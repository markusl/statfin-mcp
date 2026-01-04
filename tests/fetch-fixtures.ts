/**
 * Fetch real API responses to use as test fixtures
 * Run with: npx tsx tests/fetch-fixtures.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://pxdata.stat.fi/PxWeb/api/v1';
const FIXTURES_DIR = join(import.meta.dirname, 'fixtures');

async function fetchJson(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  console.log(`POST: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

function saveFixture(name: string, data: unknown): void {
  const path = join(FIXTURES_DIR, `${name}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`Saved: ${path}`);
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n=== Fetching Real API Fixtures ===\n');

  // 1. Subject areas list
  const subjectAreas = await fetchJson('/fi/StatFin');
  saveFixture('api-subject-areas', subjectAreas);
  await delay(8000);

  // 2. Table list for vaerak (population)
  const tableList = await fetchJson('/fi/StatFin/vaerak');
  saveFixture('api-table-list-vaerak', tableList);
  await delay(8000);

  // 3. Table metadata - population by age and sex
  const populationMetadata = await fetchJson('/fi/StatFin/vaerak/statfin_vaerak_pxt_11re.px');
  saveFixture('api-metadata-population', populationMetadata);
  await delay(8000);

  // 4. Search results for "väestö"
  const searchPopulation = await fetchJson('/fi/StatFin?query=väestö');
  saveFixture('api-search-vaesto', searchPopulation);
  await delay(8000);

  // 5. Search results for "unemployment" in English
  const searchUnemployment = await fetchJson('/en/StatFin?query=unemployment');
  saveFixture('api-search-unemployment-en', searchUnemployment);
  await delay(8000);

  // 6. Query response - Finland population 2022-2024
  const queryPopulation = await postJson('/fi/StatFin/vaerak/statfin_vaerak_pxt_11re.px', {
    query: [
      { code: 'Alue', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Vuosi', selection: { filter: 'top', values: ['3'] } },
    ],
    response: { format: 'json-stat2' },
  });
  saveFixture('api-query-population-finland', queryPopulation);
  await delay(8000);

  // 7. Query response - Helsinki population trend
  const queryHelsinki = await postJson('/fi/StatFin/vaerak/statfin_vaerak_pxt_11re.px', {
    query: [
      { code: 'Alue', selection: { filter: 'item', values: ['KU091'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Vuosi', selection: { filter: 'top', values: ['5'] } },
    ],
    response: { format: 'json-stat2' },
  });
  saveFixture('api-query-helsinki-population', queryHelsinki);
  await delay(8000);

  // 8. Employment table metadata
  const employmentMetadata = await fetchJson('/fi/StatFin/tyti/statfin_tyti_pxt_135z.px');
  saveFixture('api-metadata-employment', employmentMetadata);
  await delay(8000);

  // 9. English metadata for population table
  const populationMetadataEn = await fetchJson('/en/StatFin/vaerak/statfin_vaerak_pxt_11re.px');
  saveFixture('api-metadata-population-en', populationMetadataEn);
  await delay(8000);

  // 10. Query with multiple regions
  const queryMultiRegion = await postJson('/fi/StatFin/vaerak/statfin_vaerak_pxt_11re.px', {
    query: [
      { code: 'Alue', selection: { filter: 'item', values: ['KU091', 'KU092', 'KU049'] } },
      { code: 'Ikä', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Sukupuoli', selection: { filter: 'item', values: ['SSS'] } },
      { code: 'Vuosi', selection: { filter: 'top', values: ['1'] } },
    ],
    response: { format: 'json-stat2' },
  });
  saveFixture('api-query-three-cities', queryMultiRegion);

  console.log('\n=== Fixtures Complete ===\n');
}

main().catch(console.error);
