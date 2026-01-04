import { LRUCache } from 'lru-cache';
import { logger } from '../utils/logger.js';
import type {
  CacheStats,
  CachedQuery,
  QueryResult,
  SubjectArea,
  TableInfo,
  TableMetadata,
  PxWebSearchResult,
} from '../types/index.js';

interface CacheOptions {
  subjectAreaMaxSize?: number;
  tableListMaxSize?: number;
  metadataMaxSize?: number;
  queryMaxSize?: number;
  searchMaxSize?: number;
  subjectAreaTtlMs?: number;
  tableListTtlMs?: number;
  searchTtlMs?: number;
}

/**
 * Multi-tier cache with smart timestamp validation.
 *
 * Key insight: PxWeb provides `updated` timestamps at table and response level.
 * We use these to validate cached data - only invalidate when StatFin updates the table.
 * Historical data (e.g., 2020 population) can be served from cache indefinitely.
 */
export class CacheService {
  // Subject area list (rarely changes)
  private subjectAreaCache: LRUCache<string, SubjectArea[]>;

  // Table listings per subject area (contains `updated` timestamps)
  private tableListCache: LRUCache<string, TableInfo[]>;

  // Table metadata (long-lived, validated against table list)
  private metadataCache: LRUCache<string, TableMetadata>;

  // Query results (long-lived, validated against table `updated`)
  private queryCache: LRUCache<string, CachedQuery>;

  // Search results (short-lived, dynamic)
  private searchCache: LRUCache<string, PxWebSearchResult[]>;

  // Track table update times for validation
  private tableUpdateTimes: Map<string, string> = new Map();

  constructor(options: CacheOptions = {}) {
    this.subjectAreaCache = new LRUCache<string, SubjectArea[]>({
      max: options.subjectAreaMaxSize || 200,
      ttl: options.subjectAreaTtlMs || 24 * 60 * 60 * 1000, // 24h
    });

    this.tableListCache = new LRUCache<string, TableInfo[]>({
      max: options.tableListMaxSize || 500,
      ttl: options.tableListTtlMs || 24 * 60 * 60 * 1000, // 24h
    });

    this.metadataCache = new LRUCache<string, TableMetadata>({
      max: options.metadataMaxSize || 500,
      // No TTL - validated against table list
    });

    this.queryCache = new LRUCache<string, CachedQuery>({
      max: options.queryMaxSize || 1000,
      // No TTL - validated against table updated time
    });

    this.searchCache = new LRUCache<string, PxWebSearchResult[]>({
      max: options.searchMaxSize || 200,
      ttl: options.searchTtlMs || 60 * 60 * 1000, // 1h
    });
  }

  // ============== Subject Areas ==============

  getSubjectAreas(language: string): SubjectArea[] | undefined {
    return this.subjectAreaCache.get(`areas:${language}`);
  }

  setSubjectAreas(language: string, areas: SubjectArea[]): void {
    this.subjectAreaCache.set(`areas:${language}`, areas);
    logger.debug({ language, count: areas.length }, 'Cached subject areas');
  }

  // ============== Table Lists ==============

  getTableList(subjectArea: string, language: string): TableInfo[] | undefined {
    return this.tableListCache.get(`tables:${language}:${subjectArea}`);
  }

  setTableList(
    subjectArea: string,
    language: string,
    tables: TableInfo[]
  ): void {
    this.tableListCache.set(`tables:${language}:${subjectArea}`, tables);

    // Update table update times for validation
    for (const table of tables) {
      if (table.updated) {
        this.tableUpdateTimes.set(table.id, table.updated);
      }
    }

    logger.debug({ subjectArea, language, count: tables.length }, 'Cached table list');
  }

  // ============== Table Metadata ==============

