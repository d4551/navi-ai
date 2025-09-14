/**
 * CANONICAL Job Matching Service
 * AI-powered job matching system for gaming industry positions
 */

import type { Job, UserProfile } from '@/shared/types/jobs'

export interface JobMatchCriteria {
  skills: string[]
  experience: number
  interests: string[]
  location?: string
  salaryExpectation?: { min: number; max: number }
  workStyle?: 'remote' | 'hybrid' | 'onsite'
  rolePreferences: string[]
  companySize?: string
  technologies: string[]
}

export interface MatchResult {
  jobId: string
  matchScore: number
  matchBreakdown: {
    skillsMatch: number
    experienceMatch: number
    locationMatch: number
    salaryMatch: number
    cultureMatch: number
    technologyMatch: number
  }
  missingSkills: string[]
  recommendedSkills: string[]
  strengths: string[]
  improvementAreas: string[]
}

export interface SkillGapAnalysis {
  missingCriticalSkills: string[]
  missingPreferredSkills: string[]
  strengthAreas: string[]
  recommendedLearning: {
    skill: string
    priority: 'high' | 'medium' | 'low'
    resources: string[]
    estimatedTimeToLearn: string
  }[]
}

export class JobMatchingService {
  private readonly SKILL_WEIGHT = 0.35
  private readonly EXPERIENCE_WEIGHT = 0.25
  private readonly LOCATION_WEIGHT = 0.15
  private readonly SALARY_WEIGHT = 0.10
  private readonly CULTURE_WEIGHT = 0.10
  private readonly TECHNOLOGY_WEIGHT = 0.05

  /**
   * Calculate comprehensive match score between user profile and job
   */
  calculateMatchScore(userProfile: UserProfile, job: Job): MatchResult {
    const criteria = this.extractUserCriteria(userProfile)
    
    const skillsMatch = this.calculateSkillsMatch(criteria.skills, job.requirements || [], job.technologies || [])
    const experienceMatch = this.calculateExperienceMatch(criteria.experience, job.experienceLevel || 'mid')
    const locationMatch = this.calculateLocationMatch(criteria.location, criteria.workStyle, job.location || '', !!job.remote)
    const salaryMatch = this.calculateSalaryMatch(criteria.salaryExpectation, job.salary)
    const cultureMatch = this.calculateCultureMatch(criteria.interests || [], job.company || '', job.studioType)
    const technologyMatch = this.calculateTechnologyMatch(criteria.technologies || [], job.technologies || [])

    // Calculate weighted overall score
    const matchScore = Math.round(
      skillsMatch.score * this.SKILL_WEIGHT +
      experienceMatch * this.EXPERIENCE_WEIGHT +
      locationMatch * this.LOCATION_WEIGHT +
      salaryMatch * this.SALARY_WEIGHT +
      cultureMatch * this.CULTURE_WEIGHT +
      technologyMatch * this.TECHNOLOGY_WEIGHT
    )

    // Analyze skill gaps and strengths
    const { missingSkills, recommendedSkills, strengths } = this.analyzeSkillGaps(
      criteria.skills,
      job.requirements || [],
      job.technologies || []
    )

    const improvementAreas = this.identifyImprovementAreas({
      skillsMatch: skillsMatch.score,
      experienceMatch,
      locationMatch,
      salaryMatch,
      cultureMatch,
      technologyMatch
    })

    return {
      jobId: job.id,
      matchScore,
      matchBreakdown: {
        skillsMatch: skillsMatch.score,
        experienceMatch,
        locationMatch,
        salaryMatch,
        cultureMatch,
        technologyMatch
      },
      missingSkills,
      recommendedSkills,
      strengths,
      improvementAreas
    }
  }

