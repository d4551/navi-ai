import { StudioRepository } from "@/modules/db/repositories/studios";
import type { GameStudio } from "@/shared/types/interview";
export type { GameStudio } from "@/shared/types/interview";
import { logger } from "@/shared/utils/logger";

export type StudioType =
  | "AAA"
  | "Indie"
  | "Mobile"
  | "VR/AR"
  | "Platform"
  | "Esports"
  | "Unknown";

export type GameGenre =
  | "Action"
  | "RPG"
  | "Strategy"
  | "Puzzle"
  | "Simulation"
  | "Sports"
  | "Racing"
  | "Shooter"
  | "Platformer"
  | "Horror"
  | "MMORPG"
  | "MOBA"
  | "Battle Royale"
  | "Roguelike"
  | "Sandbox";

export type Platform =
  | "PC"
  | "Console"
  | "Mobile"
  | "VR"
  | "AR"
  | "Web"
  | "Switch"
  | "PlayStation"
  | "Xbox"
  | "Steam";

export interface StudioFilters {
  type?: StudioType;
  location?: string;
  size?: string;
  technologies?: string[];
  remoteWork?: boolean;
  hasGames?: boolean;
  genres?: GameGenre[];
  platforms?: Platform[];
  page?: number;
  pageSize?: number;
  query?: string;
}

export interface StudioSearchResult {
  studios: GameStudio[];
  total: number;
  filtered: number;
  facets: {
    types: Record<string, number>;
    locations: Record<string, number>;
    sizes: Record<string, number>;
    genres: Record<string, number>;
  };
}

class CanonicalStudioService {
  private repository = StudioRepository;
  private cache = new Map<string, { data: StudioSearchResult; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000;

  async initialize(): Promise<void> {
    await this.repository.ensureInitialized();
  }

  private calculateFacets(studios: GameStudio[]) {
    const types: Record<string, number> = {};
    const locations: Record<string, number> = {};
    const sizes: Record<string, number> = {};
    const genres: Record<string, number> = {};
    for (const s of studios as any[]) {
      const t = (s.type || (s as any).category || "").toString();
      if (t) types[t] = (types[t] || 0) + 1;
      const loc = ((s as any).headquarters || (s as any).location || "").toString();
      if (loc) locations[loc] = (locations[loc] || 0) + 1;
      const sz = ((s as any).size || "").toString();
      if (sz) sizes[sz] = (sizes[sz] || 0) + 1;
      for (const g of (((s as any).gameGenres || []) as string[])) {
        if (g) genres[g] = (genres[g] || 0) + 1;
      }
    }
    return { types, locations, sizes, genres };
  }

  async searchStudios(filters: StudioFilters = {}): Promise<StudioSearchResult> {
    const cacheKey = JSON.stringify(filters);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;

    // Prefer Electron main DB via preload API if present
    try {
      const anyWindow: any = typeof window !== "undefined" ? (window as any) : {};
      const api = anyWindow.api || anyWindow.electronAPI || {};
      if (api?.studios?.search) {
        const query: any = {};
        if (filters.type) query.type = filters.type;
        if (filters.location) query.location = filters.location;
        if (filters.size) query.size = filters.size;
        if (filters.technologies?.length) query.technologies = filters.technologies;
        if (filters.page) query.page = filters.page;
        if (filters.pageSize) query.pageSize = filters.pageSize;
        if (filters.query) query.name = filters.query;
        const res = await api.studios.search(query);
        const studios: GameStudio[] = Array.isArray(res?.studios) ? res.studios : [];
        const data: StudioSearchResult = {
          studios,
          total: Number(res?.total ?? studios.length) || studios.length,
          filtered: studios.length,
          facets: this.calculateFacets(studios),
        };
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    } catch (_e) {
      logger.warn("[StudioService] IPC search failed; falling back", e);
    }

    // Fallback: filter in renderer
    const all = (await this.repository.getAll()) as unknown as GameStudio[];
    let studios = [...all];
    if (filters.type) {
      const t = String(filters.type).toLowerCase();
      studios = studios.filter((s: any) => String(s.type || s.category || "").toLowerCase() === t);
    }
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      studios = studios.filter((s: any) => String(s.headquarters || s.location || "").toLowerCase().includes(loc));
    }
    if (filters.size) {
      const sz = String(filters.size).toLowerCase();
      studios = studios.filter((s: any) => String(s.size || "").toLowerCase() === sz);
    }
    if (filters.technologies?.length) {
      studios = studios.filter((s: any) =>
        filters.technologies!.some((t) =>
          ((s.technologies || []) as string[]).some((st) =>
            String(st).toLowerCase().includes(String(t).toLowerCase()),
          ),
        ),
      );
    }
    const data: StudioSearchResult = {
      studios,
      total: all.length,
      filtered: studios.length,
      facets: this.calculateFacets(studios),
    };
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getFavoriteStudios(): Promise<GameStudio[]> {
    const ids = await this.repository.getFavorites();
    const out: GameStudio[] = [];
    for (const id of ids) {
      const s = (await this.repository.getById(id)) as any;
      if (s) out.push(s);
    }
    return out;
  }

  async toggleFavorite(studioId: string): Promise<boolean> {
    const isFav = await this.repository.isFavorite(studioId);
    if (isFav) {
      await this.repository.removeFavorite(studioId);
      return false;
    }
    await this.repository.addFavorite(studioId);
    return true;
  }
}

export const studioService = new CanonicalStudioService();
export default studioService;