  getTableMetadata(tableId: string, language: string): TableMetadata | undefined {
    const cached = this.metadataCache.get(`meta:${language}:${tableId}`);
    if (!cached) return undefined;

    // Validate against current table update time
    const currentUpdated = this.tableUpdateTimes.get(tableId);
    if (currentUpdated && currentUpdated > cached.lastUpdated) {
      // Table was updated, invalidate
      this.metadataCache.delete(`meta:${language}:${tableId}`);
      logger.debug({ tableId, reason: 'table_updated' }, 'Metadata cache invalidated');
      return undefined;
    }

    return cached;
  }

  setTableMetadata(
    tableId: string,
    language: string,
    metadata: TableMetadata
  ): void {
    this.metadataCache.set(`meta:${language}:${tableId}`, metadata);
    logger.debug({ tableId, language }, 'Cached table metadata');
  }

  // ============== Query Results ==============

  /**
   * Get cached query result, validating against table update time.
   * Returns undefined if cache is invalid or missing.
   */
  getQueryResult(tableId: string, queryHash: string): QueryResult | undefined {
    const cached = this.queryCache.get(`query:${tableId}:${queryHash}`);
    if (!cached) return undefined;

    // Validate against current table update time
    const currentUpdated = this.tableUpdateTimes.get(tableId);
    if (currentUpdated && currentUpdated > cached.tableUpdated) {
      // Table was updated after cache, invalidate
      this.queryCache.delete(`query:${tableId}:${queryHash}`);
      logger.debug({ tableId, reason: 'table_updated' }, 'Query cache invalidated');
      return undefined;
    }

    return cached.data;
  }

  /**
   * Cache a query result with validation timestamps.
   */
  setQueryResult(
    tableId: string,
    queryHash: string,
    result: QueryResult,
    tableUpdated: string,
    dataUpdated: string
  ): void {
    const cached: CachedQuery = {
      data: result,
      tableUpdated,
      dataUpdated,
      cachedAt: new Date().toISOString(),
    };
    this.queryCache.set(`query:${tableId}:${queryHash}`, cached);
    logger.debug({ tableId, queryHash: queryHash.substring(0, 8) }, 'Cached query result');
  }

  // ============== Search Results ==============

  getSearchResults(
    query: string,
    language: string
  ): PxWebSearchResult[] | undefined {
    const normalizedQuery = query.trim().toLowerCase();
    return this.searchCache.get(`search:${language}:${normalizedQuery}`);
  }

  setSearchResults(
    query: string,
    language: string,
    results: PxWebSearchResult[]
  ): void {
    const normalizedQuery = query.trim().toLowerCase();
    this.searchCache.set(`search:${language}:${normalizedQuery}`, results);
    logger.debug({ query, language, count: results.length }, 'Cached search results');
  }

  // ============== Table Update Times ==============

  /**
   * Get the last known update time for a table.
   * Used for cache validation.
   */
  getTableUpdateTime(tableId: string): string | undefined {
    return this.tableUpdateTimes.get(tableId);
  }

  /**
   * Update the known update time for a table.
   * Call this when receiving fresh data from the API.
   */
  setTableUpdateTime(tableId: string, updated: string): void {
    this.tableUpdateTimes.set(tableId, updated);
  }

  // ============== Cache Management ==============

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.subjectAreaCache.clear();
    this.tableListCache.clear();
    this.metadataCache.clear();
    this.queryCache.clear();
    this.searchCache.clear();
    this.tableUpdateTimes.clear();
    logger.info('All caches cleared');
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    return {
      subjectAreas: {
        size: this.subjectAreaCache.size,
        maxSize: this.subjectAreaCache.max,
      },
      tableLists: {
        size: this.tableListCache.size,
        maxSize: this.tableListCache.max,
      },
      metadata: {
        size: this.metadataCache.size,
        maxSize: this.metadataCache.max,
      },
      queries: {
        size: this.queryCache.size,
        maxSize: this.queryCache.max,
      },
      search: {
        size: this.searchCache.size,
        maxSize: this.searchCache.max,
      },
    };
  }
}

// Singleton instance
let cacheService: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheService) {
    cacheService = new CacheService();
    logger.info('Cache service initialized');
  }
  return cacheService;
}
