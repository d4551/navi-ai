import { logger } from "@/shared/utils/logger";
import {
  normalizeStudio,
  type NormalizedStudio,
} from "@/shared/utils/studioNormalization";
import type { GameStudio } from "@/shared/types/interview";
import { upsertStudio } from "@/shared/services/StudioPersistenceService";
import { useAppStore } from "@/stores/app";

export interface RawStudioInput extends Partial<GameStudio> {
  id?: string;
  name: string;
  headquarters?: string;
  size?: string;
  technologies?: string[];
  games?: string[];
  commonRoles?: string[];
  description?: string;
  category?: GameStudio["category"];
  founded?: number;
  culture?: GameStudio["culture"];
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ id?: string; name?: string; error: string }>;
  normalized: number;
}

function sanitizeId(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function validate(raw: RawStudioInput): string[] {
  const errs: string[] = [];
  if (!raw.name || raw.name.trim().length < 2) errs.push("name required");
  if (
    raw.founded &&
    (raw.founded < 1800 || raw.founded > new Date().getFullYear() + 1)
  )
    errs.push("founded out of range");
  return errs;
}

export function validateRawStudios(items: RawStudioInput[]): {
  validCount: number;
  errorCount: number;
  warningCount: number;
  results: Array<{
    input: RawStudioInput;
    errors: string[];
    warnings: string[];
  }>;
} {
  const results: Array<{
    input: RawStudioInput;
    errors: string[];
    warnings: string[];
  }> = [];
  let validCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  for (const input of items || []) {
    const errors = validate(input);
    const warnings: string[] = [];
    if (!input.description) warnings.push("missing description");
    if (!input.games || input.games.length === 0)
      warnings.push("no games listed");
    if (!input.technologies || input.technologies.length === 0)
      warnings.push("no technologies listed");
    if (!input.size) warnings.push("size not specified");
    if (!input.headquarters) warnings.push("headquarters not specified");
    results.push({ input, errors, warnings });
    if (errors.length === 0) validCount++;
    if (errors.length > 0) errorCount += errors.length;
    warningCount += warnings.length;
  }
  return { validCount, errorCount, warningCount, results };
}

export async function importStudios(
  rawStudios: RawStudioInput[],
  { overwrite = true } = {},
): Promise<ImportResult> {
  const store = useAppStore();
  const result: ImportResult = {
    total: rawStudios.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    normalized: 0,
  };
  if (!Array.isArray(rawStudios) || rawStudios.length === 0) return result;

  const upserts: Record<string, NormalizedStudio> = {};

  for (const raw of rawStudios) {
    try {
      const errors = validate(raw);
      if (errors.length) {
        result.skipped++;
        result.errors.push({
          id: raw.id,
          name: raw.name,
          error: errors.join(", "),
        });
        continue;
      }
      const id = raw.id || sanitizeId(raw.name);
      // Build minimal GameStudio
      const studio: GameStudio = {
        id,
        name: raw.name.trim(),
        logo: raw.logo || "",
        description: raw.description || "",
        culture: raw.culture || { values: [], workStyle: "", environment: "" },
        games: raw.games || [],
        technologies: raw.technologies || [],
        commonRoles: raw.commonRoles || [],
        interviewStyle: raw.interviewStyle || "",
        headquarters: raw.headquarters || "",
        size: raw.size || "",
        founded: raw.founded || new Date().getFullYear(),
        publiclyTraded: Boolean(raw.publiclyTraded),
        category: raw.category,
        region: raw.region,
        remoteWork: raw.remoteWork,
        companySize: raw.companySize,
      };

      const normalized = normalizeStudio(studio);
      upserts[id] = normalized;
    } catch (e: any) {
      result.errors.push({
        id: raw.id,
        name: raw.name,
        error: e.message || "unknown error",
      });
    }
  }

  const existingMap = store.normalizedStudios || {};
  const toPersist: NormalizedStudio[] = [];
  for (const [id, norm] of Object.entries(upserts)) {
    const exists = !!existingMap[id];
    if (!exists) result.created++;
    else result.updated++;
    if (!exists || overwrite) {
      toPersist.push(norm);
    } else {
      result.skipped++;
    }
  }

  // Persist sequentially (could batch later)
  for (const n of toPersist) {
    try {
      await upsertStudio(n);
    } catch (e: any) {
      logger.warn("Failed to persist studio", String(n.id), e?.message || e);
    }
  }

  // Update store
  try {
    store.upsertNormalizedStudios(Object.values(upserts));
  } catch (e) {
    logger.warn("Failed to update store normalized studios", e);
  }
  result.normalized = Object.keys(upserts).length;
  logger.info("Studio import completed", result);
  return result;
}

export async function importStudiosFromJSON(
  jsonText: string,
): Promise<ImportResult> {
  let data: any;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ error: "Invalid JSON" }],
      normalized: 0,
    };
  }
  if (!Array.isArray(data))
    return {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ error: "Root JSON must be an array" }],
      normalized: 0,
    };
  return importStudios(data);
}

export default { importStudios, importStudiosFromJSON };
