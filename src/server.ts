import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';
import { config, validateConfig } from './config.js';
import { logger } from './utils/logger.js';
import { toCompactJson, validateApiToken, shouldUseHttpTransport } from './utils/http-helpers.js';

// Tool imports
import {
  searchStatistics,
  searchStatisticsSchema,
  searchStatisticsOutputSchema,
  listSubjectAreas,
  listSubjectAreasSchema,
  listSubjectAreasOutputSchema,
  listTables,
  listTablesSchema,
  listTablesOutputSchema,
  getTableMetadata,
  getTableMetadataSchema,
  getTableMetadataOutputSchema,
  getVariableValues,
  getVariableValuesSchema,
  getVariableValuesOutputSchema,
  queryTable,
  queryTableSchema,
  queryTableOutputSchema,
  getApiStatus,
  getApiStatusSchema,
  getApiStatusOutputSchema,
} from './tools/index.js';

/**
 * Wrap a tool implementation in a registerTool handler that logs failures.
 *
 * Tool functions that throw are otherwise turned into `{ isError: true }`
 * responses by the MCP SDK with no server-side trace, making upstream
 * failures, timeouts, and rate-limit rejections invisible in the logs. This
 * wrapper emits a `logger.error` and re-throws so client behavior is unchanged.
 */
function toolHandler(name: string, fn: (params: never) => Promise<unknown>) {
  return async (params: unknown) => {
    try {
      const result = await fn(params as never);
      return {
        content: [{ type: 'text' as const, text: toCompactJson(result) }],
        structuredContent: result as Record<string, unknown>,
      };
    } catch (error) {
      logger.error({ err: error, tool: name }, `Tool '${name}' failed`);
      throw error;
    }
  };
}

