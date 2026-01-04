import type { AppConfig } from './types/index.js';

// Cloud Run sets K_SERVICE with the service name
const isCloudRun = !!process.env.K_SERVICE;

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: (process.env.NODE_ENV || 'development') as AppConfig['nodeEnv'],
  pxwebBaseUrl:
    process.env.PXWEB_BASE_URL || 'https://pxdata.stat.fi/PxWeb/api/v1',
  defaultLanguage: (process.env.DEFAULT_LANGUAGE || 'fi') as 'fi' | 'en' | 'sv',

  // Rate limiting: 8 calls/min per instance (allows 3 Cloud Run instances = 24 total < 30 API limit)
  maxCallsPerMinute: parseInt(process.env.MAX_CALLS_PER_MINUTE || '8', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '60000', 10),

  // Query limits
  maxQueryCells: parseInt(process.env.MAX_QUERY_CELLS || '100000', 10),
  defaultQueryLimit: parseInt(process.env.DEFAULT_QUERY_LIMIT || '1000', 10),

  // Authentication
  apiToken: process.env.API_TOKEN,

  // Environment detection
  isCloudRun,
};

/**
 * Validate configuration
 */
export function validateConfig(): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid PORT: ${config.port}`);
  }
  if (config.maxCallsPerMinute < 1 || config.maxCallsPerMinute > 30) {
    throw new Error(
      `MAX_CALLS_PER_MINUTE must be between 1 and 30, got ${config.maxCallsPerMinute}`
    );
  }
  if (config.requestTimeoutMs < 1000 || config.requestTimeoutMs > 120000) {
    throw new Error(
      `REQUEST_TIMEOUT_MS must be between 1000 and 120000, got ${config.requestTimeoutMs}`
    );
  }
}
