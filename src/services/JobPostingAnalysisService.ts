/**
 * Job Posting Analysis Service
 * Analyzes job postings from text or URLs to extract key requirements
 * and provide AI-powered insights for resume/cover letter tailoring
 */

import { ai } from '@/shared/ai/canonical'
import { logger } from '@/shared/utils/logger'

// Types for job posting analysis
export interface JobPostingRequirement {
  category: 'skills' | 'experience' | 'education' | 'certification' | 'soft_skills'
  requirement: string
  priority: 'required' | 'preferred' | 'nice_to_have'
  keywords: string[]
}

export interface JobPostingAnalysis {
  company: string
  jobTitle: string
  location?: string
  salaryRange?: string
  jobType?: 'full-time' | 'part-time' | 'contract' | 'remote'
  
  // Core analysis
  requirements: JobPostingRequirement[]
  keySkills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  industryFocus: string[]
  
  // AI insights
  companyValues: string[]
  culturalKeywords: string[]
  growthOpportunities: string[]
  uniqueSellingPoints: string[]
  
  // Matching insights
  atsKeywords: string[]
  missingKeywords?: string[]
  competitiveAdvantages?: string[]
  
  // Metadata
  sourceUrl?: string
  extractedAt: string
  confidence: number
}

export interface JobPostingExtractionResult {
  success: boolean
  analysis?: JobPostingAnalysis
  rawText?: string
  error?: string
  fallback?: Partial<JobPostingAnalysis>
}

export interface TailoringRecommendations {
  resumeChanges: {
    summary: string[]
    skills: string[]
    experience: string[]
    keywords: string[]
  }
  coverLetterFocus: {
    openingHook: string
    bodyPoints: string[]
    closingCta: string
    companyConnections: string[]
  }
  interviewPrep: {
    likelyQuestions: string[]
    keyTalkingPoints: string[]
    researchAreas: string[]
  }
}

