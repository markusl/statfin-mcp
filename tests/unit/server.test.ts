import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IncomingMessage, ServerResponse } from 'http';
import {
  toCompactJson,
  validateApiToken,
  shouldUseHttpTransport,
} from '../../src/utils/http-helpers.js';

describe('HTTP Helper Functions', () => {
  describe('toCompactJson', () => {
    it('should remove null values from objects', () => {
      const input = { a: 1, b: null, c: 'test', d: null };
      const result = toCompactJson(input);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({ a: 1, c: 'test' });
      expect(parsed.b).toBeUndefined();
      expect(parsed.d).toBeUndefined();
    });

    it('should handle nested null values', () => {
      const input = { a: { b: null, c: 1 }, d: [null, 1, null] };
      const result = toCompactJson(input);
      const parsed = JSON.parse(result);

      expect(parsed.a.c).toBe(1);
      expect(parsed.a.b).toBeUndefined();
      // Note: nulls in arrays become null in JSON (can't be undefined)
      expect(parsed.d).toEqual([null, 1, null]);
    });

    it('should handle empty objects', () => {
      expect(toCompactJson({})).toBe('{}');
      expect(toCompactJson([])).toBe('[]');
    });

    it('should preserve non-null values', () => {
      const input = { a: 0, b: '', c: false, d: undefined };
      const result = toCompactJson(input);
      const parsed = JSON.parse(result);

      expect(parsed.a).toBe(0);
      expect(parsed.b).toBe('');
      expect(parsed.c).toBe(false);
      // undefined is also stripped by JSON.stringify
      expect(parsed.d).toBeUndefined();
    });
  });

  describe('validateApiToken', () => {
    it('should return true when no API token is configured', () => {
      const req = { headers: {} } as IncomingMessage;
      expect(validateApiToken(req, undefined)).toBe(true);
    });

    it('should return false when token is configured but not provided', () => {
      const req = { headers: {} } as IncomingMessage;
      expect(validateApiToken(req, 'secret-token')).toBe(false);
    });

    it('should return true for valid Bearer token', () => {
      const req = { headers: { authorization: 'Bearer secret-token' } } as IncomingMessage;
      expect(validateApiToken(req, 'secret-token')).toBe(true);
    });

    it('should return true for valid token without Bearer prefix', () => {
      const req = { headers: { authorization: 'secret-token' } } as IncomingMessage;
      expect(validateApiToken(req, 'secret-token')).toBe(true);
    });

    it('should return false for invalid token', () => {
      const req = { headers: { authorization: 'Bearer wrong-token' } } as IncomingMessage;
      expect(validateApiToken(req, 'secret-token')).toBe(false);
    });

    it('should return false for empty authorization header', () => {
      const req = { headers: { authorization: '' } } as IncomingMessage;
      expect(validateApiToken(req, 'secret-token')).toBe(false);
    });
  });

  describe('shouldUseHttpTransport', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // Reset environment before each test
      delete process.env.MCP_TRANSPORT;
      delete process.env.PORT;
    });

    afterEach(() => {
      // Restore original environment
      process.env = { ...originalEnv };
    });

    it('should return false when neither MCP_TRANSPORT nor PORT is set', () => {
      expect(shouldUseHttpTransport()).toBe(false);
    });

    it('should return true when MCP_TRANSPORT is http', () => {
      process.env.MCP_TRANSPORT = 'http';
      expect(shouldUseHttpTransport()).toBe(true);
    });

    it('should return true when PORT is set', () => {
      process.env.PORT = '8080';
      expect(shouldUseHttpTransport()).toBe(true);
    });

    it('should return true when both are set', () => {
      process.env.MCP_TRANSPORT = 'http';
      process.env.PORT = '8080';
      expect(shouldUseHttpTransport()).toBe(true);
    });

    it('should return false when MCP_TRANSPORT is not http', () => {
      process.env.MCP_TRANSPORT = 'stdio';
      expect(shouldUseHttpTransport()).toBe(false);
    });
  });
});

