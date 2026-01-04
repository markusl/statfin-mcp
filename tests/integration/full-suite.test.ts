/**
 * Integration tests against real StatFin API
 * Run with: npx tsx tests/integration-test.ts
 */

import { searchStatistics } from '../../src/tools/search-statistics.js';
import { listSubjectAreas } from '../../src/tools/list-subject-areas.js';
import { listTables } from '../../src/tools/list-tables.js';
import { getTableMetadata } from '../../src/tools/get-table-metadata.js';
import { getVariableValues } from '../../src/tools/get-variable-values.js';
import { queryTable } from '../../src/tools/query-table.js';
import { getApiStatus } from '../../src/tools/get-api-status.js';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Rate limit aware delay - wait longer after API calls
async function rateLimitDelay() {
  return delay(8000); // Wait 8 seconds between tests to respect rate limits
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('\n=== StatFin MCP Integration Tests ===\n');

  // Test 1: API Status
  await test('get_api_status', async () => {
    const result = await getApiStatus({});
    if (!result.healthy) throw new Error('API not healthy');
    if (!result.rateLimit) throw new Error('Missing rate limit info');
  });

  await rateLimitDelay();

  // Test 2: List Subject Areas
  await test('list_subject_areas (fi)', async () => {
    const result = await listSubjectAreas({ language: 'fi' });
    if (result.total < 100) throw new Error(`Expected 100+ areas, got ${result.total}`);
    console.log(`  Found ${result.total} subject areas`);
  });

  await rateLimitDelay();

  // Test 3: List Subject Areas (English)
  await test('list_subject_areas (en)', async () => {
    const result = await listSubjectAreas({ language: 'en' });
    if (result.total < 100) throw new Error(`Expected 100+ areas, got ${result.total}`);
  });

  await rateLimitDelay();

  // Test 4: Search - Population
  await test('search_statistics (väestö)', async () => {
    const result = await searchStatistics({ query: 'väestö', language: 'fi', limit: 10 });
    if (result.results.length === 0) throw new Error('No results for väestö');
    console.log(`  Found ${result.results.length} tables for "väestö"`);
  });

  await rateLimitDelay();

  // Test 5: Search - Employment
  await test('search_statistics (työllisyys)', async () => {
    const result = await searchStatistics({ query: 'työllisyys', language: 'fi', limit: 10 });
    if (result.results.length === 0) throw new Error('No results for työllisyys');
    console.log(`  Found ${result.results.length} tables for "työllisyys"`);
  });

  await rateLimitDelay();

  // Test 6: Search - English
  await test('search_statistics (population, en)', async () => {
    const result = await searchStatistics({ query: 'population', language: 'en', limit: 10 });
    if (result.results.length === 0) throw new Error('No results for population');
    console.log(`  Found ${result.results.length} tables for "population"`);
  });

  await rateLimitDelay();

  // Test 7: List Tables in vaerak
  await test('list_tables (vaerak)', async () => {
    const result = await listTables({ subjectArea: 'vaerak', language: 'fi' });
    if (result.tables.length === 0) throw new Error('No tables in vaerak');
    console.log(`  Found ${result.tables.length} tables in vaerak`);
  });

  await rateLimitDelay();

  // Test 8: List Tables in tyti (employment)
  await test('list_tables (tyti)', async () => {
    const result = await listTables({ subjectArea: 'tyti', language: 'fi' });
    if (result.tables.length === 0) throw new Error('No tables in tyti');
    console.log(`  Found ${result.tables.length} tables in tyti`);
  });

  await rateLimitDelay();

  // Test 9: Get Table Metadata - Population table
  // Use a known table ID from the vaerak subject area
  const populationTableId = 'statfin_vaerak_pxt_11re.px'; // Population by age and sex
  await test('get_table_metadata (population)', async () => {
    const result = await getTableMetadata({ tableId: populationTableId, language: 'fi' });

    if (!result.title) throw new Error('Missing title');
    if (result.variables.length === 0) throw new Error('No variables');

    console.log(`  Table: ${result.title}`);
    console.log(`  Variables: ${result.variables.map(v => v.code).join(', ')}`);
    console.log(`  Total combinations: ${result.totalCombinations.toLocaleString()}`);
  });

  await rateLimitDelay();

  // Test 10: Get Variable Values - Regions
  await test('get_variable_values (Alue)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await getVariableValues({
      tableId: populationTableId,
      variable: 'Alue',
      language: 'fi'
    });

    if (result.total === 0) throw new Error('No values for Alue');
    console.log(`  Found ${result.total} region codes`);

    if (result.commonCodes) {
      console.log(`  Whole country: ${result.commonCodes.wholeCountry}`);
      console.log(`  Regions: ${result.commonCodes.regionCount}`);
      console.log(`  Municipalities: ${result.commonCodes.municipalityCount}`);
    }
  });

  await rateLimitDelay();

  // Test 11: Get Variable Values with Search
  await test('get_variable_values (search Helsinki)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await getVariableValues({
      tableId: populationTableId,
      variable: 'Alue',
      search: 'Helsinki',
      language: 'fi'
    });

    console.log(`  Found ${result.total} matches for "Helsinki"`);
    if (result.values.length > 0) {
      console.log(`  First match: ${result.values[0].code} = ${result.values[0].name}`);
    }
  });

  await rateLimitDelay();

  // Test 12: Query - Simple query for whole country
  await test('query_table (whole country, latest year)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await queryTable({
      tableId: populationTableId,
      selections: [
        { variable: 'Alue', filter: 'item', values: ['SSS'] },
        { variable: 'Vuosi', filter: 'top', top: 1 },
      ],
      language: 'fi',
      limit: 100,
    });

    if (!result.success) throw new Error(result.error || 'Query failed');
    console.log(`  Rows: ${result.rowCount}`);
    if (result.data && result.data.rows.length > 0) {
      console.log(`  Sample: ${JSON.stringify(result.data.rows[0])}`);
    }
  });

  await rateLimitDelay();

  // Test 13: Query - Helsinki population
  await test('query_table (Helsinki, 5 years)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await queryTable({
      tableId: populationTableId,
      selections: [
        { variable: 'Alue', filter: 'item', values: ['KU091'] }, // Helsinki
        { variable: 'Vuosi', filter: 'top', top: 5 },
      ],
      language: 'fi',
      limit: 100,
    });

    if (!result.success) throw new Error(result.error || 'Query failed');
    console.log(`  Helsinki population data: ${result.rowCount} rows`);
  });

  await rateLimitDelay();

  // Test 14: Query - Multiple regions
  await test('query_table (3 cities, latest year)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await queryTable({
      tableId: populationTableId,
      selections: [
        { variable: 'Alue', filter: 'item', values: ['KU091', 'KU092', 'KU049'] }, // Helsinki, Vantaa, Espoo
        { variable: 'Vuosi', filter: 'top', top: 1 },
      ],
      language: 'fi',
      limit: 100,
    });

    if (!result.success) throw new Error(result.error || 'Query failed');
    console.log(`  3 cities population: ${result.rowCount} rows`);
  });

  await rateLimitDelay();

  // Test 15: Query size limit enforcement
  await test('query_table (reject large query)', async () => {
    if (!populationTableId) throw new Error('No table ID from previous test');

    const result = await queryTable({
      tableId: populationTableId,
      selections: [], // No filters = all values
      language: 'fi',
      limit: 10, // Very small limit
    });

    if (result.success) throw new Error('Expected query to be rejected');
    if (!result.error?.includes('exceeding')) throw new Error('Expected exceeding error');
    console.log(`  Correctly rejected: ${result.error?.substring(0, 60)}...`);
  });

  await rateLimitDelay();

  // Test 16: Employment table
  await test('query employment table', async () => {
    const search = await searchStatistics({ query: 'työllisyysaste', language: 'fi', limit: 3 });
    if (search.results.length === 0) throw new Error('No employment tables');

    const tableId = search.results[0].tableId;
    const metadata = await getTableMetadata({ tableId, language: 'fi' });

    console.log(`  Table: ${metadata.title}`);
    console.log(`  Variables: ${metadata.variables.map(v => `${v.code}(${v.valueCount})`).join(', ')}`);
  });

  await rateLimitDelay();

  // Test 17: Education table (different domain)
  await test('query education statistics', async () => {
    const search = await searchStatistics({ query: 'koulutus tutkinto', language: 'fi', limit: 3 });
    if (search.results.length === 0) throw new Error('No education tables');

    const tableId = search.results[0].tableId;
    const metadata = await getTableMetadata({ tableId, language: 'fi' });

    console.log(`  Table: ${metadata.title}`);
    console.log(`  Variables: ${metadata.variables.length}`);
  });

  await rateLimitDelay();

  // Test 18: Cache effectiveness
  await test('cache effectiveness', async () => {
    await getApiStatus({}); // Initial status check

    // Repeat a search (should hit cache)
    await listSubjectAreas({ language: 'fi' });
    await listSubjectAreas({ language: 'fi' });

    const status2 = await getApiStatus({});
    console.log(`  Cache stats: ${JSON.stringify(status2.cache)}`);
  });

  console.log('\n=== Tests Complete ===\n');
}

main().catch(console.error);
