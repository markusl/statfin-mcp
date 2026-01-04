import type { IncomingMessage } from 'http';

/**
 * Convert data to compact JSON for LLM consumption.
 * Removes null values to minimize token usage.
 */
export function toCompactJson(data: unknown): string {
  return JSON.stringify(data, (_key, value) => {
    if (value === null) return undefined;
    return value;
  });
}

/**
 * Validate API token from Authorization header.
 * Returns true if authentication passes.
 */
export function validateApiToken(req: IncomingMessage, apiToken: string | undefined): boolean {
  if (!apiToken) {
    return true; // No token configured = no auth required
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  return token === apiToken;
}

/**
 * Determine which transport to use based on environment.
 */
export function shouldUseHttpTransport(): boolean {
  return process.env.MCP_TRANSPORT === 'http' || process.env.PORT !== undefined;
}
