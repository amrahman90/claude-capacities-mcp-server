import { FastMCP } from 'fastmcp';
import type { Mode } from './modes/index.js';
import { ApiMode } from './modes/api.js';
import { FileMode } from './modes/file.js';
import {
  listSpacesTool,
  getSpaceInfoTool,
  searchTool,
  getObjectTool,
  listByTypeTool,
  getTagsTool,
  getBacklinksTool,
  getContextTool,
  loadExportTool,
  saveWeblinkTool,
  saveToDailyNoteTool,
} from './tools/index.js';
import {
  dailySummaryPrompt,
  meetingNotesPrompt,
  researchNotePrompt,
} from './prompts/index.js';

export function createMcpServer(mode: Mode): FastMCP {
  const server = new FastMCP({
    name: 'Capacities',
    version: '1.0.0',
  });

  server.addTool({
    ...listSpacesTool,
    execute: async () => listSpacesTool.execute(mode),
  });

  server.addTool({
    ...getSpaceInfoTool,
    execute: async (params: { spaceId: string }) => getSpaceInfoTool.execute(mode, params),
  });

  server.addTool({
    ...searchTool,
    execute: async (params: { query: string; spaceIds?: string[]; type?: string; tags?: string[]; limit?: number }) =>
      searchTool.execute(mode, params),
  });

  server.addTool({
    ...getObjectTool,
    execute: async (params: { idOrTitle: string }) => getObjectTool.execute(mode, params),
  });

  server.addTool({
    ...listByTypeTool,
    execute: async (params: { spaceId: string; type: string; limit?: number }) =>
      listByTypeTool.execute(mode, params),
  });

  server.addTool({
    ...getTagsTool,
    execute: async (params: { spaceId?: string }) => getTagsTool.execute(mode, params),
  });

  server.addTool({
    ...getBacklinksTool,
    execute: async (params: { objectId: string }) => getBacklinksTool.execute(mode, params),
  });

  server.addTool({
    ...getContextTool,
    execute: async (params: { objectId: string; depth?: number }) => getContextTool.execute(mode, params),
  });

  if (mode instanceof FileMode) {
    server.addTool({
      ...loadExportTool,
      execute: async (params: { path?: string }) => loadExportTool.execute(mode, params),
    });
  }

  if (mode instanceof ApiMode) {
    server.addTool({
      ...saveWeblinkTool,
      execute: async (params: {
        spaceId: string;
        url: string;
        titleOverwrite?: string;
        descriptionOverwrite?: string;
        tags?: string[];
        mdText?: string;
      }) => saveWeblinkTool.execute(mode, params),
    });

    server.addTool({
      ...saveToDailyNoteTool,
      execute: async (params: {
        spaceId: string;
        mdText: string;
        origin?: 'commandPalette';
        noTimestamp?: boolean;
      }) => saveToDailyNoteTool.execute(mode, params),
    });
  }

  server.addPrompt(dailySummaryPrompt);
  server.addPrompt(meetingNotesPrompt);
  server.addPrompt(researchNotePrompt);

  return server;
}

export async function initializeMode(mode: Mode): Promise<void> {
  if (mode instanceof FileMode) {
    console.log('Loading Capacities export...');
    await mode.load();
    const spaces = await mode.listSpaces();
    console.log(`Loaded ${spaces.length} space(s) from export`);
  }
}
