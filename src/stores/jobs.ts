import { defineStore } from 'pinia'
import { logger } from '@/shared/utils/logger'
import { statisticsService } from '@/shared/services/StatisticsService'

export interface JobApplication {
  id: string
  company: string
  title?: string
  appliedAt: string
  status: string
  [key: string]: any
}

export interface SavedJob {
  id: string
  savedAt: string
  [key: string]: any
}

export interface JobSearchData {
  preferences: Record<string, any>
  savedJobs: SavedJob[]
  applications: JobApplication[]
  lastSearchSources: string[]
}

export interface CoverLetterDraft {
  id: string
  company: string
  position: string
  role: string
  preferences: Record<string, any>
  studioProfile: Record<string, any>
  content: Record<string, any>
  meta: {
    createdAt: string
    updatedAt: string
  }
}

export interface JobsState {
  jobSearchData: JobSearchData
  coverLetterDrafts: CoverLetterDraft[]
  publicLogos: Record<string, any>
  normalizedStudios: Record<string, any>
}

export const useJobsStore = defineStore('jobs', {
  state: (): JobsState => ({
    // Job search data
    jobSearchData: {
      preferences: {},
      savedJobs: [],
      applications: [],
      lastSearchSources: [],
    },

    // Cover letter drafts
    coverLetterDrafts: [],

    // Public logo cache
    publicLogos: {},

    // Normalized studios cache
    normalizedStudios: {},
  }),

  getters: {
    getSavedJobs: (state): SavedJob[] => state.jobSearchData.savedJobs,
    getApplications: (state): JobApplication[] =>
      state.jobSearchData.applications,
    getCoverLetterDrafts: (state): CoverLetterDraft[] =>
      state.coverLetterDrafts,
  },

  actions: {
    // Save a job
    saveJob(job: any): boolean {
      try {
        if (!job || !job.id) {
          throw new Error('Invalid job')
        }
        const exists = this.jobSearchData.savedJobs.find(j => j.id === job.id)
        if (exists) {
          return false
        }

        const saved = { ...job, savedAt: new Date().toISOString() }
        this.jobSearchData.savedJobs.push(saved)

        try {
          statisticsService.recordSavedJob()
        } catch (e: any) {
          logger.warn('Statistics tracking failed for saved job:', e)
        }

        return true
      } catch (error: any) {
        logger.error('Failed to save job:', error)
        return false
      }
    },

    // Cover letter drafts management
    saveCoverLetterDraft(draft: Partial<CoverLetterDraft>): string | null {
      try {
        const now = new Date().toISOString()
        const id = draft.id || Date.now().toString()
        const existingIndex = this.coverLetterDrafts.findIndex(d => d.id === id)
        const normalized: CoverLetterDraft = {
          id,
          company: draft.company || '',
          position: draft.position || '',
          role: draft.role || '',
          preferences: draft.preferences || {},
          studioProfile: draft.studioProfile || {},
          content: draft.content || {},
          meta: {
            createdAt: draft.meta?.createdAt || now,
            updatedAt: now,
          },
        }
        if (existingIndex >= 0) {
          this.coverLetterDrafts.splice(existingIndex, 1, normalized)
        } else {
          this.coverLetterDrafts.push(normalized)
        }
        return normalized.id
      } catch (error: any) {
        logger.error('Failed to save cover letter draft:', error)
        return null
      }
    },

    deleteCoverLetterDraft(id: string): boolean {
      try {
        if (!Array.isArray(this.coverLetterDrafts)) {
          this.coverLetterDrafts = []
          return false
        }
        this.coverLetterDrafts = this.coverLetterDrafts.filter(d => d.id !== id)
        return true
      } catch (error: any) {
        logger.error('Failed to delete cover letter draft:', error)
        return false
      }
    },

    findCoverLetterDraftsByCompany(company: string): CoverLetterDraft[] {
      try {
        if (!Array.isArray(this.coverLetterDrafts)) {
          return []
        }
        return this.coverLetterDrafts.filter(
          d => (d.company || '').toLowerCase() === (company || '').toLowerCase()
        )
      } catch (error: any) {
        logger.error('Failed to query cover letter drafts:', error)
        return []
      }
    },

    upsertNormalizedStudios(studios: any[]) {
      if (!Array.isArray(studios) || studios.length === 0) return
      const map = this.normalizedStudios || {}
      for (const s of studios) {
        if (!s?.id) continue
        map[s.id] = { ...(map[s.id] || {}), ...s }
      }
      this.normalizedStudios = { ...map }
    },
  },
})
