import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const getContextTool = {
  name: 'capacities_get_context',
  description: 'Get related context for RAG retrieval. Returns objects linked to, tagged similarly, or referenced by the target object.',
  parameters: z.object({
    objectId: z.string().describe('The ID of the object to get context for'),
    depth: z.number().min(1).max(3).default(1).describe('Context depth: 1=direct relations, 2=2 hops, 3=3 hops'),
  }),
  annotations: {
    title: 'Get RAG Context',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { objectId: string; depth?: number }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode.');
      }

      const relatedObjects = await mode.getContext(params.objectId, params.depth || 1);

      const context = relatedObjects.map((obj) => ({
        id: obj.id,
        title: obj.title,
        type: obj.type,
        tags: obj.tags,
        excerpt: obj.content.substring(0, 300) + (obj.content.length > 300 ? '...' : ''),
      }));

      return JSON.stringify(
        {
          objectId: params.objectId,
          depth: params.depth || 1,
          context,
          total: context.length,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to get context: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
