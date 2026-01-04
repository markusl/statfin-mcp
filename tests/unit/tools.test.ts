import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { searchStatistics } from '../../src/tools/search-statistics.js';
import { listSubjectAreas } from '../../src/tools/list-subject-areas.js';
import { listTables } from '../../src/tools/list-tables.js';
import { getTableMetadata } from '../../src/tools/get-table-metadata.js';
import { getVariableValues } from '../../src/tools/get-variable-values.js';
import { queryTable } from '../../src/tools/query-table.js';
import { getApiStatus } from '../../src/tools/get-api-status.js';

// Load real fixtures
const fixturesDir = join(import.meta.dirname, '../fixtures');
const loadFixture = (name: string) => JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), 'utf-8'));

const subjectAreasFixture = loadFixture('api-subject-areas');
const tableListFixture = loadFixture('api-table-list-vaerak');
const metadataFixture = loadFixture('api-metadata-population');
const searchFixture = loadFixture('api-search-vaesto');
const queryFixture = loadFixture('api-query-population-finland');

// Mock the PxWebClient with real fixture data
vi.mock('../../src/services/pxweb-client.js', () => ({
  getPxWebClient: vi.fn(() => ({
    search: vi.fn().mockImplementation(async (query: string, language: string, limit: number = 20) => {
      // Return subset of real search results respecting limit
      return searchFixture.slice(0, limit).map((item: { id: string; path: string; title: string; updated?: string; score?: number }) => ({
        id: item.id,
        path: item.path,
        title: item.title,
        published: item.updated || '2024-12-15',
        score: item.score || 0.9,
      }));
    }),
    listSubjectAreas: vi.fn().mockImplementation(async () => {
      return subjectAreasFixture
        .filter((item: { type: string }) => item.type === 'l')
        .map((item: { id: string; text: string }) => ({
          id: item.id,
          name: item.text,
          tableCount: 0,
        }));
    }),
    listTables: vi.fn().mockImplementation(async () => {
      return tableListFixture
        .filter((item: { type: string }) => item.type === 't')
        .map((item: { id: string; text: string; updated?: string }) => ({
          id: item.id,
          title: item.text,
          updated: item.updated || '2024-12-15',
          path: '/vaerak',
        }));
    }),
    getTableMetadata: vi.fn().mockImplementation(async () => {
      return {
        tableId: 'statfin_vaerak_pxt_11re.px',
        title: metadataFixture.title,
        lastUpdated: '2024-12-15',
        path: 'StatFin/vaerak/statfin_vaerak_pxt_11re.px',
        variables: metadataFixture.variables.map((v: { code: string; text: string; values: string[]; valueTexts: string[]; time?: boolean; elimination?: boolean }) => ({
          code: v.code,
          name: v.text,
          valueCount: v.values.length,
          values: v.values.slice(0, 20).map((code: string, i: number) => ({
            code,
            name: v.valueTexts[i] || code,
          })),
          hasMore: v.values.length > 20,
          isTime: v.time || false,
          isOptional: v.elimination || false,
        })),
        totalCombinations: metadataFixture.variables.reduce(
          (acc: number, v: { values: string[] }) => acc * v.values.length,
          1
        ),
      };
    }),
    getVariableValues: vi.fn().mockImplementation(async (_tableId: string, variableCode: string) => {
      const variable = metadataFixture.variables.find((v: { code: string }) => v.code === variableCode);
      if (!variable) throw new Error(`Variable not found: ${variableCode}`);
      return {
        variable: variable.text,
        total: variable.values.length,
        values: variable.values.map((code: string, i: number) => ({
          code,
          name: variable.valueTexts[i] || code,
        })),
      };
    }),
    query: vi.fn().mockImplementation(async () => {
      // Transform query fixture to expected format
      const dimensions = queryFixture.id;
      const values = queryFixture.value;

      return {
        success: true,
        data: {
          columns: [...dimensions, 'value'],
          rows: values.map((value: number, i: number) => {
            const row: Record<string, string | number | null> = {};
            dimensions.forEach((dim: string) => {
              const dimData = queryFixture.dimension[dim];
              const labels = Object.values(dimData.category.label);
              row[dim] = labels[i % labels.length] as string;
            });
            row['value'] = value;
            return row;
          }),
        },
        rowCount: values.length,
        metadata: {
          source: queryFixture.source,
          updated: queryFixture.updated,
        },
        queryInfo: {
          estimatedCells: values.length,
          executionTimeMs: 50,
          cacheHit: false,
        },
      };
    }),
  })),
}));

