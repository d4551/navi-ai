import { logger } from '@/shared/utils/logger';
import type { GameStudio } from '@/shared/types/interview';
// RAWG requires an API key supplied via environment configuration
import { RAWG_API_KEY } from '@/shared/config';

// Simple in-memory cache; can later persist via IPC to Electron main (sqlite / json file)
interface CacheEntry { data: Partial<GameStudio['externalStats']>; ts: number }
const memoryCache: Record<string, CacheEntry> = {};

// Rate-limit tracker & backoff
let lastCall = 0;
const MIN_INTERVAL_MS = 400; // basic throttle between outbound requests
const MAX_RETRIES = 2;
const BASE_BACKOFF = 500; // ms

async function throttle() {
  const now = Date.now();
  const wait = lastCall + MIN_INTERVAL_MS - now;
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
}

async function fetchJson<T = any>(url: string): Promise<T | null> {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      if (attempt > 0) {
        const backoff = BASE_BACKOFF * Math.pow(2, attempt - 1) + Math.random()*200;
        await new Promise(r => setTimeout(r, backoff));
      }
      await throttle();
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const ctype = res.headers.get('content-type') || '';
      if (!ctype.includes('application/json')) {
        throw new Error('invalid content-type');
      }
      return (await res.json()) as T;
    } catch (e) {
      attempt++;
      if (attempt > MAX_RETRIES) {
        logger.warn('StudioStatsService fetch failed', url, (e as Error).message);
        return null;
      }
    }
  }
  return null;
}


export class StudioStatsService {
  static getCached(studioId: string) {
    const entry = memoryCache[studioId];
    if (!entry) return null;
    // 24h TTL
    if (Date.now() - entry.ts > 24*60*60*1000) {
      delete memoryCache[studioId];
      return null;
    }
    return entry.data;
  }

  static async fetchForStudio(studio: GameStudio): Promise<Partial<GameStudio['externalStats']>> {
    // 1. Check renderer memory cache
    const cache = this.getCached(studio.id);
    if (cache) return cache;
    // 2. Ask main process persistent cache
    try {
      // @ts-ignore
      if (window.electronAPI?.studios) {
        // @ts-ignore
        const persisted = await window.electronAPI.studios.getStats(studio.id);
        if (persisted?.success && persisted.data) {
          memoryCache[studio.id] = { data: persisted.data, ts: Date.now() };
          return persisted.data;
        }
      }
    } catch (e) { logger.warn('StudioStatsService persisted get failed', (e as Error).message); }

  const stats: Partial<GameStudio['externalStats']> = { sources: [] };

    // CheapShark (search games by title fragments from known games list)
    try {
      if (studio.games?.length) {
        const sample = studio.games[0];
        const q = encodeURIComponent(sample.split(/:|-/)[0].split(' ').slice(0,2).join(' '));
        const cheapUrl = `https://www.cheapshark.com/api/1.0/games?title=${q}&limit=5`;
        const cheapData = await fetchJson(cheapUrl);
        if (Array.isArray(cheapData) && cheapData.length) {
          // pick first with cheapestPrice
            const withDeal = cheapData.filter(g => g.cheapest && g.external);
            if (withDeal.length) {
              const cheapest = withDeal.sort((a,b)=>parseFloat(a.cheapest)-parseFloat(b.cheapest))[0];
              stats.cheapestGamePriceUsd = parseFloat(cheapest.cheapest);
              stats.cheapestGameTitle = cheapest.external || cheapest.internalName;
              stats.dealsCount = withDeal.length;
              stats.sources!.push('cheapshark');
            }
        }
      }
    } catch (e) { logger.warn('CheapShark stats failed', studio.id, (e as Error).message); }

  // RAWG publishers lookup if API key provided
    try {
      if (RAWG_API_KEY) {
        const rawgUrl = `https://api.rawg.io/api/publishers?key=${RAWG_API_KEY}&page_size=5&search=${encodeURIComponent(studio.name)}`;
        const rawg = await fetchJson(rawgUrl);
        if (rawg?.results?.length) {
          const pub = rawg.results[0];
          stats.rawgPublisherId = pub.id;
          stats.topPublishers = rawg.results.slice(0,3).map((p:any)=>p.name);
          stats.sources!.push('rawg');
        }
      }
    } catch (e) { logger.warn('RAWG stats failed', studio.id, (e as Error).message); }

    // Steam sample apps: look up real AppIDs for known game titles
    try {
      const details: { appId: number; name: string }[] = [];
      const sampleTitles = studio.games?.slice(0, 3) || [];
      for (const title of sampleTitles) {
        const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(title)}&l=english&cc=US`;
        const search = await fetchJson<{ items?: { id: number; name: string }[] }>(searchUrl);
        const first = search?.items?.[0];
        if (!first) continue;
        const detailUrl = `https://store.steampowered.com/api/appdetails?appids=${first.id}`;
        const data = await fetchJson<Record<string, any>>(detailUrl);
        if (data && data[first.id]?.success && data[first.id].data) {
          details.push({ appId: first.id, name: data[first.id].data.name });
        }
      }
      if (details.length) {
        (stats as any).steamAppSample = details;
        (stats.sources as string[]).push('steam');
      }
    } catch (e) {
      logger.warn('Steam lookup failed', studio.id, (e as Error).message);
    }

    stats.lastUpdated = new Date().toISOString();
    memoryCache[studio.id] = { data: stats, ts: Date.now() };
    // Persist to main process cache
    try {
      // @ts-ignore
      window.electronAPI?.studios?.setStats(studio.id, stats);
    } catch (e) { logger.warn('StudioStatsService persisted set failed', (e as Error).message); }
    return stats;
  }
}

export async function ensureStudioStats(studio: GameStudio) {
  try {
    if (!studio.externalStats) {
      studio.externalStats = await StudioStatsService.fetchForStudio(studio);
    } else if (Date.now() - new Date(studio.externalStats.lastUpdated || 0).getTime() > 24*60*60*1000) {
      // stale -> refresh in background (do not await)
      StudioStatsService.fetchForStudio(studio).then(fresh => { studio.externalStats = fresh; });
    }
  } catch (e) {
    logger.warn('ensureStudioStats failed', studio.id, (e as Error).message);
  }
  return studio.externalStats;
}