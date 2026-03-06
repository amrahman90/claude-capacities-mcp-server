import matter from 'gray-matter';
import type { ParsedMarkdown } from '../types.js';

const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

export function parseMarkdown(rawContent: string): ParsedMarkdown {
  const { data: frontMatter, content } = matter(rawContent);

  const tags = extractTags(frontMatter, content);
  const links = extractLinks(content);

  return {
    frontMatter,
    content: content.trim(),
    tags,
    links,
  };
}

function extractTags(frontMatter: Record<string, unknown>, content: string): string[] {
  const tags = new Set<string>();

  if (Array.isArray(frontMatter.tags)) {
    frontMatter.tags.forEach((tag) => {
      if (typeof tag === 'string') {
        tags.add(tag);
      }
    });
  }

  if (Array.isArray(frontMatter.tags_)) {
    frontMatter.tags_.forEach((tag: unknown) => {
      if (typeof tag === 'string') {
        tags.add(tag);
      }
    });
  }

  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags);
}

function extractLinks(content: string): string[] {
  const links = new Set<string>();

  let wikiMatch;
  while ((wikiMatch = WIKI_LINK_REGEX.exec(content)) !== null) {
    links.add(wikiMatch[1]);
  }

  let mdMatch;
  const internalLinkRegex = /^\.\.?\/|^\.?\.\//;
  while ((mdMatch = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
    const url = mdMatch[2];
    if (internalLinkRegex.test(url) || !url.startsWith('http')) {
      links.add(mdMatch[1]);
    }
  }

  return Array.from(links);
}

export function extractTitle(frontMatter: Record<string, unknown>, filePath: string): string {
  if (typeof frontMatter.title === 'string') {
    return frontMatter.title;
  }

  const fileName = filePath.split('/').pop() || filePath;
  return fileName.replace(/\.md$/, '');
}

export function extractType(frontMatter: Record<string, unknown>, filePath: string): string {
  if (typeof frontMatter.type === 'string') {
    return frontMatter.type;
  }

  const parts = filePath.split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }

  return 'Page';
}

export function generateId(filePath: string): string {
  const normalized = filePath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const hash = simpleHash(filePath);
  return `${normalized}-${hash}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function createExcerpt(content: string, maxLength: number = 200): string {
  const cleaned = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength).trim() + '...';
}
