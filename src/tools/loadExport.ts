import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { FileMode } from '../modes/file.js';

export const loadExportTool = {
  name: 'capacities_load_export',
  description: 'Load or reload the Capacities export file. Use this after updating the export ZIP to refresh the data.',
  parameters: z.object({
    path: z.string().optional().describe('Optional path to the export file (uses configured path if not specified)'),
  }),
  annotations: {
    title: 'Load Capacities Export',
    readOnlyHint: false,
  },
  execute: async (mode: Mode, params: { path?: string }) => {
    try {
      if (!(mode instanceof FileMode)) {
        throw new Error('This tool is only available in File mode.');
      }

      if (params.path) {
        mode = new FileMode(params.path);
      }

      await mode.load();

      const spaces = await mode.listSpaces();
      const index = mode.getIndex();
      const objectCount = index?.objects.size || 0;

      return JSON.stringify(
        {
          success: true,
          message: 'Export loaded successfully',
          spaces: spaces.length,
          objects: objectCount,
          spaceDetails: spaces.map((s) => ({
            name: s.name,
            types: s.types,
            count: s.objectCount,
          })),
        },
        null,
        2
      );
    } catch (error) {
      throw new Error(
        `Failed to load export: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
