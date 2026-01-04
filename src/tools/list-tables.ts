import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { logger } from '../utils/logger.js';

/**
 * List tables tool schema
 */
export const listTablesSchema = z.object({
  subjectArea: z
    .string()
    .describe('Subject area ID (e.g., "vaerak", "tyti", "asas")'),
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Language: fi=Finnish, en=English, sv=Swedish'),
});

export type ListTablesInput = z.input<typeof listTablesSchema>;

/**
 * List tables output schema
 */
export const listTablesOutputSchema = z.object({
  subjectArea: z.string().describe('The subject area that was queried'),
  tables: z.array(
    z.object({
      id: z.string().describe('Table ID to use with get_table_metadata and query_table'),
      title: z.string().describe('Human-readable table title'),
      updated: z.string().describe('Last update date (ISO format)'),
    })
  ).describe('All tables in this subject area'),
  total: z.number().describe('Number of tables in this area'),
});

export type ListTablesOutput = z.infer<typeof listTablesOutputSchema>;

/**
 * List all tables in a subject area.
 * Use list_subject_areas first to find the subject area ID.
 */
export async function listTables(rawInput: ListTablesInput): Promise<ListTablesOutput> {
  // Parse input to apply defaults
  const input = listTablesSchema.parse(rawInput);

  logger.info({ subjectArea: input.subjectArea, language: input.language }, 'Listing tables');

  const client = getPxWebClient();
  const tables = await client.listTables(input.subjectArea, input.language);

  return {
    subjectArea: input.subjectArea,
    tables: tables.map((t) => ({
      id: t.id,
      title: t.title,
      updated: t.updated,
    })),
    total: tables.length,
  };
}
