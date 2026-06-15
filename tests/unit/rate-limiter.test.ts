import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRateLimiter } from '../../src/services/rate-limiter.js';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should allow requests up to capacity', async () => {
    const limiter = createRateLimiter({
      capacity: 3,
      refillRate: 1,
      refillIntervalMs: 1000,
    });

    // Should allow 3 requests immediately
    await expect(limiter.acquire()).resolves.toBeUndefined();
    await expect(limiter.acquire()).resolves.toBeUndefined();
    await expect(limiter.acquire()).resolves.toBeUndefined();

    expect(limiter.getAvailableTokens()).toBe(0);
  });

  it('should queue requests when no tokens available', async () => {
    const limiter = createRateLimiter({
      capacity: 1,
      refillRate: 1,
      refillIntervalMs: 1000,
    });

    // Use the only token
    await limiter.acquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    // Start a request that will be queued
    const acquirePromise = limiter.acquire(5000);
    expect(limiter.getQueueLength()).toBe(1);

    // Advance time to refill
    vi.advanceTimersByTime(1000);

    await expect(acquirePromise).resolves.toBeUndefined();
    expect(limiter.getQueueLength()).toBe(0);
  });

  it('should timeout queued requests', async () => {
    const limiter = createRateLimiter({
      capacity: 1,
      refillRate: 1,
      refillIntervalMs: 10000, // Slow refill
    });

    await limiter.acquire();

    const acquirePromise = limiter.acquire(100);
    vi.advanceTimersByTime(101);

    await expect(acquirePromise).rejects.toThrow('Rate limit queue timeout');
  });

  it('should refill tokens over time', async () => {
    const limiter = createRateLimiter({
      capacity: 3,
      refillRate: 1,
      refillIntervalMs: 1000,
    });

    // Use all tokens
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    // Advance time for 2 refills
    vi.advanceTimersByTime(2000);
    expect(limiter.getAvailableTokens()).toBe(2);
  });

  it('should not exceed capacity when refilling', async () => {
    const limiter = createRateLimiter({
      capacity: 3,
      refillRate: 2,
      refillIntervalMs: 1000,
    });

    // Advance time significantly
    vi.advanceTimersByTime(10000);
    expect(limiter.getAvailableTokens()).toBe(3); // Capped at capacity
  });

  it('refills incrementally so a queued request resolves before the 30s timeout (prod config)', async () => {
    // Regression for issue #1: with capacity/refillRate 8 over 60s, a token
    // returns every 7.5s. A 9th request queued with the default 30s timeout
    // must be served at ~7.5s, not expire because refill only happened after
    // the full 60s interval.
    const limiter = createRateLimiter({
      capacity: 8,
      refillRate: 8,
      refillIntervalMs: 60000,
    });

    // Drain the burst.
    for (let i = 0; i < 8; i++) await limiter.acquire(30000);
    expect(limiter.getAvailableTokens()).toBe(0);

    // 9th request queues with the default 30s timeout.
    const ninth = limiter.acquire(30000);
    expect(limiter.getQueueLength()).toBe(1);

    // One token interval elapses (7.5s) — the request should now resolve.
    await vi.advanceTimersByTimeAsync(7500);

    await expect(ninth).resolves.toBeUndefined();
    expect(limiter.getQueueLength()).toBe(0);
  });

  it('carries the sub-token remainder forward across refills', async () => {
    const limiter = createRateLimiter({
      capacity: 8,
      refillRate: 8,
      refillIntervalMs: 60000, // 7.5s per token
    });
    for (let i = 0; i < 8; i++) await limiter.acquire();
    expect(limiter.getAvailableTokens()).toBe(0);

    // 7.4s: not enough for a token yet.
    vi.advanceTimersByTime(7400);
    expect(limiter.getAvailableTokens()).toBe(0);

    // +0.2s (7.6s total): the remainder carried forward, so one token is now ready.
    vi.advanceTimersByTime(200);
    expect(limiter.getAvailableTokens()).toBe(1);
  });

  it('should report status correctly', async () => {
    const limiter = createRateLimiter({
      capacity: 5,
      refillRate: 1,
      refillIntervalMs: 1000,
    });

    await limiter.acquire();
    await limiter.acquire();

    const status = limiter.getStatus();
    expect(status.availableTokens).toBe(3);
    expect(status.capacity).toBe(5);
    expect(status.queueLength).toBe(0);
  });
});