class JobPostingAnalysisService {
  private initialized = false

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      // Ensure AI service is initialized
      if (!this.initialized) {
        this.initialized = true
        logger.info('JobPostingAnalysisService initialized')
      }
    } catch (error) {
      logger.error('Failed to initialize JobPostingAnalysisService:', error)
      throw error
    }
  }

  /**
   * Extract and analyze job posting from URL
   */
  async analyzeFromUrl(url: string): Promise<JobPostingExtractionResult> {
    try {
      await this.initialize()
      
      logger.info(`Analyzing job posting from URL: ${url}`)
      
      // First, extract the job posting content
      const extractionResult = await this.extractJobPostingFromUrl(url)
      if (!extractionResult.success || !extractionResult.content) {
        return {
          success: false,
          error: extractionResult.error || 'Failed to extract job posting content'
        }
      }
      
      // Then analyze the extracted content
      const analysisResult = await this.analyzeJobPostingText(extractionResult.content)
      if (analysisResult.success && analysisResult.analysis) {
        analysisResult.analysis.sourceUrl = url
      }
      
      return analysisResult
      
    } catch (error) {
      logger.error('Job posting URL analysis failed:', error)
      return {
        success: false,
        error: `URL analysis failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Analyze job posting from pasted text
   */
  async analyzeJobPostingText(jobPostingText: string): Promise<JobPostingExtractionResult> {
    try {
      await this.initialize()
      
      if (!jobPostingText?.trim()) {
        return {
          success: false,
          error: 'Job posting text is required'
        }
      }

      logger.info('Analyzing job posting text')

      const analysisPrompt = `
Analyze this job posting and extract structured information for resume/cover letter tailoring.

Job Posting:
${jobPostingText}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "company": "Company Name",
  "jobTitle": "Job Title",
  "location": "Location (if specified)",
  "salaryRange": "Salary range (if specified)",
  "jobType": "full-time|part-time|contract|remote",
  "requirements": [
    {
      "category": "skills|experience|education|certification|soft_skills",
      "requirement": "Specific requirement",
      "priority": "required|preferred|nice_to_have",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "keySkills": ["skill1", "skill2", "skill3"],
  "experienceLevel": "entry|mid|senior|executive",
  "industryFocus": ["industry1", "industry2"],
  "companyValues": ["value1", "value2"],
  "culturalKeywords": ["culture1", "culture2"],
  "growthOpportunities": ["opportunity1", "opportunity2"],
  "uniqueSellingPoints": ["point1", "point2"],
  "atsKeywords": ["keyword1", "keyword2", "keyword3"]
}

Focus on:
1. Extracting all technical skills, tools, and technologies
2. Identifying required vs preferred qualifications
3. Understanding company culture and values
4. Finding ATS-friendly keywords
5. Determining experience level expectations
6. Highlighting unique opportunities or benefits

Return only valid JSON.`

      const response = await ai.generateText(analysisPrompt)

      // Parse the AI response
      let analysisData: any
      try {
        // Try to extract JSON from response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch {
        logger.warn('Failed to parse AI response as JSON, using fallback analysis')
        return this.createFallbackAnalysis(jobPostingText)
      }

      // Validate and structure the analysis
      const analysis: JobPostingAnalysis = {
        company: analysisData.company || 'Unknown Company',
        jobTitle: analysisData.jobTitle || 'Unknown Position',
        location: analysisData.location,
        salaryRange: analysisData.salaryRange,
        jobType: analysisData.jobType || 'full-time',
        
        requirements: Array.isArray(analysisData.requirements) 
          ? analysisData.requirements.map((req: any) => ({
              category: req.category || 'skills',
              requirement: req.requirement || '',
              priority: req.priority || 'required',
              keywords: Array.isArray(req.keywords) ? req.keywords : []
            }))
          : [],
          
        keySkills: Array.isArray(analysisData.keySkills) ? analysisData.keySkills : [],
        experienceLevel: analysisData.experienceLevel || 'mid',
        industryFocus: Array.isArray(analysisData.industryFocus) ? analysisData.industryFocus : [],
        
        companyValues: Array.isArray(analysisData.companyValues) ? analysisData.companyValues : [],
        culturalKeywords: Array.isArray(analysisData.culturalKeywords) ? analysisData.culturalKeywords : [],
        growthOpportunities: Array.isArray(analysisData.growthOpportunities) ? analysisData.growthOpportunities : [],
        uniqueSellingPoints: Array.isArray(analysisData.uniqueSellingPoints) ? analysisData.uniqueSellingPoints : [],
        
        atsKeywords: Array.isArray(analysisData.atsKeywords) ? analysisData.atsKeywords : [],
        
        extractedAt: new Date().toISOString(),
        confidence: 0.85
      }

      logger.info('Job posting analysis completed successfully')

      return {
        success: true,
        analysis,
        rawText: jobPostingText
      }

    } catch (error) {
      logger.error('Job posting text analysis failed:', error)
      
      // Return fallback analysis
      return this.createFallbackAnalysis(jobPostingText)
    }
  }

  /**
   * Generate tailoring recommendations based on job analysis and user profile
   */
  async generateTailoringRecommendations(
    jobAnalysis: JobPostingAnalysis,
    userProfile: any = {},
    currentResume: any = {}
  ): Promise<TailoringRecommendations> {
    try {
      await this.initialize()

      const recommendationPrompt = `
Generate tailored resume and cover letter recommendations based on this job analysis and user profile.

Job Analysis:
- Company: ${jobAnalysis.company}
- Position: ${jobAnalysis.jobTitle}
- Key Skills: ${jobAnalysis.keySkills.join(', ')}
- Experience Level: ${jobAnalysis.experienceLevel}
- ATS Keywords: ${jobAnalysis.atsKeywords.join(', ')}
- Requirements: ${JSON.stringify(jobAnalysis.requirements, null, 2)}

User Profile: ${JSON.stringify(userProfile, null, 2)}
Current Resume: ${JSON.stringify(currentResume, null, 2)}

Provide specific, actionable recommendations in JSON format:
{
  "resumeChanges": {
    "summary": ["specific summary improvements"],
    "skills": ["skills to add/emphasize"],
    "experience": ["experience bullets to add/modify"],
    "keywords": ["ATS keywords to include"]
  },
  "coverLetterFocus": {
    "openingHook": "compelling opening line",
    "bodyPoints": ["key points to cover in body"],
    "closingCta": "strong closing call-to-action",
    "companyConnections": ["ways to connect with company values"]
  },
  "interviewPrep": {
    "likelyQuestions": ["expected interview questions"],
    "keyTalkingPoints": ["main points to emphasize"],
    "researchAreas": ["areas to research further"]
  }
}

Focus on:
1. Matching user experience to job requirements
2. Incorporating ATS keywords naturally
3. Highlighting relevant achievements
4. Addressing any experience gaps
5. Connecting user background to company values

Return only valid JSON.`

      const response = await ai.generateText(recommendationPrompt)

      // Parse response
      let recommendations: any
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch {
        logger.warn('Failed to parse recommendations, using fallback')
        return this.createFallbackRecommendations(jobAnalysis)
      }

      return {
        resumeChanges: {
          summary: Array.isArray(recommendations.resumeChanges?.summary) 
            ? recommendations.resumeChanges.summary 
            : [],
          skills: Array.isArray(recommendations.resumeChanges?.skills) 
            ? recommendations.resumeChanges.skills 
            : [],
          experience: Array.isArray(recommendations.resumeChanges?.experience) 
            ? recommendations.resumeChanges.experience 
            : [],
          keywords: Array.isArray(recommendations.resumeChanges?.keywords) 
            ? recommendations.resumeChanges.keywords 
            : []
        },
        coverLetterFocus: {
          openingHook: recommendations.coverLetterFocus?.openingHook || '',
          bodyPoints: Array.isArray(recommendations.coverLetterFocus?.bodyPoints) 
            ? recommendations.coverLetterFocus.bodyPoints 
            : [],
          closingCta: recommendations.coverLetterFocus?.closingCta || '',
          companyConnections: Array.isArray(recommendations.coverLetterFocus?.companyConnections) 
            ? recommendations.coverLetterFocus.companyConnections 
            : []
        },
        interviewPrep: {
          likelyQuestions: Array.isArray(recommendations.interviewPrep?.likelyQuestions) 
            ? recommendations.interviewPrep.likelyQuestions 
            : [],
          keyTalkingPoints: Array.isArray(recommendations.interviewPrep?.keyTalkingPoints) 
            ? recommendations.interviewPrep.keyTalkingPoints 
            : [],
          researchAreas: Array.isArray(recommendations.interviewPrep?.researchAreas) 
            ? recommendations.interviewPrep.researchAreas 
            : []
        }
      }

    } catch (error) {
      logger.error('Failed to generate tailoring recommendations:', error)
      return this.createFallbackRecommendations(jobAnalysis)
    }
  }

  /**
   * Extract job posting content from URL using web scraping
   */
  private async extractJobPostingFromUrl(url: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      // Use WebFetch tool to get the content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const html = await response.text()
      
      // Extract text content (basic implementation)
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      return {
        success: true,
        content: textContent
      }
      
    } catch (error) {
      logger.error(`Failed to extract from URL ${url}:`, error)
      return {
        success: false,
        error: `Failed to extract job posting: ${(error as Error).message}`
      }
    }
  }

  /**
   * Create fallback analysis when AI parsing fails
   */
  private createFallbackAnalysis(jobPostingText: string): JobPostingExtractionResult {
    // Basic text analysis for fallback
    const _words = jobPostingText.toLowerCase().split(/\s+/)
    const skillKeywords = ['javascript', 'python', 'react', 'vue', 'angular', 'node', 'java', 'c#', 'sql', 'aws', 'docker', 'kubernetes']
    const foundSkills = skillKeywords.filter(skill => jobPostingText.toLowerCase().includes(skill))
    
    const fallbackAnalysis: Partial<JobPostingAnalysis> = {
      company: 'Company Name',
      jobTitle: 'Software Developer',
      keySkills: foundSkills,
      experienceLevel: 'mid',
      atsKeywords: foundSkills,
      requirements: [
        {
          category: 'skills',
          requirement: 'Programming experience required',
          priority: 'required',
          keywords: foundSkills
        }
      ],
      extractedAt: new Date().toISOString(),
      confidence: 0.3
    }

    return {
      success: true,
      analysis: fallbackAnalysis as JobPostingAnalysis,
      rawText: jobPostingText,
      fallback: fallbackAnalysis
    }
  }

  /**
   * Create fallback recommendations
   */
  private createFallbackRecommendations(jobAnalysis: JobPostingAnalysis): TailoringRecommendations {
    return {
      resumeChanges: {
        summary: [`Experienced ${jobAnalysis.jobTitle.toLowerCase()} with expertise in ${jobAnalysis.keySkills.slice(0, 3).join(', ')}`],
        skills: jobAnalysis.keySkills.slice(0, 5),
        experience: [`Demonstrated proficiency in ${jobAnalysis.keySkills[0] || 'relevant technologies'}`],
        keywords: jobAnalysis.atsKeywords.slice(0, 10)
      },
      coverLetterFocus: {
        openingHook: `I am excited to apply for the ${jobAnalysis.jobTitle} position at ${jobAnalysis.company}`,
        bodyPoints: [
          `My experience aligns well with your requirements for ${jobAnalysis.keySkills.slice(0, 2).join(' and ')}`,
          `I am passionate about contributing to ${jobAnalysis.company}'s mission`
        ],
        closingCta: 'I look forward to discussing how my skills can contribute to your team',
        companyConnections: ['Share the company\'s values and mission']
      },
      interviewPrep: {
        likelyQuestions: [
          'Tell me about your experience with the technologies mentioned in the job posting',
          'Why do you want to work at our company?',
          'Describe a challenging project you worked on'
        ],
        keyTalkingPoints: jobAnalysis.keySkills.slice(0, 3),
        researchAreas: ['Company history and values', 'Recent projects and initiatives', 'Team structure and culture']
      }
    }
  }
}

// Export singleton instance
export const jobPostingAnalysisService = new JobPostingAnalysisService()