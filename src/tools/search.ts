import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { ApiMode } from '../modes/api.js';
import { FileMode } from '../modes/file.js';

export const searchTool = {
  name: 'capacities_search',
  description: 'Search for content across Capacities spaces. Returns matching objects with excerpts for RAG context retrieval.',
  parameters: z.object({
    query: z.string().describe('The search query - keywords or phrases to search for'),
    spaceIds: z.array(z.string()).optional().describe('Array of space IDs to search in (optional, searches all if not specified)'),
    type: z.string().optional().describe('Filter by object type (e.g., Page, Person, Weblink, Organization)'),
    tags: z.array(z.string()).optional().describe('Filter by tags'),
    limit: z.number().min(1).max(100).default(20).describe('Maximum number of results to return'),
  }),
  annotations: {
    title: 'Search Capacities Content',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { query: string; spaceIds?: string[]; type?: string; tags?: string[]; limit?: number }) => {
    try {
      const limit = params.limit || 20;

      if (mode instanceof ApiMode) {
        const spaces = await mode.listSpaces();
        const spaceIds = params.spaceIds || spaces.map((s) => s.id);
        const results = await mode.search(params.query, spaceIds, 'fullText');
        return JSON.stringify(
          {
            results: results.slice(0, limit),
            total: results.length,
            query: params.query,
          },
          null,
          2
        );
      } else if (mode instanceof FileMode) {
        const spaceId = params.spaceIds?.[0];
        const results = await mode.search({
          query: params.query,
          spaceId,
          type: params.type,
          tags: params.tags,
          limit,
        });
        return JSON.stringify(
          {
            results,
            total: results.length,
            query: params.query,
          },
          null,
          2
        );
      }
      throw new Error('Unknown mode');
    } catch (error) {
      throw new Error(
        `Failed to search content: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
