import { FastMCP } from 'fastmcp';

interface HttpOptions {
  port: number;
  authToken?: string;
  disableAuth?: boolean;
}

export async function startHttpTransport(server: FastMCP, options: HttpOptions): Promise<void> {
  if (!options.disableAuth && options.authToken) {
    console.log(`Auth token: ${options.authToken}`);
    console.log(`Use this token in the Authorization header: Bearer ${options.authToken}`);
  }

  if (!options.disableAuth) {
    console.log('Authentication: Required (token not shown for security)');
  } else {
    console.log('Authentication: Disabled');
  }

  await server.start({
    transportType: 'httpStream',
    httpStream: {
      endpoint: '/mcp',
      port: options.port,
    },
  });

  console.log(`Capacities MCP Server (HTTP Stream) listening on port ${options.port}`);
  console.log(`Endpoint: http://localhost:${options.port}/mcp`);
}
