import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { logger } from '../utils/logger.js';

/**
 * Get table metadata tool schema
 */
export const getTableMetadataSchema = z.object({
  tableId: z
    .string()
    .describe('Table ID from search_statistics. Example: "statfin_vaerak_pxt_11re.px"'),
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Language for variable/value names. Default "fi".'),
  includeAllValues: z
    .boolean()
    .optional()
    .default(false)
    .describe('If true, return ALL value codes (can be 300+ for regions). Default false shows first 20.'),
});

export type GetTableMetadataInput = z.input<typeof getTableMetadataSchema>;

/**
 * Get table metadata output schema
 */
export const getTableMetadataOutputSchema = z.object({
  tableId: z.string().describe('The table ID'),
  title: z.string().describe('Human-readable table title'),
  lastUpdated: z.string().describe('When the data was last updated (ISO format)'),
  variables: z.array(
    z.object({
      code: z.string().describe('Variable code to use in query_table selections'),
      name: z.string().describe('Human-readable variable name'),
      valueCount: z.number().describe('Total number of possible values'),
      values: z.array(
        z.object({
          code: z.string().describe('Value code to use in selections'),
          name: z.string().describe('Human-readable value name'),
        })
      ).describe('First 20 values (or all if includeAllValues=true)'),
      hasMore: z.boolean().describe('True if more values exist (use get_variable_values)'),
      isTime: z.boolean().describe('True if this is a time/year variable'),
      isOptional: z.boolean().describe('True if variable can be omitted from query'),
    })
  ).describe('All variables in this table'),
  totalCombinations: z.number().describe('Total possible data cells (product of all value counts)'),
  queryGuidance: z.string().describe('Tips for constructing an efficient query'),
});

export type GetTableMetadataOutput = z.infer<typeof getTableMetadataOutputSchema>;

/**
 * Get metadata for a table including variables and their values.
 * Use this to understand table structure before querying.
 */
export async function getTableMetadata(rawInput: GetTableMetadataInput): Promise<GetTableMetadataOutput> {
  // Parse input to apply defaults
  const input = getTableMetadataSchema.parse(rawInput);

  logger.info({ tableId: input.tableId, language: input.language }, 'Getting table metadata');

  const client = getPxWebClient();
  const metadata = await client.getTableMetadata(
    input.tableId,
    input.language,
    input.includeAllValues
  );

  // Generate query guidance
  const timeVar = metadata.variables.find((v) => v.isTime);
  const queryGuidance = timeVar
    ? `Use 'top' filter for '${timeVar.code}' to get the latest years (e.g., top=5 for last 5 years).`
    : 'Select specific values for each variable to limit query size.';

  return {
    tableId: metadata.tableId,
    title: metadata.title,
    lastUpdated: metadata.lastUpdated,
    variables: metadata.variables.map((v) => ({
      code: v.code,
      name: v.name,
      valueCount: v.valueCount,
      values: v.values,
      hasMore: v.hasMore,
      isTime: v.isTime,
      isOptional: v.isOptional,
    })),
    totalCombinations: metadata.totalCombinations,
    queryGuidance,
  };
}
