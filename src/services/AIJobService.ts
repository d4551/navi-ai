/**
 * AI-Powered Job Service
 * Provides intelligent job matching, recommendations, and analysis
 */

import { ref, computed } from 'vue'
import type { Job, JobFilters } from '@/shared/types/jobs'
import { useAppStore } from '@/stores/app'
import { getActivePinia } from 'pinia'
import { logger } from '@/shared/utils/logger'

export interface AIJobMatch {
  job: Job
  matchScore: number
  matchReasons: string[]
  salaryFit: 'below' | 'match' | 'above'
  skillAlignment: number
  experienceAlignment: number
  locationPreference: number
  cultureScore?: number
}

export interface JobMarketInsight {
  skill: string
  demand: 'high' | 'medium' | 'low'
  trend: 'rising' | 'stable' | 'declining'
  averageSalary: number
  projectedGrowth: number
  relatedSkills: string[]
}

export interface SalaryPrediction {
  estimatedSalary: { min: number; max: number; currency: string }
  confidence: number
  factors: string[]
  marketData: {
    percentile25: number
    percentile50: number
    percentile75: number
    percentile90: number
  }
}

export interface AIJobInsights {
  jobComplexity: 'entry' | 'intermediate' | 'advanced' | 'expert'
  requiredSkills: string[]
  nicetohaveSkills: string[]
  careerProgression: string[]
  industryGrowth: 'declining' | 'stable' | 'growing' | 'booming'
  remoteCompatibility: number // 0-100
  burnoutRisk: 'low' | 'medium' | 'high'
  learningCurve: 'gentle' | 'moderate' | 'steep'
}

export class AIJobService {
  private userProfile = ref<any>({})
  private modelCache = new Map<string, any>()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes

  constructor() {
    // Do not access Pinia or stores at module init time.
    // Profile will be hydrated lazily on first use once Pinia is active.
  }

  private tryHydrateProfile() {
    try {
      // Ensure there is an active Pinia (set via app.use(pinia) and setActivePinia)
      if (!getActivePinia()) return
      const store = useAppStore()
      this.userProfile.value = {
        skills: store.user?.skills || [],
        experience: (store.user as any)?.experience || 0,
        preferences: (store.user as any)?.preferences || {},
        salaryRange: (store.user as any)?.salaryExpectation || {},
        location: (store.user as any)?.location || '',
        workStyle: (store.user as any)?.workStyle || 'hybrid',
        careerGoals: (store.user as any)?.careerGoals || []
      }
    } catch (e) {
      // Safe no‑op if store not ready; methods will still function with defaults
    }
  }

  /**
   * AI-powered job matching with detailed scoring
   */
  async analyzeJobMatches(jobs: Job[]): Promise<AIJobMatch[]> {
    try {
      // Lazy hydration in case this service was imported before Pinia initialization
      this.tryHydrateProfile()
      const matches: AIJobMatch[] = []

      for (const job of jobs) {
        const match = await this.calculateJobMatch(job)
        matches.push(match)
      }

      // Sort by match score and return
      return matches.sort((a, b) => b.matchScore - a.matchScore)
    } catch (error) {
      logger.error('AI job matching failed:', error)
      return jobs.map(job => ({
        job,
        matchScore: 50, // Fallback score
        matchReasons: ['Basic compatibility check'],
        salaryFit: 'match' as const,
        skillAlignment: 50,
        experienceAlignment: 50,
        locationPreference: 50
      }))
    }
  }

  /**
   * Generate personalized job recommendations
   * Applies filtering and thresholding to analyzed matches
   */
  async generateRecommendations(jobs: Job[], limit: number = 10): Promise<AIJobMatch[]> {
    this.tryHydrateProfile()
    const matches = await this.analyzeJobMatches(jobs)
    const recommendations = matches
      .filter(match => match.matchScore >= 60)
      .filter(match => this.passesRecommendationFilters(match))
      .slice(0, Math.max(1, limit))
    return recommendations
  }

