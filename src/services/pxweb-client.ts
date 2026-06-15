import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { getRateLimiter } from './rate-limiter.js';
import { getCacheService } from './cache.js';
import { createHash } from 'crypto';
import type {
  PxWebListItem,
  PxWebTableMetadata,
  PxWebSearchResult,
  PxWebQuery,
  JsonStat2Response,
  PxWebApiConfig,
  SubjectArea,
  TableInfo,
  TableMetadata,
  VariableInfo,
  QueryResult,
  Language,
} from '../types/index.js';

interface PxWebClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

/**
 * Client for the PxWeb API (Statistics Finland StatFin).
 *
 * Features:
 * - Rate limiting (token bucket)
 * - Smart caching with timestamp validation
 * - Automatic retry with exponential backoff
 */
export class PxWebClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: PxWebClientOptions = {}) {
    this.baseUrl = options.baseUrl || config.pxwebBaseUrl;
    this.timeoutMs = options.timeoutMs || config.requestTimeoutMs;
  }

  /**
   * Normalize a table ID to the short form used by the API.
   *
   * The 8 June 2026 PxWeb migration shortened table IDs from the long form
   * (e.g. "statfin_vaerak_pxt_11re.px") to a four-character code
   * (e.g. "11re.px"); the long form now returns HTTP 400. We accept the old
   * form for backward compatibility and convert it so legacy clients keep
   * working. Anything else (already short, or unrecognized) is returned as-is.
   */
  private normalizeTableId(tableId: string): string {
    const match = tableId.match(/^statfin_[a-z0-9]+_pxt_(.+)$/);
    return match?.[1] ?? tableId;
  }

  /**
   * Make a rate-limited GET request to the API
   */
  private async get<T>(path: string): Promise<T> {
    const rateLimiter = getRateLimiter();
    await rateLimiter.acquire();

    const url = `${this.baseUrl}${path}`;
    logger.debug({ url }, 'GET request');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Make a rate-limited POST request to the API
   */
  private async post<T>(path: string, body: unknown): Promise<T> {
    const rateLimiter = getRateLimiter();
    await rateLimiter.acquire();

    const url = `${this.baseUrl}${path}`;
    logger.debug({ url }, 'POST request');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ============== Browse/List Operations ==============

  /**
   * List all subject areas (top-level databases)
   */
  async listSubjectAreas(language: Language = 'fi'): Promise<SubjectArea[]> {
    const cache = getCacheService();

    // Check cache
    const cached = cache.getSubjectAreas(language);
    if (cached) {
      logger.debug({ language }, 'Subject areas cache hit');
      return cached;
    }

    // Fetch from API
    const items = await this.get<PxWebListItem[]>(`/${language}/StatFin`);

    // Count tables per area (requires additional API calls)
    // For now, we just return the basic info - table counts can be fetched lazily
    const areas: SubjectArea[] = items
      .filter((item) => item.type === 'l')
      .map((item) => ({
        id: item.id,
        name: item.text,
        tableCount: 0, // Will be filled when listing tables
      }));

    cache.setSubjectAreas(language, areas);
    return areas;
  }

  /**
   * List tables in a subject area
   */
  async listTables(
    subjectArea: string,
    language: Language = 'fi'
  ): Promise<TableInfo[]> {
    const cache = getCacheService();

    // Check cache
    const cached = cache.getTableList(subjectArea, language);
    if (cached) {
      logger.debug({ subjectArea, language }, 'Table list cache hit');
      return cached;
    }

    // Fetch from API
    const items = await this.get<PxWebListItem[]>(
      `/${language}/StatFin/${subjectArea}`
    );

    const tables: TableInfo[] = items
      .filter((item) => item.type === 't')
      .map((item) => ({
        id: item.id,
        title: item.text,
        updated: item.updated || '',
        path: `/${subjectArea}`,
      }));

    cache.setTableList(subjectArea, language, tables);
    return tables;
  }

  // ============== Table Metadata ==============

  /**
   * Get metadata for a table (variables and values)
   */
  async getTableMetadata(
    tableId: string,
    language: Language = 'fi',
    includeAllValues: boolean = false
  ): Promise<TableMetadata> {
    const cache = getCacheService();

    // The API addresses tables by their short ID and ignores the subject-area
    // path segment (e.g. /StatFin/11re.px works the same as /StatFin/vaerak/11re.px).
    const id = this.normalizeTableId(tableId);
    const path = `/${language}/StatFin/${id}`;

    // Check cache (unless requesting all values which might differ)
    if (!includeAllValues) {
      const cached = cache.getTableMetadata(id, language);
      if (cached) {
        logger.debug({ tableId: id, language }, 'Table metadata cache hit');
        return cached;
      }
    }

    // Fetch from API
    const raw = await this.get<PxWebTableMetadata>(path);

    // Best-effort table update time from a previously cached table list. The
    // subject area is no longer part of the table ID, so this is a cache miss
    // unless the relevant list was fetched in this process; falls back to ''.
    const lastUpdated = cache.getTableUpdateTime(id) || '';

    // Transform to our format
    const variables: VariableInfo[] = raw.variables.map((v) => {
      const maxValues = includeAllValues ? v.values.length : 20;
      const values = v.values.slice(0, maxValues).map((code, i) => ({
        code,
        name: v.valueTexts[i] || code,
      }));

      return {
        code: v.code,
        name: v.text,
        valueCount: v.values.length,
        values,
        hasMore: v.values.length > maxValues,
        isTime: v.time || false,
        isOptional: v.elimination || false,
      };
    });

    // Calculate total combinations
    const totalCombinations = raw.variables.reduce(
      (acc, v) => acc * v.values.length,
      1
    );

    const metadata: TableMetadata = {
      tableId: id,
      path: `StatFin/${id}`,
      title: raw.title,
      lastUpdated,
      variables,
      totalCombinations,
    };

    // Only cache if not requesting all values (default view)
    if (!includeAllValues) {
      cache.setTableMetadata(id, language, metadata);
    }

    return metadata;
  }

  /**
   * Get all values for a specific variable in a table
   */
  async getVariableValues(
    tableId: string,
    variableCode: string,
    language: Language = 'fi',
    search?: string
  ): Promise<{
    variable: string;
    total: number;
    values: Array<{ code: string; name: string }>;
  }> {
    // Get full metadata with all values
    const metadata = await this.getTableMetadata(tableId, language, true);
    const variable = metadata.variables.find((v) => v.code === variableCode);

    if (!variable) {
      throw new Error(`Variable '${variableCode}' not found in table ${tableId}`);
    }

    // Filter if search term provided
    let values = variable.values;
    if (search) {
      const searchLower = search.toLowerCase();
      values = values.filter(
        (v) =>
          v.code.toLowerCase().includes(searchLower) ||
          v.name.toLowerCase().includes(searchLower)
      );
    }

    return {
      variable: variable.name,
      total: values.length,
      values,
    };
  }

  // ============== Search ==============

  /**
   * Search for tables by keyword
   */
  async search(
    query: string,
    language: Language = 'fi',
    limit: number = 20
  ): Promise<PxWebSearchResult[]> {
    const cache = getCacheService();

    // Check cache
    const cached = cache.getSearchResults(query, language);
    if (cached) {
      logger.debug({ query, language }, 'Search cache hit');
      return cached.slice(0, limit);
    }

    // Fetch from API
    const encodedQuery = encodeURIComponent(query);
    const results = await this.get<PxWebSearchResult[]>(
      `/${language}/StatFin?query=${encodedQuery}`
    );

    // Cache full results
    cache.setSearchResults(query, language, results);

    return results.slice(0, limit);
  }

  // ============== Query Execution ==============

  /**
   * Execute a data query on a table
   */
  async query(
    tableId: string,
    selections: Array<{
      variable: string;
      filter: 'item' | 'all' | 'top';
      values?: string[];
      top?: number;
    }>,
    language: Language = 'fi',
    format: 'json-stat2' | 'json' | 'csv' = 'json-stat2'
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const cache = getCacheService();

    // The API addresses tables by their short ID and ignores the subject-area
    // path segment. Normalize so legacy long-form IDs keep working.
    const id = this.normalizeTableId(tableId);
    const apiPath = `/${language}/StatFin/${id}`;

    // Build query body
    const queryBody: PxWebQuery = {
      query: selections.map((s) => ({
        code: s.variable,
        selection: {
          filter: s.filter,
          values:
            s.filter === 'top'
              ? [String(s.top || 1)]
              : s.filter === 'all'
                ? ['*']
                : s.values || [],
        },
      })),
      response: { format },
    };

    // Create cache key
    const queryHash = createHash('sha256')
      .update(JSON.stringify(queryBody))
      .digest('hex')
      .substring(0, 16);

    // Check cache
    const cachedResult = cache.getQueryResult(id, queryHash);
    if (cachedResult) {
      logger.debug({ tableId: id, queryHash }, 'Query cache hit');
      return {
        ...cachedResult,
        queryInfo: {
          ...cachedResult.queryInfo,
          cacheHit: true,
          executionTimeMs: Date.now() - startTime,
        },
      };
    }

    // Get table update time for cache validation
    const tableUpdated = cache.getTableUpdateTime(id) || '';

    // Execute query
    const response = await this.post<JsonStat2Response>(apiPath, queryBody);

    // Transform response
    const result = this.transformJsonStat2(response, startTime);

    // Cache result
    cache.setQueryResult(
      id,
      queryHash,
      result,
      tableUpdated,
      response.updated || ''
    );

    return result;
  }

  /**
   * Transform JSON-stat2 response to our format
   */
  private transformJsonStat2(
    response: JsonStat2Response,
    startTime: number
  ): QueryResult {
    const dimensions = response.id;
    const sizes = response.size;

    // Build column names from dimensions
    const columns = dimensions.map(
      (d) => response.dimension[d]?.label || d
    );

    // Create index arrays for each dimension
    const dimensionValues = dimensions.map((d) => {
      const dim = response.dimension[d];
      if (!dim) return [];
      const index = dim.category.index;
      const labels = dim.category.label;
      return Object.keys(index)
        .sort((a, b) => index[a]! - index[b]!)
        .map((key) => labels[key] || key);
    });

    // Generate rows from flat value array
    const rows: Record<string, string | number | null>[] = [];
    const totalRows = sizes.reduce((a, b) => a * b, 1);

    for (let i = 0; i < totalRows; i++) {
      const row: Record<string, string | number | null> = {};

      // Calculate indices for each dimension
      let remainder = i;
      for (let d = 0; d < dimensions.length; d++) {
        const size = sizes.slice(d + 1).reduce((a, b) => a * b, 1);
        const idx = Math.floor(remainder / size);
        remainder = remainder % size;

        const colName = columns[d] || dimensions[d] || `col_${d}`;
        row[colName] = dimensionValues[d]?.[idx] || String(idx);
      }

      // Add the value
      row['value'] = response.value[i] ?? null;
      rows.push(row);
    }

    return {
      success: true,
      data: {
        columns: [...columns, 'value'],
        rows,
      },
      rowCount: rows.length,
      metadata: {
        source: response.source,
        updated: response.updated,
        label: response.label,
      },
      queryInfo: {
        estimatedCells: totalRows,
        executionTimeMs: Date.now() - startTime,
        cacheHit: false,
      },
    };
  }

  // ============== API Config ==============

  /**
   * Get API configuration and limits
   */
  async getConfig(): Promise<PxWebApiConfig> {
    const response = await this.get<PxWebApiConfig>(`/fi?config`);
    return response;
  }
}

// Singleton instance
let pxwebClient: PxWebClient | null = null;

export function getPxWebClient(): PxWebClient {
  if (!pxwebClient) {
    pxwebClient = new PxWebClient();
    logger.info({ baseUrl: config.pxwebBaseUrl }, 'PxWeb client initialized');
  }
  return pxwebClient;
}
