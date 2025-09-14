/**
 * AI-Powered Job Matching Service
 * Provides semantic job search, intelligent matching, and market analysis 
 * for gaming industry positions using advanced AI algorithms.
 * Integrates with studio data for comprehensive job-studio matching.
 */

import { aiService } from '@/shared/services/AIService'
import { logger } from '@/shared/utils/logger'
import { GameStudioService } from '@/services/GameStudioService'

class AIJobMatchingService {
  constructor() {
    this.matchingCache = new Map()
    this.insightsCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    this.studioService = GameStudioService.getInstance()
  }

  /**
   * Perform intelligent semantic job search using AI
   */
  async performSemanticSearch(searchQuery, userProfile = {}, options = {}) {
    try {
      // Initialize AI service if needed
      try {
        await aiService.initialize({
          primaryProvider: 'google',
          enableContextPersistence: true,
          enableRealTime: false
        })
      } catch (error) {
        throw new Error('AI service not initialized. Please configure your API key in settings.')
      }
      
      const systemInstructions = `You are an expert gaming industry recruiter and job matching specialist. Analyze the user's search intent and provide intelligent job search insights.

Your task is to:
1. Parse the natural language job search query
2. Extract key requirements, preferences, and skills
3. Identify optimal search terms and filters
4. Suggest improvements to maximize relevant results
5. Provide market insights specific to gaming careers

GAMING INDUSTRY CONTEXT:
- Focus on gaming studios, publishers, esports, and gaming tech companies
- Understand transferable skills from competitive gaming to professional roles
- Consider remote work trends in gaming industry
- Account for gaming-specific roles (Game Designer, Community Manager, Esports Coordinator, etc.)

USER PROFILE: ${JSON.stringify(userProfile)}

Return JSON response:
{
  "searchAnalysis": {
    "extractedRoles": ["role1", "role2"],
    "keySkills": ["skill1", "skill2"],
    "experienceLevel": "junior|mid|senior|lead",
    "preferredLocations": ["location1", "location2"],
    "salaryRange": { "min": 65000, "max": 95000 },
    "workType": "remote|hybrid|onsite",
    "industrySegments": ["AAA", "Indie", "Mobile", "Esports"]
  },
  "enhancedSearchTerms": {
    "primary": ["term1", "term2"],
    "secondary": ["term3", "term4"],
    "exclude": ["exclude1", "exclude2"]
  },
  "matchingScore": 0.85,
  "recommendations": {
    "queryImprovements": ["suggestion1", "suggestion2"],
    "additionalFilters": ["filter1", "filter2"],
    "expandedSearch": ["expansion1", "expansion2"]
  },
  "marketInsights": {
    "demandLevel": "high|medium|low",
    "trendingSkills": ["skill1", "skill2"],
    "salaryBenchmark": "above|at|below market",
    "competitionLevel": "high|medium|low",
    "tips": ["tip1", "tip2"]
  }
}`

      const prompt = `Analyze this gaming industry job search query: "${searchQuery}"
      
Search Parameters:
- Location: ${options.location || 'Any'}
- Experience: ${options.experience || 'All levels'}
- Job Type: ${options.type || 'Full-time'}
- Remote: ${options.remote ? 'Yes' : 'No'}
- Salary Range: $${options.salaryMin || 0} - $${options.salaryMax || 'unlimited'}

Provide comprehensive semantic analysis and recommendations for optimal job matching.`

      const contextInfo = `USER PROFILE: ${JSON.stringify(userProfile)}
SEARCH OPTIONS: ${JSON.stringify(_options)}

Analyze this gaming industry job search query and provide comprehensive semantic analysis and recommendations for optimal job matching.`

      const response = await aiService.chat({
        message: `Analyze this gaming industry job search query: "${searchQuery}"

Search Parameters:
- Location: ${options.location || 'Any'}
- Experience: ${options.experience || 'All levels'}
- Job Type: ${options.type || 'Full-time'}
- Remote: ${options.remote ? 'Yes' : 'No'}
- Salary Range: $${options.salaryMin || 0} - $${options.salaryMax || 'unlimited'}`,
        context: contextInfo,
        type: 'analysis'
      })

      // Try to parse as JSON, fallback to structured analysis
      let analysis
      try {
        analysis = JSON.parse(response.content)
      } catch {
        analysis = this.parseSearchAnalysisFromText(response.content, searchQuery, options)
      }
      
      // Cache the results
      const cacheKey = this.createCacheKey('search', searchQuery, options)
      this.matchingCache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now()
      })