  private async calculateJobMatch(job: Job): Promise<AIJobMatch> {
    const profile = this.userProfile.value
    const matchReasons: string[] = []
    let totalScore = 0
    let weights = { skills: 0.35, experience: 0.25, salary: 0.20, location: 0.15, culture: 0.05 }

    // Skill alignment analysis
    const skillScore = this.calculateSkillAlignment(job, profile.skills)
    totalScore += skillScore * weights.skills
    if (skillScore > 70) {
      matchReasons.push(`Strong skill match (${Math.round(skillScore)}% alignment)`)
    }

    // Experience alignment
    const experienceScore = this.calculateExperienceAlignment(job, profile.experience)
    totalScore += experienceScore * weights.experience
    if (experienceScore > 80) {
      matchReasons.push('Experience level perfectly matches')
    } else if (experienceScore < 30) {
      matchReasons.push('Experience level may be challenging')
    }

    // Salary analysis
    const salaryFit = this.analyzeSalaryFit(job, profile.salaryRange)
    const salaryScore = this.calculateSalaryScore(salaryFit)
    totalScore += salaryScore * weights.salary
    matchReasons.push(`Salary ${salaryFit} expectations`)

    // Location preference
    const locationScore = this.calculateLocationAlignment(job, profile)
    totalScore += locationScore * weights.location
    if (locationScore > 90) {
      matchReasons.push('Perfect location match')
    }

    // Culture and company fit (AI-powered analysis)
    const cultureScore = await this.analyzeCultureFit(job, profile)
    totalScore += cultureScore * weights.culture

    return {
      job,
      matchScore: Math.round(Math.min(totalScore, 100)),
      matchReasons,
      salaryFit,
      skillAlignment: skillScore,
      experienceAlignment: experienceScore,
      locationPreference: locationScore,
      cultureScore
    }
  }

  private calculateSkillAlignment(job: Job, userSkills: string[]): number {
    if (!job.requirements?.length && !job.technologies?.length) return 50

    const jobSkills = [
      ...(job.requirements || []),
      ...(job.technologies || []),
      ...this.extractSkillsFromDescription(job.description || '')
    ].map(skill => skill.toLowerCase())

    const userSkillsLower = userSkills.map(skill => skill.toLowerCase())
    
    let matchCount = 0
    let totalWeight = 0

    jobSkills.forEach(jobSkill => {
      const weight = this.getSkillImportance(jobSkill)
      totalWeight += weight

      if (userSkillsLower.some(userSkill => 
        userSkill.includes(jobSkill) || 
        jobSkill.includes(userSkill) ||
        this.areRelatedSkills(userSkill, jobSkill)
      )) {
        matchCount += weight
      }
    })

    return totalWeight > 0 ? (matchCount / totalWeight) * 100 : 50
  }

  private calculateExperienceAlignment(job: Job, userExperience: number): number {
    const jobLevel = job.experienceLevel || 'mid'
    const requiredYears = this.getExperienceYears(jobLevel)
    
    if (userExperience >= requiredYears - 1 && userExperience <= requiredYears + 3) {
      return 100 // Perfect match
    } else if (userExperience >= requiredYears - 2 && userExperience <= requiredYears + 5) {
      return 80 // Good match
    } else if (userExperience < requiredYears) {
      return Math.max(20, (userExperience / requiredYears) * 60) // Underqualified but learning opportunity
    } else {
      return Math.max(30, 70 - ((userExperience - requiredYears) * 5)) // Overqualified
    }
  }

  private analyzeSalaryFit(job: Job, userSalaryRange: any): 'below' | 'match' | 'above' {
    if (!job.salary || !userSalaryRange?.min) return 'match'

    const jobSalary = typeof job.salary === 'object' 
      ? (job.salary.min + job.salary.max) / 2 
      : parseInt(String(job.salary).replace(/\D/g, ''))

    const userExpected = (userSalaryRange.min + (userSalaryRange.max || userSalaryRange.min)) / 2

    if (jobSalary < userExpected * 0.8) return 'below'
    if (jobSalary > userExpected * 1.2) return 'above'
    return 'match'
  }

  private calculateSalaryScore(salaryFit: 'below' | 'match' | 'above'): number {
    switch (salaryFit) {
      case 'match': return 100
      case 'above': return 85
      case 'below': return 40
    }
  }

  private calculateLocationAlignment(job: Job, profile: any): number {
    if (job.remote && profile.workStyle === 'remote') return 100
    if (!job.remote && profile.workStyle === 'onsite') return 100
    if (profile.workStyle === 'hybrid') return 85
    
    // Geographic matching
    if (profile.location && job.location) {
      const userLocation = profile.location.toLowerCase()
      const jobLocation = job.location.toLowerCase()
      
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        return 95
      }
    }
    