/**
 * Create and configure the MCP server
 */
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'statfin-mcp',
    version: '1.0.0',
  });

  // ============== Register Tools ==============

  // 1. Search Statistics (PRIMARY DISCOVERY TOOL)
  server.registerTool(
    'search_statistics',
    {
      title: 'Search Finnish Statistics',
      description: `Search Statistics Finland's StatFin database for statistical tables by keyword.

USE THIS FIRST when looking for data. Returns ranked results with relevance scores.

Examples:
- "väestö Helsinki" → population tables for Helsinki
- "unemployment" → employment/labor market tables
- "housing prices" → real estate statistics

Returns: tableId (needed for query_table), title, relevance score, publication date.

After finding a table, use get_table_metadata to see its structure before querying.`,
      inputSchema: searchStatisticsSchema.shape,
      outputSchema: searchStatisticsOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('search_statistics', searchStatistics)
  );

  // 2. List Subject Areas
  server.registerTool(
    'list_subject_areas',
    {
      title: 'Browse Statistical Topics',
      description: `List all 149 subject areas (topics) in StatFin database.

Use this to explore what statistics are available when you don't have a specific search term.

Topic examples:
- vaerak: Population structure
- tyti: Labor force
- ashi: Housing prices
- synt: Births and deaths
- muutl: Migration

After finding an area, use list_tables to see all tables in that topic.`,
      inputSchema: listSubjectAreasSchema.shape,
      outputSchema: listSubjectAreasOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('list_subject_areas', listSubjectAreas)
  );

  // 3. List Tables
  server.registerTool(
    'list_tables',
    {
      title: 'List Tables in Topic',
      description: `List all statistical tables within a subject area.

Each area typically has 20-40 tables with different data views.

Common subject areas:
- "vaerak" → 30+ population tables (age, gender, region, etc.)
- "tyti" → 35+ employment tables (employment rate, unemployment, etc.)
- "ashi" → 15+ housing price tables

Use list_subject_areas first to find the area ID, or use search_statistics for direct search.`,
      inputSchema: listTablesSchema.shape,
      outputSchema: listTablesOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('list_tables', listTables)
  );

  // 4. Get Table Metadata
  server.registerTool(
    'get_table_metadata',
    {
      title: 'Get Table Structure',
      description: `Get the structure of a table: what variables it has and what values are available.

REQUIRED before querying - shows you:
- Variable codes (table-specific and version-stamped, e.g. "alue_23_20260101" for region, "timeperiod_y" for the time variable). Always read these here - never assume or reuse codes from another table.
- Value codes (KU091=Helsinki, SSS=Total, 2024=year 2024)
- Which variables are required vs optional
- Total possible data combinations

Example: a region variable may have 300+ values, a year variable 50+.

After understanding the structure, use query_table with the exact codes from this output.`,
      inputSchema: getTableMetadataSchema.shape,
      outputSchema: getTableMetadataOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('get_table_metadata', getTableMetadata)
  );

  // 5. Get Variable Values
  server.registerTool(
    'get_variable_values',
    {
      title: 'Get All Values for a Variable',
      description: `Get the complete list of values for a variable when metadata only shows first 20.

Useful for:
- Finding specific region codes (KU091=Helsinki, MK01=Uusimaa region)
- Getting all available years (1972-2024)
- Finding specific category codes

Common region codes:
- SSS = Whole country (Finland)
- MK01-MK19 = Regions (maakunta)
- KU091 = Helsinki, KU049 = Espoo, KU837 = Tampere

Use search parameter to filter: search="Helsinki" returns only matching values.`,
      inputSchema: getVariableValuesSchema.shape,
      outputSchema: getVariableValuesOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('get_variable_values', getVariableValues)
  );

  // 6. Query Table
  server.registerTool(
    'query_table',
    {
      title: 'Query Statistical Data',
      description: `Execute a query to retrieve actual statistical data from a table.

WORKFLOW: search_statistics → get_table_metadata → query_table

Selection types:
- filter: "item" + values: ["KU091", "2024"] → specific values
- filter: "top" + top: 5 → latest 5 values (good for time variables)
- filter: "all" → all values (use carefully, can be large!)

Example - Helsinki population for last 5 years (the variable codes below are from
table 11re.px; YOUR table's codes WILL differ - always read them from
get_table_metadata first, never reuse these):
{
  "tableId": "11re.px",
  "selections": [
    {"variable": "alue_23_20260101", "filter": "item", "values": ["KU091"]},
    {"variable": "timeperiod_y", "filter": "top", "top": 5},
    {"variable": "sukupuoli_9_20180101", "filter": "item", "values": ["SSS"]},
    {"variable": "ikaryhma_10_20180101", "filter": "item", "values": ["SSS"]},
    {"variable": "contentscode", "filter": "item", "values": ["vaerak-vaesto"]}
  ]
}

IMPORTANT: Variable codes are table-specific; get them from get_table_metadata.
Use VALUE CODES (KU091, SSS), not labels (Helsinki, Total).`,
      inputSchema: queryTableSchema.shape,
      outputSchema: queryTableOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    toolHandler('query_table', queryTable)
  );

  // 7. Get API Status
  server.registerTool(
    'get_api_status',
    {
      title: 'Check API Status',
      description: `Get server health, rate limit status, and cache statistics.

Use when:
- Queries are failing or slow
- Need to check remaining API quota
- Debugging connection issues

Rate limit: 8 requests per minute per instance.`,
      inputSchema: getApiStatusSchema.shape,
      outputSchema: getApiStatusOutputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    toolHandler('get_api_status', getApiStatus)
  );

  return server;
}

/**
 * Start the server with STDIO transport
 */
async function startStdioServer(server: McpServer): Promise<void> {
  logger.info('Starting MCP server with STDIO transport');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCP server connected via STDIO');
}

/**
 * Start the server with HTTP transport
 */
async function startHttpServer(server: McpServer): Promise<void> {
  logger.info(`Starting MCP server with HTTP transport on port ${config.port}`);
  logger.info(`API token authentication: ${config.apiToken ? 'enabled' : 'disabled'}`);

  const httpServer = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check (no auth required)
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy' }));
      return;
    }

    // Validate API token for all other endpoints
    if (!validateApiToken(req, config.apiToken)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing API token' }));
      return;
    }

    // MCP endpoint (only /mcp path)
    if (req.url === '/mcp') {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await transport.handleRequest(req, res, await server.connect(transport));
      return;
    }

    // 404 for other routes
    res.writeHead(404);
    res.end('Not Found');
  });

  httpServer.listen(config.port, () => {
    logger.info(`MCP server listening on http://localhost:${config.port}/mcp`);
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Create server
    const server = createMcpServer();

    // Determine transport based on environment
    const useHttp = shouldUseHttpTransport();

    if (useHttp) {
      await startHttpServer(server);
    } else {
      await startStdioServer(server);
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down...');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down...');
      process.exit(0);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
main();
