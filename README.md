# Tilastokeskus StatFin MCP Server

Production-grade [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for Statistics Finland's StatFin database. Enables AI assistants like Claude to browse, search, and query Finnish statistical data.

## Purpose

This project makes Finland's official statistics accessible to AI assistants through the Model Context Protocol (MCP). It bridges the gap between natural language queries and the structured PxWeb API.

### Why This Exists

**The Problem:** Statistics Finland maintains one of the world's most comprehensive national statistics databases with 4,500+ tables covering population, employment, housing, economy, and more. However, the PxWeb API requires:
- Knowledge of table IDs, variable codes, and value codes
- Understanding of the hierarchical data structure
- Correct query formatting with specific filter types
- Awareness of API rate limits and response sizes

This makes it difficult for users to answer simple questions like "What is Helsinki's population?" without significant technical knowledge.

**The Solution:** This MCP server provides 7 tools that allow AI assistants to:
1. **Discover** relevant tables through natural language search
2. **Explore** the database structure and available variables
3. **Query** specific data with proper filtering and pagination
4. **Handle** rate limiting, caching, and error recovery automatically

### Use Cases

- **Journalists** asking "How has unemployment changed since COVID?"
- **Researchers** comparing regional population trends
- **Analysts** tracking housing price divergence between Helsinki and other cities
- **Citizens** curious about birth rates, migration, or energy consumption
- **Developers** building applications that need Finnish statistical data

### Design Philosophy

- **LLM-first:** Tool descriptions, parameter hints, and output schemas are optimized for AI consumption
- **Guided workflow:** Each tool guides the LLM to the next logical step
- **Fail-safe:** Query size estimation prevents expensive API calls; rate limiting protects against quota exhaustion
- **Cache-smart:** Historical data is cached until StatFin updates it, minimizing redundant API calls

## Features

- **7 MCP Tools** for comprehensive data access
- **149 subject areas** covering population, employment, education, economy, environment, and more
- **~4,500+ statistical tables** with decades of historical data
- **Smart caching** with timestamp validation - historical data stays cached until updated
- **Rate limiting** (8 req/min per instance) to respect API limits
- **Multi-language** support (Finnish, English, Swedish)

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture and design decisions
- [BLOGS.md](BLOGS.md) - Blog post ideas and data stories (English)
- [BLOGIT.md](BLOGIT.md) - Blog post ideas and data stories (Finnish)

## Data Source & License

[Statistics Finland StatFin Database](https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/)

- Official statistics of Finland
- Data updated regularly (varies by table)
- Free to use, no API key required

**Data License**: Statistics Finland data is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). When using the data, provide attribution: "Source: Statistics Finland"

## Installation

### Local Installation

Clone and build the server to run on your machine.

```bash
git clone https://github.com/your-org/statfin-mcp.git
cd statfin-mcp
npm install
npm run build
```

<details>
<summary>Claude Desktop</summary>

Add to your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "statfin": {
      "command": "node",
      "args": ["/absolute/path/to/statfin-mcp/dist/server.js"]
    }
  }
}
```

</details>

<details>
<summary>Claude Code</summary>

```bash
claude mcp add statfin node /absolute/path/to/statfin-mcp/dist/server.js
```

Verify with:
```bash
claude mcp list
```

</details>

<details>
<summary>OpenAI Codex / ChatGPT</summary>

Add to `~/.codex/config.toml`:

```toml
[mcp.statfin]
command = "node"
args = ["/absolute/path/to/statfin-mcp/dist/server.js"]
transport = "stdio"
```

</details>

<details>
<summary>Cursor</summary>

In Cursor settings, add MCP server with command:
- **Name**: `statfin`
- **Command**: `node`
- **Args**: `/absolute/path/to/statfin-mcp/dist/server.js`

</details>

---

### Remote Server

Connect to a hosted instance without local installation.

<details>
<summary>Claude Code</summary>

```bash
claude mcp add --transport http statfin https://your-server.example.com/mcp
```

Verify with:
```bash
claude mcp list
```

</details>

<details>
<summary>Claude Desktop</summary>

Add to your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "statfin": {
      "type": "http",
      "url": "https://your-server.example.com/mcp"
    }
  }
}
```

</details>

<details>
<summary>OpenAI Codex / ChatGPT</summary>

Add to `~/.codex/config.toml`:

```toml
[mcp.statfin]
url = "https://your-server.example.com/mcp"
transport = "http"
```

</details>

<details>
<summary>Cursor</summary>

In Cursor settings, add MCP server:
- **Name**: `statfin`
- **URL**: `https://your-server.example.com/mcp`
- **Transport**: HTTP

</details>

---

### Running the Server