    return 60 // Neutral score
  }

  private async analyzeCultureFit(job: Job, profile: any): Promise<number> {
    try {
      // AI-powered culture analysis based on job description and company
      const cultureKeywords = {
        collaborative: ['team', 'collaboration', 'agile', 'scrum'],
        innovative: ['innovation', 'cutting-edge', 'research', 'new technology'],
        fastPaced: ['fast-paced', 'startup', 'dynamic', 'rapid growth'],
        stable: ['established', 'mature', 'stable', 'enterprise'],
        creative: ['creative', 'design', 'artistic', 'visual']
      }

      const description = (job.description || '').toLowerCase()
      const cultureScores: Record<string, number> = {}

      Object.entries(cultureKeywords).forEach(([culture, keywords]) => {
        const score = keywords.reduce((acc, keyword) => {
          return acc + (description.includes(keyword) ? 1 : 0)
        }, 0) / keywords.length * 100
        
        cultureScores[culture] = score
      })

      // Match against user preferences (mock implementation)
      const userPreferences = profile.preferences?.culture || ['collaborative', 'innovative']
      const alignmentScore = userPreferences.reduce((acc: number, pref: string) => {
        return acc + (cultureScores[pref] || 50)
      }, 0) / userPreferences.length

      return Math.min(alignmentScore, 100)
    } catch (error) {
      return 70 // Default cultural fit score
    }
  }

  /**
   * Predict salary for a job based on AI analysis
   */
  async predictSalary(job: Job): Promise<SalaryPrediction> {
    try {
      const cacheKey = `salary_${job.title}_${job.location}_${job.experienceLevel}`
      const cached = this.getCachedResult(cacheKey)
      if (cached) return cached

      // AI-powered salary prediction
      const baseSalary = this.calculateBaseSalary(job)
      const adjustments = this.calculateSalaryAdjustments(job)
      
      const prediction: SalaryPrediction = {
        estimatedSalary: {
          min: Math.round(baseSalary * adjustments.min),
          max: Math.round(baseSalary * adjustments.max),
          currency: 'USD'
        },
        confidence: this.calculatePredictionConfidence(job),
        factors: this.getSalaryFactors(job, adjustments),
        marketData: {
          percentile25: Math.round(baseSalary * 0.8),
          percentile50: Math.round(baseSalary),
          percentile75: Math.round(baseSalary * 1.3),
          percentile90: Math.round(baseSalary * 1.6)
        }
      }

      this.setCachedResult(cacheKey, prediction)
      return prediction
    } catch (error) {
      logger.error('Salary prediction failed:', error)
      return {
        estimatedSalary: { min: 50000, max: 120000, currency: 'USD' },
        confidence: 50,
        factors: ['Limited data available'],
        marketData: { percentile25: 60000, percentile50: 80000, percentile75: 100000, percentile90: 120000 }
      }
    }
  }

  /**
   * Analyze job for detailed AI insights
   */
  async analyzeJobInsights(job: Job): Promise<AIJobInsights> {
    try {
      const description = job.description || ''
      const requirements = job.requirements || []
      const technologies = job.technologies || []

      return {
        jobComplexity: this.analyzeJobComplexity(job),
        requiredSkills: this.extractRequiredSkills(requirements, description),
        nicetohaveSkills: this.extractNiceToHaveSkills(description),
        careerProgression: this.analyzeCareerProgression(job.title),
        industryGrowth: this.analyzeIndustryGrowth(job.company, technologies),
        remoteCompatibility: this.analyzeRemoteCompatibility(job, description),
        burnoutRisk: this.analyzeBurnoutRisk(description, job.type),
        learningCurve: this.analyzeLearningCurve(technologies, requirements)
      }
    } catch (error) {
      logger.error('Job insights analysis failed:', error)
      return {
        jobComplexity: 'intermediate',
        requiredSkills: job.requirements || [],
        nicetohaveSkills: [],
        careerProgression: ['Senior Developer', 'Lead Developer', 'Engineering Manager'],
        industryGrowth: 'stable',
        remoteCompatibility: 70,
        burnoutRisk: 'medium',
        learningCurve: 'moderate'
      }
    }
  }

  /**
   * Get market insights for specific skills
   */
  async getMarketInsights(skills: string[]): Promise<JobMarketInsight[]> {
    try {
      const insights: JobMarketInsight[] = []

      for (const skill of skills) {
        const insight = await this.analyzeSkillMarket(skill)
        insights.push(insight)
      }

      return insights.sort((a, b) => b.averageSalary - a.averageSalary)
    } catch (error) {
      logger.error('Market insights failed:', error)
      return []
    }
  }

  

  // Helper methods
  private extractSkillsFromDescription(description: string): string[] {
    const skillPatterns = [
      /\b(React|Vue|Angular|JavaScript|TypeScript|Python|Java|C#|C\+\+|Go|Rust|Swift|Kotlin)\b/gi,
      /\b(Unity|Unreal Engine|Blender|Maya|Photoshop|Figma|Git|Docker|Kubernetes)\b/gi,
      /\b(AWS|Azure|GCP|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/gi
    ]

    const skills = new Set<string>()
    skillPatterns.forEach(pattern => {
      const matches = description.match(pattern)
      if (matches) {
        matches.forEach(match => skills.add(match))
      }
    })

    return Array.from(skills)
  }

  private getSkillImportance(skill: string): number {
    const highImportance = ['react', 'vue', 'angular', 'unity', 'unreal', 'python', 'javascript']
    const mediumImportance = ['git', 'sql', 'mongodb', 'docker', 'aws']
    
    const skillLower = skill.toLowerCase()
    if (highImportance.some(s => skillLower.includes(s))) return 3
    if (mediumImportance.some(s => skillLower.includes(s))) return 2
    return 1
  }

  private areRelatedSkills(skill1: string, skill2: string): boolean {
    const relatedSkills = {
      'react': ['jsx', 'redux', 'nextjs'],
      'vue': ['vuex', 'nuxt'],
      'unity': ['c#', 'game development'],
      'python': ['django', 'flask', 'fastapi']
    }

    const skill1Lower = skill1.toLowerCase()
    const skill2Lower = skill2.toLowerCase()

    return Object.entries(relatedSkills).some(([key, related]) => 
      (skill1Lower.includes(key) && related.some(r => skill2Lower.includes(r))) ||
      (skill2Lower.includes(key) && related.some(r => skill1Lower.includes(r)))
    )
  }

  private getExperienceYears(level: string): number {
    switch (level.toLowerCase()) {
      case 'entry': case 'junior': return 1
      case 'mid': case 'intermediate': return 3
      case 'senior': return 5
      case 'lead': case 'principal': return 8
      default: return 3
    }
  }

  private calculateBaseSalary(job: Job): number {
    const baseSalaries = {
      'game developer': 75000,
      'unity developer': 80000,
      'unreal developer': 85000,
      'frontend developer': 70000,
      'backend developer': 75000,
      'fullstack developer': 80000,
      'data scientist': 90000,
      'ml engineer': 95000,
      'devops engineer': 85000
    }

    const jobTitle = job.title.toLowerCase()
    const baseSalary = Object.entries(baseSalaries).find(([title]) => 
      jobTitle.includes(title)
    )?.[1] || 70000

    // Experience level multiplier
    const experienceMultiplier = {
      'entry': 0.7,
      'junior': 0.8,
      'mid': 1.0,
      'intermediate': 1.1,
      'senior': 1.4,
      'lead': 1.7,
      'principal': 2.0
    }

    const multiplier = experienceMultiplier[job.experienceLevel as keyof typeof experienceMultiplier] || 1.0
    return baseSalary * multiplier
  }

  private calculateSalaryAdjustments(job: Job): { min: number; max: number } {
    let minAdjust = 0.8
    let maxAdjust = 1.4

    // Location adjustments
    const highCostAreas = ['san francisco', 'new york', 'seattle', 'los angeles']
    if (highCostAreas.some(area => job.location?.toLowerCase().includes(area))) {
      minAdjust *= 1.3
      maxAdjust *= 1.5
    }

    // Company size adjustments (heuristic based on company name)
    const bigTech = ['google', 'microsoft', 'apple', 'amazon', 'meta', 'netflix', 'epic games']
    if (bigTech.some(company => job.company?.toLowerCase().includes(company))) {
      minAdjust *= 1.2
      maxAdjust *= 1.6
    }

    // Remote work adjustment
    if (job.remote) {
      maxAdjust *= 1.1 // Remote often pays slightly more
    }

    return { min: minAdjust, max: maxAdjust }
  }

  private calculatePredictionConfidence(job: Job): number {
    let confidence = 60 // Base confidence

    if (job.salary) confidence += 20 // Has salary data
    if (job.requirements?.length > 3) confidence += 10 // Detailed requirements
    if (job.description?.length > 200) confidence += 10 // Detailed description
    if (job.company) confidence += 5 // Company information available

    return Math.min(confidence, 95)
  }

  private getSalaryFactors(job: Job, adjustments: any): string[] {
    const factors = []
    
    if (adjustments.min > 1.0) {
      factors.push('High-cost location premium')
    }
    if (job.remote) {
      factors.push('Remote work flexibility')
    }
    if (job.experienceLevel === 'senior' || job.experienceLevel === 'lead') {
      factors.push('Senior-level position')
    }
    if (job.requirements?.some(req => req.toLowerCase().includes('ai') || req.toLowerCase().includes('machine learning'))) {
      factors.push('High-demand AI/ML skills')
    }
    
    return factors
  }

  private analyzeJobComplexity(job: Job): 'entry' | 'intermediate' | 'advanced' | 'expert' {
    const requirements = job.requirements || []
    const technologies = job.technologies || []
    const description = job.description || ''
    
    let complexity = 0
    
    // Count advanced technologies
    const advancedTech = ['ai', 'machine learning', 'blockchain', 'kubernetes', 'microservices']
    complexity += advancedTech.filter(tech => 
      description.toLowerCase().includes(tech) || 
      technologies.some(t => t.toLowerCase().includes(tech))
    ).length * 2
    
    // Count requirements
    complexity += requirements.length
    
    // Experience level factor
    const expLevels = { 'entry': 1, 'junior': 1, 'mid': 2, 'senior': 3, 'lead': 4 }
    complexity += expLevels[job.experienceLevel as keyof typeof expLevels] || 2
    
    if (complexity >= 12) return 'expert'
    if (complexity >= 8) return 'advanced'
    if (complexity >= 5) return 'intermediate'
    return 'entry'
  }

  private extractRequiredSkills(requirements: string[], description: string): string[] {
    const allText = (requirements.join(' ') + ' ' + description).toLowerCase()
    const requiredIndicators = ['required', 'must have', 'essential', 'mandatory']
    
    const skills = this.extractSkillsFromDescription(allText)
    return skills.filter(skill => 
      requiredIndicators.some(indicator => 
        allText.includes(`${indicator}${skill.toLowerCase()}`) ||
        allText.includes(`${skill.toLowerCase()}${indicator}`)
      )
    )
  }

  private extractNiceToHaveSkills(description: string): string[] {
    const niceToHaveIndicators = ['nice to have', 'preferred', 'bonus', 'plus', 'advantage']
    const descLower = description.toLowerCase()
    
    return this.extractSkillsFromDescription(description).filter(skill =>
      niceToHaveIndicators.some(indicator =>
        descLower.includes(`${indicator}${skill.toLowerCase()}`) ||
        descLower.includes(`${skill.toLowerCase()}${indicator}`)
      )
    )
  }

  private analyzeCareerProgression(title: string): string[] {
    const progressionPaths = {
      'developer': ['Senior Developer', 'Lead Developer', 'Engineering Manager', 'CTO'],
      'designer': ['Senior Designer', 'Design Lead', 'Design Manager', 'Head of Design'],
      'analyst': ['Senior Analyst', 'Lead Analyst', 'Analytics Manager', 'Head of Analytics']
    }
    
    const titleLower = title.toLowerCase()
    const path = Object.entries(progressionPaths).find(([key]) => 
      titleLower.includes(key)
    )?.[1] || ['Senior Role', 'Lead Role', 'Management', 'Executive']
    
    return path
  }

  private analyzeIndustryGrowth(company: string, technologies: string[]): 'declining' | 'stable' | 'growing' | 'booming' {
    const boomingTech = ['ai', 'machine learning', 'vr', 'ar', 'blockchain', 'quantum']
    const growingTech = ['react', 'vue', 'python', 'kubernetes', 'cloud']
    
    const techText = technologies.join(' ').toLowerCase()
    
    if (boomingTech.some(tech => techText.includes(tech))) return 'booming'
    if (growingTech.some(tech => techText.includes(tech))) return 'growing'
    if (company?.toLowerCase().includes('startup')) return 'growing'
    
    return 'stable'
  }

  private analyzeRemoteCompatibility(job: Job, description: string): number {
    if (job.remote) return 95
    
    const remoteIndicators = ['remote', 'distributed', 'work from home', 'wfh', 'flexible']
    const localIndicators = ['onsite', 'office', 'in-person', 'laboratory', 'manufacturing']
    
    const descLower = description.toLowerCase()
    const remoteScore = remoteIndicators.reduce((score, indicator) => 
      score + (descLower.includes(indicator) ? 20 : 0), 0
    )
    const localScore = localIndicators.reduce((score, indicator) => 
      score - (descLower.includes(indicator) ? 15 : 0), 0
    )
    
    return Math.max(0, Math.min(100, 60 + remoteScore + localScore))
  }

  private analyzeBurnoutRisk(description: string, jobType?: string): 'low' | 'medium' | 'high' {
    const highRiskIndicators = ['fast-paced', 'high-pressure', 'tight deadlines', 'overtime', 'crunch']
    const lowRiskIndicators = ['work-life balance', 'flexible hours', 'wellness', 'sustainable']
    
    const descLower = description.toLowerCase()
    const highRisk = highRiskIndicators.some(indicator => descLower.includes(indicator))
    const lowRisk = lowRiskIndicators.some(indicator => descLower.includes(indicator))
    
    if (highRisk && !lowRisk) return 'high'
    if (lowRisk && !highRisk) return 'low'
    return 'medium'
  }

  private analyzeLearningCurve(technologies: string[], requirements: string[]): 'gentle' | 'moderate' | 'steep' {
    const advancedTech = ['machine learning', 'ai', 'blockchain', 'quantum', 'webgl', 'webassembly']
    const moderateTech = ['react', 'vue', 'angular', 'docker', 'kubernetes', 'aws']
    
    const allTech = [...technologies, ...requirements].map(t => t.toLowerCase())
    const hasAdvanced = advancedTech.some(tech => allTech.some(t => t.includes(tech)))
    const hasModerate = moderateTech.some(tech => allTech.some(t => t.includes(tech)))
    
    if (hasAdvanced) return 'steep'
    if (hasModerate) return 'moderate'
    return 'gentle'
  }

  private async analyzeSkillMarket(skill: string): Promise<JobMarketInsight> {
    // Mock implementation - in production, this would use real market data APIs
    const marketData = {
      'unity': { demand: 'high', trend: 'rising', salary: 82000, growth: 15 },
      'react': { demand: 'high', trend: 'stable', salary: 78000, growth: 8 },
      'python': { demand: 'high', trend: 'rising', salary: 85000, growth: 20 },
      'ai': { demand: 'high', trend: 'booming', salary: 120000, growth: 35 },
      'vue': { demand: 'medium', trend: 'rising', salary: 75000, growth: 12 }
    }
    
    const skillLower = skill.toLowerCase()
    const data = Object.entries(marketData).find(([key]) => 
      skillLower.includes(key) || key.includes(skillLower)
    )?.[1] || { demand: 'medium', trend: 'stable', salary: 70000, growth: 5 }
    
    return {
      skill,
      demand: data.demand as any,
      trend: data.trend as any,
      averageSalary: data.salary,
      projectedGrowth: data.growth,
      relatedSkills: this.getRelatedSkills(skill)
    }
  }

  private getRelatedSkills(skill: string): string[] {
    const relatedSkillsMap = {
      'unity': ['C#', 'Game Development', 'Blender', 'Maya'],
      'react': ['JavaScript', 'TypeScript', 'Redux', 'Next.js'],
      'python': ['Django', 'FastAPI', 'Data Science', 'Machine Learning'],
      'ai': ['Machine Learning', 'TensorFlow', 'PyTorch', 'Python'],
      'vue': ['JavaScript', 'TypeScript', 'Nuxt.js', 'Vuex']
    }
    
    const skillLower = skill.toLowerCase()
    return Object.entries(relatedSkillsMap).find(([key]) => 
      skillLower.includes(key) || key.includes(skillLower)
    )?.[1] || []
  }

  private passesRecommendationFilters(match: AIJobMatch): boolean {
    // Filter out jobs that might not be good recommendations
    if (match.matchScore < 60) return false
    if (match.salaryFit === 'below' && match.skillAlignment < 70) return false
    return true
  }

  private getCachedResult(key: string): any {
    const cached = this.modelCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCachedResult(key: string, data: any): void {
    this.modelCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}

// Export singleton instance
export const aiJobService = new AIJobService()
