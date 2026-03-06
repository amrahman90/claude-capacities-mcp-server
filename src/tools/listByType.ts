import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const listByTypeTool = {
  name: 'capacities_list_by_type',
  description: 'List all objects of a specific type in a space. Useful for browsing content by category.',
  parameters: z.object({
    spaceId: z.string().describe('The ID or name of the space'),
    type: z.string().describe('The object type to list (e.g., Page, Person, Weblink, Organization, Definition)'),
    limit: z.number().min(1).max(100).default(50).describe('Maximum number of results'),
  }),
  annotations: {
    title: 'List Objects by Type',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { spaceId: string; type: string; limit?: number }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode.');
      }

      const objects = await mode.listByType(params.spaceId, params.type, params.limit || 50);

      return JSON.stringify(
        {
          spaceId: params.spaceId,
          type: params.type,
          objects: objects.map((obj) => ({
            id: obj.id,
            title: obj.title,
            tags: obj.tags,
            excerpt: obj.content.substring(0, 200) + (obj.content.length > 200 ? '...' : ''),
          })),
          total: objects.length,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to list objects by type: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
