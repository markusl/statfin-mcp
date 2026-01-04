import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PxWebClient } from '../../src/services/pxweb-client.js';

// Load real fixtures
const fixturesDir = join(import.meta.dirname, '../fixtures');
const loadFixture = (name: string) => JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), 'utf-8'));

const subjectAreasFixture = loadFixture('api-subject-areas');
const tableListFixture = loadFixture('api-table-list-vaerak');
const metadataFixture = loadFixture('api-metadata-population');
const metadataEnFixture = loadFixture('api-metadata-population-en');
const metadataEmploymentFixture = loadFixture('api-metadata-employment');
const searchFixture = loadFixture('api-search-vaesto');
const searchUnemploymentEnFixture = loadFixture('api-search-unemployment-en');
const queryFixture = loadFixture('api-query-population-finland');
const queryThreeCitiesFixture = loadFixture('api-query-three-cities');
const queryHelsinkiFixture = loadFixture('api-query-helsinki-population');

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock rate limiter to not actually wait
vi.mock('../../src/services/rate-limiter.js', () => ({
  getRateLimiter: vi.fn(() => ({
    acquire: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock cache service
vi.mock('../../src/services/cache.js', () => ({
  getCacheService: vi.fn(() => ({
    getSubjectAreas: vi.fn().mockReturnValue(undefined),
    setSubjectAreas: vi.fn(),
    getTableList: vi.fn().mockReturnValue(undefined),
    setTableList: vi.fn(),
    getTableMetadata: vi.fn().mockReturnValue(undefined),
    setTableMetadata: vi.fn(),
    getSearchResults: vi.fn().mockReturnValue(undefined),
    setSearchResults: vi.fn(),
    getQueryResult: vi.fn().mockReturnValue(undefined),
    setQueryResult: vi.fn(),
    getTableUpdateTime: vi.fn().mockReturnValue(undefined),
  })),
}));

describe('PxWebClient', () => {
  let client: PxWebClient;

  beforeEach(() => {
    client = new PxWebClient({
      baseUrl: 'https://pxdata.stat.fi/PxWeb/api/v1',
      timeoutMs: 30000,
    });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('listSubjectAreas', () => {
    it('should fetch and transform subject areas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => subjectAreasFixture,
      });

      const result = await client.listSubjectAreas('fi');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
      );

      expect(result).toHaveLength(149);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should filter out non-folder items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 'vaerak', type: 'l', text: 'Väestörakenne' },
          { id: 'table.px', type: 't', text: 'Some table' },
        ],
      });

      const result = await client.listSubjectAreas('fi');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('vaerak');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('HTTP 500');
    });
  });

  describe('listTables', () => {
    it('should fetch and transform table list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => tableListFixture,
      });

      const result = await client.listTables('vaerak', 'fi');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/vaerak',
        expect.any(Object)
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('updated');
    });

    it('should only return table type items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 'subfolder', type: 'l', text: 'Subfolder' },
          { id: 'table.px', type: 't', text: 'Table', updated: '2024-01-01' },
        ],
      });

      const result = await client.listTables('vaerak', 'fi');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('table.px');
    });
  });

  describe('getTableMetadata', () => {
    it('should fetch and transform table metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getTableMetadata('statfin_vaerak_pxt_11re.px', 'fi');

      expect(result.tableId).toBe('statfin_vaerak_pxt_11re.px');
      expect(result.title).toBe(metadataFixture.title);
      expect(result.variables).toHaveLength(5);
    });

    it('should include variable metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getTableMetadata('statfin_vaerak_pxt_11re.px', 'fi');

      const alueVar = result.variables.find(v => v.code === 'Alue');
      expect(alueVar).toBeDefined();
      expect(alueVar!.valueCount).toBe(309);
      expect(alueVar!.isOptional).toBe(true); // elimination=true
    });

    it('should calculate total combinations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getTableMetadata('statfin_vaerak_pxt_11re.px', 'fi');

      // 309 * 102 * 3 * 53 * 1 = 5,011,362
      expect(result.totalCombinations).toBeGreaterThan(5000000);
    });

    it('should limit values when includeAllValues is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getTableMetadata('statfin_vaerak_pxt_11re.px', 'fi', false);

      const alueVar = result.variables.find(v => v.code === 'Alue');
      expect(alueVar!.values.length).toBeLessThanOrEqual(20);
      expect(alueVar!.hasMore).toBe(true);
    });
  });

  describe('getVariableValues', () => {
    it('should return all values for a variable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getVariableValues('statfin_vaerak_pxt_11re.px', 'Alue', 'fi');

      expect(result.variable).toBe('Alue');
      expect(result.total).toBe(309);
      expect(result.values).toHaveLength(309);
    });

    it('should filter values by search term', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      const result = await client.getVariableValues(
        'statfin_vaerak_pxt_11re.px',
        'Alue',
        'fi',
        'Helsinki'
      );

      expect(result.values.length).toBeLessThan(309);
      expect(result.values.some(v => v.name.includes('Helsinki'))).toBe(true);
    });

    it('should throw error for unknown variable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataFixture,
      });

      await expect(
        client.getVariableValues('statfin_vaerak_pxt_11re.px', 'UnknownVar', 'fi')
      ).rejects.toThrow("Variable 'UnknownVar' not found");
    });
  });

  describe('search', () => {
    it('should search for tables', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => searchFixture,
      });

      const result = await client.search('väestö', 'fi', 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=v%C3%A4est%C3%B6'),
        expect.any(Object)
      );

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should respect limit parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => searchFixture,
      });

      const result = await client.search('väestö', 'fi', 5);

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('query', () => {
    it('should execute query and transform JSON-stat2 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => queryFixture,
      });

      const result = await client.query(
        'statfin_vaerak_pxt_11re.px',
        [
          { variable: 'Alue', filter: 'item', values: ['SSS'] },
          { variable: 'Vuosi', filter: 'top', top: 3 },
        ],
        'fi'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.columns).toContain('value');
      expect(result.data!.rows.length).toBeGreaterThan(0);
    });

    it('should include query metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => queryFixture,
      });

      const result = await client.query(
        'statfin_vaerak_pxt_11re.px',
        [{ variable: 'Alue', filter: 'item', values: ['SSS'] }],
        'fi'
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata!.source).toBe('Tilastokeskus, väestörakenne');
      expect(result.queryInfo.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should send correct POST body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => queryFixture,
      });

      await client.query(
        'statfin_vaerak_pxt_11re.px',
        [
          { variable: 'Alue', filter: 'item', values: ['SSS', 'KU091'] },
          { variable: 'Vuosi', filter: 'top', top: 5 },
        ],
        'fi'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"filter":"item"'),
        })
      );
    });

    it('should handle query errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid query',
      });

      await expect(
        client.query('statfin_vaerak_pxt_11re.px', [], 'fi')
      ).rejects.toThrow('HTTP 400');
    });
  });

  describe('transformJsonStat2', () => {
    it('should correctly transform multi-dimensional data', async () => {
      const multiDimResponse = {
        ...queryFixture,
        id: ['Alue', 'Vuosi', 'Tiedot'],
        size: [2, 3, 1],
        value: [100, 110, 120, 200, 210, 220],
        dimension: {
          Alue: {
            label: 'Alue',
            category: {
              index: { SSS: 0, KU091: 1 },
              label: { SSS: 'KOKO MAA', KU091: 'Helsinki' },
            },
          },
          Vuosi: {
            label: 'Vuosi',
            category: {
              index: { '2022': 0, '2023': 1, '2024': 2 },
              label: { '2022': '2022', '2023': '2023', '2024': '2024' },
            },
          },
          Tiedot: {
            label: 'Tiedot',
            category: {
              index: { vaesto: 0 },
              label: { vaesto: 'Väestö' },
            },
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => multiDimResponse,
      });

      const result = await client.query('test.px', [], 'fi');

      expect(result.rowCount).toBe(6);
      expect(result.data!.columns).toEqual(['Alue', 'Vuosi', 'Tiedot', 'value']);
    });

    it('should handle null values in response', async () => {
      const responseWithNulls = {
        ...queryFixture,
        value: [100, null, 120],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithNulls,
      });

      const result = await client.query('test.px', [], 'fi');

      expect(result.data!.rows.some(r => r.value === null)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('Network error');
    });

    it('should handle timeout via AbortController', async () => {
      // Create a client with very short timeout
      const shortTimeoutClient = new PxWebClient({
        baseUrl: 'https://pxdata.stat.fi/PxWeb/api/v1',
        timeoutMs: 1,
      });

      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      await expect(shortTimeoutClient.listSubjectAreas('fi')).rejects.toThrow();
    });

    it('should handle AbortError specifically', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('aborted');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      });

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('Unexpected token');
    });

    it('should handle empty array response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await client.listSubjectAreas('fi');
      // Empty array returns empty result
      expect(result).toEqual([]);
    });

    it('should handle connection refused errors', async () => {
      const connectionError = new Error('connect ECONNREFUSED 127.0.0.1:443');
      connectionError.name = 'FetchError';

      mockFetch.mockRejectedValueOnce(connectionError);

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND pxdata.stat.fi');

      mockFetch.mockRejectedValueOnce(dnsError);

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('ENOTFOUND');
    });

    it('should handle POST request network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error during POST'));

      await expect(
        client.query('statfin_vaerak_pxt_11re.px', [], 'fi')
      ).rejects.toThrow('Network error during POST');
    });

    it('should handle malformed JSON-stat2 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing required fields
          id: ['Alue'],
          size: [2],
          // value is missing
        }),
      });

      await expect(
        client.query('statfin_vaerak_pxt_11re.px', [], 'fi')
      ).rejects.toThrow();
    });
  });

  describe('getConfig', () => {
    it('should fetch API configuration', async () => {
      const configResponse = {
        maxValues: 100000,
        maxCells: 120000,
        maxCalls: 30,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => configResponse,
      });

      const result = await client.getConfig();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://pxdata.stat.fi/PxWeb/api/v1/fi?config',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(configResponse);
    });

    it('should handle config fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(client.getConfig()).rejects.toThrow('HTTP 500');
    });
  });

  describe('HTTP status codes', () => {
    it('should handle HTTP 429 rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('HTTP 429');
    });

    it('should handle HTTP 503 service unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await expect(client.listSubjectAreas('fi')).rejects.toThrow('HTTP 503');
    });

    it('should handle HTTP 404 not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(client.listTables('nonexistent', 'fi')).rejects.toThrow('HTTP 404');
    });

    it('should include response body in POST error messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid query: variable not found',
      });

      await expect(
        client.query('test.px', [{ variable: 'Invalid', filter: 'item', values: ['x'] }], 'fi')
      ).rejects.toThrow('Invalid query: variable not found');
    });
  });

  describe('language support', () => {
    it('should use Finnish by default', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => subjectAreasFixture,
      });

      await client.listSubjectAreas();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/fi/StatFin'),
        expect.any(Object)
      );
    });

    it('should support English', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => subjectAreasFixture,
      });

      await client.listSubjectAreas('en');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/en/StatFin'),
        expect.any(Object)
      );
    });

    it('should support Swedish', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => subjectAreasFixture,
      });

      await client.listSubjectAreas('sv');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sv/StatFin'),
        expect.any(Object)
      );
    });
  });

  describe('English language with real fixtures', () => {
    it('should return English metadata with translated labels', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataEnFixture,
      });

      const result = await client.getTableMetadata('statfin_vaerak_pxt_11re.px', 'en');

      expect(result.title).toContain('Population');
      expect(result.variables.find(v => v.code === 'Alue')?.name).toBe('Area');
    });

    it('should search in English and return results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => searchUnemploymentEnFixture,
      });

      const result = await client.search('unemployment', 'en', 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('multi-region queries with real fixtures', () => {
    it('should handle three-city query response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => queryThreeCitiesFixture,
      });

      const result = await client.query(
        'statfin_vaerak_pxt_11re.px',
        [
          { variable: 'Alue', filter: 'item', values: ['KU091', 'KU092', 'KU049'] },
          { variable: 'Vuosi', filter: 'top', top: 1 },
        ],
        'fi'
      );

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(3); // 3 cities
      expect(result.data?.rows.some(r => r['Alue'] === 'Helsinki')).toBe(true);
      expect(result.data?.rows.some(r => r['Alue'] === 'Espoo')).toBe(true);
      expect(result.data?.rows.some(r => r['Alue'] === 'Vantaa')).toBe(true);
    });

    it('should handle Helsinki population trend', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => queryHelsinkiFixture,
      });

      const result = await client.query(
        'statfin_vaerak_pxt_11re.px',
        [
          { variable: 'Alue', filter: 'item', values: ['KU091'] },
          { variable: 'Vuosi', filter: 'top', top: 5 },
        ],
        'fi'
      );

      expect(result.success).toBe(true);
      expect(result.rowCount).toBe(5); // 5 years
      expect(result.data?.rows.every(r => r['Alue'] === 'Helsinki')).toBe(true);
    });
  });

  describe('different table structures with real fixtures', () => {
    it('should handle employment table metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataEmploymentFixture,
      });

      const result = await client.getTableMetadata('statfin_tyti_pxt_135z.px', 'fi');

      expect(result.title).toBeDefined();
      expect(result.variables.length).toBeGreaterThan(0);
      // Employment tables have different variable structure
      expect(result.variables.some(v => v.isTime)).toBe(true);
    });

    it('should calculate total combinations for employment table', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => metadataEmploymentFixture,
      });

      const result = await client.getTableMetadata('statfin_tyti_pxt_135z.px', 'fi');

      expect(result.totalCombinations).toBeGreaterThan(0);
      // Verify it's a product of all variable value counts
      const expectedCombinations = result.variables.reduce(
        (acc, v) => acc * v.valueCount,
        1
      );
      expect(result.totalCombinations).toBe(expectedCombinations);
    });
  });
});

