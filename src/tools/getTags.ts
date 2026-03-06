import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const getTagsTool = {
  name: 'capacities_get_tags',
  description: 'Get all tags used in a space with their usage counts. Useful for discovering available tags for filtering.',
  parameters: z.object({
    spaceId: z.string().optional().describe('The ID or name of the space (optional, gets all tags if not specified)'),
  }),
  annotations: {
    title: 'Get Capacities Tags',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { spaceId?: string }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode.');
      }

      const tags = await mode.getTags(params.spaceId);
      const sortedTags = Array.from(tags.entries()).sort((a, b) => b[1] - a[1]);

      return JSON.stringify(
        {
          spaceId: params.spaceId || 'all',
          tags: sortedTags.map(([tag, count]) => ({ tag, count })),
          total: sortedTags.length,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to get tags: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
