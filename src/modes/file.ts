import type { Index, Space, CapacitiesObject, SearchResult } from '../types.js';
import { loadExport } from '../parser/index.js';
import { search, searchByTitle, searchByTags, getRelatedObjects } from '../indexer/index.js';
import { createExcerpt } from '../parser/markdown.js';

export class FileMode {
  private exportPath: string;
  private index: Index | null = null;
  private isLoading: boolean = false;

  constructor(exportPath: string) {
    this.exportPath = exportPath;
  }

  async load(): Promise<void> {
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    try {
      this.index = await loadExport(this.exportPath);
    } finally {
      this.isLoading = false;
    }
  }

  isLoaded(): boolean {
    return this.index !== null;
  }

  getIndex(): Index | null {
    return this.index;
  }

  async listSpaces(): Promise<Space[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    return Array.from(this.index.spaces.values());
  }

  async getSpaceInfo(spaceId: string): Promise<Space | null> {
    if (!this.index) {
      await this.load();
    }

    return this.index?.spaces.get(spaceId) || null;
  }

  async search(params: {
    query: string;
    spaceId?: string;
    type?: string;
    tags?: string[];
    limit?: number;
  }): Promise<SearchResult[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    return search(this.index, params);
  }

  async getObject(idOrTitle: string): Promise<CapacitiesObject | null> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return null;
    }

    let obj = this.index.objects.get(idOrTitle);
    if (obj) return obj;

    obj = searchByTitle(this.index, idOrTitle);
    return obj || null;
  }

  async listByType(spaceId: string, type: string, limit: number = 50): Promise<CapacitiesObject[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    const typeObjects = this.index.objectsByType.get(type);
    if (!typeObjects) return [];

    const spaceObjects = this.index.objectsBySpace.get(spaceId);
    if (!spaceObjects) return [];

    const results: CapacitiesObject[] = [];

    for (const objectId of typeObjects) {
      if (spaceObjects.has(objectId)) {
        const obj = this.index.objects.get(objectId);
        if (obj) {
          results.push(obj);
          if (results.length >= limit) break;
        }
      }
    }

    return results;
  }

  async getTags(spaceId?: string): Promise<Map<string, number>> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return new Map();
    }

    const tags = new Map<string, number>();

    for (const [tag, objectIds] of this.index.objectsByTag) {
      if (spaceId) {
        const spaceObjects = this.index.objectsBySpace.get(spaceId);
        if (!spaceObjects) continue;

        let count = 0;
        for (const objectId of objectIds) {
          if (spaceObjects.has(objectId)) {
            count++;
          }
        }
        if (count > 0) {
          tags.set(tag, count);
        }
      } else {
        tags.set(tag, objectIds.size);
      }
    }

    return tags;
  }

  async getBacklinks(objectId: string): Promise<CapacitiesObject[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    const backlinkIds = this.index.backlinksIndex.get(objectId);
    if (!backlinkIds) return [];

    const results: CapacitiesObject[] = [];
    for (const id of backlinkIds) {
      const obj = this.index.objects.get(id);
      if (obj) {
        results.push(obj);
      }
    }

    return results;
  }

  async getContext(objectId: string, depth: number = 1): Promise<CapacitiesObject[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    return getRelatedObjects(this.index, objectId, depth * 10);
  }

  async searchByTags(tags: string[], limit: number = 50): Promise<CapacitiesObject[]> {
    if (!this.index) {
      await this.load();
    }

    if (!this.index) {
      return [];
    }

    return searchByTags(this.index, tags, limit);
  }

  isReadOnly(): boolean {
    return true;
  }
}
