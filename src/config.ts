import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CapacitiesConfig, ServerMode } from './types.js';

interface ConfigFile {
  mode: ServerMode;
  exportPath?: string;
  apiKey?: string;
  http?: {
    port?: number;
    authToken?: string;
  };
}

let configCache: CapacitiesConfig | null = null;

export function getConfig(): CapacitiesConfig {
  if (configCache) {
    return configCache;
  }

  const configPath = findConfigPath();

  if (!configPath) {
    const created = createDefaultConfig();
    if (created) {
      throw new Error(
        'config.json has been created in the project root.\n' +
        'Please edit it with your settings and run the server again.\n\n' +
        'Required settings for File mode:\n' +
        '  - mode: "file"\n' +
        '  - exportPath: "/path/to/your/capacities-export.zip"\n\n' +
        'Required settings for API mode:\n' +
        '  - mode: "api"\n' +
        '  - apiKey: "your-api-key"'
      );
    }
    throw new Error('config.json not found and could not be created.');
  }

  const config = readConfigFile(configPath);
  validateConfig(config);
  
  configCache = config;
  return config;
}

function findConfigPath(): string | null {
  const searchPaths = getConfigSearchPaths();

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath)) {
      return searchPath;
    }
  }

  return null;
}

function getConfigSearchPaths(): string[] {
  const paths: string[] = [];

  // 1. Project root (relative to compiled dist/config.js)
  const distDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(distDir, '..');
  paths.push(path.join(projectRoot, 'config.json'));

  // 2. Current working directory
  paths.push(path.join(process.cwd(), 'config.json'));

  // 3. Executable directory (for packaged apps)
  if (process.execPath) {
    paths.push(path.join(path.dirname(process.execPath), 'config.json'));
  }

  return paths;
}

function readConfigFile(configPath: string): CapacitiesConfig {
  let rawConfig: ConfigFile;

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    rawConfig = JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config.json: ${error.message}`);
    }
    throw new Error(`Failed to read config.json: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    mode: rawConfig.mode || 'file',
    apiKey: rawConfig.apiKey || undefined,
    exportPath: rawConfig.exportPath || undefined,
    authToken: rawConfig.http?.authToken || undefined,
  };
}

export function validateConfig(config: CapacitiesConfig): void {
  if (!['api', 'file'].includes(config.mode)) {
    throw new Error(`Invalid mode "${config.mode}" in config.json. Must be "api" or "file".`);
  }

  if (config.mode === 'api') {
    if (!config.apiKey) {
      throw new Error('apiKey is required in config.json when mode is "api".');
    }
  }

  if (config.mode === 'file') {
    if (!config.exportPath) {
      throw new Error('exportPath is required in config.json when mode is "file".');
    }

    if (!fs.existsSync(config.exportPath)) {
      throw new Error(`exportPath "${config.exportPath}" does not exist.`);
    }
  }
}

function createDefaultConfig(): boolean {
  const searchPaths = getConfigSearchPaths();
  const projectRoot = path.dirname(searchPaths[0]);
  const configPath = path.join(projectRoot, 'config.json');
  const examplePath = path.join(projectRoot, 'config.example.json');

  // Don't overwrite existing config
  if (fs.existsSync(configPath)) {
    return false;
  }

  const defaultConfig: ConfigFile = {
    mode: 'file',
    exportPath: '',
    apiKey: '',
    http: {
      port: 3000,
      authToken: '',
    },
  };

  try {
    // Create config.json from example if it exists, otherwise use defaults
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, configPath);
    } else {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
    console.log(`Created config.json at: ${configPath}`);
    return true;
  } catch (error) {
    console.error('Failed to create config.json:', error);
    return false;
  }
}

export function getConfigPath(): string | null {
  return findConfigPath();
}

export const API_BASE_URL = 'https://api.capacities.io';

export const RATE_LIMITS = {
  spaces: { max: 5, window: 60000 },
  'space-info': { max: 5, window: 60000 },
  search: { max: 120, window: 60000 },
  'save-weblink': { max: 10, window: 60000 },
  'save-to-daily-note': { max: 5, window: 60000 },
} as const;
