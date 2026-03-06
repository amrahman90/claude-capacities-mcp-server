import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const getObjectTool = {
  name: 'capacities_get_object',
  description: 'Get a specific object by its ID or title. Returns the full content for detailed RAG context retrieval.',
  parameters: z.object({
    idOrTitle: z.string().describe('The ID or title of the object to retrieve'),
  }),
  annotations: {
    title: 'Get Capacities Object',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { idOrTitle: string }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode. Use search in API mode.');
      }

      const obj = await mode.getObject(params.idOrTitle);
      if (!obj) {
        throw new Error(`Object not found: ${params.idOrTitle}. Try searching with capacities_search first.`);
      }

      return JSON.stringify(
        {
          id: obj.id,
          type: obj.type,
          title: obj.title,
          spaceId: obj.spaceId,
          tags: obj.tags,
          content: obj.content,
          frontMatter: obj.frontMatter,
          links: obj.links,
          createdAt: obj.createdAt,
          modifiedAt: obj.modifiedAt,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to get object: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
