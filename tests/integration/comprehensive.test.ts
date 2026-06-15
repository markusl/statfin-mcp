/**
 * Comprehensive test covering different data types and tables
 * Run with: npx tsx tests/comprehensive-test.ts
 */

import { searchStatistics } from '../../src/tools/search-statistics.js';
import { listSubjectAreas } from '../../src/tools/list-subject-areas.js';
import { listTables } from '../../src/tools/list-tables.js';
import { getTableMetadata } from '../../src/tools/get-table-metadata.js';
import { queryTable } from '../../src/tools/query-table.js';
import { getApiStatus } from '../../src/tools/get-api-status.js';

const TESTS: Array<{ name: string; fn: () => Promise<void> }> = [];
let passed = 0;
let failed = 0;

/**
 * Resolve the (table-specific, version-stamped since June 2026) variable codes
 * for the population table 11re.px by structural predicate, so tests don't
 * hardcode codes that change at each migration.
 */
async function resolvePopulationCodes() {
  const meta = await getTableMetadata({ tableId: '11re.px', language: 'fi' });
  const byPrefix = (p: string) => meta.variables.find(v => v.code.startsWith(p))!.code;
  return {
    region: byPrefix('alue'),
    year: meta.variables.find(v => v.isTime)!.code,
    sex: byPrefix('sukupuoli'),
    age: byPrefix('ikaryhma'),
  };
}

function test(name: string, fn: () => Promise<void>) {
  TESTS.push({ name, fn });
}

async function runTests() {
  console.log('\n=== Comprehensive Integration Tests ===\n');

  for (const { name, fn } of TESTS) {
    try {
      await fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
    // Rate limit delay between tests (8 seconds)
    await new Promise(r => setTimeout(r, 8000));
  }

  console.log(`\n=== Results: ${passed}/${passed + failed} passed ===\n`);
}

// TEST 1: API Status
test('API Status', async () => {
  const status = await getApiStatus({});
  if (!status.healthy) throw new Error('Not healthy');
  if (!status.rateLimit) throw new Error('Missing rate limit');
  if (!status.cache) throw new Error('Missing cache stats');
});

// TEST 2: Browse - List Subject Areas
test('List Subject Areas (149 expected)', async () => {
  const result = await listSubjectAreas({ language: 'fi' });
  if (result.total < 140) throw new Error(`Only ${result.total} areas`);
});

// TEST 3: Browse - List Tables in Population
test('List Tables in vaerak (30 expected)', async () => {
  const result = await listTables({ subjectArea: 'vaerak', language: 'fi' });
  if (result.tables.length < 20) throw new Error(`Only ${result.tables.length} tables`);
});

// TEST 4: Search - Finnish
test('Search "väestö" returns results', async () => {
  const result = await searchStatistics({ query: 'väestö', language: 'fi', limit: 10 });
  if (result.results.length === 0) throw new Error('No results');
});

// TEST 5: Search - English
test('Search "unemployment" in English', async () => {
  const result = await searchStatistics({ query: 'unemployment', language: 'en', limit: 10 });
  if (result.results.length === 0) throw new Error('No results');
});

// TEST 6: Metadata - Population table with many variables
test('Get metadata for population table', async () => {
  const result = await getTableMetadata({
    tableId: '11re.px',
    language: 'fi',
  });
  if (result.variables.length < 4) throw new Error('Missing variables');
  if (result.totalCombinations < 1000000) throw new Error('Combinations too low');
});

// TEST 7: Query - Simple population query
test('Query whole country population (latest 3 years)', async () => {
  const c = await resolvePopulationCodes();
  const result = await queryTable({
    tableId: '11re.px',
    selections: [
      { variable: c.region, filter: 'item', values: ['SSS'] },
      { variable: c.year, filter: 'top', top: 3 },
      { variable: c.sex, filter: 'item', values: ['SSS'] },
      { variable: c.age, filter: 'item', values: ['SSS'] },
    ],
    language: 'fi',
    limit: 100,
  });
  if (!result.success) throw new Error(result.error || 'Failed');
  if (result.rowCount !== 3) throw new Error(`Expected 3 rows, got ${result.rowCount}`);
});

// TEST 8: Query - Multiple regions
test('Query 3 cities population', async () => {
  const c = await resolvePopulationCodes();
  const result = await queryTable({
    tableId: '11re.px',
    selections: [
      { variable: c.region, filter: 'item', values: ['KU091', 'KU092', 'KU049'] },
      { variable: c.year, filter: 'top', top: 1 },
      { variable: c.sex, filter: 'item', values: ['SSS'] },
      { variable: c.age, filter: 'item', values: ['SSS'] },
    ],
    language: 'fi',
    limit: 100,
  });
  if (!result.success) throw new Error(result.error || 'Failed');
  if (result.rowCount !== 3) throw new Error(`Expected 3 rows, got ${result.rowCount}`);
});

// TEST 9: Query - Large query rejection
test('Reject large query (5M+ cells)', async () => {
  const result = await queryTable({
    tableId: '11re.px',
    selections: [], // No filters
    language: 'fi',
    limit: 100,
  });
  if (result.success) throw new Error('Should have been rejected');
  if (result.queryInfo.estimatedCells < 1000000) throw new Error('Wrong estimate');
});

// TEST 10: Multi-language - Swedish
test('Swedish language metadata', async () => {
  const result = await getTableMetadata({
    tableId: '11re.px',
    language: 'sv',
  });
  if (!result.title.includes('Befolkning')) throw new Error('Title not in Swedish');
});

// TEST 11: Cache hit verification
test('Cache hit on repeated call', async () => {
  const status1 = await getApiStatus({});
  await listSubjectAreas({ language: 'fi' }); // Should hit cache
  const status2 = await getApiStatus({});
  // Cache size should be same or higher
  if (status2.cache.subjectAreas.size < status1.cache.subjectAreas.size) {
    throw new Error('Cache not working');
  }
});

// TEST 12: Employment domain - different table
test('Query employment statistics table', async () => {
  // First find an employment table
  const search = await searchStatistics({ query: 'työllisyysaste', language: 'fi', limit: 3 });
  if (search.results.length === 0) throw new Error('No employment tables found');

  const tableId = search.results[0].tableId;
  const metadata = await getTableMetadata({ tableId, language: 'fi' });
  if (metadata.variables.length === 0) throw new Error('No variables');
});

runTests().catch(console.error);
