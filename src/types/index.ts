export * from './config.js';
export * from './pxweb.js';

/**
 * Subject area with table count
 */
export interface SubjectArea {
  id: string;
  name: string;
  tableCount: number;
}

/**
 * Table info from listing
 */
export interface TableInfo {
  id: string;
  title: string;
  updated: string;
  path: string;
}

/**
 * Variable metadata for tools
 */
export interface VariableInfo {
  code: string;
  name: string;
  valueCount: number;
  values: Array<{ code: string; name: string }>;
  hasMore: boolean;
  isTime: boolean;
  isOptional: boolean;
}

/**
 * Table metadata for tools
 */
export interface TableMetadata {
  tableId: string;
  path: string;
  title: string;
  lastUpdated: string;
  variables: VariableInfo[];
  totalCombinations: number;
}

/**
 * Query result
 */
export interface QueryResult {
  success: boolean;
  data?: {
    columns: string[];
    rows: Record<string, string | number | null>[];
  };
  rowCount?: number;
  metadata?: {
    source?: string;
    updated?: string;
    label?: string;
  };
  queryInfo: {
    estimatedCells: number;
    executionTimeMs: number;
    cacheHit: boolean;
  };
  error?: string;
}

/**
 * Cached query entry with validation timestamps
 */
export interface CachedQuery {
  data: QueryResult;
  tableUpdated: string;
  dataUpdated: string;
  cachedAt: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  subjectAreas: { size: number; maxSize: number };
  tableLists: { size: number; maxSize: number };
  metadata: { size: number; maxSize: number };
  queries: { size: number; maxSize: number };
  search: { size: number; maxSize: number };
}