describe('cache hit paths', () => {
  let client: PxWebClient;

  beforeEach(() => {
    client = new PxWebClient({
      baseUrl: 'https://pxdata.stat.fi/PxWeb/api/v1',
      timeoutMs: 30000,
    });
    mockFetch.mockReset();
  });

  it('should return cached search results without API call', async () => {
    const cachedResults = [
      { id: 'table1.px', path: '/vaerak', title: 'Cached Table', score: 0.9 },
    ];

    // Override the cache mock for this test
    const { getCacheService } = await import('../../src/services/cache.js');
    vi.mocked(getCacheService).mockReturnValueOnce({
      getSubjectAreas: vi.fn().mockReturnValue(undefined),
      setSubjectAreas: vi.fn(),
      getTableList: vi.fn().mockReturnValue(undefined),
      setTableList: vi.fn(),
      getTableMetadata: vi.fn().mockReturnValue(undefined),
      setTableMetadata: vi.fn(),
      getSearchResults: vi.fn().mockReturnValue(cachedResults),
      setSearchResults: vi.fn(),
      getQueryResult: vi.fn().mockReturnValue(undefined),
      setQueryResult: vi.fn(),
      getTableUpdateTime: vi.fn().mockReturnValue(undefined),
      getStats: vi.fn(),
    } as never);

    const result = await client.search('väestö', 'fi', 10);

    // Should return cached results
    expect(result).toEqual(cachedResults);
    // Should NOT have made an API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return cached query results with updated cacheHit flag', async () => {
    const cachedQueryResult = {
      success: true,
      data: {
        columns: ['Alue', 'Vuosi', 'value'],
        rows: [{ Alue: 'Helsinki', Vuosi: '2024', value: 674000 }],
      },
      rowCount: 1,
      queryInfo: {
        estimatedCells: 1,
        executionTimeMs: 50,
        cacheHit: false,
      },
    };

    // Override the cache mock for this test
    const { getCacheService } = await import('../../src/services/cache.js');
    vi.mocked(getCacheService).mockReturnValueOnce({
      getSubjectAreas: vi.fn().mockReturnValue(undefined),
      setSubjectAreas: vi.fn(),
      getTableList: vi.fn().mockReturnValue(undefined),
      setTableList: vi.fn(),
      getTableMetadata: vi.fn().mockReturnValue(undefined),
      setTableMetadata: vi.fn(),
      getSearchResults: vi.fn().mockReturnValue(undefined),
      setSearchResults: vi.fn(),
      getQueryResult: vi.fn().mockReturnValue(cachedQueryResult),
      setQueryResult: vi.fn(),
      getTableUpdateTime: vi.fn().mockReturnValue('2024-01-01'),
      getStats: vi.fn(),
    } as never);

    const result = await client.query(
      'statfin_vaerak_pxt_11re.px',
      [{ variable: 'Alue', filter: 'item', values: ['KU091'] }],
      'fi'
    );

    // Should return cached results with cacheHit=true
    expect(result.success).toBe(true);
    expect(result.queryInfo.cacheHit).toBe(true);
    expect(result.data).toEqual(cachedQueryResult.data);
    // Should NOT have made an API call
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should respect limit when returning cached search results', async () => {
    const cachedResults = [
      { id: 'table1.px', path: '/vaerak', title: 'Table 1', score: 0.9 },
      { id: 'table2.px', path: '/vaerak', title: 'Table 2', score: 0.8 },
      { id: 'table3.px', path: '/vaerak', title: 'Table 3', score: 0.7 },
      { id: 'table4.px', path: '/vaerak', title: 'Table 4', score: 0.6 },
      { id: 'table5.px', path: '/vaerak', title: 'Table 5', score: 0.5 },
    ];

    const { getCacheService } = await import('../../src/services/cache.js');
    vi.mocked(getCacheService).mockReturnValueOnce({
      getSubjectAreas: vi.fn().mockReturnValue(undefined),
      setSubjectAreas: vi.fn(),
      getTableList: vi.fn().mockReturnValue(undefined),
      setTableList: vi.fn(),
      getTableMetadata: vi.fn().mockReturnValue(undefined),
      setTableMetadata: vi.fn(),
      getSearchResults: vi.fn().mockReturnValue(cachedResults),
      setSearchResults: vi.fn(),
      getQueryResult: vi.fn().mockReturnValue(undefined),
      setQueryResult: vi.fn(),
      getTableUpdateTime: vi.fn().mockReturnValue(undefined),
      getStats: vi.fn(),
    } as never);

    const result = await client.search('väestö', 'fi', 3);

    // Should only return first 3 results
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('table1.px');
    expect(result[2].id).toBe('table3.px');
  });
});

describe('getPxWebClient singleton', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return the same instance on multiple calls', async () => {
    const { getPxWebClient } = await import('../../src/services/pxweb-client.js');

    const client1 = getPxWebClient();
    const client2 = getPxWebClient();

    expect(client1).toBe(client2);
  });

  it('should create a PxWebClient instance', async () => {
    const { getPxWebClient, PxWebClient } = await import('../../src/services/pxweb-client.js');

    const client = getPxWebClient();

    expect(client).toBeInstanceOf(PxWebClient);
  });
});
