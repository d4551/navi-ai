/**
 * Studio Utilities
 * Helper functions for working with gaming studios data
 */

import { GAMING_STUDIOS } from '@/data/gaming-studios'

export interface NormalizedStudio {
  id: string
  name: string
  location: string
  headquarters: string
  logo?: string
  employeeCount: string
  founded: string
  website?: string
  description?: string
  games: string[]
  technologies: string[]
  culture: {
    values: string[]
    workStyle: string
    environment: string
  }
  benefits: string[]
  specialties: string[]
  careerOpportunities: string[]
  size: string
  publiclyTraded: boolean
  parentCompany?: string
  averageSalary?: string
  glassdoorRating?: number
  interviewStyle?: string
  commonRoles?: string[]
}

/**
 * Normalize a studio entry from the raw data
 */
export function normalizeStudio(studio: any): NormalizedStudio {
  return {
    id: studio.id || studio.name?.toLowerCase().replace(/\s+/g, '-'),
    name: studio.name || '',
    location: studio.location || studio.headquarters || '',
    headquarters: studio.headquarters || studio.location || '',
    logo: studio.logoPath || studio.logo,
    employeeCount: studio.employeeCount || studio.size || 'Unknown',
    founded: studio.founded || 'Unknown',
    website: studio.website,
    description: studio.description || undefined,
    games: studio.games || [],
    technologies: studio.techStack || studio.technologies || [],
    culture: {
      values: studio.culture || [],
      workStyle: studio.workStyle || 'Flexible',
      environment: studio.environment || 'Collaborative',
    },
    benefits: studio.benefits || [],
    specialties: studio.specialties || [],
    careerOpportunities: studio.careerOpportunities || [],
    size: studio.employeeCount || studio.size || 'Unknown',
    publiclyTraded: !!studio.stockTicker,
    parentCompany: studio.parentCompany,
    averageSalary: studio.averageSalary,
    glassdoorRating: studio.glassdoorRating,
    interviewStyle:
      studio.interviewStyle ||
      'Standard technical interviews with portfolio review',
    commonRoles: studio.careerOpportunities || [],
  }
}

/**
 * Build normalized studios from raw data
 */
export function buildNormalizedStudios(): Record<string, NormalizedStudio> {
  const normalized: Record<string, NormalizedStudio> = {}

  GAMING_STUDIOS.forEach(studio => {
    const normalizedStudio = normalizeStudio(studio)
    normalized[normalizedStudio.id] = normalizedStudio
  })

  return normalized
}

/**
 * Seed studios if empty
 */
export function seedStudiosIfEmpty(): Promise<void> {
  return Promise.resolve()
}

/**
 * Get matching studio by name
 */
export function getMatchingStudio(
  name: string,
  studios: Record<string, NormalizedStudio> = {}
): NormalizedStudio | null {
  if (!name) return null

  const normalizedName = name.toLowerCase().trim()

  // Direct match
  for (const studio of Object.values(studios)) {
    if (studio.name.toLowerCase() === normalizedName) {
      return studio
    }
  }

  // Partial match
  for (const studio of Object.values(studios)) {
    if (
      normalizedName.includes(studio.name.toLowerCase()) ||
      studio.name.toLowerCase().includes(normalizedName)
    ) {
      return studio
    }
  }

  return null
}
