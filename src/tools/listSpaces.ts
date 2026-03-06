import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { ApiMode } from '../modes/api.js';
import { FileMode } from '../modes/file.js';

export const listSpacesTool = {
  name: 'capacities_list_spaces',
  description: 'List all personal spaces in Capacities. Use this to discover available spaces before searching or accessing content.',
  parameters: z.object({}),
  annotations: {
    title: 'List Capacities Spaces',
    readOnlyHint: true,
  },
  execute: async (mode: Mode) => {
    try {
      const spaces = await mode.listSpaces();
      return JSON.stringify(
        {
          spaces: spaces.map((s) => ({
            id: s.id,
            name: s.name,
            types: s.types,
            objectCount: s.objectCount,
          })),
          total: spaces.length,
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to list spaces: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
