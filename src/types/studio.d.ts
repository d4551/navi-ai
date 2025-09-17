declare module '@/data/gaming-studios' {
  export interface RawStudio {
    id?: string
    name: string
    description?: string
    location: string
    headquarters: string
    logoPath?: string
    logo?: string
    employeeCount?: string
    size?: string
    founded: string
    industry?: string
    website?: string
    stockTicker?: string | null
    parentCompany?: string
    games: string[]
    specialties?: string[]
    culture?: string[]
    careerOpportunities?: string[]
    benefits?: string[]
    techStack?: string[]
    technologies?: string[]
    averageSalary?: string
    glassdoorRating?: number
    workStyle?: string
    environment?: string
  }

  export const GAMING_STUDIOS: RawStudio[]
}
