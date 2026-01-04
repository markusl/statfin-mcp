import { z } from 'zod';
import { getPxWebClient } from '../services/pxweb-client.js';
import { logger } from '../utils/logger.js';

/**
 * Get variable values tool schema
 */
export const getVariableValuesSchema = z.object({
  tableId: z
    .string()
    .describe('Table ID. Example: "statfin_vaerak_pxt_11re.px"'),
  variable: z
    .string()
    .describe('Variable code from get_table_metadata. Common: "Alue" (region), "Vuosi" (year), "Ikä" (age)'),
  search: z
    .string()
    .optional()
    .describe('Filter values containing this text. Example: "Helsinki" returns only Helsinki-related codes.'),
  language: z
    .enum(['fi', 'en', 'sv'])
    .optional()
    .default('fi')
    .describe('Language for value names. Default "fi".'),
});

export type GetVariableValuesInput = z.input<typeof getVariableValuesSchema>;

/**
 * Get variable values output schema
 */
export const getVariableValuesOutputSchema = z.object({
  variable: z.string().describe('The variable code that was queried'),
  total: z.number().describe('Total number of values for this variable'),
  values: z.array(
    z.object({
      code: z.string().describe('Value code to use in query_table selections'),
      name: z.string().describe('Human-readable value name'),
    })
  ).describe('All values for this variable (filtered if search was used)'),
  commonCodes: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional()
    .describe('Common code patterns for region variables (wholeCountry, regions, municipalities)'),
});

export type GetVariableValuesOutput = z.infer<typeof getVariableValuesOutputSchema>;

/**
 * Get all values for a specific variable in a table.
 * Use this to find correct codes for regions, time periods, etc.
 */
export async function getVariableValues(rawInput: GetVariableValuesInput): Promise<GetVariableValuesOutput> {
  // Parse input to apply defaults
  const input = getVariableValuesSchema.parse(rawInput);

  logger.info({ tableId: input.tableId, variable: input.variable, search: input.search }, 'Getting variable values');

  const client = getPxWebClient();
  const result = await client.getVariableValues(
    input.tableId,
    input.variable,
    input.language,
    input.search
  );

  // Identify common code patterns for regions
  let commonCodes: Record<string, string | string[]> | undefined;

  if (input.variable === 'Alue' || input.variable.toLowerCase().includes('area')) {
    const values = result.values;

    // Find whole country code (usually SSS or KOKO MAA)
    const wholeCountry = values.find(
      (v) => v.code === 'SSS' || v.name.includes('KOKO MAA')
    );

    // Find regions (MK prefix)
    const regions = values.filter((v) => v.code.startsWith('MK'));

    // Find municipalities (KU prefix)
    const municipalities = values.filter((v) => v.code.startsWith('KU'));

    if (wholeCountry || regions.length > 0 || municipalities.length > 0) {
      commonCodes = {
        wholeCountry: wholeCountry?.code || 'SSS',
        regionCount: String(regions.length),
        municipalityCount: String(municipalities.length),
        exampleRegions: regions.slice(0, 5).map((v) => `${v.code} (${v.name})`),
        exampleMunicipalities: municipalities.slice(0, 5).map((v) => `${v.code} (${v.name})`),
      };
    }
  }

  return {
    variable: result.variable,
    total: result.total,
    values: result.values,
    commonCodes,
  };
}
