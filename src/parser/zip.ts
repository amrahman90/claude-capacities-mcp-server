import fs from 'node:fs';
import path from 'node:path';
// @ts-ignore - unzipper types are declared in src/types/unzipper.d.ts
import unzipper from 'unzipper';
import type { CapacitiesObject, Space, Index } from '../types.js';
import { parseMarkdown, extractTitle, extractType, generateId } from './markdown.js';

export async function parseZipFile(zipPath: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', async (entry: unzipper.Entry) => {
        const filePath = entry.path;

        if (filePath.endsWith('.md')) {
          const content = await entry.buffer();
          files.set(filePath, content.toString('utf-8'));
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => resolve(files))
      .on('error', reject);
  });
}

export async function parseFolder(folderPath: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  async function walk(dir: string, basePath: string = '') {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await walk(fullPath, relativePath);
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        files.set(relativePath, content);
      }
    }
  }

  await walk(folderPath);
  return files;
}

export function buildIndex(files: Map<string, string>): Index {
  const spaces = new Map<string, Space>();
  const objects = new Map<string, CapacitiesObject>();
  const objectsByType = new Map<string, Set<string>>();
  const objectsBySpace = new Map<string, Set<string>>();
  const objectsByTag = new Map<string, Set<string>>();
  const searchIndex = new Map<string, Set<string>>();
  const titleIndex = new Map<string, string>();
  const linksIndex = new Map<string, Set<string>>();
  const backlinksIndex = new Map<string, Set<string>>();

  const typeCounts = new Map<string, number>();

  for (const [filePath, rawContent] of files) {
    const parsed = parseMarkdown(rawContent);
    const spaceId = extractSpaceId(filePath);
    const objectType = extractType(parsed.frontMatter, filePath);
    const title = extractTitle(parsed.frontMatter, filePath);
    const id = generateId(filePath);

    const obj: CapacitiesObject = {
      id,
      type: objectType,
      title,
      spaceId,
      filePath,
      frontMatter: parsed.frontMatter,
      content: parsed.content,
      tags: parsed.tags,
      createdAt: extractDate(parsed.frontMatter.createdAt || parsed.frontMatter.creationDate),
      modifiedAt: extractDate(parsed.frontMatter.modificationDate),
      links: parsed.links,
      backlinks: [],
    };

    objects.set(id, obj);

    if (!objectsByType.has(objectType)) {
      objectsByType.set(objectType, new Set());
    }
    objectsByType.get(objectType)!.add(id);

    if (!objectsBySpace.has(spaceId)) {
      objectsBySpace.set(spaceId, new Set());
    }
    objectsBySpace.get(spaceId)!.add(id);

    for (const tag of parsed.tags) {
      if (!objectsByTag.has(tag)) {
        objectsByTag.set(tag, new Set());
      }
      objectsByTag.get(tag)!.add(id);
    }

    indexContent(searchIndex, id, parsed.content, title, parsed.tags);

    titleIndex.set(title.toLowerCase(), id);

    if (parsed.links.length > 0) {
      linksIndex.set(id, new Set(parsed.links));
    }

    typeCounts.set(objectType, (typeCounts.get(objectType) || 0) + 1);
  }

  for (const [id, links] of linksIndex) {
    for (const linkTitle of links) {
      const linkedId = titleIndex.get(linkTitle.toLowerCase());
      if (linkedId && linkedId !== id) {
        if (!backlinksIndex.has(linkedId)) {
          backlinksIndex.set(linkedId, new Set());
        }
        backlinksIndex.get(linkedId)!.add(id);
      }
    }
  }

  for (const [spaceId, objectIds] of objectsBySpace) {
    const types = new Set<string>();
    for (const objId of objectIds) {
      const obj = objects.get(objId);
      if (obj) {
        types.add(obj.type);
      }
    }

    spaces.set(spaceId, {
      id: spaceId,
      name: spaceId,
      types: Array.from(types),
      objectCount: objectIds.size,
      lastIndexed: new Date().toISOString(),
    });
  }

  return {
    spaces,
    objects,
    objectsByType,
    objectsBySpace,
    objectsByTag,
    searchIndex,
    titleIndex,
    linksIndex,
    backlinksIndex,
  };
}

function extractSpaceId(filePath: string): string {
  const parts = filePath.split('/');
  return parts[0] || 'Unknown';
}

function extractDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  return undefined;
}

function indexContent(
  searchIndex: Map<string, Set<string>>,
  objectId: string,
  content: string,
  title: string,
  tags: string[]
): void {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  const tokens = tokenize(text);

  for (const token of tokens) {
    if (!searchIndex.has(token)) {
      searchIndex.set(token, new Set());
    }
    searchIndex.get(token)!.add(objectId);
  }
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function isZipFile(path: string): boolean {
  return path.toLowerCase().endsWith('.zip');
}

export async function loadExport(exportPath: string): Promise<Index> {
  let files: Map<string, string>;

  if (isZipFile(exportPath)) {
    files = await parseZipFile(exportPath);
  } else {
    const stats = await fs.promises.stat(exportPath);
    if (stats.isDirectory()) {
      files = await parseFolder(exportPath);
    } else {
      throw new Error(`Export path must be a ZIP file or directory: ${exportPath}`);
    }
  }

  return buildIndex(files);
}
