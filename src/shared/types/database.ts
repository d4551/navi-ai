/**
 * DATABASE TYPES - GAMING CAREER PLATFORM
 * ========================================
 *
 * Comprehensive type definitions for the gaming industry job platform
 * Optimized for video game professionals and recruiters
 */

// === USER & PROFILE TYPES ===
export interface UserProfile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  location: string
  timezone: string

  // Gaming-specific profile
  gamingProfile: GamingProfile

  // Career preferences
  careerPreferences: CareerPreferences

  // Privacy & notifications
  privacySettings: PrivacySettings
  notificationSettings: NotificationSettings

  // Metadata
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isEmailVerified: boolean
  isPremium: boolean
  subscriptionTier: 'free' | 'pro' | 'enterprise'
}

export interface GamingProfile {
  // Professional gaming background
  yearsInGaming: number
  currentRole?: string
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
  specializations: GamingSpecialization[]

  // Technical skills
  programmingLanguages: string[]
  gameEngines: GameEngine[]
  platforms: GamingPlatform[]
  artTools?: string[]
  audioTools?: string[]

  // Portfolio & work samples
  portfolioUrl?: string
  demoReel?: string
  githubUsername?: string
  artStationProfile?: string
  linkedinProfile?: string

  // Gaming preferences
  favoriteGenres: GameGenre[]
  platformExperience: PlatformExperience[]

  // Professional achievements
  achievements: Achievement[]
  shippedTitles: ShippedTitle[]
  awards?: Award[]
}

export interface CareerPreferences {
  desiredRoles: string[]
  preferredCompanySize: CompanySize[]
  preferredLocations: string[]
  remotePreference: 'onsite' | 'hybrid' | 'remote' | 'flexible'
  salaryRange: {
    min: number
    max: number
    currency: string
  }
  availabilityDate?: Date
  willingToRelocate: boolean
  visaStatus?: VisaStatus
  contractPreference: ContractType[]
}

// === JOB & COMPANY TYPES ===
export interface JobPosting {
  id: string
  title: string
  description: string
  requirements: string[]
  niceToHave?: string[]
  responsibilities: string[]

  // Company info
  company: CompanyInfo

  // Job specifics
  experienceLevel: ExperienceLevel
  contractType: ContractType
  location: JobLocation
  remote: RemotePolicy

  // Compensation
  salary?: SalaryRange
  equity?: EquityRange
  benefits: string[]

  // Gaming-specific
  platforms: GamingPlatform[]
  gameGenres: GameGenre[]
  gameEngines: GameEngine[]
  projectType: ProjectType
  teamSize?: number

  // Application details
  applicationDeadline?: Date
  quickApply: boolean
  applicationUrl?: string
  contactEmail?: string

  // Metadata
  postedAt: Date
  updatedAt: Date
  expiresAt?: Date
  featured: boolean
  urgent: boolean
  views: number
  applications: number

  // AI matching
  skillMatchScore?: number
  aiRecommended?: boolean
  matchingReasons?: string[]
}

export interface CompanyInfo {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
  description?: string

  // Company details
  size: CompanySize
  founded?: number
  location: string
  offices: string[]

  // Gaming focus
  companyType: CompanyType
  focusAreas: GameGenre[]
  notableGames: string[]
  platforms: GamingPlatform[]

  // Culture & values
  culture?: CompanyCulture
  benefits: string[]
  diversityInfo?: string

  // Ratings & reviews
  glassdoorRating?: number
  employeeCount?: number
  growthStage: 'startup' | 'scale-up' | 'established' | 'enterprise'

  // Social links
  socialLinks: {
    twitter?: string
    linkedin?: string
    discord?: string
    youtube?: string
  }
}

// === GAMING-SPECIFIC ENUMS ===
export type GamingSpecialization =
  | 'game-programming'
  | 'gameplay-programming'
  | 'engine-programming'
  | 'graphics-programming'
  | 'ai-programming'
  | 'ui-programming'
  | 'network-programming'
  | 'tools-programming'
  | 'game-design'
  | 'level-design'
  | 'narrative-design'
  | 'systems-design'
  | 'ui-ux-design'
  | '3d-art'
  | '2d-art'
  | 'concept-art'
  | 'character-art'
  | 'environment-art'
  | 'vfx-art'
  | 'animation'
  | 'rigging'
  | 'technical-art'
  | 'audio-design'
  | 'sound-engineering'
  | 'music-composition'
  | 'voice-acting'
  | 'quality-assurance'
  | 'production'
  | 'project-management'
  | 'marketing'
  | 'community-management'
  | 'business-development'
  | 'data-analytics'

