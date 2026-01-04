/**
 * PxWeb API types
 */

// Database/table listing item
export interface PxWebListItem {
  id: string;
  type: 'l' | 't'; // l = link (folder), t = table
  text: string;
  updated?: string; // ISO timestamp, only for tables
}

// Variable in table metadata
export interface PxWebVariable {
  code: string;
  text: string;
  values: string[];
  valueTexts: string[];
  elimination?: boolean;
  time?: boolean;
}

// Table metadata response
export interface PxWebTableMetadata {
  title: string;
  variables: PxWebVariable[];
}

// Search result item
export interface PxWebSearchResult {
  id: string;
  path: string;
  title: string;
  score: number;
  published: string;
}

// Query request body
export interface PxWebQuery {
  query: PxWebQueryVariable[];
  response: {
    format: 'json-stat2' | 'json' | 'csv' | 'xlsx' | 'px';
  };
}

export interface PxWebQueryVariable {
  code: string;
  selection: {
    filter: 'item' | 'all' | 'top' | 'agg';
    values: string[];
  };
}

// JSON-stat2 response format
export interface JsonStat2Response {
  version: string;
  class: string;
  id: string[];
  size: number[];
  dimension: Record<string, JsonStat2Dimension>;
  value: (number | null)[];
  status?: Record<string, string>;
  source?: string;
  updated?: string;
  label?: string;
  note?: string[];
  extension?: Record<string, unknown>;
  role?: {
    time?: string[];
    geo?: string[];
    metric?: string[];
  };
}

export interface JsonStat2Dimension {
  label: string;
  category: {
    index: Record<string, number>;
    label: Record<string, string>;
    unit?: Record<string, { base: string; decimals: number }>;
  };
}

// API config response
export interface PxWebApiConfig {
  maxValues: number;
  maxCalls: number;
  timeWindow: number;
  CORS: boolean;
}
