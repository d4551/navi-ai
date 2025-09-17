/**
 * Type definitions for enhanced gaming industry skill mapping
 */

export interface GameSkill {
  id: string
  name: string
  source: 'gaming' | 'professional' | 'education' | 'personal'
  category: SkillCategory
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface SkillMapping {
  id: string
  gameExpression: string // "IGL in Valorant"
  transferableSkill: string // "Strategic Leadership"
  industryApplications: string[] // ["Consulting", "Game Design", "Esports Management"]
  evidenceSuggestions?: string[]
  evidence: SkillEvidence[]
  confidence: number // 0-100
  category: SkillCategory
  demandLevel: 'high' | 'medium' | 'low'
  verified: boolean
  createdAt: Date
  updatedAt?: Date
  aiGenerated?: boolean
}

export interface SkillEvidence {
  id: string
  type: EvidenceType
  title: string
  description: string
  url?: string
  file?: File
  metadata?: Record<string, any>
  verificationStatus: 'pending' | 'verified' | 'rejected'
  createdAt: Date
}

export type EvidenceType =
  | 'clip'
  | 'stats'
  | 'community'
  | 'achievement'
  | 'document'
  | 'portfolio_piece'
  | 'testimonial'
  | 'certificate'

export type SkillCategory =
  | 'leadership'
  | 'community'
  | 'technical'
  | 'creative'
  | 'analytical'
  | 'communication'
  | 'project_management'

export interface TrendingSkill {
  skill: string
  description: string
  demandGrowth: number // percentage
  avgSalaryMin: number
  avgSalaryMax: number
  roles: string[]
  learningResources: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
}

export interface IndustryRole {
  id: string
  title: string
  description: string
  coreSkills: string[]
  niceToHaveSkills: string[]
  responsibilities: string[]
  tools: string[]
  salaryRanges: {
    junior: SalaryRange
    mid: SalaryRange
    senior: SalaryRange
  }
  careerProgression: ProgressionStage[]
  industryDemand: 'high' | 'medium' | 'low'
  remoteWorkFriendly: boolean
  requiredEducation?: string[]
  alternativePaths?: string[]
}

export interface SalaryRange {
  min: number
  max: number
  currency?: string
  location?: string
}

export interface ProgressionStage {
  level: string
  duration: string
  focus: string
  description: string
  typicalSalary?: SalaryRange
}

export interface CareerPathway {
  id: string
  title: string
  description: string
  detailedDescription?: string
  matchScore: number // 0-100 based on user skills
  stages: PathwayStage[]
  requiredSkills: string[]
  estimatedTimeToEntry: string
  icon?: string
  examples?: SuccessStory[]
  averageSalary?: SalaryRange
  jobMarketTrend: 'growing' | 'stable' | 'declining'
}

export interface PathwayStage {
  title: string
  duration: string
  description: string
  completed?: boolean
  current?: boolean
  requirements?: string[]
  outcomes?: string[]
}

export interface SuccessStory {
  name: string
  background: string
  careerPath: string
  avatar?: string
  currentRole: string
  company: string
  timeline: string
  keySkills: string[]
  advice?: string
}

export interface ReadinessAssessment {
  overallScore: number // 0-100
  categories: {
    technical: CategoryAssessment
    softSkills: CategoryAssessment
    industryKnowledge: CategoryAssessment
    portfolio: CategoryAssessment
  }
  improvementSuggestions: string[]
  nextSteps: string[]
  targetRoleReadiness?: RoleReadiness[]
  lastAssessed: Date
}

export interface CategoryAssessment {
  score: number
  feedback: string
  strengths?: string[]
  improvements?: string[]
}

export interface RoleReadiness {
  roleId: string
  roleTitle: string
  readinessScore: number
  missingSkills: string[]
  matchingSkills: string[]
  timeToReady?: string
  recommendedActions: string[]
}

export interface SkillAnalysis {
  skillId: string
  analysisType: 'ai_enhanced' | 'peer_reviewed' | 'industry_validated'
  improvements: {
    gameExpression?: string
    transferableSkill?: string
    industryApplications?: string[]
    newEvidenceSuggestions?: string[]
  }
  marketDemand: {
    currentDemand: number
    projectedGrowth: number
    topCompanies: string[]
    averageSalary: SalaryRange
  }
  learningPath?: {
    nextSteps: string[]
    resources: LearningResource[]
    estimatedTime: string
  }
  createdAt: Date
}

export interface LearningResource {
  title: string
  type: 'course' | 'tutorial' | 'book' | 'project' | 'certification'
  provider: string
  url?: string
  duration?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  cost: 'free' | 'paid' | 'freemium'
  rating?: number
}

export interface SkillExportOptions {
  format: 'pdf' | 'image' | 'json' | 'csv'
  framework: 'discipline' | 'experience' | 'studio' | 'custom'
  targetStudio?: string
  includeEvidence: boolean
  includeAnalysis: boolean
  includeReadiness: boolean
  customSections?: ExportSection[]
}

export interface ExportSection {
  title: string
  skills: string[]
  description?: string
  priority: number
}

// Visual skill web types
export interface SkillWebNode {
  id: string
  type: 'central' | 'category' | 'skill'
  label: string
  x: number
  y: number
  radius: number
  color?: string
  strength?: 'weak' | 'moderate' | 'strong'
  connections?: string[] // IDs of connected nodes
}

export interface SkillWebConnection {
  from: string
  to: string
  strength: 'weak' | 'moderate' | 'strong'
  type: 'primary' | 'secondary'
}

export interface SkillWebVisualization {
  nodes: SkillWebNode[]
  connections: SkillWebConnection[]
  dimensions: {
    width: number
    height: number
    centerX: number
    centerY: number
  }
  categories: SkillCategory[]
  interactionMode: 'view' | 'edit' | 'explore'
}

// Game-to-industry translation types
export interface GameToIndustryTranslation {
  gameActivity: string
  gameContext?: string // "World of Warcraft", "Competitive Valorant"
  professionalEquivalent: string
  industries: string[]
  skillsRequired: string[]
  evidenceTypes: EvidenceType[]
  difficultyToTransition: 'easy' | 'moderate' | 'challenging'
  famousExamples?: FamousExample[]
  successStories?: SuccessStory[]
}

export interface FamousExample {
  name: string
  description: string
  company?: string
  achievement: string
  relevantSkills: string[]
}

// Team skill mapping (future feature)
export interface TeamSkillMap {
  teamId: string
  members: TeamMember[]
  overallStrengths: SkillCategory[]
  gaps: SkillGap[]
  recommendations: TeamRecommendation[]
  synergy: number // 0-100
  optimalTeamSize?: number
}

export interface TeamMember {
  userId: string
  name: string
  skills: SkillMapping[]
  role: string
  experience: string
}

export interface SkillGap {
  category: SkillCategory
  severity: 'low' | 'medium' | 'high'
  impact: string
  solutions: string[]
}

export interface TeamRecommendation {
  type: 'hire' | 'train' | 'redistribute'
  priority: 'low' | 'medium' | 'high'
  description: string
  expectedImpact: string
  timeframe: string
}

// AI career path simulation types
export interface CareerSimulation {
  userId: string
  currentSkills: SkillMapping[]
  targetRole: string
  simulationResults: SimulationResult[]
  recommendedPath: SimulationPath
  confidenceScore: number
  createdAt: Date
}

export interface SimulationResult {
  scenario: string
  probability: number
  timeframe: string
  requiredActions: string[]
  expectedOutcome: string
  salaryProjection?: SalaryRange
}

export interface SimulationPath {
  steps: SimulationStep[]
  totalDuration: string
  successProbability: number
  alternativePaths?: SimulationPath[]
}

export interface SimulationStep {
  order: number
  action: string
  duration: string
  difficulty: 'easy' | 'moderate' | 'challenging'
  impact: number // 0-100
  dependencies?: string[]
  resources: LearningResource[]
}
