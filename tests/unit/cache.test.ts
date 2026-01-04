import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../../src/services/cache.js';
import type { SubjectArea, TableInfo, TableMetadata, QueryResult } from '../../src/types/index.js';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  describe('Subject Areas', () => {
    const mockAreas: SubjectArea[] = [
      { id: 'vaerak', name: 'Väestörakenne', tableCount: 30 },
      { id: 'tyti', name: 'Työvoimatutkimus', tableCount: 20 },
    ];

    it('should cache and retrieve subject areas', () => {
      cache.setSubjectAreas('fi', mockAreas);
      const result = cache.getSubjectAreas('fi');
      expect(result).toEqual(mockAreas);
    });

    it('should return undefined for uncached language', () => {
      cache.setSubjectAreas('fi', mockAreas);
      expect(cache.getSubjectAreas('en')).toBeUndefined();
    });
  });

  describe('Table Lists', () => {
    const mockTables: TableInfo[] = [
      { id: 'statfin_vaerak_pxt_11re.px', title: 'Väestö', updated: '2024-12-15', path: '/vaerak' },
    ];

    it('should cache and retrieve table lists', () => {
      cache.setTableList('vaerak', 'fi', mockTables);
      const result = cache.getTableList('vaerak', 'fi');
      expect(result).toEqual(mockTables);
    });

    it('should store table update times', () => {
      cache.setTableList('vaerak', 'fi', mockTables);
      const updateTime = cache.getTableUpdateTime('statfin_vaerak_pxt_11re.px');
      expect(updateTime).toBe('2024-12-15');
    });
  });

  describe('Table Metadata', () => {
    const mockMetadata: TableMetadata = {
      tableId: 'statfin_vaerak_pxt_11re.px',
      path: 'StatFin/vaerak/statfin_vaerak_pxt_11re.px',
      title: 'Väestö',
      lastUpdated: '2024-12-15',
      variables: [],
      totalCombinations: 1000,
    };

    it('should cache and retrieve table metadata', () => {
      cache.setTableMetadata('statfin_vaerak_pxt_11re.px', 'fi', mockMetadata);
      const result = cache.getTableMetadata('statfin_vaerak_pxt_11re.px', 'fi');
      expect(result).toEqual(mockMetadata);
    });
  });

  describe('Query Results with Timestamp Validation', () => {
    const mockResult: QueryResult = {
      success: true,
      data: { columns: ['Alue', 'value'], rows: [{ Alue: 'Helsinki', value: 100 }] },
      rowCount: 1,
      metadata: { source: 'Test', updated: '2024-12-15' },
      queryInfo: { estimatedCells: 1, executionTimeMs: 10, cacheHit: false },
    };

    it('should cache and retrieve query results', () => {
      cache.setQueryResult('table1', 'hash1', mockResult, '2024-12-01', '2024-12-15');
      const result = cache.getQueryResult('table1', 'hash1');
      expect(result).toEqual(mockResult);
    });

    it('should invalidate cache when table is updated', () => {
      // Cache with table updated at 2024-12-01
      cache.setQueryResult('table1', 'hash1', mockResult, '2024-12-01', '2024-12-15');

      // Simulate table update
      cache.setTableList('test', 'fi', [
        { id: 'table1', title: 'Test', updated: '2024-12-20', path: '/test' },
      ]);

      // Should return undefined because table was updated after cache
      const result = cache.getQueryResult('table1', 'hash1');
      expect(result).toBeUndefined();
    });

    it('should return cached result if table has not been updated', () => {
      // Set table list first (simulating known update time)
      cache.setTableList('test', 'fi', [
        { id: 'table1', title: 'Test', updated: '2024-12-01', path: '/test' },
      ]);

      // Cache result
      cache.setQueryResult('table1', 'hash1', mockResult, '2024-12-01', '2024-12-15');

      // Should return cached result
      const result = cache.getQueryResult('table1', 'hash1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('Search Results', () => {
    const mockSearchResults = [
      { id: 'table1', path: '/path', title: 'Test', published: '2024-12-15', score: 0.9 },
    ];

    it('should cache and retrieve search results', () => {
      cache.setSearchResults('population', 'fi', mockSearchResults);
      const result = cache.getSearchResults('population', 'fi');
      expect(result).toEqual(mockSearchResults);
    });

    it('should normalize search queries', () => {
      cache.setSearchResults('  POPULATION  ', 'fi', mockSearchResults);
      const result = cache.getSearchResults('population', 'fi');
      expect(result).toEqual(mockSearchResults);
    });
  });

  describe('Cache Stats', () => {
    it('should return cache statistics', () => {
      cache.setSubjectAreas('fi', []);
      cache.setTableList('test', 'fi', []);

      const stats = cache.getStats();
      expect(stats.subjectAreas.size).toBeGreaterThan(0);
      expect(stats.tableLists.size).toBeGreaterThan(0);
    });
  });
});
