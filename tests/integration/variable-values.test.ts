/**
 * Additional integration tests
 * Run with: npx tsx tests/more-tests.ts
 */

import { searchStatistics } from '../../src/tools/search-statistics.js';
import { getTableMetadata } from '../../src/tools/get-table-metadata.js';
import { getVariableValues } from '../../src/tools/get-variable-values.js';
import { queryTable } from '../../src/tools/query-table.js';

async function main() {
  console.log('\n=== Additional Tests ===\n');

  // Variable codes are table-specific and version-stamped since the June 2026
  // migration; resolve them from live metadata rather than hardcoding.
  const meta = await getTableMetadata({ tableId: '11re.px', language: 'fi' });
  const REGION = meta.variables.find(v => v.code.startsWith('alue'))!.code;
  const YEAR = meta.variables.find(v => v.isTime)!.code;
  const SEX = meta.variables.find(v => v.code.startsWith('sukupuoli'))!.code;
  const AGE = meta.variables.find(v => v.code.startsWith('ikaryhma'))!.code;

  // Test 1: Check if MK codes exist in region variable
  console.log('1. Checking region code patterns...');
  const values = await getVariableValues({
    tableId: '11re.px',
    variable: REGION,
    language: 'fi'
  });

  const mkCodes = values.values.filter(v => v.code.startsWith('MK'));
  const kuCodes = values.values.filter(v => v.code.startsWith('KU'));
  const skCodes = values.values.filter(v => v.code.startsWith('SK'));
  console.log(`   Total: ${values.total}`);
  console.log(`   SSS (whole country): ${values.values.some(v => v.code === 'SSS') ? 'yes' : 'no'}`);
  console.log(`   MK (regions): ${mkCodes.length}`);
  console.log(`   KU (municipalities): ${kuCodes.length}`);
  console.log(`   SK (other): ${skCodes.length}`);
  if (mkCodes.length > 0) {
    console.log(`   Sample MK codes: ${mkCodes.slice(0, 3).map(v => `${v.code}=${v.name}`).join(', ')}`);
  }

  // Test 2: Search for Helsinki
  console.log('\n2. Search for Helsinki in region values...');
  const helsinkiSearch = await getVariableValues({
    tableId: '11re.px',
    variable: REGION,
    search: 'Helsinki',
    language: 'fi'
  });
  console.log(`   Found ${helsinkiSearch.total} matches`);
  helsinkiSearch.values.forEach(v => {
    console.log(`     ${v.code} = ${v.name}`);
  });

  // Test 3: Query Helsinki population by year
  console.log('\n3. Query Helsinki population trend...');
  const helsinkiPop = await queryTable({
    tableId: '11re.px',
    selections: [
      { variable: REGION, filter: 'item', values: ['KU091'] },
      { variable: YEAR, filter: 'top', top: 10 },
      { variable: SEX, filter: 'item', values: ['SSS'] }, // Total
      { variable: AGE, filter: 'item', values: ['SSS'] }, // All ages combined - need to check if this exists
    ],
    language: 'fi',
    limit: 100,
  });

  if (helsinkiPop.success) {
    console.log(`   Success! ${helsinkiPop.rowCount} rows`);
    helsinkiPop.data?.rows.forEach(row => {
      console.log(`     ${row['Vuosi']}: ${row['value']?.toLocaleString()}`);
    });
  } else {
    console.log(`   Error: ${helsinkiPop.error}`);
  }

  // Test 4: Test employment data
  console.log('\n4. Testing employment statistics...');
  const empSearch = await searchStatistics({ query: 'työttömyys', language: 'fi', limit: 5 });
  console.log(`   Found ${empSearch.total} tables for "työttömyys"`);
  if (empSearch.results.length > 0) {
    const empTable = empSearch.results[0];
    console.log(`   First table: ${empTable.tableId}`);
    console.log(`   Title: ${empTable.title}`);

    const empMeta = await getTableMetadata({ tableId: empTable.tableId, language: 'fi' });
    console.log(`   Variables: ${empMeta.variables.map(v => v.code).join(', ')}`);
  }

  // Test 5: Test English language
  console.log('\n5. Testing English language...');
  const englishMeta = await getTableMetadata({
    tableId: '11re.px',
    language: 'en'
  });
  console.log(`   Title: ${englishMeta.title}`);
  console.log(`   Variables: ${englishMeta.variables.map(v => v.name).join(', ')}`);

  // Test 6: Test large query rejection
  console.log('\n6. Testing large query rejection...');
  const largeQuery = await queryTable({
    tableId: '11re.px',
    selections: [], // No filters = all combinations
    language: 'fi',
    limit: 10,
  });
  console.log(`   Rejected: ${!largeQuery.success}`);
  if (!largeQuery.success) {
    console.log(`   Error: ${largeQuery.error?.substring(0, 80)}...`);
  }

  // Test 7: Test Swedish language
  console.log('\n7. Testing Swedish language...');
  const swedishMeta = await getTableMetadata({
    tableId: '11re.px',
    language: 'sv'
  });
  console.log(`   Title: ${swedishMeta.title}`);

  // Test 8: Check age variable codes
  console.log('\n8. Checking age variable codes...');
  const ages = await getVariableValues({
    tableId: '11re.px',
    variable: AGE,
    language: 'fi'
  });
  console.log(`   Total age categories: ${ages.total}`);
  console.log(`   First 10: ${ages.values.slice(0, 10).map(v => v.code).join(', ')}`);
  // Check if there's a "total" age code
  const totalAge = ages.values.find(v => v.name.toLowerCase().includes('yhteensä') || v.code === 'SSS');
  if (totalAge) {
    console.log(`   Total/All ages code: ${totalAge.code} = ${totalAge.name}`);
  }

  console.log('\n=== Additional Tests Complete ===\n');
}

main().catch(console.error);