  /**
   * Calculate skills matching score with detailed analysis
   */
  private calculateSkillsMatch(userSkills: string[], jobRequirements: string[], jobTechnologies: string[]): {
    score: number
    matchedSkills: string[]
    missingCritical: string[]
    missingPreferred: string[]
  } {
    const allJobSkills = [...jobRequirements, ...jobTechnologies].map(s => s.toLowerCase())
    const userSkillsLower = userSkills.map(s => s.toLowerCase())
    
    // Categorize job skills
    const criticalSkills = jobRequirements.slice(0, Math.ceil(jobRequirements.length * 0.7))
    const preferredSkills = jobRequirements.slice(criticalSkills.length)
    
    // Calculate matches
    const matchedSkills = userSkillsLower.filter(skill => 
      allJobSkills.some(jobSkill => this.skillsSimilar(skill, jobSkill))
    )
    
    const criticalMatches = criticalSkills.filter(skill =>
      userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, skill.toLowerCase()))
    )
    
    const preferredMatches = preferredSkills.filter(skill =>
      userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, skill.toLowerCase()))
    )
    
    // Score calculation: 70% critical skills, 30% preferred skills
    const criticalScore = criticalSkills.length > 0 ? (criticalMatches.length / criticalSkills.length) * 70 : 70
    const preferredScore = preferredSkills.length > 0 ? (preferredMatches.length / preferredSkills.length) * 30 : 30
    
    const score = Math.min(100, criticalScore + preferredScore)
    
    return {
      score,
      matchedSkills,
      missingCritical: criticalSkills.filter(skill => 
        !criticalMatches.includes(skill)
      ),
      missingPreferred: preferredSkills.filter(skill =>
        !preferredMatches.includes(skill)
      )
    }
  }

  /**
   * Calculate experience level matching
   */
  private calculateExperienceMatch(userExperience: number, jobExperience: string): number {
    const experienceMapping = {
      'entry': { min: 0, max: 2 },
      'junior': { min: 1, max: 3 },
      'mid': { min: 3, max: 6 },
      'senior': { min: 5, max: 10 },
      'principal': { min: 8, max: 15 },
      'director': { min: 10, max: 20 }
    }
    
    const jobExp = experienceMapping[jobExperience as keyof typeof experienceMapping]
    if (!jobExp) return 70 // Default score if experience level unclear
    
    // Perfect match if within range
    if (userExperience >= jobExp.min && userExperience <= jobExp.max) {
      return 100
    }
    
    // Calculate distance penalty
    let distance: number
    if (userExperience < jobExp.min) {
      distance = jobExp.min - userExperience
    } else {
      distance = userExperience - jobExp.max
    }
    
    // Reduce score by 10 points per year difference, minimum 20
    return Math.max(20, 100 - (distance * 10))
  }

  /**
   * Calculate location matching score
   */
  private calculateLocationMatch(
    userLocation: string | undefined,
    workStyle: string | undefined,
    jobLocation: string,
    jobRemote: boolean
  ): number {
    // Remote work preference
    if (workStyle === 'remote' && jobRemote) return 100
    if (workStyle === 'remote' && !jobRemote) return 30
    
    // On-site preference
    if (workStyle === 'onsite' && jobRemote) return 40
    
    // Location-based matching
    if (!userLocation || !jobLocation) return 60
    
    const userLocationLower = userLocation.toLowerCase()
    const jobLocationLower = jobLocation.toLowerCase()
    
    // Exact city match
    if (userLocationLower.includes(jobLocationLower) || jobLocationLower.includes(userLocationLower)) {
      return 100
    }
    
    // Same state/region match
    const userParts = userLocation.split(',').map(s => s.trim().toLowerCase())
    const jobParts = jobLocation.split(',').map(s => s.trim().toLowerCase())
    
    if (userParts.some(part => jobParts.includes(part))) {
      return 80
    }
    
    // Gaming hub bonus - major gaming cities get higher scores
    const gamingHubs = ['san francisco', 'los angeles', 'seattle', 'austin', 'montreal', 'london', 'tokyo']
    if (gamingHubs.some(hub => jobLocationLower.includes(hub))) {
      return 70
    }
    
    return 50
  }

  /**
   * Calculate salary expectation matching
   */
  private calculateSalaryMatch(
    userSalaryExpectation: { min: number; max: number } | undefined,
    jobSalary: { min: number; max: number } | string | undefined
  ): number {
    if (!userSalaryExpectation || !jobSalary) return 70
    
    if (typeof jobSalary === 'string') return 70 // Can't compare string salary
    
    // Check overlap
    const userMin = userSalaryExpectation.min
    const userMax = userSalaryExpectation.max
    const jobMin = jobSalary.min
    const jobMax = jobSalary.max
    
    // Perfect overlap
    if (jobMin >= userMin && jobMax <= userMax) return 100
    
    // Partial overlap
    if (jobMax >= userMin && jobMin <= userMax) {
      const overlapSize = Math.min(jobMax, userMax) - Math.max(jobMin, userMin)
      const userRange = userMax - userMin
      return Math.max(60, 60 + (overlapSize / userRange) * 40)
    }
    
    // No overlap but close
    const distance = Math.min(
      Math.abs(jobMax - userMin),
      Math.abs(userMax - jobMin)
    )
    
    const avgSalary = (userMin + userMax) / 2
    const distancePercent = distance / avgSalary
    
    return Math.max(20, 100 - (distancePercent * 100))
  }

  /**
   * Calculate culture/company fit
   */
  private calculateCultureMatch(
    userInterests: string[],
    company: string,
    studioType: string | undefined
  ): number {
    let score = 60 // Base score
    
    // Studio type preferences
    if (studioType) {
      const interestsLower = userInterests.map(i => i.toLowerCase())
      
      // AAA studio bonuses
      if (studioType === 'AAA' && interestsLower.some(i => 
        ['aaa', 'large team', 'big budget', 'console', 'blockbuster'].includes(i)
      )) {
        score += 20
      }
      
      // Indie studio bonuses  
      if (studioType === 'Indie' && interestsLower.some(i =>
        ['indie', 'small team', 'creative freedom', 'innovation', 'experimental'].includes(i)
      )) {
        score += 20
      }
      
      // Mobile game bonuses
      if (studioType === 'Mobile' && interestsLower.some(i =>
        ['mobile', 'casual games', 'f2p', 'social games'].includes(i)
      )) {
        score += 15
      }
    }
    
    // Company recognition bonus
    const recognizedStudios = ['epic games', 'blizzard', 'valve', 'riot games', 'nintendo', 'sony', 'microsoft']
    if (recognizedStudios.some(studio => company.toLowerCase().includes(studio))) {
      score += 10
    }
    
    return Math.min(100, score)
  }

  /**
   * Calculate technology stack matching
   */
  private calculateTechnologyMatch(userTechnologies: string[], jobTechnologies: string[]): number {
    if (jobTechnologies.length === 0) return 80
    
    const userTechLower = userTechnologies.map(t => t.toLowerCase())
    const jobTechLower = jobTechnologies.map(t => t.toLowerCase())
    
    const matches = jobTechLower.filter(tech =>
      userTechLower.some(userTech => this.skillsSimilar(userTech, tech))
    )
    
    const matchPercentage = matches.length / jobTechnologies.length
    return Math.round(matchPercentage * 100)
  }

  /**
   * Analyze skill gaps and provide recommendations
   */
  private analyzeSkillGaps(
    userSkills: string[],
    jobRequirements: string[],
    jobTechnologies: string[]
  ): { missingSkills: string[]; recommendedSkills: string[]; strengths: string[] } {
    const userSkillsLower = userSkills.map(s => s.toLowerCase())
    const allJobSkills = [...jobRequirements, ...jobTechnologies]
    
    const missingSkills = allJobSkills.filter(skill =>
      !userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, skill.toLowerCase()))
    )
    
    const strengths = userSkills.filter(skill =>
      allJobSkills.some(jobSkill => this.skillsSimilar(skill.toLowerCase(), jobSkill.toLowerCase()))
    )
    
    // Recommend complementary skills based on matched skills
    const recommendedSkills = this.getComplementarySkills(strengths)
    
    return { missingSkills, recommendedSkills, strengths }
  }

  /**
   * Identify areas for improvement based on match breakdown
   */
  private identifyImprovementAreas(
    breakdown: Record<string, number>
  ): string[] {
    const areas: string[] = []
    
    if (breakdown.skillsMatch < 70) {
      areas.push('skills')
    }
    
    if (breakdown.experienceMatch < 60) {
      areas.push('experience')
    }
    
    if (breakdown.technologyMatch < 60) {
      areas.push('technology')
    }
    
    if (breakdown.locationMatch < 50 && breakdown.locationMatch > 0) {
      areas.push('location')
    }
    
    return areas
  }

  /**
   * Get complementary skills based on existing skills
   */
  private getComplementarySkills(userSkills: string[]): string[] {
    const skillComplements: Record<string, string[]> = {
      'unity': ['c#', 'game design', 'mobile development'],
      'unreal engine': ['c++', 'blueprint', '3d modeling'],
      'c++': ['unreal engine', 'game optimization', 'graphics programming'],
      'c#': ['unity', '.net', 'gameplay programming'],
      'game design': ['unity', 'balancing', 'user research'],
      '3d modeling': ['blender', 'maya', 'texturing'],
      'ui/ux': ['figma', 'user research', 'prototyping']
    }
    
    const recommendations = new Set<string>()
    
    userSkills.forEach(skill => {
      const complements = skillComplements[skill.toLowerCase()]
      if (complements) {
        complements.forEach(complement => recommendations.add(complement))
      }
    })
    
    return Array.from(recommendations).filter(rec => 
      !userSkills.some(skill => skill.toLowerCase() === rec.toLowerCase())
    )
  }

  /**
   * Check if two skills are similar (handles variations, abbreviations)
   */
  private skillsSimilar(skill1: string, skill2: string): boolean {
    skill1 = skill1.toLowerCase().trim()
    skill2 = skill2.toLowerCase().trim()
    
    if (skill1 === skill2) return true
    
    // Handle common variations
    const variations: Record<string, string[]> = {
      'javascript': ['js', 'node.js', 'nodejs'],
      'typescript': ['ts'],
      'c++': ['cpp', 'c plus plus'],
      'c#': ['csharp', 'c sharp'],
      'python': ['py'],
      'unreal engine': ['ue4', 'ue5', 'unreal'],
      'unity': ['unity3d'],
      'photoshop': ['ps', 'adobe photoshop'],
      'maya': ['autodesk maya', '3ds max'],
      'git': ['version control', 'source control']
    }
    
    // Check if either skill has variations that match the other
    for (const [main, vars] of Object.entries(variations)) {
      if ((skill1 === main && vars.includes(skill2)) ||
          (skill2 === main && vars.includes(skill1)) ||
          (vars.includes(skill1) && vars.includes(skill2))) {
        return true
      }
    }
    
    // Partial matching for compound skills
    if (skill1.includes(skill2) || skill2.includes(skill1)) {
      return skill1.length > 2 && skill2.length > 2 // Avoid matching single letters
    }
    
    return false
  }

  /**
   * Extract user criteria from profile
   */
  private extractUserCriteria(profile: UserProfile): JobMatchCriteria {
    // Handle both legacy array format and new object format for skills
    let skillsArray: string[] = [];
    if (profile.skills) {
      if (Array.isArray(profile.skills)) {
        // Legacy format: skills is already an array
        skillsArray = profile.skills;
      } else if (typeof profile.skills === 'object' && profile.skills !== null) {
        // New format: skills is an object with categories
        const skillsObj = profile.skills as any; // Type assertion for object format
        skillsArray = [
          ...(skillsObj.technical || []),
          ...(skillsObj.soft || []),
          ...(skillsObj.languages || []),
          ...(skillsObj.tools || []),
          ...(skillsObj.frameworks || []),
          ...(skillsObj.gaming || [])
        ];
      }
    }

    return {
      skills: skillsArray,
      experience: profile.experience || 0,
      interests: profile.interests || [],
      location: profile.location,
      salaryExpectation: profile.salaryExpectation,
      workStyle: profile.workStyle,
      rolePreferences: profile.rolePreferences || [],
      companySize: profile.companySize,
      technologies: profile.technologies || []
    }
  }

  /**
   * Generate personalized job recommendations
   */
  generateRecommendations(
    userProfile: UserProfile,
    jobs: Job[],
    limit: number = 10
  ): MatchResult[] {
    const matches = jobs.map(job => this.calculateMatchScore(userProfile, job))
    
    return matches
      .filter(match => match.matchScore >= 60) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
  }

  /**
   * Analyze skill gaps across multiple job applications
   */
  analyzeSkillGapsForJobs(
    userProfile: UserProfile,
    jobs: Job[]
  ): SkillGapAnalysis {
    const allRequiredSkills = new Set<string>()
    const allTechnologies = new Set<string>()
    
    jobs.forEach((job: Job) => {
      const reqs: string[] = job.requirements ?? []
      for (const skill of reqs) { allRequiredSkills.add(skill) }
      const techs: string[] = job.technologies ?? []
      for (const tech of techs) { allTechnologies.add(tech) }
    })
    
    const userSkillsLower = (userProfile.skills || []).map(s => s.toLowerCase())
    const missingCritical: string[] = []
    const missingPreferred: string[] = []
    const strengthAreas: string[] = []
    
    Array.from(allRequiredSkills).forEach((skill: string) => {
      if (!userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, skill.toLowerCase()))) {
        const frequency = jobs.filter((job: Job) => (job.requirements || []).includes(skill)).length
        if (frequency >= jobs.length * 0.6) { // Present in 60%+ of jobs
          missingCritical.push(skill)
        } else {
          missingPreferred.push(skill)
        }
      } else {
        strengthAreas.push(skill)
      }
    })
    
    const recommendedLearning = this.generateLearningRecommendations(
      missingCritical,
      missingPreferred
    )
    
    return {
      missingCriticalSkills: missingCritical,
      missingPreferredSkills: missingPreferred,
      strengthAreas,
      recommendedLearning
    }
  }

  /**
   * Generate learning recommendations for missing skills
   */
  private generateLearningRecommendations(
    criticalSkills: string[],
    preferredSkills: string[]
  ): SkillGapAnalysis['recommendedLearning'] {
    const learningResources: Record<string, {
      priority: 'high' | 'medium' | 'low'
      resources: string[]
      estimatedTime: string
    }> = {
      'unity': {
        priority: 'high',
        resources: ['Unity Learn', 'Coursera Unity Courses', 'YouTube Unity Tutorials'],
        estimatedTime: '2-3 months'
      },
      'c#': {
        priority: 'high',
        resources: ['Microsoft Learn C#', 'Codecademy C#', 'C# Fundamentals'],
        estimatedTime: '1-2 months'
      },
      'game design': {
        priority: 'medium',
        resources: ['Game Design Workshop', 'Extra Credits', 'Game Design Documents'],
        estimatedTime: '3-6 months'
      }
      // Add more skill resources...
    }
    
    const recommendations: SkillGapAnalysis['recommendedLearning'] = []
    
    // High priority for critical skills
    criticalSkills.forEach(skill => {
      const resource = learningResources[skill.toLowerCase()]
      recommendations.push({
        skill,
        priority: 'high',
        resources: resource?.resources || ['Online courses', 'Documentation', 'Practice projects'],
        estimatedTimeToLearn: resource?.estimatedTime || '1-3 months'
      })
    })
    
    // Medium/low priority for preferred skills
    preferredSkills.forEach(skill => {
      const resource = learningResources[skill.toLowerCase()]
      recommendations.push({
        skill,
        priority: 'medium',
        resources: resource?.resources || ['Online tutorials', 'Community resources'],
        estimatedTimeToLearn: resource?.estimatedTime || '2-4 weeks'
      })
    })
    
    return recommendations
  }
}

// Singleton instance
export const jobMatchingService = new JobMatchingService()
