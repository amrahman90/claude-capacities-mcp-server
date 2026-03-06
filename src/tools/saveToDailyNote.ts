import { z } from 'zod';
import type { Mode } from '../modes/index.js';
import { ApiMode } from '../modes/api.js';

export const saveToDailyNoteTool = {
  name: 'capacities_save_to_daily_note',
  description: 'Add markdown content to today\'s daily note in a Capacities space. Requires API mode (Pro subscription).',
  parameters: z.object({
    spaceId: z.string().describe('The UUID of the space to save to the daily note'),
    mdText: z.string().max(200000).describe('The markdown text to add to today\'s daily note'),
    origin: z.enum(['commandPalette']).optional().describe('Optional origin label (only "commandPalette" is supported)'),
    noTimestamp: z.boolean().optional().describe('If true, no timestamp will be added to the note'),
  }),
  annotations: {
    title: 'Save to Daily Note',
    readOnlyHint: false,
    destructiveHint: false,
  },
  execute: async (mode: Mode, params: {
    spaceId: string;
    mdText: string;
    origin?: 'commandPalette';
    noTimestamp?: boolean;
  }) => {
    try {
      if (!(mode instanceof ApiMode)) {
        throw new Error('This tool requires API mode (Pro subscription). File mode is read-only.');
      }

      const result = await mode.saveToDailyNote(params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(
        `Failed to save to daily note: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
};
