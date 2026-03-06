import { FastMCP } from 'fastmcp';

export async function startStdioTransport(server: FastMCP): Promise<void> {
  await server.start({
    transportType: 'stdio',
  });
}
