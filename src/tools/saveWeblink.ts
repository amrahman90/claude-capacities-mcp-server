import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { ApiMode } from '../modes/api.js';

export const saveWeblinkTool = {
  name: 'capacities_save_weblink',
  description: 'Save a web link to a Capacities space. Requires API mode (Pro subscription).',
  parameters: z.object({
    spaceId: z.string().describe('The UUID of the space to save the weblink to'),
    url: z.string().url().describe('The URL to save'),
    titleOverwrite: z.string().max(500).optional().describe('Optional custom title for the weblink'),
    descriptionOverwrite: z.string().max(500).optional().describe('Optional description for the weblink'),
    tags: z.array(z.string()).max(30).optional().describe('Optional tags. Tags must exactly match your tag names in Capacities.'),
    mdText: z.string().max(200000).optional().describe('Optional markdown text to add to the notes section'),
  }),
  annotations: {
    title: 'Save Weblink to Capacities',
    readOnlyHint: false,
    destructiveHint: false,
  },
  execute: async (mode: Mode, params: {
    spaceId: string;
    url: string;
    titleOverwrite?: string;
    descriptionOverwrite?: string;
    tags?: string[];
    mdText?: string;
  }) => {
    try {
      if (!(mode instanceof ApiMode)) {
        throw new Error('This tool requires API mode (Pro subscription). File mode is read-only.');
      }

      const result = await mode.saveWeblink(params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to save weblink: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
