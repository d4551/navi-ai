/**
 * CANONICAL Job Types and Interfaces
 * Type definitions for gaming industry job system
 */

export interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  hybrid?: boolean
  salary?: SalaryRange | string
  description?: string
  requirements?: string[]
  technologies?: string[]
  experienceLevel?: ExperienceLevel
  type: JobType
  postedDate: string | Date
  // Back-compat properties used by older views
  posted?: string | Date
  url?: string
  featured?: boolean
  matchScore?: number
  applicants?: number
  source?: string
  tags?: string[]
  companyLogo?: string
  applicationUrl?: string
  
  // Gaming-specific fields
  studioType?: StudioType
  gameGenres?: GameGenre[]
  platforms?: Platform[]
  projectType?: ProjectType
  teamSize?: TeamSize
  cultureInfo?: CultureInfo
  gamingRelevance?: number  // 0-1 score indicating gaming industry relevance
}

export interface SalaryRange {
  min: number
  max: number
  currency?: string
  frequency?: 'yearly' | 'monthly' | 'hourly'
  // Back-compat alias used in some views/modules
  type?: 'yearly' | 'monthly' | 'hourly'
}

export interface CultureInfo {
  workStyle: string
  values: string[]
  benefits: string[]
  diversity: boolean
  remoteFirst: boolean
}

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'principal' | 'director'

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'

export type StudioType = 'AAA' | 'Indie' | 'Mobile' | 'VR/AR' | 'Platform' | 'Esports' | 'Unknown'

export type GameGenre = 
  | 'Action' | 'RPG' | 'Strategy' | 'Puzzle' | 'Simulation' 
  | 'Sports' | 'Racing' | 'Shooter' | 'Platformer' | 'Horror'
  | 'MMORPG' | 'MOBA' | 'Battle Royale' | 'Roguelike' | 'Sandbox'

export type Platform = 
  | 'PC' | 'Console' | 'Mobile' | 'VR' | 'AR' | 'Web'
  | 'Switch' | 'PlayStation' | 'Xbox' | 'Steam'

export type ProjectType = 'New IP' | 'Sequel' | 'Remaster' | 'DLC' | 'Live Service' | 'Prototype'

export type TeamSize = 'Solo' | 'Small (2-10)' | 'Medium (11-50)' | 'Large (51-200)' | 'AAA (200+)'

export interface JobFilters {
  title?: string
  query?: string // Alias for title to support legacy APIs
  company?: string
  location?: string
  remote?: boolean
  hybrid?: boolean
  salaryMin?: number
  salaryMax?: number
  experienceLevel?: ExperienceLevel
  jobType?: JobType
  technologies?: string[]
  studioTypes?: StudioType[]
  gameGenres?: GameGenre[]
  platforms?: Platform[]
  postedWithin?: number // days
  featured?: boolean
  hasMatchScore?: boolean
  minMatchScore?: number
  limit?: number // Maximum number of results
}

export interface JobSearchResult {
  jobs: Job[]
  total: number
  page: number
  limit: number
  filters: JobFilters
  aggregations: {
    companies: Array<{ name: string; count: number }>
    technologies: Array<{ name: string; count: number }>
    locations: Array<{ name: string; count: number }>
    experienceLevels: Array<{ level: ExperienceLevel; count: number }>
    studioTypes: Array<{ type: StudioType; count: number }>
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  skills: string[]
  experience: number // years
  interests: string[]
  location?: string
  salaryExpectation?: SalaryRange
  workStyle?: 'remote' | 'hybrid' | 'onsite'
  rolePreferences: string[]
  companySize?: string
  technologies: string[]
  portfolio?: PortfolioItem[]
  resume?: ResumeData
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  technologies: string[]
  url?: string
  imageUrl?: string
  type: 'game' | 'project' | 'art' | 'demo'
  featured: boolean
}

export interface ResumeData {
  summary: string
  workExperience: WorkExperience[]
  education: Education[]
  certifications: Certification[]
}

export interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  achievements: string[]
  technologies: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  graduationYear: number
  gpa?: number
}

export interface Certification {
  name: string
  issuer: string
  date: string
  credentialId?: string
  url?: string
}

export interface MatchScore {
  overall: number
  breakdown: {
    skills: number
    experience: number
    location: number
    salary: number
    culture: number
    technology: number
  }
  strengths: string[]
  improvements: string[]
  missingSkills: string[]
}

export interface SkillMatch {
  skill: string
  userLevel: number
  requiredLevel: number
  importance: 'critical' | 'preferred' | 'nice-to-have'
  match: boolean
}

export interface JobRecommendation {
  job: Job
  matchScore: MatchScore
  reasons: string[]
  skillGaps: SkillMatch[]
  learningPath: LearningRecommendation[]
}