export type GameEngine =
  | 'Unity'
  | 'Unreal Engine'
  | 'Godot'
  | 'CryEngine'
  | 'Frostbite'
  | 'Source Engine'
  | 'RPG Maker'
  | 'GameMaker Studio'
  | 'Construct 3'
  | 'Defold'
  | 'Corona/Solar2D'
  | 'Cocos2d'
  | 'Custom Engine'

export type GamingPlatform =
  | 'PC'
  | 'PlayStation 5'
  | 'PlayStation 4'
  | 'Xbox Series X/S'
  | 'Xbox One'
  | 'Nintendo Switch'
  | 'iOS'
  | 'Android'
  | 'Steam Deck'
  | 'Meta Quest'
  | 'PICO'
  | 'Apple Vision Pro'
  | 'Web/Browser'
  | 'Arcade'

export type GameGenre =
  | 'Action'
  | 'Adventure'
  | 'RPG'
  | 'Strategy'
  | 'Simulation'
  | 'Sports'
  | 'Racing'
  | 'Fighting'
  | 'Puzzle'
  | 'Platformer'
  | 'Shooter'
  | 'Horror'
  | 'Survival'
  | 'Sandbox'
  | 'MMORPG'
  | 'Battle Royale'
  | 'MOBA'
  | 'Card Game'
  | 'Educational'
  | 'Casual'
  | 'Indie'
  | 'AA'
  | 'AAA'

export type ProjectType =
  | 'new-ip'
  | 'sequel'
  | 'remaster'
  | 'port'
  | 'expansion'
  | 'live-service'
  | 'prototype'
  | 'r-and-d'

export type CompanyType =
  | 'aaa-studio'
  | 'indie-studio'
  | 'publisher'
  | 'platform-holder'
  | 'middleware'
  | 'tools'
  | 'services'
  | 'outsourcing'
  | 'education'
  | 'consulting'

export type CompanySize =
  | 'solo' // 1 person
  | 'micro' // 2-10
  | 'small' // 11-50
  | 'medium' // 51-200
  | 'large' // 201-1000
  | 'enterprise' // 1000+

export type ExperienceLevel =
  | 'entry'
  | 'junior'
  | 'mid'
  | 'senior'
  | 'lead'
  | 'principal'
  | 'director'
  | 'vp'
  | 'c-level'

export type ContractType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship'
  | 'apprenticeship'

export type RemotePolicy = 'onsite' | 'hybrid' | 'remote' | 'flexible'

export type VisaStatus =
  | 'citizen'
  | 'permanent-resident'
  | 'work-visa'
  | 'student-visa'
  | 'requires-sponsorship'

// === ADDITIONAL SUPPORTING TYPES ===
export interface SalaryRange {
  min: number
  max: number
  currency: string
  period: 'hourly' | 'daily' | 'monthly' | 'annually'
  negotiable: boolean
}

export interface EquityRange {
  min: number
  max: number
  type: 'percentage' | 'stock-options' | 'rsu'
}

export interface JobLocation {
  city: string
  state?: string
  country: string
  timezone?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface PlatformExperience {
  platform: GamingPlatform
  yearsOfExperience: number
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  notableProjects?: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  date: Date
  type: 'award' | 'certification' | 'milestone' | 'publication'
  organization?: string
  url?: string
}

export interface ShippedTitle {
  name: string
  platform: GamingPlatform[]
  releaseDate: Date
  role: string
  teamSize?: number
  metacriticScore?: number
  salesFigures?: string
  awards?: string[]
}

export interface Award {
  name: string
  organization: string
  year: number
  category?: string
  project?: string
}

export interface CompanyCulture {
  workLifeBalance: number // 1-5 scale
  diversity: number
  innovation: number
  growth: number
  compensation: number
  values: string[]
  perks: string[]
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'recruiters-only' | 'private'
  showSalaryExpectations: boolean
  allowMessages: 'all' | 'recruiters-only' | 'none'
  showLocation: boolean
  indexForSearch: boolean
}

export interface NotificationSettings {
  jobAlerts: boolean
  applicationUpdates: boolean
  messageNotifications: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
  pushNotifications: boolean
}

// === APPLICATION & TRACKING TYPES ===
export interface JobApplication {
  id: string
  jobId: string
  userId: string

