import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const getBacklinksTool = {
  name: 'capacities_get_backlinks',
  description: 'Get all objects that link to a specific object. Useful for knowledge graph traversal and discovering related content.',
  parameters: z.object({
    objectId: z.string().describe('The ID of the object to get backlinks for'),
  }),
  annotations: {
    title: 'Get Object Backlinks',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { objectId: string }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode.');
      }

      const backlinks = await mode.getBacklinks(params.objectId);

      return JSON.stringify(
        {
          objectId: params.objectId,
          backlinks: backlinks.map((obj) => ({
            id: obj.id,
            title: obj.title,
            type: obj.type,
            spaceId: obj.spaceId,
          })),
          total: backlinks.length,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to get backlinks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
