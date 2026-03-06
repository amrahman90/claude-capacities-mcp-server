#!/usr/bin/env node
import { getConfig } from './config.js';
import { createMode } from './modes/index.js';
import { createMcpServer, initializeMode } from './server.js';
import { startStdioTransport } from './transports/stdio.js';
import { startHttpTransport } from './transports/http.js';

interface CliOptions {
  transport: 'stdio' | 'http';
  port: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    transport: 'stdio',
    port: 3000,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--transport' && i + 1 < args.length) {
      options.transport = args[i + 1] as 'stdio' | 'http';
      i++;
    } else if (args[i] === '--port' && i + 1 < args.length) {
      options.port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Capacities MCP Server - Knowledge base connector for RAG

Usage: capacities-mcp [options]

Options:
  --transport <type>     Transport type: 'stdio' or 'http' (default: stdio)
  --port <number>        Port for HTTP server (default: 3000)
  --help, -h             Show this help message

Configuration:
  Edit config.json in the project root to configure the server.

  File mode (free users):
    {
      "mode": "file",
      "exportPath": "/path/to/capacities-export.zip"
    }

  API mode (Pro users):
    {
      "mode": "api",
      "apiKey": "your-api-key"
    }

  HTTP transport:
    {
      "http": {
        "port": 3000,
        "authToken": "your-token"
      }
    }

Examples:
  capacities-mcp                              # stdio transport
  capacities-mcp --transport http --port 3000 # HTTP transport
  `);
}

async function main(): Promise<void> {
  const cliOptions = parseArgs();

  try {
    const config = getConfig();

    console.log(`Starting Capacities MCP Server in ${config.mode} mode...`);

    const mode = createMode(config);
    await initializeMode(mode);

    const server = createMcpServer(mode);

    if (cliOptions.transport === 'stdio') {
      await startStdioTransport(server);
    } else if (cliOptions.transport === 'http') {
      await startHttpTransport(server, {
        port: cliOptions.port,
        authToken: config.authToken,
        disableAuth: !config.authToken,
      });
    } else {
      throw new Error(`Unsupported transport: ${cliOptions.transport}`);
    }
  } catch (error) {
    console.error('Error starting server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
