import type { Index, Space, CapacitiesObject, SearchResult, ApiSpaceInfo } from '../types.js';
import { API_BASE_URL, RATE_LIMITS } from '../config.js';
import { createExcerpt } from '../parser/markdown.js';

interface RateLimiter {
  timestamps: number[];
  max: number;
  window: number;
}

const rateLimiters: Record<string, RateLimiter> = {};

function checkRateLimit(endpoint: string): void {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS];
  if (!config) return;

  if (!rateLimiters[endpoint]) {
    rateLimiters[endpoint] = { timestamps: [], ...config };
  }

  const limiter = rateLimiters[endpoint];
  const now = Date.now();

  limiter.timestamps = limiter.timestamps.filter((t) => now - t < limiter.window);

  if (limiter.timestamps.length >= limiter.max) {
    const oldest = limiter.timestamps[0];
    const waitTime = limiter.window - (now - oldest);
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  limiter.timestamps.push(now);
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export class ApiMode {
  private apiKey: string;
  private cache: {
    spaces?: Space[];
    spaceInfo?: Map<string, ApiSpaceInfo>;
    lastFetch?: number;
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cache = {
      spaceInfo: new Map(),
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const endpointKey = endpoint.split('?')[0].replace('/', '');
    checkRateLimit(endpointKey);

    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const text = await response.text();
    if (!text.trim()) {
      return {};
    }

    return JSON.parse(text);
  }

  async listSpaces(): Promise<Space[]> {
    if (this.cache.spaces && this.cache.lastFetch && Date.now() - this.cache.lastFetch < 60000) {
      return this.cache.spaces;
    }

    const data = (await this.makeRequest('/spaces')) as { spaces?: Array<{ id: string; name: string }> };
    const spaces: Space[] = (data.spaces || []).map((s) => ({
      id: s.id,
      name: s.name,
      types: [],
      objectCount: 0,
    }));

    this.cache.spaces = spaces;
    this.cache.lastFetch = Date.now();

    return spaces;
  }

  async getSpaceInfo(spaceId: string): Promise<ApiSpaceInfo> {
    if (this.cache.spaceInfo?.has(spaceId)) {
      return this.cache.spaceInfo.get(spaceId)!;
    }

    const data = (await this.makeRequest(`/space-info?spaceid=${spaceId}`)) as ApiSpaceInfo;
    this.cache.spaceInfo?.set(spaceId, data);

    return data;
  }

  async search(query: string, spaceIds: string[], mode: 'title' | 'fullText' = 'title'): Promise<SearchResult[]> {
    const data = (await this.makeRequest('/search', {
      method: 'POST',
      body: JSON.stringify({
        searchTerm: query,
        spaceIds,
        mode,
      }),
    })) as { results?: Array<{ id: string; title: string; structureId: string; spaceId: string; snippet?: string }> };

    return (data.results || []).map((r) => ({
      id: r.id,
      type: r.structureId,
      title: r.title,
      spaceId: r.spaceId,
      tags: [],
      excerpt: r.snippet || '',
      relevanceScore: 1,
      metadata: {},
    }));
  }

  async saveWeblink(params: {
    spaceId: string;
    url: string;
    titleOverwrite?: string;
    descriptionOverwrite?: string;
    tags?: string[];
    mdText?: string;
  }): Promise<{ success: boolean; message: string }> {
    await this.makeRequest('/save-weblink', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return { success: true, message: 'Weblink saved successfully' };
  }

  async saveToDailyNote(params: {
    spaceId: string;
    mdText: string;
    origin?: 'commandPalette';
    noTimestamp?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    await this.makeRequest('/save-to-daily-note', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    return { success: true, message: 'Content saved to daily note' };
  }

  getIndex(): Index | null {
    return null;
  }

  isReadOnly(): boolean {
    return false;
  }
}
