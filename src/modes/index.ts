import type { CapacitiesConfig } from '../types.js';
import { ApiMode } from './api.js';
import { FileMode } from './file.js';

export type Mode = ApiMode | FileMode;

export function createMode(config: CapacitiesConfig): Mode {
  if (config.mode === 'api') {
    if (!config.apiKey) {
      throw new Error('CAPACITIES_API_KEY is required for API mode');
    }
    return new ApiMode(config.apiKey);
  }

  if (!config.exportPath) {
    throw new Error('CAPACITIES_EXPORT_PATH is required for File mode');
  }
  return new FileMode(config.exportPath);
}

export { ApiMode } from './api.js';
export { FileMode } from './file.js';
