import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Query table tool schema
 */
export const queryTableSchema = z.object({
  tableId: z
    .string()
    .describe('Table ID from search_statistics or list_tables. Example: "statfin_vaerak_pxt_11re.px"'),
  selections: z
    .array(
      z.object({
        variable: z
          .string()
          .describe('Variable code from get_table_metadata. Examples: "Alue" (region), "Vuosi" (year), "Sukupuoli" (gender)'),
        filter: z
          .enum(['item', 'all', 'top'])
          .optional()
          .default('item')
          .describe('"item": specific values, "all": all values (caution!), "top": latest N (good for Vuosi/year)'),
        values: z
          .array(z.string())
          .optional()
          .describe('Value CODES for "item" filter. Use codes like "KU091", "SSS", "2024" - NOT labels like "Helsinki"'),
        top: z
          .number()
          .optional()
          .describe('For "top" filter: number of latest values. Example: top=5 for last 5 years'),
      })
    )
    .describe('One entry per variable. IMPORTANT: Include all non-optional variables or query will return too much data.'),
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Label language in results. Default "fi".'),
  limit: z
    .number()
    .min(1)
    .max(10000)
    .optional()
    .default(1000)
    .describe('Max rows. If query exceeds this, it fails with an error suggesting more specific selections.'),
});

export type QueryTableInput = z.input<typeof queryTableSchema>;

/**
 * Query table output schema
 */
export const queryTableOutputSchema = z.object({
  success: z.boolean().describe('True if query succeeded, false if error'),
  data: z.object({
    columns: z.array(z.string()).describe('Column names in order'),
    rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()])))
      .describe('Data rows as objects with column names as keys'),
  }).optional().describe('Query results (only present if success=true)'),
  rowCount: z.number().optional().describe('Number of data rows returned'),
  queryInfo: z.object({
    estimatedCells: z.number().describe('Estimated number of data cells'),
    executionTimeMs: z.number().describe('Query execution time in milliseconds'),
    cacheHit: z.boolean().describe('True if result was served from cache'),
  }).describe('Query execution metadata'),
  error: z.string().optional().describe('Error message (only present if success=false)'),
});

export type QueryTableOutput = z.infer<typeof queryTableOutputSchema>;

/**
 * Execute a data query on a table.
 * Use get_table_metadata first to understand available variables.
 */
export async function queryTable(rawInput: QueryTableInput): Promise<QueryTableOutput> {
  // Parse input to apply defaults
  const input = queryTableSchema.parse(rawInput);

  logger.info({ tableId: input.tableId, selections: input.selections }, 'Querying table');

  const client = getPxWebClient();

  // Get metadata to validate and estimate query size
  const metadata = await client.getTableMetadata(input.tableId, input.language);

  // Estimate result size
  // Note: All variables contribute to result size. The "optional" (elimination) flag
  // only indicates if a variable can be completely omitted from results, but
  // if not specified in query, PxWeb returns all values.
  let estimatedCells = 1;

  for (const variable of metadata.variables) {
    const selection = input.selections.find((s) => s.variable === variable.code);

    if (selection) {
      if (selection.filter === 'item' && selection.values) {
        estimatedCells *= selection.values.length;
      } else if (selection.filter === 'top' && selection.top) {
        estimatedCells *= selection.top;
      } else if (selection.filter === 'all') {
        estimatedCells *= variable.valueCount;
      }
    } else {
      // Unspecified variable - defaults to all values
      estimatedCells *= variable.valueCount;
    }
  }

  // Check against limits
  if (estimatedCells > config.maxQueryCells) {
    return {
      success: false,
      error: `Query would return approximately ${estimatedCells.toLocaleString()} cells, exceeding the limit of ${config.maxQueryCells.toLocaleString()}. Add more specific selections to reduce query size.`,
      queryInfo: {
        estimatedCells,
        executionTimeMs: 0,
        cacheHit: false,
      },
    };
  }

  if (estimatedCells > input.limit) {
    return {
      success: false,
      error: `Query would return approximately ${estimatedCells.toLocaleString()} rows, exceeding your limit of ${input.limit}. Either increase the limit or add more specific selections.`,
      queryInfo: {
        estimatedCells,
        executionTimeMs: 0,
        cacheHit: false,
      },
    };
  }

  // Execute query
  const result = await client.query(
    input.tableId,
    input.selections.map((s) => ({
      variable: s.variable,
      filter: s.filter,
      values: s.values,
      top: s.top,
    })),
    input.language
  );

  return result;
}
