# Architecture

## Overview

Tilastokeskus / StatFin MCP is a Model Context Protocol server that provides AI assistants access to Statistics Finland's StatFin database via the PxWeb API.

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Desktop                          │
│                    (or other MCP client)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (stdio/HTTP)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    StatFin MCP Server                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    7 MCP Tools                       │   │
│  │  search_statistics | list_subject_areas | list_tables│   │
│  │  get_table_metadata | get_variable_values | query    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ Rate Limiter │  │  Cache Service │  │ PxWeb Client │   │
│  │ (8 req/min)  │  │ (LRU + timestamps)│  │   (HTTP)    │   │
│  └──────────────┘  └────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Statistics Finland PxWeb API                   │
│           https://pxdata.stat.fi/PxWeb/api/v1              │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
statfin-mcp/
├── src/
│   ├── server.ts                 # MCP server entry point
│   ├── config.ts                 # Environment configuration
│   ├── tools/                    # MCP tool implementations
│   │   ├── index.ts
│   │   ├── search-statistics.ts  # Primary discovery tool
│   │   ├── list-subject-areas.ts # Browse 149 topics
│   │   ├── list-tables.ts        # Tables in subject area
│   │   ├── get-table-metadata.ts # Table structure
│   │   ├── get-variable-values.ts# Variable codes
│   │   ├── query-table.ts        # Execute queries
│   │   └── get-api-status.ts     # Health check
│   ├── services/
│   │   ├── pxweb-client.ts       # PxWeb API client
│   │   ├── cache.ts              # Multi-tier LRU cache
│   │   └── rate-limiter.ts       # Token bucket limiter
│   ├── types/                    # TypeScript definitions
│   │   ├── index.ts
│   │   ├── config.ts
│   │   └── pxweb.ts
│   └── utils/
│       ├── logger.ts             # Pino logger
│       └── http-helpers.ts       # HTTP transport utilities
├── tests/
│   ├── unit/                     # Mocked unit tests
│   ├── integration/              # Real API tests
│   │   ├── comprehensive.test.ts # Full integration test suite
│   │   ├── smoke.test.ts         # Quick smoke tests
│   │   └── ...                   # Other integration tests
│   ├── fixtures/                 # Real API responses
│   └── fetch-fixtures.ts         # Script to refresh fixtures
├── Dockerfile
├── docker-compose.yml
└── cloudbuild.yaml
```

## Key Components

### 1. MCP Server (`src/server.ts`)

Supports two transports:
- **stdio**: For local development and Claude Desktop
- **HTTP**: For production deployment (Cloud Run)

```typescript
// Transport selection
const useHttp = process.env.MCP_TRANSPORT === 'http' || process.env.PORT !== undefined;
```

### 2. Rate Limiter (`src/services/rate-limiter.ts`)

Token bucket algorithm to respect StatFin's 30 req/min limit:

```typescript
{
  capacity: 8,           // Burst capacity
  refillRate: 8,         // Tokens per interval
  refillIntervalMs: 60000 // 1 minute
}
```

Designed for 3 concurrent instances = 24 req/min (under 30 limit).

### 3. Cache Service (`src/services/cache.ts`)

Multi-tier LRU cache with timestamp validation:

| Cache | TTL | Max Size | Validation |
|-------|-----|----------|------------|
| Subject Areas | 24h | 200 | None |
| Table Lists | 24h | 500 | Stores update timestamps |
| Metadata | Long-lived | 500 | Against table `updated` |
| Queries | Long-lived | 1000 | Against table `updated` |
| Search | 1h | 200 | None |

**Smart Invalidation**: Query results are only invalidated when the table's `updated` timestamp changes. Historical data (e.g., 2020 population) stays cached indefinitely until StatFin updates the table.

```typescript
getQueryResult(tableId, queryHash) {
  const cached = this.queryCache.get(key);
  const currentUpdated = this.tableUpdateTimes.get(tableId);

  // Invalidate if table was updated after cache
  if (currentUpdated > cached.tableUpdated) {
    this.queryCache.delete(key);
    return undefined;
  }

  return cached.data;
}
```

### 4. PxWeb Client (`src/services/pxweb-client.ts`)

HTTP client for the PxWeb API:

- Rate-limited requests
- Automatic caching
- JSON-stat2 response transformation
- Timeout handling (60s)

**Key Methods**:
- `listSubjectAreas(language)` - Get 149 topic areas
- `listTables(subjectArea, language)` - Tables in area
- `getTableMetadata(tableId, language)` - Table structure
- `getVariableValues(tableId, variable, language)` - All codes
- `search(query, language, limit)` - Full-text search
- `query(tableId, selections, language)` - Execute query

### 5. Tools (`src/tools/`)

Each tool follows the pattern:

```typescript
// Schema definition with Zod
export const searchStatisticsSchema = z.object({
  query: z.string().describe('Search term'),
  language: z.enum(['fi', 'en', 'sv']).default('fi'),
  limit: z.number().max(50).default(10),
});

