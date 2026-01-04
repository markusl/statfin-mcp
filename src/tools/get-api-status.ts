import { z } from 'zod';
import { getRateLimiter } from '../services/rate-limiter.js';
import { getCacheService } from '../services/cache.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Get API status tool schema
 */
export const getApiStatusSchema = z.object({});

export type GetApiStatusInput = z.infer<typeof getApiStatusSchema>;

/**
 * Get API status output schema
 */
export const getApiStatusOutputSchema = z.object({
  healthy: z.boolean().describe('True if server is healthy and accepting requests'),
  rateLimit: z.object({
    availableTokens: z.number().describe('Number of API calls available right now'),
    capacity: z.number().describe('Maximum token capacity (8)'),
    queuedRequests: z.number().describe('Number of requests waiting in queue'),
    nextTokenMs: z.number().describe('Milliseconds until next token becomes available'),
  }).describe('Current rate limit status'),
  config: z.object({
    maxQueryCells: z.number().describe('Maximum cells per query (100000)'),
    requestTimeoutMs: z.number().describe('Request timeout in milliseconds'),
    maxCallsPerMinute: z.number().describe('Rate limit: calls per minute per instance'),
  }).describe('Server configuration'),
  cache: z.object({
    subjectAreas: z.object({
      size: z.number().describe('Current number of cached entries'),
      maxSize: z.number().describe('Maximum cache capacity'),
    }).describe('Subject area cache'),
    tableLists: z.object({
      size: z.number().describe('Current number of cached entries'),
      maxSize: z.number().describe('Maximum cache capacity'),
    }).describe('Table list cache'),
    metadata: z.object({
      size: z.number().describe('Current number of cached entries'),
      maxSize: z.number().describe('Maximum cache capacity'),
    }).describe('Table metadata cache'),
    queries: z.object({
      size: z.number().describe('Current number of cached entries'),
      maxSize: z.number().describe('Maximum cache capacity'),
    }).describe('Query result cache'),
    search: z.object({
      size: z.number().describe('Current number of cached entries'),
      maxSize: z.number().describe('Maximum cache capacity'),
    }).describe('Search result cache'),
  }).describe('Cache statistics per cache type'),
});

export type GetApiStatusOutput = z.infer<typeof getApiStatusOutputSchema>;

/**
 * Get API health, rate limits, and cache statistics.
 * Use this to monitor the server's status and resource usage.
 */
export async function getApiStatus(_input: GetApiStatusInput): Promise<GetApiStatusOutput> {
  logger.info('Getting API status');

  const rateLimiter = getRateLimiter();
  const cache = getCacheService();

  const rateLimitStatus = rateLimiter.getStatus();
  const cacheStats = cache.getStats();

  return {
    healthy: true,
    rateLimit: {
      availableTokens: rateLimitStatus.availableTokens,
      capacity: rateLimitStatus.capacity,
      queuedRequests: rateLimitStatus.queueLength,
      nextTokenMs: rateLimitStatus.nextTokenMs,
    },
    config: {
      maxQueryCells: config.maxQueryCells,
      requestTimeoutMs: config.requestTimeoutMs,
      maxCallsPerMinute: config.maxCallsPerMinute,
    },
    cache: {
      subjectAreas: cacheStats.subjectAreas,
      tableLists: cacheStats.tableLists,
      metadata: cacheStats.metadata,
      queries: cacheStats.queries,
      search: cacheStats.search,
    },
  };
}
