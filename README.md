# Capacities MCP Server

A Model Context Protocol (MCP) server for [Capacities](https://capacities.io) - designed as a **knowledge base connector for RAG** (Retrieval-Augmented Generation).

## Features

- **Dual Mode Support**: API mode (Pro users) and File mode (Free users)
- **RAG-Optimized**: Tools designed for knowledge retrieval and context enrichment
- **Multiple Transports**: stdio (default) and HTTP for web-based clients
- **Search**: Simple keyword and tag-based search
- **Knowledge Graph**: Backlinks and context retrieval
- **Simple Configuration**: Single `config.json` file

## Installation

```bash
# Clone or download the project
cd capacities-mcp

# Install dependencies
bun install

# Build
bun run build
```

## Configuration

The server reads configuration from `config.json` in the project root.

### First Run

On first run, the server will create a default `config.json` file. Edit it with your settings:

```json
{
  "mode": "file",
  "exportPath": "/path/to/your/capacities-export.zip",
  "apiKey": "",
  "http": {
    "port": 3000,
    "authToken": ""
  }
}
```

### File Mode (Free Users)

For users without API access, use the exported ZIP file:

```json
{
  "mode": "file",
  "exportPath": "C:\\Users\\mahmu\\Downloads\\Capacities (2026-02-11 13-03-27).zip"
}
```

1. Export your Capacities data: Settings > Full Export > Manual Export
2. Set `exportPath` to the ZIP file location
3. Run the server

### API Mode (Pro Users)

For users with API access:

```json
{
  "mode": "api",
  "apiKey": "your-api-key-here"
}
```

Get your API key from [Capacities account settings](https://capacities.io/).

### HTTP Transport (Optional)

For web-based MCP clients:

```json
{
  "mode": "file",
  "exportPath": "/path/to/export.zip",
  "http": {
    "port": 3000,
    "authToken": "your-secret-token"
  }
}
```

## Quick Start

```bash
# Build
bun run build

# Run (stdio transport - default)
bun dist/index.js

# Run with HTTP transport
bun dist/index.js --transport http --port 3000

# Show help
bun dist/index.js --help
```

## MCP Client Configuration

### Claude Desktop

`%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "capacities": {
      "command": "bun",
      "args": ["C:\\Users\\mahmu\\IdeaProjects\\capacities-mcp\\dist\\index.js"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json`

```json
{
  "mcpServers": {
    "capacities": {
      "command": "bun",
      "args": ["/path/to/capacities-mcp/dist/index.js"]
    }
  }
}
```

### opencode

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "capacities": {
      "command": "bun",
      "args": ["C:\\Users\\mahmu\\IdeaProjects\\capacities-mcp\\dist\\index.js"]
    }
  }
}
```

## Available Tools

### Read Tools (Both Modes)

| Tool | Description |
|------|-------------|
| `capacities_list_spaces` | List all spaces |
| `capacities_get_space_info` | Get structures and types in a space |
| `capacities_search` | Search content by keywords and tags |
| `capacities_get_object` | Get full object content by ID or title (File mode) |
| `capacities_list_by_type` | List objects by type (File mode) |
| `capacities_get_tags` | Get all tags with usage counts |
| `capacities_get_backlinks` | Get objects linking to an object |
| `capacities_get_context` | Get related context for RAG |

### Write Tools (API Mode Only)

| Tool | Description |
|------|-------------|
| `capacities_save_weblink` | Save a web link to a space |
| `capacities_save_to_daily_note` | Add content to daily note |

### File Mode Only

| Tool | Description |
|------|-------------|
| `capacities_load_export` | Reload the export file |

## HTTP Transport

For web-based MCP clients:

```bash
# Start HTTP server
bun dist/index.js --transport http --port 3000
```

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | MCP JSON-RPC requests |

## Available Prompts

- `capacities-daily-summary` - Structured daily summaries
- `capacities-meeting-notes` - Meeting note templates
- `capacities-research-note` - Research note formatting

## CLI Options

```
Options:
  --transport <type>     Transport: 'stdio' or 'http' (default: stdio)
  --port <number>        Port for HTTP server (default: 3000)
  --help, -h             Show help
```

## Rate Limits (API Mode)

| Endpoint | Limit |
|----------|-------|
| `/spaces` | 5 requests / 60 seconds |
| `/space-info` | 5 requests / 60 seconds |
| `/search` | 120 requests / 60 seconds |
| `/save-weblink` | 10 requests / 60 seconds |
| `/save-to-daily-note` | 5 requests / 60 seconds |

## Development

```bash
# Install dependencies
bun install

# Development mode with hot reload
bun run dev

# Build
bun run build

# Run tests
bun test

# Type check
bun run lint
```

## Updating the Export

When you export a new ZIP from Capacities:

1. Save the new ZIP file
2. Update `exportPath` in `config.json`
3. Restart the MCP server, or use `capacities_load_export` tool

## License

MIT
