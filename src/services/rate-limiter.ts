import { logger } from '../utils/logger.js';

interface TokenBucketOptions {
  capacity: number;
  refillRate: number; // tokens per interval
  refillIntervalMs: number;
}

interface QueuedRequest {
  resolve: () => void;
  reject: (err: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * Token bucket rate limiter for respecting PxWeb API limits.
 * Allows bursts up to capacity, then throttles to refill rate.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;
  private readonly refillIntervalMs: number;
  private queue: QueuedRequest[] = [];

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;
    this.refillIntervalMs = options.refillIntervalMs;
    this.tokens = options.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const intervalsElapsed = Math.floor(elapsed / this.refillIntervalMs);

    if (intervalsElapsed > 0) {
      const tokensToAdd = intervalsElapsed * this.refillRate;
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now - (elapsed % this.refillIntervalMs);

      // Process queued requests
      this.processQueue();
    }
  }

  /**
   * Process queued requests when tokens become available
   */
  private processQueue(): void {
    while (this.tokens > 0 && this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        clearTimeout(request.timeout);
        this.tokens--;
        request.resolve();
      }
    }
  }

  /**
   * Acquire a token for making a request.
   * Returns immediately if a token is available, otherwise queues the request.
   *
   * @param timeoutMs Maximum time to wait for a token (default: 30000ms)
   * @throws Error if timeout is reached
   */
  async acquire(timeoutMs: number = 30000): Promise<void> {
    this.refill();

    // Token available immediately
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Remove from queue
        const index = this.queue.findIndex((r) => r.timeout === timeout);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }
        reject(new Error(`Rate limit queue timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      this.queue.push({ resolve, reject, timeout });

      // Schedule a check when we expect tokens to be available
      const msUntilNextToken = this.refillIntervalMs / this.refillRate;
      setTimeout(() => this.refill(), msUntilNextToken);
    });
  }

  /**
   * Check if a token is available without consuming it
   */
  isAvailable(): boolean {
    this.refill();
    return this.tokens > 0;
  }

  /**
   * Get current number of available tokens
   */
  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  /**
   * Get number of queued requests
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Time until next token is available (ms)
   */
  getNextTokenTime(): number {
    this.refill();
    if (this.tokens > 0) {
      return 0;
    }
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    return Math.max(0, this.refillIntervalMs / this.refillRate - elapsed);
  }

  /**
   * Get rate limiter status for monitoring
   */
  getStatus(): {
    availableTokens: number;
    capacity: number;
    queueLength: number;
    nextTokenMs: number;
  } {
    return {
      availableTokens: this.getAvailableTokens(),
      capacity: this.capacity,
      queueLength: this.getQueueLength(),
      nextTokenMs: this.getNextTokenTime(),
    };
  }
}

// Singleton instance
let rateLimiter: RateLimiter | null = null;

/**
 * Get the rate limiter singleton.
 * Configured for 8 calls per minute per instance.
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter({
      capacity: 8,
      refillRate: 8,
      refillIntervalMs: 60000, // 8 tokens per minute
    });
    logger.info({ capacity: 8, refillRate: '8/min' }, 'Rate limiter initialized');
  }
  return rateLimiter;
}

/**
 * Create a new rate limiter with custom options (for testing)
 */
export function createRateLimiter(options: TokenBucketOptions): RateLimiter {
  return new RateLimiter(options);
}
