import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { logger } from '../utils/logger.js';

/**
 * Search statistics input schema
 */
export const searchStatisticsSchema = z.object({
  query: z
    .string()
    .min(2)
    .describe('Search term. Examples: "väestö Helsinki", "unemployment rate", "asuntojen hinnat". Finnish terms often work better.'),
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Response language. Default "fi" (Finnish). Use "en" for English labels.'),
  limit: z
    .number()
    .min(1)
    .max(50)
    .optional()
    .default(10)
    .describe('Max results (1-50). Default 10. Increase if first results are not relevant.'),
});

export type SearchStatisticsInput = z.input<typeof searchStatisticsSchema>;

/**
 * Search statistics output schema
 */
export const searchStatisticsOutputSchema = z.object({
  query: z.string().describe('The search query that was executed'),
  results: z.array(
    z.object({
      tableId: z.string().describe('Table ID to use with get_table_metadata and query_table'),
      path: z.string().describe('Subject area path'),
      title: z.string().describe('Human-readable table title'),
      score: z.number().describe('Relevance score (0-1, higher is better)'),
      published: z.string().describe('Publication date (ISO format)'),
    })
  ).describe('Ranked search results'),
  total: z.number().describe('Number of results returned'),
  hasMore: z.boolean().describe('True if more results available (increase limit)'),
});

export type SearchStatisticsOutput = z.infer<typeof searchStatisticsOutputSchema>;

/**
 * Search for statistical tables by keyword.
 * This is the primary discovery tool for finding relevant data.
 */
export async function searchStatistics(rawInput: SearchStatisticsInput): Promise<SearchStatisticsOutput> {
  // Parse input to apply defaults
  const input = searchStatisticsSchema.parse(rawInput);

  logger.info({ query: input.query, language: input.language }, 'Searching statistics');

  const client = getPxWebClient();
  const results = await client.search(input.query, input.language, input.limit);

  return {
    query: input.query,
    results: results.map((r) => ({
      tableId: r.id,
      path: r.path,
      title: r.title,
      score: r.score,
      published: r.published,
    })),
    total: results.length,
    hasMore: results.length >= input.limit,
  };
}