```bash
# Development mode (stdio transport, watch mode)
npm run dev

# Production HTTP server
npm start

# With custom port
PORT=8080 npm start

# Docker
docker-compose up --build
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `search_statistics` | Search for tables by keyword (primary discovery) |
| `list_subject_areas` | Browse all 149 topic areas |
| `list_tables` | List tables in a subject area |
| `get_table_metadata` | Get table structure and variables |
| `get_variable_values` | Get all codes for a variable (regions, years) |
| `query_table` | Execute data queries |
| `get_api_status` | Check server health and rate limits |

## Example Workflows

> **⚠️ Variable codes changed in the 8 June 2026 PxWeb migration.** They are now version-stamped and **table-specific** (e.g. `alue_23_20260101`, `timeperiod_y`), so the variable codes shown in the advanced examples below are *illustrative* — always call `get_table_metadata` to get the exact codes for your table. Table IDs are now short (`11re.px`, not `statfin_vaerak_pxt_11re.px`). **Value** codes (`SSS`, `KU091`, `MK01`…) are unchanged.

### Basic: Helsinki Population Trend

```javascript
// Codes below are the current codes for table 11re.px (verified).
query_table({
  tableId: "11re.px",
  selections: [
    { variable: "alue_23_20260101", filter: "item", values: ["KU091"] },     // Helsinki
    { variable: "ikaryhma_10_20180101", filter: "item", values: ["SSS"] },    // All ages
    { variable: "sukupuoli_9_20180101", filter: "item", values: ["SSS"] },    // Total
    { variable: "timeperiod_y", filter: "top", top: 10 },                     // Last 10 years
    { variable: "contentscode", filter: "item", values: ["vaerak-vaesto"] }   // Population
  ]
})
// Returns: Helsinki population trend over the last 10 years
```

---

## Advanced Example Queries

*The `variable` codes in these examples are conceptual (pre-migration names shown for readability). Resolve the real, current codes for each table via `get_table_metadata` before querying — only the short table IDs and the value codes are guaranteed current.*

### Education: University Student Employment by Field

*Which fields of study have the highest employment rates for students?*

```javascript
// Table: Student employment by education level and field
query_table({
  tableId: "13g2.px",
  selections: [
    { variable: "Koulutusaste", filter: "item", values: ["7"] },  // University level
    { variable: "Sukupuoli", filter: "item", values: ["SSS"] },   // All genders
    { variable: "Maakunta", filter: "item", values: ["SSS"] },    // Whole country
    { variable: "Vuosi", filter: "top", top: 3 }                  // Last 3 years
  ]
})
// Analyze: Compare IT vs humanities employment rates
```

### Housing: Rent Price Trends by Postal Code

*Track rental market changes in Helsinki city center vs suburbs*

```javascript
// Table: Free-market rental prices by postal code, quarterly
query_table({
  tableId: "13eb.px",
  selections: [
    { variable: "Postinumero", filter: "item", values: [
      "00100",  // Helsinki center (Kruununhaka)
      "00500",  // Sörnäinen
      "02100",  // Espoo Tapiola
      "01300"   // Vantaa Tikkurila
    ]},
    { variable: "Huoneluku", filter: "item", values: ["02"] },  // 2-room apartments
    { variable: "Vuosineljännes", filter: "top", top: 20 }      // 5 years quarterly
  ]
})
// Analyze: Which areas are gentrifying fastest?
```

### Migration: International Migration Flows

*Analyze emigration vs immigration patterns over decades*

```javascript
// Table: Migration by month and type
query_table({
  tableId: "119z.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["SSS"] },
    { variable: "Tapahtumakuukausi", filter: "item", values: ["SSS"] },  // Annual totals
    { variable: "Tiedot", filter: "item", values: [
      "vm41",  // Immigration
      "vm42",  // Emigration
      "vm43"   // Net migration
    ]},
    { variable: "Vuosi", filter: "top", top: 30 }  // 30-year trend
  ]
})
// Analyze: How has Finland's migration balance changed since 1990?
```

### Crime: Monthly Crime Statistics Trends

*Track reported crimes by category with seasonal patterns*

```javascript
// Table: Reported crimes by month (preliminary data)
query_table({
  tableId: "13jt.px",
  selections: [
    { variable: "Rikosryhmä ja teonkuvauksen tarkenne", filter: "item", values: [
      "101T603",     // All crimes total
      "101T504X406", // Violent crimes
      "101T161"      // Property crimes
    ]},
    { variable: "Tiedot", filter: "item", values: ["rikokset_lkm"] },
    { variable: "Kuukausi", filter: "top", top: 60 }  // 5 years monthly
  ]
})
// Analyze: Seasonal crime patterns, COVID impact on crime rates
```

### Electricity: Power Generation Mix Evolution

*How has Finland's electricity production evolved toward renewables?*

```javascript
// Table: Electricity supply and production by source
query_table({
  tableId: "11sr.px",
  selections: [
    { variable: "Tiedot", filter: "item", values: [
      "sahkon_tuot",       // Total production
      "vesivoima",         // Hydropower
      "tuulivoima",        // Wind power
      "ydinvoima",         // Nuclear
      "fossiiliset"        // Fossil fuels
    ]},
    { variable: "Vuosi", filter: "top", top: 25 }  // 25-year transition
  ]
})
// Analyze: Nuclear vs wind growth, fossil phase-out trajectory
```

### Traffic: Road Accident Hotspots by Municipality

*Which municipalities have the highest traffic accident rates?*

```javascript
// Table: Traffic accidents with injuries by area and road type
query_table({
  tableId: "12qh.px",
  selections: [
    { variable: "Alue", filter: "item", values: [
      "SSS",    // Whole country (for comparison)
      "KU091",  // Helsinki
      "KU092",  // Vantaa
      "KU049",  // Espoo
      "KU837",  // Tampere
      "KU853"   // Turku
    ]},
    { variable: "Tielaji", filter: "item", values: ["SSS"] },
    { variable: "Osallinen", filter: "item", values: ["SSS"] },
    { variable: "Tiedot", filter: "item", values: [
      "konn",     // Total accidents
      "kuolonn",  // Fatal accidents
      "loukonn"   // Injury accidents
    ]},
    { variable: "Vuosi", filter: "top", top: 5 }
  ]
})
// Analyze: Per-capita accident rates, pedestrian vs vehicle involvement
```

### Housing: Household Size and Building Type Changes

*How are Finnish living patterns changing over time?*

```javascript
// Table: Households by size and building type
query_table({
  tableId: "116a.px",
  selections: [
    { variable: "Talotyyppi", filter: "item", values: [
      "1",  // Detached houses
      "2",  // Attached houses
      "3",  // Apartment buildings
    ]},
    { variable: "Asuntokunnan koko", filter: "item", values: [
      "1",  // 1-person households
      "2",  // 2-person
      "3",  // 3-person
      "4"   // 4+ person
    ]},
    { variable: "Vuosi", filter: "top", top: 40 }  // Since 1985
  ]
})
// Analyze: Rise of single-person households, apartment living trends
```

### Electric Vehicles: Adoption Rate by Vehicle Type

*Track the EV transition in Finland's vehicle fleet*

```javascript
// Table: New vehicle registrations by fuel type
query_table({
  tableId: "11ck.px",
  selections: [
    { variable: "Ajoneuvoluokka", filter: "item", values: ["01"] },  // Passenger cars
    { variable: "Käyttövoima", filter: "item", values: [
      "00",  // Total
      "01",  // Petrol
      "02",  // Diesel
      "04",  // Electric
      "05",  // Plug-in hybrid
    ]},
    { variable: "Vuosi", filter: "top", top: 15 }
  ]
})
// Analyze: EV market share growth, diesel decline post-2015
```

---

## Multi-Step Analysis Patterns

### Cross-Domain Analysis: Education → Employment → Income

```
1. Find education completion rates by field
2. Get employment statistics for recent graduates
3. Query income data by education level
4. Compare: Which fields offer best ROI?
```

### Time-Series with Regional Breakdown

```
1. Get national trend (region variable, value "SSS")
2. Compare major cities (KU091, KU837, KU853)
3. Identify regional divergence patterns
4. Correlate with local economic indicators
```

### Demographic Shift Analysis

```
1. Query population by age groups (1990-2024)
2. Get migration data for same period
3. Query birth/death rates
4. Model: Aging population impact on workforce
```

## Common Region Codes

| Code | Description |
|------|-------------|
| `SSS` | Whole country (KOKO MAA) |
| `MK01`-`MK19` | Regions (maakunta) |
| `KU091` | Helsinki |
| `KU092` | Vantaa |
| `KU049` | Espoo |

## Development

```bash
# Type checking
npm run typecheck

# Run unit tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run integration tests (requires API access)
npm run test:integration

# Fetch fresh test fixtures
npm run test:fixtures:fetch
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | HTTP server port |
| `MCP_TRANSPORT` | stdio | Set to "http" for HTTP transport |
| `API_TOKEN` | - | Optional authentication token |
| `LOG_LEVEL` | info | Logging level (debug, info, warn, error) |

## API Rate Limits

- StatFin API: 30 requests/minute total
- This server: 8 requests/minute per instance
- Designed for up to 3 concurrent Cloud Run instances

## License

This project (code) is licensed under MIT. The statistical data accessed through this server is provided by Statistics Finland under CC BY 4.0.