export interface LearningRecommendation {
  skill: string
  priority: 'high' | 'medium' | 'low'
  resources: LearningResource[]
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface LearningResource {
  type: 'course' | 'tutorial' | 'documentation' | 'book' | 'video'
  title: string
  provider: string
  url: string
  duration?: string
  cost?: number
  rating?: number
}

export interface GameStudio {
  id: string
  name: string
  logo?: string
  website?: string
  location: string
  size: TeamSize
  type: StudioType
  founded?: number
  description?: string
  games: string[]
  technologies: string[]
  culture: CultureInfo
  openPositions: number
  averageSalary?: SalaryRange
  rating?: number
  benefits: string[]
}

export interface JobAlert {
  id: string
  name: string
  filters: JobFilters
  frequency: 'immediate' | 'daily' | 'weekly'
  enabled: boolean
  created: string
  lastRun?: string
  totalNotifications: number
}

export interface JobApplication {
  id: string
  jobId: string
  status: 'applied' | 'reviewing' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  appliedDate: string
  lastUpdate: string
  notes: string
  timeline: ApplicationEvent[]
}

export interface ApplicationEvent {
  id: string
  type: 'applied' | 'viewed' | 'responded' | 'interviewed' | 'feedback' | 'decision'
  date: string
  description: string
  documents?: string[]
}

export interface Interview {
  id: string
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'cultural' | 'final'
  scheduledDate: string
  duration: number
  interviewer?: string
  feedback?: string
  outcome?: 'passed' | 'failed' | 'pending'
  questions?: InterviewQuestion[]
}

export interface InterviewQuestion {
  question: string
  answer?: string
  category: 'technical' | 'behavioral' | 'cultural' | 'portfolio'
}

export interface CompensationPackage {
  baseSalary: SalaryRange
  bonus?: SalaryRange
  equity?: {
    percentage?: number
    shares?: number
    vestingPeriod: number
  }
  benefits: Benefit[]
}

export interface Benefit {
  type: 'health' | 'dental' | 'vision' | 'retirement' | 'vacation' | 'remote' | 'learning' | 'other'
  name: string
  description?: string
  value?: number
}

export interface JobMarketData {
  averageSalaries: Record<string, SalaryRange>
  demandTrends: Record<string, number>
  skillDemand: Record<string, number>
  locationTrends: Record<string, number>
  growthProjections: Record<string, number>
}

// API Response Types
export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface JobAPIResponse extends APIResponse<Job[]> {
  aggregations?: JobSearchResult['aggregations']
}

// Search and Filter Types
export interface SearchOptions {
  query?: string
  filters?: JobFilters
  sort?: {
    field: keyof Job
    direction: 'asc' | 'desc'
  }
  page?: number
  limit?: number
}

export interface FilterOption {
  value: string
  label: string
  count?: number
  icon?: string
}

export interface FilterGroup {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'boolean' | 'text'
  options?: FilterOption[]
  min?: number
  max?: number
}

// Gaming-specific constants
export const GAMING_ROLES = {
  DESIGN: ['Game Designer', 'Level Designer', 'Narrative Designer', 'UX Designer', 'Systems Designer'],
  ENGINEERING: ['Gameplay Programmer', 'Engine Programmer', 'Graphics Programmer', 'Tools Programmer', 'Backend Developer'],
  ART: ['Concept Artist', '3D Artist', '2D Artist', 'Technical Artist', 'Animator', 'VFX Artist'],
  AUDIO: ['Sound Designer', 'Audio Programmer', 'Composer', 'Voice Director'],
  PRODUCTION: ['Producer', 'Project Manager', 'Scrum Master', 'Development Director'],
  QA: ['QA Tester', 'QA Lead', 'Automation Engineer', 'Compliance Tester'],
  BUSINESS: ['Business Development', 'Marketing Manager', 'Community Manager', 'Data Analyst']
} as const

export const GAMING_TECHNOLOGIES = {
  ENGINES: ['Unity', 'Unreal Engine', 'Godot', 'Custom Engine', 'CryEngine'],
  LANGUAGES: ['C++', 'C#', 'JavaScript', 'Python', 'Lua', 'Go', 'Rust'],
  GRAPHICS: ['DirectX', 'OpenGL', 'Vulkan', 'Metal', 'Shader Languages'],
  TOOLS: ['Maya', 'Blender', '3ds Max', 'Photoshop', 'Substance', 'Perforce', 'Git'],
  PLATFORMS: ['Steam', 'Epic Games Store', 'Console SDKs', 'Mobile SDKs'],
  AUDIO: ['Wwise', 'FMOD', 'Unity Audio', 'Pro Tools']
} as const

export const SALARY_RANGES = {
  ENTRY: { min: 50000, max: 75000 },
  JUNIOR: { min: 60000, max: 85000 },
  MID: { min: 75000, max: 110000 },
  SENIOR: { min: 100000, max: 150000 },
  PRINCIPAL: { min: 140000, max: 200000 },
  DIRECTOR: { min: 180000, max: 300000 }
} as const

// Utility Types
export type JobField = keyof Job
export type RequiredJobFields = 'id' | 'title' | 'company' | 'location'
export type OptionalJobFields = Exclude<JobField, RequiredJobFields>

export type PartialJob = Partial<Job> & Pick<Job, RequiredJobFields>
export type JobUpdate = Partial<Omit<Job, 'id'>>
export type JobCreate = Omit<Job, 'id'> & Partial<Pick<Job, 'id'>>

// Event Types for real-time updates
export interface JobEvent {
  type: 'created' | 'updated' | 'deleted' | 'applied'
  jobId: string
  job?: Job
  timestamp: string
  userId?: string
}

export interface AlertEvent {
  type: 'triggered' | 'created' | 'updated' | 'deleted'
  alertId: string
  jobs?: Job[]
  timestamp: string
}