// Mock rate limiter
vi.mock('../../src/services/rate-limiter.js', () => ({
  getRateLimiter: vi.fn(() => ({
    getStatus: vi.fn().mockReturnValue({
      availableTokens: 8,
      capacity: 8,
      queueLength: 0,
      nextTokenMs: 0,
    }),
  })),
}));

// Mock cache
vi.mock('../../src/services/cache.js', () => ({
  getCacheService: vi.fn(() => ({
    getStats: vi.fn().mockReturnValue({
      subjectAreas: { size: 1, maxSize: 200 },
      tableLists: { size: 2, maxSize: 500 },
      metadata: { size: 5, maxSize: 500 },
      queries: { size: 10, maxSize: 1000 },
      search: { size: 3, maxSize: 200 },
    }),
  })),
}));

describe('MCP Tools with Real Fixtures', () => {
  describe('searchStatistics', () => {
    it('should search for statistics and return results', async () => {
      const result = await searchStatistics({ query: 'väestö', language: 'fi', limit: 10 });
      expect(result.results).toHaveLength(10);
      expect(result.results[0]).toHaveProperty('tableId');
      expect(result.results[0]).toHaveProperty('title');
    });

    it('should respect limit parameter', async () => {
      const result = await searchStatistics({ query: 'väestö', language: 'fi', limit: 5 });
      expect(result.results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('listSubjectAreas', () => {
    it('should list all 149 subject areas', async () => {
      const result = await listSubjectAreas({ language: 'fi' });
      expect(result.total).toBe(149);
      expect(result.areas[0]).toHaveProperty('id');
      expect(result.areas[0]).toHaveProperty('name');
    });
  });

  describe('listTables', () => {
    it('should list tables in a subject area', async () => {
      const result = await listTables({ subjectArea: 'vaerak', language: 'fi' });
      expect(result.tables.length).toBeGreaterThan(0);
      expect(result.subjectArea).toBe('vaerak');
      expect(result.tables[0]).toHaveProperty('id');
      expect(result.tables[0]).toHaveProperty('title');
    });
  });

  describe('getTableMetadata', () => {
    it('should return table metadata with variables', async () => {
      const result = await getTableMetadata({
        tableId: 'statfin_vaerak_pxt_11re.px',
        language: 'fi',
      });
      expect(result.tableId).toBe('statfin_vaerak_pxt_11re.px');
      expect(result.variables.length).toBe(5); // Alue, Ikä, Sukupuoli, Vuosi, Tiedot
      expect(result.totalCombinations).toBeGreaterThan(1000000); // ~5 million
    });

    it('should include variable value counts', async () => {
      const result = await getTableMetadata({
        tableId: 'statfin_vaerak_pxt_11re.px',
        language: 'fi',
      });
      const alueVar = result.variables.find(v => v.code === 'Alue');
      expect(alueVar).toBeDefined();
      expect(alueVar!.valueCount).toBe(309); // Real count
    });
  });

  describe('getVariableValues', () => {
    it('should return all values for Alue variable', async () => {
      const result = await getVariableValues({
        tableId: 'statfin_vaerak_pxt_11re.px',
        variable: 'Alue',
        language: 'fi',
      });
      expect(result.variable).toBe('Alue');
      expect(result.total).toBe(309);
      expect(result.values[0].code).toBe('SSS'); // Whole country
    });
  });

  describe('queryTable', () => {
    it('should execute query and return data', async () => {
      const result = await queryTable({
        tableId: 'statfin_vaerak_pxt_11re.px',
        selections: [
          { variable: 'Alue', filter: 'item', values: ['SSS'] },
          { variable: 'Ikä', filter: 'item', values: ['SSS'] },
          { variable: 'Sukupuoli', filter: 'item', values: ['SSS'] },
          { variable: 'Vuosi', filter: 'top', top: 3 },
          { variable: 'Tiedot', filter: 'item', values: ['vaesto'] },
        ],
        language: 'fi',
        limit: 100,
      });
      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(3);
      expect(result.data?.columns).toContain('value');
    });

    it('should reject queries exceeding cell limit', async () => {
      const result = await queryTable({
        tableId: 'statfin_vaerak_pxt_11re.px',
        selections: [], // No filters = all values (~5 million)
        language: 'fi',
        limit: 1000,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeding');
      expect(result.queryInfo.estimatedCells).toBeGreaterThan(1000000);
    });
  });

  describe('getApiStatus', () => {
    it('should return API health status', async () => {
      const result = await getApiStatus({});
      expect(result.healthy).toBe(true);
      expect(result.rateLimit).toBeDefined();
      expect(result.rateLimit.capacity).toBe(8);
      expect(result.cache).toBeDefined();
    });
  });
});
