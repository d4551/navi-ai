/**
 * CANONICAL MAIN PROCESS JOB MATCHING SERVICE
 * Mirrors logic from src/services/JobMatchingService.ts (adapted to CJS)
 */

class JobMatchingService {
  constructor() {
    this.SKILL_WEIGHT = 0.35
    this.EXPERIENCE_WEIGHT = 0.25
    this.LOCATION_WEIGHT = 0.15
    this.SALARY_WEIGHT = 0.10
    this.CULTURE_WEIGHT = 0.10
    this.TECHNOLOGY_WEIGHT = 0.05
  }

  calculateMatchScore(userProfile, job) {
    const criteria = this.extractUserCriteria(userProfile)

    const jobReq = Array.isArray(job.requirements) ? job.requirements : this.parseList(job.requirements)
    const jobTech = Array.isArray(job.technologies) ? job.technologies : this.parseList(job.technologies)

    const skillsMatch = this.calculateSkillsMatch(criteria.skills, jobReq, jobTech)
    const experienceMatch = this.calculateExperienceMatch(criteria.experience, job.experienceLevel)
    const locationMatch = this.calculateLocationMatch(criteria.location, criteria.workStyle, job.location || '', !!job.remote)
    const salaryMatch = this.calculateSalaryMatch(criteria.salaryExpectation, job.salary)
    const cultureMatch = this.calculateCultureMatch(criteria.interests, job.company || '', job.studioType)
    const technologyMatch = this.calculateTechnologyMatch(criteria.technologies, jobTech)

    const matchScore = Math.round(
      skillsMatch.score * this.SKILL_WEIGHT +
      experienceMatch * this.EXPERIENCE_WEIGHT +
      locationMatch * this.LOCATION_WEIGHT +
      salaryMatch * this.SALARY_WEIGHT +
      cultureMatch * this.CULTURE_WEIGHT +
      technologyMatch * this.TECHNOLOGY_WEIGHT
    )

    const { missingSkills, recommendedSkills, strengths } = this.analyzeSkillGaps(criteria.skills, jobReq, jobTech)

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

  parseList(val) {
    if (!val) return []
    if (typeof val === 'string') {
      return val.split(/[;,\n]/).map(s => s.trim()).filter(Boolean)
    }
    return []
  }

  calculateSkillsMatch(userSkills, jobRequirements, jobTechnologies) {
    const allJobSkills = [...(jobRequirements || []), ...(jobTechnologies || [])].map(s => String(s || '').toLowerCase())
    const userSkillsLower = (userSkills || []).map(s => String(s || '').toLowerCase())

    const criticalSkills = (jobRequirements || []).slice(0, Math.ceil((jobRequirements || []).length * 0.7))
    const preferredSkills = (jobRequirements || []).slice(criticalSkills.length)

    const matchedSkills = userSkillsLower.filter(skill => allJobSkills.some(jobSkill => this.skillsSimilar(skill, jobSkill)))
    const criticalMatches = criticalSkills.filter(skill => userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, String(skill || '').toLowerCase())))
    const preferredMatches = preferredSkills.filter(skill => userSkillsLower.some(userSkill => this.skillsSimilar(userSkill, String(skill || '').toLowerCase())))

    const criticalScore = criticalSkills.length > 0 ? (criticalMatches.length / criticalSkills.length) * 70 : 70
    const preferredScore = preferredSkills.length > 0 ? (preferredMatches.length / preferredSkills.length) * 30 : 30

