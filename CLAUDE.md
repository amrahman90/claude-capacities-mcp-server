# Capacities MCP Server

This is an MCP (Model Context Protocol) server for Capacities, designed as a knowledge base connector for RAG (Retrieval-Augmented Generation).

## Architecture

```
src/
├── index.ts           # Entry point + CLI args
├── server.ts          # FastMCP server setup + tool registration
├── config.ts          # Environment configuration
├── types.ts           # TypeScript type definitions
├── modes/
│   ├── api.ts         # API mode (Pro users)
│   └── file.ts        # File mode (Free users)
├── parser/
│   ├── markdown.ts    # MD + front matter parsing
│   └── zip.ts         # ZIP extraction + index building
├── indexer/
│   └── search.ts      # Simple keyword/tag search
├── tools/             # MCP tool definitions
├── prompts/           # MCP prompt templates
└── transports/
    ├── stdio.ts       # Stdio transport
    └── http.ts        # HTTP transport (Express)
```

## Mode Detection

- `CAPACITIES_API_KEY` set → API mode
- `CAPACITIES_EXPORT_PATH` set → File mode
- `CAPACITIES_MODE` → Force a specific mode

## Available Tools

### Both Modes
- `capacities_list_spaces`
- `capacities_get_space_info`
- `capacities_search`
- `capacities_get_object` (File mode)
- `capacities_list_by_type` (File mode)
- `capacities_get_tags`
- `capacities_get_backlinks`
- `capacities_get_context`

### API Mode Only
- `capacities_save_weblink`
- `capacities_save_to_daily_note`

### File Mode Only
- `capacities_load_export`

## Transports

- **stdio** (default): For Claude Desktop, Cursor, opencode
- **http**: For web-based MCP clients

## CLI

```bash
node dist/index.js --transport stdio
node dist/index.js --transport http --port 3000
node dist/index.js --transport http --auth-token secret
```

## RAG Usage Pattern

1. Use `capacities_search` to find relevant content
2. Use `capacities_get_object` to retrieve full content
3. Use `capacities_get_context` to expand context with related objects
4. Use `capacities_get_backlinks` for knowledge graph traversal

## Common Commands

```bash
bun install          # Install dependencies
bun run build        # Build TypeScript
bun run dev          # Development mode
bun test             # Run tests
```
