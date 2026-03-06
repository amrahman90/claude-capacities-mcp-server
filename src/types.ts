export type ServerMode = 'api' | 'file';

export interface CapacitiesConfig {
  mode: ServerMode;
  apiKey?: string;
  exportPath?: string;
  authToken?: string;
}

export interface Space {
  id: string;
  name: string;
  types: string[];
  objectCount: number;
  lastIndexed?: string;
}

export interface CapacitiesObject {
  id: string;
  type: string;
  title: string;
  spaceId: string;
  filePath: string;
  frontMatter: Record<string, unknown>;
  content: string;
  tags: string[];
  createdAt?: string;
  modifiedAt?: string;
  links: string[];
  backlinks: string[];
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  spaceId: string;
  tags: string[];
  excerpt: string;
  relevanceScore: number;
  metadata: {
    createdAt?: string;
    modifiedAt?: string;
  };
}

export interface SearchParams {
  query: string;
  spaceId?: string;
  type?: string;
  tags?: string[];
  limit?: number;
}

export interface Index {
  spaces: Map<string, Space>;
  objects: Map<string, CapacitiesObject>;
  objectsByType: Map<string, Set<string>>;
  objectsBySpace: Map<string, Set<string>>;
  objectsByTag: Map<string, Set<string>>;
  searchIndex: Map<string, Set<string>>;
  titleIndex: Map<string, string>;
  linksIndex: Map<string, Set<string>>;
  backlinksIndex: Map<string, Set<string>>;
}

export interface ParsedMarkdown {
  frontMatter: Record<string, unknown>;
  content: string;
  tags: string[];
  links: string[];
}

export interface MediaMetadata {
  type: 'Image' | 'File' | 'Media';
  title: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  url?: string;
}

export interface ApiSpaceInfo {
  id: string;
  name: string;
  structures: ApiStructure[];
  collections: ApiCollection[];
}

export interface ApiStructure {
  id: string;
  name: string;
  pluralName: string;
  color: string;
  icon: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  structureId: string;
}

export interface ApiSearchResult {
  id: string;
  title: string;
  structureId: string;
  spaceId: string;
  snippet?: string;
}

export interface TransportOptions {
  type: 'stdio' | 'http';
  port?: number;
  authToken?: string;
}