    const score = Math.min(100, Math.round(criticalScore + preferredScore))
    return {
      score,
      matchedSkills,
      missingCritical: criticalSkills.filter(s => !criticalMatches.includes(s)),
      missingPreferred: preferredSkills.filter(s => !preferredMatches.includes(s))
    }
  }

  calculateExperienceMatch(userExperience, jobExperience) {
    const map = {
      'entry': { min: 0, max: 2 },
      'junior': { min: 1, max: 3 },
      'mid': { min: 3, max: 6 },
      'senior': { min: 5, max: 10 },
      'principal': { min: 8, max: 15 },
      'director': { min: 10, max: 20 }
    }
    const jobExp = map[jobExperience] || null
    if (!jobExp) return 70
    if (userExperience >= jobExp.min && userExperience <= jobExp.max) return 100
    const distance = userExperience < jobExp.min ? (jobExp.min - userExperience) : (userExperience - jobExp.max)
    return Math.max(20, 100 - (distance * 10))
  }

  calculateLocationMatch(userLocation, workStyle, jobLocation, jobRemote) {
    if (workStyle === 'remote' && jobRemote) return 100
    if (workStyle === 'remote' && !jobRemote) return 30
    if (workStyle === 'onsite' && jobRemote) return 40
    if (!userLocation || !jobLocation) return 60
    const u = String(userLocation).toLowerCase()
    const j = String(jobLocation).toLowerCase()
    if (u.includes(j) || j.includes(u)) return 100
    const up = String(userLocation).split(',').map(s => s.trim().toLowerCase())
    const jp = String(jobLocation).split(',').map(s => s.trim().toLowerCase())
    if (up.some(part => jp.includes(part))) return 80
    const hubs = ['san francisco', 'los angeles', 'seattle', 'austin', 'montreal', 'london', 'tokyo']
    if (hubs.some(h => j.includes(h))) return 70
    return 50
  }

  calculateSalaryMatch(userSalaryExpectation, jobSalary) {
    if (!userSalaryExpectation || !jobSalary) return 70
    if (typeof jobSalary === 'string') return 70
    const userMin = Number(userSalaryExpectation.min || 0)
    const userMax = Number(userSalaryExpectation.max || userMin)
    const jobMin = Number(jobSalary.min || 0)
    const jobMax = Number(jobSalary.max || jobMin)
    if (jobMin >= userMin && jobMax <= userMax) return 100
    if (jobMax >= userMin && jobMin <= userMax) {
      const overlapSize = Math.min(jobMax, userMax) - Math.max(jobMin, userMin)
      const userRange = Math.max(1, userMax - userMin)
      return Math.max(60, 60 + (overlapSize / userRange) * 40)
    }
    const distance = Math.min(Math.abs(jobMax - userMin), Math.abs(userMax - jobMin))
    const avg = (userMin + userMax) / 2 || 1
    const distancePercent = distance / avg
    return Math.max(20, Math.round(100 - (distancePercent * 100)))
  }

  calculateCultureMatch(userInterests, company, studioType) {
    let score = 60
    const interestsLower = (userInterests || []).map(i => String(i).toLowerCase())
    if (studioType) {
      if (String(studioType) === 'AAA' && interestsLower.some(i => ['aaa','large team','big budget','console','blockbuster'].includes(i))) score += 20
      if (String(studioType) === 'Indie' && interestsLower.some(i => ['indie','small team','creative freedom','innovation','experimental'].includes(i))) score += 20
      if (String(studioType) === 'Mobile' && interestsLower.some(i => ['mobile','casual games','f2p','social games'].includes(i))) score += 15
    }
    const recognized = ['epic games','blizzard','valve','riot games','nintendo','sony','microsoft']
    if (recognized.some(r => String(company || '').toLowerCase().includes(r))) score += 10
    return Math.min(100, score)
  }

  calculateTechnologyMatch(userTechnologies, jobTechnologies) {
    const jobTechLower = (jobTechnologies || []).map(t => String(t).toLowerCase())
    const userTechLower = (userTechnologies || []).map(t => String(t).toLowerCase())
    if (jobTechLower.length === 0) return 80
    const matches = jobTechLower.filter(tech => userTechLower.some(userTech => this.skillsSimilar(userTech, tech)))
    const pct = matches.length / jobTechnologies.length
    return Math.round(60 + Math.min(40, pct * 40))
  }

  analyzeSkillGaps(userSkills, jobRequirements, jobTechnologies) {
    const allReq = new Set([...(jobRequirements || []), ...(jobTechnologies || [])])
    const userLower = (userSkills || []).map(s => String(s).toLowerCase())
    const missing = [], strengths = []
    Array.from(allReq).forEach(skill => {
      if (!userLower.some(u => this.skillsSimilar(u, String(skill).toLowerCase()))) strengths.push ? null : null
    })
    Array.from(allReq).forEach(skill => {
      if (!userLower.some(u => this.skillsSimilar(u, String(skill).toLowerCase()))) missing.push(skill)
    })
    const recommendedSkills = missing.slice(0, 5)
    return { missingSkills: missing, recommendedSkills, strengths }
  }

  identifyImprovementAreas(parts) {
    const entries = Object.entries(parts || {})
    return entries
      .filter(([, score]) => (score || 0) < 70)
      .sort((a,b) => (a[1]||0)-(b[1]||0))
      .map(([k]) => k)
  }

  skillsSimilar(skill1, skill2) {
    skill1 = String(skill1).toLowerCase().trim()
    skill2 = String(skill2).toLowerCase().trim()
    if (skill1 === skill2) return true
    const variations = {
      'javascript': ['js','node.js','nodejs'],
      'typescript': ['ts'],
      'c++': ['cpp','c plus plus'],
      'c#': ['csharp','c sharp'],
      'python': ['py'],
      'unreal engine': ['ue4','ue5','unreal'],
      'unity': ['unity3d'],
      'photoshop': ['ps','adobe photoshop'],
      'maya': ['autodesk maya','3ds max'],
      'git': ['version control','source control']
    }
    for (const [main, vars] of Object.entries(variations)) {
      if ((skill1 === main && vars.includes(skill2)) || (skill2 === main && vars.includes(skill1)) || (vars.includes(skill1) && vars.includes(skill2))) {
        return true
      }
    }
    if (skill1.includes(skill2) || skill2.includes(skill1)) {
      return skill1.length > 2 && skill2.length > 2
    }
    return false
  }

  extractUserCriteria(profile) {
    profile = profile || {}
    return {
      skills: profile.skills || [],
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

  generateRecommendations(userProfile, jobs, limit = 10) {
    const matches = (jobs || []).map(job => this.calculateMatchScore(userProfile, job))
    return matches.filter(m => (m.matchScore || 0) >= 60).sort((a,b)=>b.matchScore - a.matchScore).slice(0, limit)
  }
}

module.exports = { JobMatchingService }

