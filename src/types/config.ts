/**
 * Application configuration
 */
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  pxwebBaseUrl: string;
  defaultLanguage: 'fi' | 'en' | 'sv';

  // Rate limiting (per instance)
  maxCallsPerMinute: number;
  requestTimeoutMs: number;

  // Query limits
  maxQueryCells: number;
  defaultQueryLimit: number;

  // Authentication (for HTTP transport)
  apiToken: string | undefined;

  // Cloud Run detection
  isCloudRun: boolean;
}

export type Language = 'fi' | 'en' | 'sv';
