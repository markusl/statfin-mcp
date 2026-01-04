# StatFin MCP Server

MCP server for Statistics Finland's StatFin database. See [README.md](README.md) for project overview and [ARCHITECTURE.md](ARCHITECTURE.md) for technical details.

## Quick Reference

### Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Development (stdio, watch mode)
npm run build        # Build TypeScript
npm run typecheck    # Type checking
npm run test:run     # Run unit tests
npm run test:coverage # Run tests with coverage
npm start            # Production (HTTP transport)
```

### Project Structure

```
src/
├── server.ts              # MCP server (stdio + HTTP transports)
├── config.ts              # Environment configuration
├── tools/                 # 7 MCP tools (search, list, query, etc.)
├── services/              # PxWeb client, cache, rate limiter
├── types/                 # TypeScript definitions
└── utils/                 # Logger, HTTP helpers

tests/
├── unit/                  # Unit tests (vitest)
├── integration/           # Real API tests
└── fixtures/              # API response fixtures
```

### MCP Tools

1. `search_statistics` - Full-text search (primary discovery)
2. `list_subject_areas` - Browse 149 topic areas
3. `list_tables` - Tables in a subject area
4. `get_table_metadata` - Table structure/variables
5. `get_variable_values` - Variable codes (regions, years)
6. `query_table` - Execute data queries
7. `get_api_status` - Health and rate limits

### Key Patterns

**Rate Limiting**: Token bucket, 8 req/min per instance (3 instances = 24 req/min, under 30 limit)

**Caching**: Timestamp-validated. Query results cached until table's `updated` timestamp changes.

**Query Selection**:
```typescript
{ variable: "Alue", filter: "item", values: ["KU091"] }  // Specific values
{ variable: "Vuosi", filter: "top", top: 5 }             // Latest N values
{ variable: "Sukupuoli", filter: "all" }                 // All values (caution!)
```

**Common Codes**:
- `SSS` = Whole country
- `MK01-MK19` = Regions (maakunta)
- `KU091` = Helsinki, `KU092` = Vantaa, `KU049` = Espoo

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | HTTP server port |
| `MCP_TRANSPORT` | - | Set to "http" for HTTP |
| `API_TOKEN` | - | Optional auth token |
| `LOG_LEVEL` | info | Pino log level |

### Data Source & License

Data from [Statistics Finland StatFin](https://pxdata.stat.fi). Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution: "Source: Statistics Finland"
