import type { Index, SearchResult, SearchParams, CapacitiesObject } from '../types.js';
import { createExcerpt } from '../parser/markdown.js';

export function search(index: Index, params: SearchParams): SearchResult[] {
  const { query, spaceId, type, tags, limit = 20 } = params;
  const queryTokens = tokenize(query.toLowerCase());
  const scores = new Map<string, number>();

  for (const token of queryTokens) {
    const objectIds = index.searchIndex.get(token);
    if (objectIds) {
      for (const objectId of objectIds) {
        scores.set(objectId, (scores.get(objectId) || 0) + 1);
      }
    }
  }

  if (spaceId) {
    const spaceObjects = index.objectsBySpace.get(spaceId);
    if (spaceObjects) {
      for (const [objectId] of scores) {
        if (!spaceObjects.has(objectId)) {
          scores.delete(objectId);
        }
      }
    }
  }

  if (type) {
    const typeObjects = index.objectsByType.get(type);
    if (typeObjects) {
      for (const [objectId] of scores) {
        if (!typeObjects.has(objectId)) {
          scores.delete(objectId);
        }
      }
    }
  }

  if (tags && tags.length > 0) {
    for (const tag of tags) {
      const tagObjects = index.objectsByTag.get(tag);
      if (tagObjects) {
        for (const [objectId] of scores) {
          if (!tagObjects.has(objectId)) {
            scores.delete(objectId);
          }
        }
      }
    }
  }

  const sortedResults = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const results: SearchResult[] = [];

  for (const [objectId, score] of sortedResults) {
    const obj = index.objects.get(objectId);
    if (obj) {
      results.push({
        id: obj.id,
        type: obj.type,
        title: obj.title,
        spaceId: obj.spaceId,
        tags: obj.tags,
        excerpt: createExcerpt(obj.content),
        relevanceScore: score / queryTokens.length,
        metadata: {
          createdAt: obj.createdAt,
          modifiedAt: obj.modifiedAt,
        },
      });
    }
  }

  return results;
}

export function searchByTitle(index: Index, titleQuery: string): CapacitiesObject | undefined {
  const id = index.titleIndex.get(titleQuery.toLowerCase());
  if (id) {
    return index.objects.get(id);
  }

  for (const [title, objectId] of index.titleIndex) {
    if (title.includes(titleQuery.toLowerCase())) {
      return index.objects.get(objectId);
    }
  }

  return undefined;
}

export function searchByTags(index: Index, tags: string[], limit: number = 50): CapacitiesObject[] {
  const objectScores = new Map<string, number>();

  for (const tag of tags) {
    const objectIds = index.objectsByTag.get(tag);
    if (objectIds) {
      for (const objectId of objectIds) {
        objectScores.set(objectId, (objectScores.get(objectId) || 0) + 1);
      }
    }
  }

  return Array.from(objectScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([objectId]) => index.objects.get(objectId)!)
    .filter(Boolean);
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function getRelatedObjects(index: Index, objectId: string, limit: number = 10): CapacitiesObject[] {
  const obj = index.objects.get(objectId);
  if (!obj) return [];

  const scores = new Map<string, number>();

  for (const link of obj.links) {
    const linkedId = index.titleIndex.get(link.toLowerCase());
    if (linkedId && linkedId !== objectId) {
      scores.set(linkedId, (scores.get(linkedId) || 0) + 3);
    }
  }

  const backlinks = index.backlinksIndex.get(objectId);
  if (backlinks) {
    for (const backlinkId of backlinks) {
      if (backlinkId !== objectId) {
        scores.set(backlinkId, (scores.get(backlinkId) || 0) + 2);
      }
    }
  }

  for (const tag of obj.tags) {
    const tagObjects = index.objectsByTag.get(tag);
    if (tagObjects) {
      for (const tagObjectId of tagObjects) {
        if (tagObjectId !== objectId) {
          scores.set(tagObjectId, (scores.get(tagObjectId) || 0) + 1);
        }
      }
    }
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => index.objects.get(id)!)
    .filter(Boolean);
}