      logger.info('Semantic job search analysis completed')
      return {
        success: true,
        analysis,
        suggestions: this.generateSearchSuggestions(analysis),
        insights: this.generateJobInsights(analysis)
      }
    } catch (error) {
      logger.error('Semantic search analysis failed:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackSearchAnalysis(searchQuery, options)
      }
    }
  }

  /**
   * Match job listings against user profile using AI scoring
   */
  async matchJobsToProfile(jobListings, userProfile, searchContext = {}) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady()
      if (!initialized) {
        throw new Error('AI service not initialized. Please configure your API key in settings.')
      }

      const systemInstructions = `You are an AI career matching specialist focused on gaming industry placements. Score and rank job opportunities based on fit with the candidate's profile.

SCORING CRITERIA:
1. Skill Match (30%) - Technical and soft skills alignment
2. Experience Fit (25%) - Role level and background compatibility  
3. Gaming Passion (20%) - Industry enthusiasm and relevant gaming experience
4. Culture Fit (15%) - Company values and work environment match
5. Growth Potential (10%) - Career advancement opportunities

GAMING INDUSTRY FACTORS:
- Value competitive gaming experience highly
- Consider community management and content creation skills
- Account for remote work preferences common in gaming
- Recognize transferable skills from gaming leadership roles

Return JSON with scored and ranked jobs:
{
  "rankedJobs": [
    {
      "jobId": "job123",
      "overallScore": 0.89,
      "categoryScores": {
        "skillMatch": 0.92,
        "experienceFit": 0.85,
        "gamingPassion": 0.90,
        "cultureFit": 0.88,
        "growthPotential": 0.84
      },
      "matchReasons": ["reason1", "reason2"],
      "concerns": ["concern1"],
      "recommendations": ["rec1", "rec2"]
    }
  ],
  "summary": {
    "totalMatches": 10,
    "highMatches": 3,
    "mediumMatches": 5,
    "lowMatches": 2,
    "averageScore": 0.76
  }
}`

      const jobData = jobListings.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description?.substring(0, 500),
        requirements: job.requirements,
        location: job.location,
        remote: job.remote,
        salary: job.salary
      }))

      const prompt = `Match these ${jobListings.length} gaming industry jobs to the candidate profile:

CANDIDATE PROFILE: ${JSON.stringify(userProfile)}

SEARCH CONTEXT: ${JSON.stringify(searchContext)}

JOBS TO MATCH: ${JSON.stringify(jobData)}

Provide detailed matching scores and explanations for optimal job recommendations.`

      const response = await aiService.chat({
        message: prompt,
        type: 'analysis',
        metadata: { jobData, userProfile, searchContext }
      })

      const matchResults = JSON.parse(response.content || response)
      
      // Enrich results with studio data for enhanced matching
      const enrichedJobs = await this.enrichJobsWithStudioData(jobListings, userProfile)
      
      logger.info(`AI job matching completed for ${jobListings.length} positions with studio data integration`)
      return {
        success: true,
        matches: matchResults.rankedJobs,
        enrichedJobs,
        summary: matchResults.summary,
        recommendations: this.generateMatchingRecommendations(matchResults)
      }
    } catch (error) {
      logger.error('AI job matching failed:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackMatching(jobListings, userProfile)
      }
    }
  }

  /**
   * Generate personalized job search insights using market data
   */
  async generateJobSearchInsights(searchQuery, userProfile = {}, marketData = {}) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady()
      if (!initialized) {
        throw new Error('AI service not initialized. Please configure your API key in settings.')
      }

      const systemInstructions = `You are a gaming industry career advisor providing personalized job search insights. Analyze market trends, salary data, and career opportunities.

Focus on:
1. Market demand for specific gaming roles
2. Salary benchmarking and negotiation tips
3. Skill gap analysis and recommendations
4. Career pathway suggestions
5. Industry trends affecting job availability

Return actionable insights in JSON format:
{
  "insights": [
    {
      "id": "insight1",
      "type": "market_trend|salary|skills|career|location",
      "priority": "high|medium|low",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "How this affects job search",
      "action": {
        "label": "Action button text",
        "type": "update_search|expand_skills|adjust_salary|change_location",
        "data": {}
      }
    }
  ],
  "marketSummary": {
    "demandLevel": "high|medium|low",
    "competitiveRoles": ["role1", "role2"],
    "emergingOpportunities": ["opp1", "opp2"],
    "skillsInDemand": ["skill1", "skill2"]
  },
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["goal1", "goal2"],
    "longTerm": ["strategy1", "strategy2"]
  }
}`

      const prompt = `Generate personalized job search insights for this gaming industry candidate:

SEARCH QUERY: "${searchQuery}"
CANDIDATE PROFILE: ${JSON.stringify(userProfile)}
MARKET DATA: ${JSON.stringify(marketData)}

Provide strategic insights to optimize their job search success.`

      const response = await aiService.chat({
        message: prompt,
        type: 'analysis',
        metadata: { userProfile, marketData }
      })

      const insights = JSON.parse(response.content || response)
      
      // Cache insights
      const cacheKey = this.createCacheKey('insights', searchQuery, userProfile)
      this.insightsCache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
      })

      logger.info('Job search insights generated successfully')
      return {
        success: true,
        insights: insights.insights,
        marketSummary: insights.marketSummary,
        recommendations: insights.recommendations
      }
    } catch (error) {
      logger.error('Failed to generate job search insights:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackInsights(searchQuery, userProfile)
      }
    }
  }

  /**
   * Analyze salary competitiveness using market data
   */
  async analyzeSalaryCompetitiveness(jobTitle, location, salaryRange, userProfile = {}) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady()
      if (!initialized) {
        throw new Error('AI service not initialized. Please configure your API key in settings.')
      }

      const systemInstructions = `You are a gaming industry compensation expert. Analyze salary competitiveness and provide negotiation insights.

Consider:
1. Gaming industry salary standards
2. Location-based cost of living adjustments
3. Experience level and skill premiums
4. Remote work salary implications
5. Company size and funding stage impact

Return analysis in JSON:
{
  "salaryAnalysis": {
    "competitiveness": "above|at|below",
    "marketPercentile": 75,
    "confidenceLevel": 0.85,
    "adjustedRange": { "min": 75000, "max": 95000 }
  },
  "insights": [
    "Market insight 1",
    "Market insight 2"  
  ],
  "negotiationTips": [
    "tip1", 
    "tip2"
  ],
  "benchmarkData": {
    "similar_roles": ["role1", "role2"],
    "location_factor": 1.15,
    "experience_premium": 0.20
  }
}`

      const prompt = `Analyze salary competitiveness for this gaming industry position:

JOB TITLE: ${jobTitle}
LOCATION: ${location}
SALARY RANGE: $${salaryRange.min} - $${salaryRange.max}
CANDIDATE PROFILE: ${JSON.stringify(userProfile)}

Provide comprehensive salary analysis and negotiation guidance.`

      const response = await aiService.chat({
        message: prompt,
        type: 'analysis',
        metadata: { jobTitle, location, salaryRange, userProfile }
      })

      const analysis = JSON.parse(response.content || response)
      
      logger.info('Salary competitiveness analysis completed')
      return {
        success: true,
        analysis: analysis.salaryAnalysis,
        insights: analysis.insights,
        negotiationTips: analysis.negotiationTips,
        benchmarkData: analysis.benchmarkData
      }
    } catch (error) {
      logger.error('Salary analysis failed:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackSalaryAnalysis(salaryRange, location)
      }
    }
  }

  /**
   * Generate personalized job search recommendations
   */
  async getPersonalizedRecommendations(userProfile, searchHistory = [], currentSearch = {}) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady()
      if (!initialized) {
        throw new Error('AI service not initialized. Please configure your API key in settings.')
      }

      const systemInstructions = `You are a personalized gaming career advisor. Based on the user's profile and search history, provide tailored job search recommendations.

Analyze patterns and provide strategic guidance for:
1. Search optimization
2. Skill development priorities  
3. Profile enhancement suggestions
4. Network building strategies
5. Application timing and approach

Return recommendations in JSON:
{
  "personalizedTips": [
    {
      "category": "search|profile|skills|network|application",
      "priority": "high|medium|low", 
      "title": "Recommendation title",
      "description": "Detailed guidance",
      "action": "Specific next step"
    }
  ],
  "profileStrengths": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"],
  "skillGaps": ["skill1", "skill2"],
  "opportunityTrends": ["trend1", "trend2"]
}`

      const prompt = `Provide personalized job search recommendations based on:

USER PROFILE: ${JSON.stringify(userProfile)}
SEARCH HISTORY: ${JSON.stringify(searchHistory.slice(-5))}
CURRENT SEARCH: ${JSON.stringify(currentSearch)}

Focus on gaming industry career advancement and optimization strategies.`

      const response = await aiService.chat({
        message: prompt,
        type: 'analysis',
        metadata: { userProfile, searchHistory, currentSearch }
      })

      const recommendations = JSON.parse(response.content || response)
      
      logger.info('Personalized recommendations generated')
      return {
        success: true,
        recommendations: recommendations.personalizedTips,
        strengths: recommendations.profileStrengths,
        improvements: recommendations.improvementAreas,
        skillGaps: recommendations.skillGaps,
        trends: recommendations.opportunityTrends
      }
    } catch (error) {
      logger.error('Failed to generate personalized recommendations:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackRecommendations(userProfile)
      }
    }
  }

  // Helper method to parse search analysis from text when JSON parsing fails
  parseSearchAnalysisFromText(responseText, searchQuery, options) {
    // Extract relevant information from text response
    const lines = responseText.split('\n').filter(line => line.trim());
    
    // Basic fallback structure
    return {
      searchAnalysis: {
        extractedRoles: this.extractRolesFromText(responseText),
        keySkills: this.extractSkillsFromText(responseText),
        experienceLevel: options.experience || 'mid',
        preferredLocations: options.location ? [options.location] : ['Remote'],
        workType: options.remote ? 'remote' : 'hybrid'
      },
      enhancedSearchTerms: {
        primary: [searchQuery],
        secondary: [],
        exclude: []
      },
      matchingScore: 0.75,
      recommendations: {
        queryImprovements: ['Be more specific about role level', 'Add preferred technologies'],
        additionalFilters: ['Location', 'Company size'],
        expandedSearch: ['Related gaming roles']
      },
      marketInsights: {
        demandLevel: 'medium',
        trendingSkills: ['Unity', 'Unreal Engine', 'Community Management'],
        salaryBenchmark: 'at market',
        competitionLevel: 'medium',
        tips: ['Highlight gaming experience', 'Show portfolio projects']
      }
    }
  }

  extractRolesFromText(text) {
    const commonRoles = ['Game Developer', 'Game Designer', 'Community Manager', 'QA Tester', 'Producer'];
    return commonRoles.filter(role => 
      text.toLowerCase().includes(role.toLowerCase().replace(' ', ''))
    ).slice(0, 3);
  }

  extractSkillsFromText(text) {
    const commonSkills = ['Unity', 'Unreal Engine', 'C#', 'JavaScript', 'Leadership', 'Communication'];
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 5);
  }

  // Utility methods

  createCacheKey(type, ...args) {
    return `${type}_${args.map(arg => JSON.stringify(arg)).join('_')}`
  }

  getCachedResult(cacheMap, key) {
    const cached = cacheMap.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    cacheMap.delete(key) // Remove expired cache
    return null
  }

  generateSearchSuggestions(analysis) {
    const suggestions = []
    
    if (analysis.searchAnalysis?.extractedRoles) {
      suggestions.push(...analysis.searchAnalysis.extractedRoles.slice(0, 3))
    }
    
    if (analysis.enhancedSearchTerms?.primary) {
      suggestions.push(...analysis.enhancedSearchTerms.primary.slice(0, 2))
    }
    
    return suggestions.filter(Boolean).slice(0, 8)
  }

  generateJobInsights(analysis) {
    const insights = []
    
    if (analysis.marketInsights?.demandLevel === 'high') {
      insights.push({
        id: 'high_demand',
        icon: 'mdi-trending-up',
        title: 'High Market Demand',
        description: `${analysis.searchAnalysis?.extractedRoles?.[0] || 'These roles'} are seeing increased demand`,
        action: { label: 'View Details', type: 'trend' }
      })
    }
    
    if (analysis.marketInsights?.salaryBenchmark === 'below') {
      insights.push({
        id: 'salary_opt',
        icon: 'mdi-cash',
        title: 'Salary Optimization',
        description: 'Consider expanding range for more opportunities',
        action: { label: 'Adjust Range', type: 'salary' }
      })
    }
    
    if (analysis.searchAnalysis?.workType === 'remote') {
      insights.push({
        id: 'remote_insight',
        icon: 'mdi-home',
        title: 'Remote Opportunities',
        description: 'Strong remote job market in gaming industry',
        action: { label: 'Expand Search', type: 'location' }
      })
    }
    
    return insights.slice(0, 3)
  }

  generateMatchingRecommendations(matchResults) {
    const recommendations = []
    
    if (matchResults.summary.highMatches > 0) {
      recommendations.push('Focus on high-match positions for best success rate')
    }
    
    if (matchResults.summary.averageScore < 0.7) {
      recommendations.push('Consider expanding search criteria or enhancing profile')
    }
    
    return recommendations
  }

  /**
   * Integrate studio data with job matching for enhanced recommendations
   */
  async enrichJobsWithStudioData(jobs, userProfile = {}) {
    try {
      logger.info('Enriching jobs with studio data for enhanced matching')
      
      // Get all unique studio/company names from jobs
      const companyNames = [...new Set(jobs.map(job => job.company).filter(Boolean))]
      
      // Fetch studio data for these companies
      const studioPromises = companyNames.map(async (companyName) => {
        try {
          const studios = await this.studioService.searchStudios({ query: companyName })
          return studios.length > 0 ? { company: companyName, studio: studios[0] } : null
        } catch (error) {
          logger.debug(`Could not fetch studio data for ${companyName}:`, error)
          return null
        }
      })
      
      const studioData = (await Promise.all(studioPromises)).filter(Boolean)
      const studioMap = new Map(studioData.map(item => [item.company, item.studio]))
      
      // Enrich jobs with studio information
      const enrichedJobs = jobs.map(job => {
        const studioInfo = studioMap.get(job.company)
        if (!studioInfo) return job
        
        return {
          ...job,
          studioData: {
            type: studioInfo.type,
            size: studioInfo.size,
            technologies: studioInfo.technologies || [],
            specializations: studioInfo.specializations || [],
            workEnvironment: studioInfo.workEnvironment,
            benefits: studioInfo.benefits || [],
            culture: studioInfo.culture,
            gameGenres: studioInfo.gameGenres || [],
            platforms: studioInfo.platforms || []
          },
          enhancedMatching: {
            studioCultureFit: this.calculateStudioCultureFit(userProfile, studioInfo),
            technologyAlignment: this.calculateTechnologyAlignment(userProfile, studioInfo),
            genreInterest: this.calculateGenreInterest(userProfile, studioInfo)
          }
        }
      })
      
      logger.info(`Enriched ${enrichedJobs.filter(j => j.studioData).length}/${jobs.length} jobs with studio data`)
      return enrichedJobs
      
    } catch (error) {
      logger.error('Failed to enrich jobs with studio data:', error)
      return jobs
    }
  }

  /**
   * Calculate culture fit between user and studio
   */
  calculateStudioCultureFit(userProfile, studioInfo) {
    let score = 0.5 // base score
    
    // Match work style preferences
    if (userProfile.workStyle && studioInfo.workEnvironment) {
      if (userProfile.workStyle === studioInfo.workEnvironment) {
        score += 0.3
      }
    }
    
    // Match company size preference
    if (userProfile.companySize && studioInfo.size) {
      if (userProfile.companySize === studioInfo.size) {
        score += 0.2
      }
    }
    
    return Math.min(1.0, score)
  }

  /**
   * Calculate technology alignment score
   */
  calculateTechnologyAlignment(userProfile, studioInfo) {
    const userTech = userProfile.technologies || []
    const studioTech = studioInfo.technologies || []
    
    if (userTech.length === 0 || studioTech.length === 0) return 0.5
    
    const matches = userTech.filter(tech => 
      studioTech.some(sTech => 
        sTech.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(sTech.toLowerCase())
      )
    ).length
    
    return Math.min(1.0, matches / Math.max(userTech.length, studioTech.length))
  }

  /**
   * Calculate genre interest alignment
   */
  calculateGenreInterest(userProfile, studioInfo) {
    const userInterests = userProfile.gameGenres || userProfile.interests || []
    const studioGenres = studioInfo.gameGenres || []
    
    if (userInterests.length === 0 || studioGenres.length === 0) return 0.5
    
    const matches = userInterests.filter(interest => 
      studioGenres.some(genre => 
        genre.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(genre.toLowerCase())
      )
    ).length
    
    return Math.min(1.0, matches / userInterests.length)
  }

  // Fallback methods for when AI fails

  getFallbackSearchAnalysis(searchQuery, options) {
    return {
      searchAnalysis: {
        extractedRoles: this.extractBasicRoles(searchQuery),
        keySkills: this.extractBasicSkills(searchQuery),
        experienceLevel: options.experience || 'mid'
      },
      enhancedSearchTerms: {
        primary: [searchQuery],
        secondary: []
      },
      recommendations: {
        queryImprovements: ['Add specific skills', 'Include preferred location']
      }
    }
  }

  getFallbackMatching(jobListings, userProfile) {
    return {
      matches: jobListings.map((job, index) => ({
        jobId: job.id,
        overallScore: Math.max(0.5, Math.random() * 0.5),
        matchReasons: ['Basic keyword match']
      })),
      summary: {
        totalMatches: jobListings.length,
        averageScore: 0.65
      }
    }
  }

  getFallbackInsights(searchQuery, userProfile) {
    return {
      insights: [
        {
          id: 'basic_tip',
          type: 'search',
          priority: 'medium',
          title: 'Expand Your Search',
          description: 'Consider related roles and companies',
          action: { label: 'View Tips', type: 'expand' }
        }
      ],
      recommendations: {
        immediate: ['Review and update your profile']
      }
    }
  }

  getFallbackSalaryAnalysis(salaryRange, location) {
    return {
      analysis: {
        competitiveness: 'at',
        marketPercentile: 50,
        confidenceLevel: 0.6
      },
      insights: ['Salary appears competitive for the market'],
      negotiationTips: ['Research industry standards', 'Highlight unique skills']
    }
  }

  getFallbackRecommendations(userProfile) {
    return {
      recommendations: [
        {
          category: 'profile',
          priority: 'high',
          title: 'Complete Your Profile',
          description: 'Add more details about your gaming experience',
          action: 'Update profile sections'
        }
      ],
      strengths: ['Gaming passion'],
      improvements: ['Add specific examples']
    }
  }

  extractBasicRoles(query) {
    const roleKeywords = ['designer', 'developer', 'producer', 'artist', 'manager', 'coordinator']
    return roleKeywords.filter(role => 
      query.toLowerCase().includes(role)
    ).slice(0, 3)
  }

  extractBasicSkills(query) {
    const skillKeywords = ['unity', 'unreal', 'c#', 'javascript', 'leadership', 'teamwork']
    return skillKeywords.filter(skill => 
      query.toLowerCase().includes(skill)
    ).slice(0, 5)
  }
}

// Export singleton instance
export const aiJobMatchingService = new AIJobMatchingService()
export default aiJobMatchingService