// Tool implementation
export async function searchStatistics(input: SearchStatisticsInput) {
  const client = getPxWebClient();
  const results = await client.search(input.query, input.language, input.limit);
  // Transform and return
}
```

## Data Flow

### Query Execution

```
1. User asks: "What's Helsinki's population?"

2. search_statistics({ query: "väestö" })
   └─> Rate limiter: acquire token
   └─> Cache: check search cache
   └─> PxWeb API: GET /fi/StatFin?query=väestö
   └─> Cache: store results
   └─> Return: table IDs with relevance scores

3. get_table_metadata({ tableId: "11re.px" })
   └─> Rate limiter: acquire token
   └─> Cache: check metadata cache (with timestamp validation)
   └─> PxWeb API: GET /fi/StatFin/11re.px
   └─> Return: variables (alue_23_20260101, ikaryhma_10_20180101, sukupuoli_9_20180101, timeperiod_y, contentscode)

4. query_table({
     tableId: "11re.px",
     selections: [
       { variable: "alue_23_20260101", filter: "item", values: ["KU091"] },
       { variable: "timeperiod_y", filter: "top", top: 1 }
     ]
   })
   └─> Estimate query size (prevent 5M+ cell queries)
   └─> Rate limiter: acquire token
   └─> Cache: check query cache (with timestamp validation)
   └─> PxWeb API: POST with JSON-stat2 query
   └─> Transform: JSON-stat2 → tabular format
   └─> Cache: store with table update timestamp
   └─> Return: { rows: [{ Alue: "Helsinki", value: 684018 }] }
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | HTTP server port |
| `MCP_TRANSPORT` | - | Set to "http" for HTTP transport |
| `NODE_ENV` | development | Environment (development/production) |
| `PXWEB_BASE_URL` | https://pxdata.stat.fi/PxWeb/api/v1 | PxWeb API base URL |
| `DEFAULT_LANGUAGE` | fi | Default language (fi/en/sv) |
| `MAX_CALLS_PER_MINUTE` | 8 | Rate limit per instance |
| `REQUEST_TIMEOUT_MS` | 60000 | Request timeout in milliseconds |
| `MAX_QUERY_CELLS` | 100000 | Maximum cells per query |
| `DEFAULT_QUERY_LIMIT` | 1000 | Default row limit for queries |
| `API_TOKEN` | - | Optional API token for authentication |

## Deployment

### Requirements

- Node.js >= 24.0.0

### Local Development

```bash
npm run dev  # stdio transport, tsx watch
```

### Docker

```bash
docker-compose up  # HTTP transport on :8080
```

### Cloud Run

- Region: europe-north1
- Memory: 512Mi
- CPU: 1
- Max instances: 3
- Concurrency: 80
- Timeout: 60s

```yaml
# cloudbuild.yaml triggers on push to main
gcloud run deploy statfin-mcp \
  --image gcr.io/$PROJECT_ID/statfin-mcp \
  --max-instances 3 \
  --memory 512Mi
```

## Security

- **API Token**: Optional Bearer token authentication for HTTP transport
- **Health endpoint**: `/health` (no auth required)
- **CORS**: Enabled for all origins (configurable)
- **No secrets**: StatFin API is public, no API keys needed

## Testing Strategy

### Unit Tests (mocked)

```bash
npm run test:run
```

- Mock `fetch` for PxWeb API responses
- Use real API response fixtures
- Test tool logic, caching, rate limiting

### Integration Tests (real API)

```bash
npm run test:integration        # Comprehensive tests
npm run test:integration:smoke  # Quick smoke tests
```

- Hit real StatFin API
- Rate-limited to avoid hitting API limits
- Verify end-to-end functionality

### Fixtures

```bash
npm run test:fixtures:fetch
```

Fetches fresh responses from StatFin API for use in unit tests.

## Performance Considerations

1. **Query Size Limits**: Reject queries > 100,000 cells before API call
2. **Caching**: Historical data rarely changes, cache aggressively
3. **Rate Limiting**: Token bucket prevents API throttling
4. **Timeout**: 60s timeout prevents hanging requests
5. **JSON-stat2**: Efficient format for statistical data
