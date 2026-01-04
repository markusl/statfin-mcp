import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { logger } from '../utils/logger.js';

/**
 * List subject areas tool schema
 */
export const listSubjectAreasSchema = z.object({
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Language: fi=Finnish, en=English, sv=Swedish'),
});

export type ListSubjectAreasInput = z.input<typeof listSubjectAreasSchema>;

/**
 * List subject areas output schema
 */
export const listSubjectAreasOutputSchema = z.object({
  areas: z.array(
    z.object({
      id: z.string().describe('Subject area ID to use with list_tables'),
      name: z.string().describe('Human-readable name of the topic'),
    })
  ).describe('All available subject areas (topics)'),
  total: z.number().describe('Total number of subject areas (149)'),
});

export type ListSubjectAreasOutput = z.infer<typeof listSubjectAreasOutputSchema>;

/**
 * List all subject areas (statistical domains) available in StatFin.
 * Use this to get an overview of what statistics are available.
 */
export async function listSubjectAreas(rawInput: ListSubjectAreasInput): Promise<ListSubjectAreasOutput> {
  // Parse input to apply defaults
  const input = listSubjectAreasSchema.parse(rawInput);

  logger.info({ language: input.language }, 'Listing subject areas');

  const client = getPxWebClient();
  const areas = await client.listSubjectAreas(input.language);

  return {
    areas: areas.map((a) => ({
      id: a.id,
      name: a.name,
    })),
    total: areas.length,
  };
}
