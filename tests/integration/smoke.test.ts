/**
 * Quick smoke test against real StatFin API
 * Run with: npx tsx tests/quick-test.ts
 */

import { listSubjectAreas } from '../../src/tools/list-subject-areas.js';
import { listTables } from '../../src/tools/list-tables.js';
import { getTableMetadata } from '../../src/tools/get-table-metadata.js';
import { getVariableValues } from '../../src/tools/get-variable-values.js';
import { queryTable } from '../../src/tools/query-table.js';

async function main() {
  console.log('\n=== Quick Smoke Test ===\n');

  // Test 1: List subject areas
  console.log('1. Listing subject areas...');
  const areas = await listSubjectAreas({ language: 'fi' });
  console.log(`   Found ${areas.total} subject areas`);
  console.log(`   First 3: ${areas.areas.slice(0, 3).map(a => a.name).join(', ')}`);

  // Test 2: List tables in vaerak
  console.log('\n2. Listing tables in vaerak...');
  const tables = await listTables({ subjectArea: 'vaerak', language: 'fi' });
  console.log(`   Found ${tables.tables.length} tables`);

  // Find a specific table
  const table = tables.tables.find(t => t.id.includes('11re'));
  if (!table) {
    console.log('   Looking for any table...');
    const firstTable = tables.tables[0];
    console.log(`   Using: ${firstTable.id} - ${firstTable.title}`);
  } else {
    console.log(`   Found: ${table.id} - ${table.title}`);
  }

  const tableId = table?.id || tables.tables[0].id;

  // Test 3: Get table metadata
  console.log(`\n3. Getting metadata for ${tableId}...`);
  const metadata = await getTableMetadata({ tableId, language: 'fi' });
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Variables:`);
  for (const v of metadata.variables) {
    console.log(`     - ${v.code}: ${v.name} (${v.valueCount} values)`);
  }
  console.log(`   Total combinations: ${metadata.totalCombinations.toLocaleString()}`);

  // Test 4: Get variable values for Alue (if exists)
  const alueVar = metadata.variables.find(v => v.code === 'Alue');
  if (alueVar) {
    console.log(`\n4. Getting values for Alue variable...`);
    const values = await getVariableValues({ tableId, variable: 'Alue', language: 'fi' });
    console.log(`   Total: ${values.total} regions`);
    console.log(`   First 5: ${values.values.slice(0, 5).map(v => `${v.code}=${v.name}`).join(', ')}`);
    if (values.commonCodes) {
      console.log(`   Whole country: ${values.commonCodes.wholeCountry}`);
      console.log(`   Regions: ${values.commonCodes.regionCount}, Municipalities: ${values.commonCodes.municipalityCount}`);
    }
  }

  // Test 5: Execute a simple query
  console.log(`\n5. Querying data...`);

  // Build selections for all variables to avoid large result sets
  const selections: Array<{ variable: string; filter: 'item' | 'top'; values?: string[]; top?: number }> = [];

  for (const variable of metadata.variables) {
    if (variable.code === 'Alue') {
      selections.push({ variable: 'Alue', filter: 'item', values: ['SSS'] }); // Whole country
    } else if (variable.isTime) {
      selections.push({ variable: variable.code, filter: 'top', top: 3 }); // Last 3 years
    } else if (variable.values.length > 0) {
      // Use first value (usually 'SSS' = total) for other variables
      const firstValue = variable.values[0];
      selections.push({ variable: variable.code, filter: 'item', values: [firstValue.code] });
    }
  }

  const result = await queryTable({
    tableId,
    selections,
    language: 'fi',
    limit: 100,
  });

  if (result.success) {
    console.log(`   Success! ${result.rowCount} rows returned`);
    console.log(`   Columns: ${result.data?.columns.join(', ')}`);
    console.log(`   Sample data:`);
    result.data?.rows.slice(0, 5).forEach((row, i) => {
      console.log(`     ${i + 1}: ${JSON.stringify(row)}`);
    });
    console.log(`   Cache hit: ${result.queryInfo.cacheHit}`);
    console.log(`   Execution time: ${result.queryInfo.executionTimeMs}ms`);
  } else {
    console.log(`   Error: ${result.error}`);
  }

  console.log('\n=== Quick Test Complete ===\n');
}

main().catch(console.error);