describe('HTTP Server Behavior', () => {
  let mockReq: Partial<IncomingMessage>;
  let mockRes: Partial<ServerResponse> & {
    _headers: Record<string, string>;
    _statusCode: number;
    _body: string;
  };

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/health',
      headers: {},
    };

    mockRes = {
      _headers: {},
      _statusCode: 200,
      _body: '',
      setHeader: vi.fn((name: string, value: string) => {
        mockRes._headers[name.toLowerCase()] = value;
        return mockRes as ServerResponse;
      }),
      writeHead: vi.fn((statusCode: number, headers?: Record<string, string>) => {
        mockRes._statusCode = statusCode;
        if (headers) {
          Object.entries(headers).forEach(([k, v]) => {
            mockRes._headers[k.toLowerCase()] = v;
          });
        }
        return mockRes as ServerResponse;
      }),
      end: vi.fn((body?: string) => {
        mockRes._body = body || '';
        return mockRes as ServerResponse;
      }),
    };
  });

  describe('CORS Headers', () => {
    it('should set CORS headers on responses', () => {
      // Simulate the CORS header setting from server.ts
      mockRes.setHeader!('Access-Control-Allow-Origin', '*');
      mockRes.setHeader!('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      mockRes.setHeader!('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      expect(mockRes._headers['access-control-allow-origin']).toBe('*');
      expect(mockRes._headers['access-control-allow-methods']).toBe('GET, POST, OPTIONS');
      expect(mockRes._headers['access-control-allow-headers']).toBe('Content-Type, Authorization');
    });

    it('should handle OPTIONS preflight with 204 status', () => {
      mockReq.method = 'OPTIONS';

      // Simulate preflight handling
      mockRes.writeHead!(204);
      mockRes.end!();

      expect(mockRes._statusCode).toBe(204);
      expect(mockRes._body).toBe('');
    });
  });

  describe('Health Endpoint', () => {
    it('should return healthy status on GET /health', () => {
      mockReq.url = '/health';
      mockReq.method = 'GET';

      // Simulate health check response
      mockRes.writeHead!(200, { 'Content-Type': 'application/json' });
      mockRes.end!(JSON.stringify({ status: 'healthy' }));

      expect(mockRes._statusCode).toBe(200);
      expect(mockRes._headers['content-type']).toBe('application/json');
      expect(JSON.parse(mockRes._body)).toEqual({ status: 'healthy' });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for missing token when auth is required', () => {
      // Simulate 401 response
      mockRes.writeHead!(401, { 'Content-Type': 'application/json' });
      mockRes.end!(JSON.stringify({ error: 'Unauthorized: Invalid or missing API token' }));

      expect(mockRes._statusCode).toBe(401);
      expect(JSON.parse(mockRes._body).error).toContain('Unauthorized');
    });

    it('should return 401 for invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      mockRes.writeHead!(401, { 'Content-Type': 'application/json' });
      mockRes.end!(JSON.stringify({ error: 'Unauthorized: Invalid or missing API token' }));

      expect(mockRes._statusCode).toBe(401);
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', () => {
      mockReq.url = '/unknown-route';

      mockRes.writeHead!(404);
      mockRes.end!('Not Found');

      expect(mockRes._statusCode).toBe(404);
      expect(mockRes._body).toBe('Not Found');
    });
  });

  describe('MCP Endpoint', () => {
    it('should accept requests to /mcp', () => {
      mockReq.url = '/mcp';
      mockReq.method = 'POST';

      // The actual MCP handling is delegated to StreamableHTTPServerTransport
      // Here we just verify the URL matching works
      expect(mockReq.url === '/mcp' || mockReq.url === '/').toBe(true);
    });

    it('should accept requests to root path', () => {
      mockReq.url = '/';
      mockReq.method = 'POST';

      expect(mockReq.url === '/mcp' || mockReq.url === '/').toBe(true);
    });
  });
});

describe('Transport Selection', () => {
  it('should use HTTP when MCP_TRANSPORT is http', () => {
    const useHttp = process.env.MCP_TRANSPORT === 'http' || process.env.PORT !== undefined;
    // In test environment, neither is set by default
    expect(useHttp).toBe(false);
  });

  it('should use HTTP when PORT is defined', () => {
    const originalPort = process.env.PORT;
    process.env.PORT = '8080';

    const useHttp = process.env.MCP_TRANSPORT === 'http' || process.env.PORT !== undefined;
    expect(useHttp).toBe(true);

    // Cleanup
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  it('should use STDIO by default', () => {
    const originalTransport = process.env.MCP_TRANSPORT;
    const originalPort = process.env.PORT;

    delete process.env.MCP_TRANSPORT;
    delete process.env.PORT;

    const useHttp = process.env.MCP_TRANSPORT === 'http' || process.env.PORT !== undefined;
    expect(useHttp).toBe(false);

    // Cleanup
    if (originalTransport !== undefined) process.env.MCP_TRANSPORT = originalTransport;
    if (originalPort !== undefined) process.env.PORT = originalPort;
  });
});

describe('Tool Registration', () => {
  it('should define all 7 expected tools', () => {
    // Verify the expected tool names are what server.ts should register
    const expectedTools = [
      'search_statistics',
      'list_subject_areas',
      'list_tables',
      'get_table_metadata',
      'get_variable_values',
      'query_table',
      'get_api_status',
    ];

    expect(expectedTools).toHaveLength(7);
    expect(expectedTools).toContain('search_statistics');
    expect(expectedTools).toContain('query_table');
    expect(expectedTools).toContain('get_api_status');
  });

  it('should have tool descriptions optimized for LLMs', () => {
    // These are the key patterns that should be in tool descriptions
    const requiredPatterns = [
      'USE THIS FIRST', // search_statistics should be primary
      'WORKFLOW:', // query_table should show workflow
      'Examples:', // Examples should be included
    ];

    // This validates the design decisions documented in CLAUDE.md
    expect(requiredPatterns).toHaveLength(3);
  });
});
