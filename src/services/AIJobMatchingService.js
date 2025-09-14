
import { aiService } from "@/shared/services/AIService";
import { logger } from "@/shared/utils/logger";
import { GameStudioService } from "@/services/GameStudioService";

class AIJobMatchingService {
  constructor() {
    this.matchingCache = new Map();
    this.insightsCache = new Map();
    this.studioService = GameStudioService.getInstance();
  }

  async performSemanticSearch(searchQuery, userProfile = {}, options = {}) {
    try {
      // Initialize AI service if needed
      try {
        await aiService.initialize({
          primaryProvider: "google",
          enableContextPersistence: true,
          enableRealTime: false,
        });
      } catch (_error) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const systemInstructions = `You are an expert gaming industry recruiter and job matching specialist. Analyze the user's search intent and provide intelligent job search insights.

Your task is to:

GAMING INDUSTRY CONTEXT:
- Focus on gaming studios, publishers, esports, and gaming tech companies
- Understand transferable skills from competitive gaming to professional roles
- Consider remote work trends in gaming industry
- Account for gaming-specific roles (Game Designer, Community Manager, Esports Coordinator, etc.)

USER PROFILE: ${JSON.stringify(userProfile)}

Return JSON response:
{
  "searchAnalysis": {
    "experienceLevel": "junior|mid|senior|lead",
    "workType": "remote|hybrid|onsite",
    "industrySegments": ["AAA", "Indie", "Mobile", "Esports"]
  },
  "enhancedSearchTerms": {
  },
  "recommendations": {
  },
  "marketInsights": {
    "demandLevel": "high|medium|low",
    "salaryBenchmark": "above|at|below market",
    "competitionLevel": "high|medium|low",
  }
}`;

      const prompt = `Analyze this gaming industry job search query: "${searchQuery}"
      
Search Parameters:
- Location: ${options.location || "Any"}
- Experience: ${options.experience || "All levels"}
- Job Type: ${options.type || "Full-time"}
- Remote: ${options.remote ? "Yes" : "No"}

Provide comprehensive semantic analysis and recommendations for optimal job matching.`;

      const contextInfo = `USER PROFILE: ${JSON.stringify(userProfile)}
SEARCH OPTIONS: ${JSON.stringify(_options)}

Analyze this gaming industry job search query and provide comprehensive semantic analysis and recommendations for optimal job matching.`;

      const response = await aiService.chat({
        message: `Analyze this gaming industry job search query: "${searchQuery}"

Search Parameters:
- Location: ${options.location || "Any"}
- Experience: ${options.experience || "All levels"}
- Job Type: ${options.type || "Full-time"}
- Remote: ${options.remote ? "Yes" : "No"}
        context: contextInfo,
        type: "analysis",
      });

      // Try to parse as JSON, fallback to structured analysis
      let analysis;
      try {
        analysis = JSON.parse(response.content);
      } catch {
        analysis = this.parseSearchAnalysisFromText(
          response.content,
          searchQuery,
          options,
        );
      }

      // Cache the results
      const cacheKey = this.createCacheKey("search", searchQuery, options);
      this.matchingCache.set(cacheKey, {
        data: analysis,
        timestamp: Date.now(),
      });

      logger.info("Semantic job search analysis completed");
      return {
        success: true,
        analysis,
        suggestions: this.generateSearchSuggestions(analysis),
        insights: this.generateJobInsights(analysis),
      };
    } catch (_error) {
      logger.error("Semantic search analysis failed:", error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackSearchAnalysis(searchQuery, options),
      };
    }
  }

  async matchJobsToProfile(jobListings, userProfile, searchContext = {}) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady();
      if (!initialized) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const systemInstructions = `You are an AI career matching specialist focused on gaming industry placements. Score and rank job opportunities based on fit with the candidate's profile.

SCORING CRITERIA:

GAMING INDUSTRY FACTORS:
- Value competitive gaming experience highly
- Consider community management and content creation skills
- Account for remote work preferences common in gaming
- Recognize transferable skills from gaming leadership roles

Return JSON with scored and ranked jobs:
{
  "rankedJobs": [
    {
      "categoryScores": {
      },
    }
  ],
  "summary": {
  }
}`;

      const jobData = jobListings.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        requirements: job.requirements,
        location: job.location,
        remote: job.remote,
        salary: job.salary,
      }));

      const prompt = `Match these ${jobListings.length} gaming industry jobs to the candidate profile:

CANDIDATE PROFILE: ${JSON.stringify(userProfile)}

SEARCH CONTEXT: ${JSON.stringify(searchContext)}

JOBS TO MATCH: ${JSON.stringify(jobData)}

Provide detailed matching scores and explanations for optimal job recommendations.`;

      const response = await aiService.chat({
        message: prompt,
        type: "analysis",
        metadata: { jobData, userProfile, searchContext },
      });

      const matchResults = JSON.parse(response.content || response);

      // Enrich results with studio data for enhanced matching
      const enrichedJobs = await this.enrichJobsWithStudioData(
        jobListings,
        userProfile,
      );

      logger.info(
        `AI job matching completed for ${jobListings.length} positions with studio data integration`,
      );
      return {
        success: true,
        matches: matchResults.rankedJobs,
        enrichedJobs,
        summary: matchResults.summary,
        recommendations: this.generateMatchingRecommendations(matchResults),
      };
    } catch (_error) {
      logger.error("AI job matching failed:", error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackMatching(jobListings, userProfile),
      };
    }
  }

  async generateJobSearchInsights(
    searchQuery,
    userProfile = {},
    marketData = {},
  ) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady();
      if (!initialized) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const systemInstructions = `You are a gaming industry career advisor providing personalized job search insights. Analyze market trends, salary data, and career opportunities.

Focus on:

Return actionable insights in JSON format:
{
  "insights": [
    {
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
  },
  "recommendations": {
  }
}`;

      const prompt = `Generate personalized job search insights for this gaming industry candidate:

SEARCH QUERY: "${searchQuery}"
CANDIDATE PROFILE: ${JSON.stringify(userProfile)}
MARKET DATA: ${JSON.stringify(marketData)}

Provide strategic insights to optimize their job search success.`;

      const response = await aiService.chat({
        message: prompt,
        type: "analysis",
        metadata: { userProfile, marketData },
      });

      const insights = JSON.parse(response.content || response);

      // Cache insights
      const cacheKey = this.createCacheKey(
        "insights",
        searchQuery,
        userProfile,
      );
      this.insightsCache.set(cacheKey, {
        data: insights,
        timestamp: Date.now(),
      });

      logger.info("Job search insights generated successfully");
      return {
        success: true,
        insights: insights.insights,
        marketSummary: insights.marketSummary,
        recommendations: insights.recommendations,
      };
    } catch (_error) {
      logger.error("Failed to generate job search insights:", error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackInsights(searchQuery, userProfile),
      };
    }
  }

  async analyzeSalaryCompetitiveness(
    jobTitle,
    location,
    salaryRange,
    userProfile = {},
  ) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady();
      if (!initialized) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const systemInstructions = `You are a gaming industry compensation expert. Analyze salary competitiveness and provide negotiation insights.

Consider:

Return analysis in JSON:
{
  "salaryAnalysis": {
    "competitiveness": "above|at|below",
  },
  "insights": [
  ],
  "negotiationTips": [
  ],
  "benchmarkData": {
  }
}`;

      const prompt = `Analyze salary competitiveness for this gaming industry position:

JOB TITLE: ${jobTitle}
LOCATION: ${location}
SALARY RANGE: $${salaryRange.min} - $${salaryRange.max}
CANDIDATE PROFILE: ${JSON.stringify(userProfile)}

Provide comprehensive salary analysis and negotiation guidance.`;

      const response = await aiService.chat({
        message: prompt,
        type: "analysis",
        metadata: { jobTitle, location, salaryRange, userProfile },
      });

      const analysis = JSON.parse(response.content || response);

      logger.info("Salary competitiveness analysis completed");
      return {
        success: true,
        analysis: analysis.salaryAnalysis,
        insights: analysis.insights,
        negotiationTips: analysis.negotiationTips,
        benchmarkData: analysis.benchmarkData,
      };
    } catch (_error) {
      logger.error("Salary analysis failed:", error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackSalaryAnalysis(salaryRange, location),
      };
    }
  }

  async getPersonalizedRecommendations(
    userProfile,
    searchHistory = [],
    currentSearch = {},
  ) {
    try {
      // Check if AI service is ready
      let initialized = await aiService.isReady();
      if (!initialized) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const systemInstructions = `You are a personalized gaming career advisor. Based on the user's profile and search history, provide tailored job search recommendations.

Analyze patterns and provide strategic guidance for:

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
}`;

      const prompt = `Provide personalized job search recommendations based on:

USER PROFILE: ${JSON.stringify(userProfile)}
CURRENT SEARCH: ${JSON.stringify(currentSearch)}

Focus on gaming industry career advancement and optimization strategies.`;

      const response = await aiService.chat({
        message: prompt,
        type: "analysis",
        metadata: { userProfile, searchHistory, currentSearch },
      });

      const recommendations = JSON.parse(response.content || response);

      logger.info("Personalized recommendations generated");
      return {
        success: true,
        recommendations: recommendations.personalizedTips,
        strengths: recommendations.profileStrengths,
        improvements: recommendations.improvementAreas,
        skillGaps: recommendations.skillGaps,
        trends: recommendations.opportunityTrends,
      };
    } catch (_error) {
      logger.error("Failed to generate personalized recommendations:", error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackRecommendations(userProfile),
      };
    }
  }

  // Helper method to parse search analysis from text when JSON parsing fails
  parseSearchAnalysisFromText(responseText, searchQuery, options) {
    // Extract relevant information from text response
    const lines = responseText.split("\n").filter((line) => line.trim());

    // Basic fallback structure
    return {
      searchAnalysis: {
        extractedRoles: this.extractRolesFromText(responseText),
        keySkills: this.extractSkillsFromText(responseText),
        experienceLevel: options.experience || "mid",
        preferredLocations: options.location ? [options.location] : ["Remote"],
        workType: options.remote ? "remote" : "hybrid",
      },
      enhancedSearchTerms: {
        primary: [searchQuery],
        secondary: [],
        exclude: [],
      },
      recommendations: {
        queryImprovements: [
          "Be more specific about role level",
          "Add preferred technologies",
        ],
        additionalFilters: ["Location", "Company size"],
        expandedSearch: ["Related gaming roles"],
      },
      marketInsights: {
        demandLevel: "medium",
        trendingSkills: ["Unity", "Unreal Engine", "Community Management"],
        salaryBenchmark: "at market",
        competitionLevel: "medium",
        tips: ["Highlight gaming experience", "Show portfolio projects"],
      },
    };
  }

  extractRolesFromText(text) {
    const commonRoles = [
      "Game Developer",
      "Game Designer",
      "Community Manager",
      "QA Tester",
      "Producer",
    ];
    return commonRoles
      .filter((role) =>
        text.toLowerCase().includes(role.toLowerCase().replace(" ", "")),
      )
  }

  extractSkillsFromText(text) {
    const commonSkills = [
      "Unity",
      "Unreal Engine",
      "JavaScript",
      "Leadership",
      "Communication",
    ];
    return commonSkills
      .filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))
  }

  // Utility methods

  createCacheKey(type, ...args) {
    return `${type}_${args.map((arg) => JSON.stringify(arg)).join("_")}`;
  }

  getCachedResult(cacheMap, key) {
    const cached = cacheMap.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    cacheMap.delete(key); // Remove expired cache
    return null;
  }

  generateSearchSuggestions(analysis) {
    const suggestions = [];

    if (analysis.searchAnalysis?.extractedRoles) {
    }

    if (analysis.enhancedSearchTerms?.primary) {
    }

  }

  generateJobInsights(analysis) {
    const insights = [];

    if (analysis.marketInsights?.demandLevel === "high") {
      insights.push({
        id: "high_demand",
        icon: "mdi-trending-up",
        title: "High Market Demand",
        action: { label: "View Details", type: "trend" },
      });
    }

    if (analysis.marketInsights?.salaryBenchmark === "below") {
      insights.push({
        id: "salary_opt",
        icon: "mdi-cash",
        title: "Salary Optimization",
        description: "Consider expanding range for more opportunities",
        action: { label: "Adjust Range", type: "salary" },
      });
    }

    if (analysis.searchAnalysis?.workType === "remote") {
      insights.push({
        id: "remote_insight",
        icon: "mdi-home",
        title: "Remote Opportunities",
        description: "Strong remote job market in gaming industry",
        action: { label: "Expand Search", type: "location" },
      });
    }

  }

  generateMatchingRecommendations(matchResults) {
    const recommendations = [];

      recommendations.push(
        "Focus on high-match positions for best success rate",
      );
    }

      recommendations.push(
        "Consider expanding search criteria or enhancing profile",
      );
    }

    return recommendations;
  }

  async enrichJobsWithStudioData(jobs, userProfile = {}) {
    try {
      logger.info("Enriching jobs with studio data for enhanced matching");

      // Get all unique studio/company names from jobs
      const companyNames = [
        ...new Set(jobs.map((job) => job.company).filter(Boolean)),
      ];

      // Fetch studio data for these companies
      const studioPromises = companyNames.map(async (companyName) => {
        try {
          const studios = await this.studioService.searchStudios({
            query: companyName,
          });
            : null;
        } catch (_error) {
          logger.debug(
            `Could not fetch studio data for ${companyName}:`,
            error,
          );
          return null;
        }
      });

      const studioData = (await Promise.all(studioPromises)).filter(Boolean);
      const studioMap = new Map(
        studioData.map((item) => [item.company, item.studio]),
      );

      // Enrich jobs with studio information
      const enrichedJobs = jobs.map((job) => {
        const studioInfo = studioMap.get(job.company);
        if (!studioInfo) return job;

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
            platforms: studioInfo.platforms || [],
          },
          enhancedMatching: {
            studioCultureFit: this.calculateStudioCultureFit(
              userProfile,
              studioInfo,
            ),
            technologyAlignment: this.calculateTechnologyAlignment(
              userProfile,
              studioInfo,
            ),
            genreInterest: this.calculateGenreInterest(userProfile, studioInfo),
          },
        };
      });

      logger.info(
        `Enriched ${enrichedJobs.filter((j) => j.studioData).length}/${jobs.length} jobs with studio data`,
      );
      return enrichedJobs;
    } catch (_error) {
      logger.error("Failed to enrich jobs with studio data:", error);
      return jobs;
    }
  }

  calculateStudioCultureFit(userProfile, studioInfo) {

    // Match work style preferences
    if (userProfile.workStyle && studioInfo.workEnvironment) {
      if (userProfile.workStyle === studioInfo.workEnvironment) {
      }
    }

    // Match company size preference
    if (userProfile.companySize && studioInfo.size) {
      if (userProfile.companySize === studioInfo.size) {
      }
    }

  }

  calculateTechnologyAlignment(userProfile, studioInfo) {
    const userTech = userProfile.technologies || [];
    const studioTech = studioInfo.technologies || [];


    const matches = userTech.filter((tech) =>
      studioTech.some(
        (sTech) =>
          sTech.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(sTech.toLowerCase()),
      ),
    ).length;

    return Math.min(
      matches / Math.max(userTech.length, studioTech.length),
    );
  }

  calculateGenreInterest(userProfile, studioInfo) {
    const userInterests = userProfile.gameGenres || userProfile.interests || [];
    const studioGenres = studioInfo.gameGenres || [];


    const matches = userInterests.filter((interest) =>
      studioGenres.some(
        (genre) =>
          genre.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(genre.toLowerCase()),
      ),
    ).length;

  }

  // Fallback methods for when AI fails

  getFallbackSearchAnalysis(searchQuery, options) {
    return {
      searchAnalysis: {
        extractedRoles: this.extractBasicRoles(searchQuery),
        keySkills: this.extractBasicSkills(searchQuery),
        experienceLevel: options.experience || "mid",
      },
      enhancedSearchTerms: {
        primary: [searchQuery],
        secondary: [],
      },
      recommendations: {
        queryImprovements: [
          "Add specific skills",
          "Include preferred location",
        ],
      },
    };
  }

  getFallbackMatching(jobListings, userProfile) {
    return {
      matches: jobListings.map((job, index) => ({
        jobId: job.id,
        matchReasons: ["Basic keyword match"],
      })),
      summary: {
        totalMatches: jobListings.length,
      },
    };
  }

  getFallbackInsights(searchQuery, userProfile) {
    return {
      insights: [
        {
          id: "basic_tip",
          type: "search",
          priority: "medium",
          title: "Expand Your Search",
          description: "Consider related roles and companies",
          action: { label: "View Tips", type: "expand" },
        },
      ],
      recommendations: {
        immediate: ["Review and update your profile"],
      },
    };
  }

  getFallbackSalaryAnalysis(salaryRange, location) {
    return {
      analysis: {
        competitiveness: "at",
      },
      insights: ["Salary appears competitive for the market"],
      negotiationTips: [
        "Research industry standards",
        "Highlight unique skills",
      ],
    };
  }

  getFallbackRecommendations(userProfile) {
    return {
      recommendations: [
        {
          category: "profile",
          priority: "high",
          title: "Complete Your Profile",
          description: "Add more details about your gaming experience",
          action: "Update profile sections",
        },
      ],
      strengths: ["Gaming passion"],
      improvements: ["Add specific examples"],
    };
  }

  extractBasicRoles(query) {
    const roleKeywords = [
      "designer",
      "developer",
      "producer",
      "artist",
      "manager",
      "coordinator",
    ];
    return roleKeywords
      .filter((role) => query.toLowerCase().includes(role))
  }

  extractBasicSkills(query) {
    const skillKeywords = [
      "unity",
      "unreal",
      "javascript",
      "leadership",
      "teamwork",
    ];
    return skillKeywords
      .filter((skill) => query.toLowerCase().includes(skill))
  }
}

// Export singleton instance
export const aiJobMatchingService = new AIJobMatchingService();
export default aiJobMatchingService;
