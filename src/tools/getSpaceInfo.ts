import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { ApiMode } from '../modes/api.js';
import { FileMode } from '../modes/file.js';

export const getSpaceInfoTool = {
  name: 'capacities_get_space_info',
  description: 'Get detailed information about a specific Capacities space including structures (object types) and collections.',
  parameters: z.object({
    spaceId: z.string().describe('The ID or name of the space to get information for'),
  }),
  annotations: {
    title: 'Get Capacities Space Info',
    readOnlyHint: true,
  },
  execute: async (mode: Mode, params: { spaceId: string }) => {
    try {
      if (mode instanceof ApiMode) {
        const info = await mode.getSpaceInfo(params.spaceId);
        return JSON.stringify(info, null, 2);
      } else if (mode instanceof FileMode) {
        const info = await mode.getSpaceInfo(params.spaceId);
        if (!info) {
          throw new Error(`Space not found: ${params.spaceId}. Available spaces: ${(await mode.listSpaces()).map((s) => s.name).join(', ')}`);
        }
        return JSON.stringify(info, null, 2);
      }
      throw new Error('Unknown mode');
    } catch (error) {
      throw new Error(
        `Failed to get space info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