  // Application details
  coverLetter?: string
  customResume?: string
  portfolioLink?: string
  additionalDocuments?: ApplicationDocument[]

  // Status tracking
  status: ApplicationStatus
  statusHistory: ApplicationStatusHistory[]

  // Communication
  messages: ApplicationMessage[]
  interviews: Interview[]

  // Metadata
  appliedAt: Date
  updatedAt: Date
  withdrawnAt?: Date

  // AI insights
  matchScore?: number
  improvementSuggestions?: string[]
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'screening'
  | 'interviewing'
  | 'technical-assessment'
  | 'reference-check'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'withdrawn'

export interface ApplicationStatusHistory {
  status: ApplicationStatus
  date: Date
  note?: string
  changedBy?: 'user' | 'recruiter' | 'system'
}

export interface ApplicationDocument {
  id: string
  name: string
  type: 'resume' | 'portfolio' | 'certificate' | 'other'
  url: string
  uploadedAt: Date
}

export interface ApplicationMessage {
  id: string
  from: 'user' | 'recruiter'
  message: string
  sentAt: Date
  read: boolean
  attachments?: string[]
}

export interface Interview {
  id: string
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'portfolio-review'
  scheduledAt: Date
  duration: number // minutes
  location?: string
  meetingLink?: string
  interviewer?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  feedback?: InterviewFeedback
}

export interface InterviewFeedback {
  rating: number // 1-5
  strengths: string[]
  improvements: string[]
  notes: string
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no'
}

// === SEARCH & FILTERING TYPES ===
export interface JobSearchQuery {
  keywords?: string
  location?: string
  remote?: RemotePolicy
  experienceLevel?: ExperienceLevel[]
  contractType?: ContractType[]
  salaryMin?: number
  salaryMax?: number
  companySize?: CompanySize[]
  platforms?: GamingPlatform[]
  genres?: GameGenre[]
  engines?: GameEngine[]
  specializations?: GamingSpecialization[]
  postedWithin?: number // days
  sortBy?: 'relevance' | 'date' | 'salary' | 'company'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface JobSearchResult {
  jobs: JobPosting[]
  total: number
  facets: SearchFacets
  suggestions?: string[]
}

export interface SearchFacets {
  experienceLevels: FacetCount[]
  contractTypes: FacetCount[]
  locations: FacetCount[]
  companies: FacetCount[]
  platforms: FacetCount[]
  genres: FacetCount[]
  engines: FacetCount[]
  specializations: FacetCount[]
  salaryRanges: SalaryRangeFacet[]
}

export interface FacetCount {
  value: string
  count: number
}

export interface SalaryRangeFacet {
  min: number
  max: number
  count: number
}

// === AI & RECOMMENDATION TYPES ===
export interface AIJobRecommendation {
  jobId: string
  score: number // 0-100
  reasons: RecommendationReason[]
  skillGaps?: SkillGap[]
  improvementTips?: string[]
}

export interface RecommendationReason {
  type:
    | 'skill-match'
    | 'experience-match'
    | 'location-match'
    | 'company-culture'
    | 'salary-match'
  score: number
  explanation: string
}

export interface SkillGap {
  skill: string
  importance: 'critical' | 'important' | 'nice-to-have'
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced'
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  learningResources?: LearningResource[]
}

export interface LearningResource {
  title: string
  type: 'course' | 'tutorial' | 'documentation' | 'book' | 'video'
  url: string
  duration?: string
  cost?: 'free' | 'paid'
  rating?: number
}

// === ANALYTICS & METRICS TYPES ===
export interface UserAnalytics {
  profileViews: number
  jobApplications: number
  interviewRequests: number
  searchActivity: SearchActivity[]
  skillDevelopment: SkillProgress[]
  careerProgression: CareerMilestone[]
}

export interface SearchActivity {
  date: Date
  query: string
  resultsCount: number
  clickedJobs: string[]
  appliedJobs: string[]
}

export interface SkillProgress {
  skill: string
  currentLevel: number // 1-10
  targetLevel: number
  progress: number // percentage
  lastUpdated: Date
}

export interface CareerMilestone {
  date: Date
  type:
    | 'job-change'
    | 'promotion'
    | 'skill-acquired'
    | 'certification'
    | 'project-completed'
  description: string
  impact?: string
}
