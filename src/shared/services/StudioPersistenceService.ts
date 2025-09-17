import { unifiedStorage } from '@/utils/storage'
import { logger } from '@/shared/utils/logger'
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios'

export interface PersistedStudioMeta {
  version: number
  normalizedAt: string
}

// Canonical persistence via unifiedStorage (IndexedDB-backed)
export async function seedStudiosIfEmpty() {
  try {
    const existing = await unifiedStorage.getAllStudios()
    if ((existing?.length || 0) > 10) return
    const now = new Date().toISOString()
    const records = Object.values(GAMING_STUDIOS).map((s: any) => ({
      ...s,
      meta: { version: 1, normalizedAt: now } as PersistedStudioMeta,
    }))
    for (const r of records) {
      await unifiedStorage.upsertStudio(r)
    }
    logger.info('StudioPersistenceService seeded', records.length)
  } catch (e) {
    logger.warn('Failed to seed studios', e)
  }
}

export async function getAllStudios() {
  return await unifiedStorage.getAllStudios()
}

export async function upsertStudio(studio: any) {
  studio.meta = studio.meta || {
    version: 1,
    normalizedAt: new Date().toISOString(),
  }
  return await unifiedStorage.upsertStudio(studio)
}

export async function getStudio(id: string) {
  return await unifiedStorage.getStudio(id)
}

export async function clearStudios() {
  return await unifiedStorage.clearStudios()
}
