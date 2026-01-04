/**
 * Verify the query estimation fix
 */

import { queryTable } from '../../src/tools/query-table.js';

async function main() {
  console.log('\n=== Verify Query Estimation Fix ===\n');

  // Test: Large query should be rejected with correct estimate
  console.log('Testing large query rejection...');
  const result = await queryTable({
    tableId: 'statfin_vaerak_pxt_11re.px',
    selections: [], // No filters = all combinations
    language: 'fi',
    limit: 1000,
  });

  if (!result.success) {
    console.log('✓ Query correctly rejected');
    console.log(`  Error: ${result.error}`);
    console.log(`  Estimated cells: ${result.queryInfo.estimatedCells.toLocaleString()}`);

    // Should be ~5 million, not 53
    if (result.queryInfo.estimatedCells > 1000000) {
      console.log('✓ Estimate is correct (> 1 million)');
    } else {
      console.log('✗ Estimate is wrong (should be > 1 million)');
    }
  } else {
    console.log('✗ Query should have been rejected');
  }

  console.log('\n=== Done ===\n');
}

main().catch(console.error);
