/**
 * AI Cover Letter Generation Service
 * Provides intelligent cover letter creation, optimization, and personalization
 * tailored to specific job descriptions and gaming industry requirements.
 */

import { ai } from '@/shared/ai/canonical'
import { AIProvider } from '@/shared/types/ai'
import { logger } from '@/shared/utils/logger'

// Types
interface CoverLetterResult {
  success: boolean
  coverLetter: {
    fullText: string
    sections: {
      opening: string
      body: string
      closing: string
    }
  }
  keyPoints: string[]
  personalizations: string[]
  suggestions?: Record<string, any>
  error?: string
  fallback?: any
}

interface CompanyResearchResult {
  success: boolean
  companyOverview?: string
  culture?: string[]
  projects?: string[]
  position?: string
  talkingPoints?: string[]
  hooks?: string[]
  error?: string
  fallback?: any
}

interface ReviewResult {
  success: boolean
  score: number
  categoryScores?: Record<string, number>
  strengths?: string[]
  weaknesses?: string[]
  suggestions?: string[]
  atsCompliance?: boolean
  revisionPriority?: string[]
  error?: string
  fallback?: any
}

interface ImprovementResult {
  success: boolean
  improvedText: string
  changes?: string[]
  improvements?: string[]
  keywordBoosts?: string[]
  error?: string
}

interface VariationsResult {
  success: boolean
  variations: Array<{
    id: string
    fullText: string
    approach: string
    tone: string
    differences: string[]
  }>
  error?: string
}

interface GenerationOptions {
  tone?: string
  length?: string
  focusAreas?: string[]
  companyInfo?: string
  approach?: string
}

class AICoverLetterService {
  private generationCache: Map<string, any>
  private companyCache: Map<string, any>
  private cacheExpiry: number

  constructor() {
    this.generationCache = new Map()
    this.companyCache = new Map()
    this.cacheExpiry = 10 * 60 * 1000 // 10 minutes
  }

  // Internal guard to ensure AI is initialized
  private async ensureAiReady(): Promise<void> {
    // Initialize canonical AI service
    try {
      await ai.init({ provider: AIProvider.GEMINI })
      return
    } catch {
      throw new Error(
        'AI service not initialized. Please configure your API key in settings.'
      )
    }
  }

  /**
   * Generate a complete cover letter from job description and user profile
   */
  async generateFromJobDescription(
    jobDescription: string,
    userProfile: any = {},
    options: GenerationOptions = {}
  ): Promise<CoverLetterResult> {
    try {
      // Initialize AI service if needed
      await this.ensureAiReady()

      const __contextInfo = `USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

JOB DESCRIPTION:
${jobDescription}

GENERATION OPTIONS:
- Tone: ${options.tone || 'professional'}
- Length: ${options.length || 'medium'}
- Focus Areas: ${options.focusAreas?.join(', ') || 'skills match, gaming passion, company culture'}
- Additional Company Info: ${options.companyInfo || 'None provided'}

Create a compelling, personalized cover letter for this gaming industry position that demonstrates genuine passion for gaming, highlights transferable skills, and shows cultural fit.`

      const cacheKey = `${jobDescription.slice(0, 100)}_${JSON.stringify(userProfile)}_${JSON.stringify(options)}`

      // Check cache first
      if (this.generationCache.has(cacheKey)) {
        const cached = this.generationCache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          logger.info('Using cached cover letter generation')
          return { success: true, ...cached.data }
        }
      }

      const prompt = `Generate a professional cover letter for this job:

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFO:
${options.companyInfo || 'None provided'}

Please create a compelling cover letter that highlights relevant skills and experience. Return the response as JSON with this structure:
{
  "coverLetter": {
    "fullText": "Complete cover letter text",
    "sections": {
      "opening": "Opening paragraph",
      "body": "Body paragraphs", 
      "closing": "Closing paragraph"
    }
  },
  "keyPoints": ["Key points highlighted"],
  "personalizations": ["Personalization elements used"],
  "suggestions": {}
}`

      const result = await ai.generateText(prompt)

      try {
        // Try to parse as JSON first
        const parsedContent = JSON.parse(result.content)

        // Validate required fields
        if (!parsedContent.coverLetter?.fullText) {
          throw new Error('Missing required cover letter content')
        }

        const response: CoverLetterResult = {
          success: true,
          coverLetter: parsedContent.coverLetter,
          keyPoints: parsedContent.keyPoints || [],
          personalizations: parsedContent.personalizations || [],
          suggestions: parsedContent.suggestions || {},
        }

        // Cache the result
        this.generationCache.set(cacheKey, {
          timestamp: Date.now(),
          data: response,
        })

        logger.info('Cover letter generated successfully')
        return response
      } catch (parseError) {
        logger.warn(
          'Failed to parse AI response, using fallback format:',
          parseError
        )

        // Fallback: use raw content as full text
        const fallbackResult: CoverLetterResult = {
          success: true,
          coverLetter: {
            fullText: result.content,
            sections: {
              opening: result.content.split('\n\n')[0] || '',
              body:
                result.content.split('\n\n').slice(1, -1).join('\n\n') || '',
              closing: result.content.split('\n\n').slice(-1)[0] || '',
            },
          },
          keyPoints: ['Generated with AI assistance'],
          personalizations: ['Tailored to job requirements'],
          suggestions: { note: 'Fallback generation used' },
        }

        return fallbackResult
      }
    } catch (error: any) {
      logger.error('Cover letter generation error:', error)
      return {
        success: false,
        error: error.message || 'Generation failed',
        coverLetter: {
          fullText: '',
          sections: { opening: '', body: '', closing: '' },
        },
        keyPoints: [],
        personalizations: [],
      }
    }
  }

  /**
   * Research company information for personalization
   */
  async researchCompany(
    companyName: string,
    jobTitle = '',
    additionalContext = ''
  ): Promise<CompanyResearchResult> {
    try {
      await this.ensureAiReady()

      const cacheKey = `${companyName}_${jobTitle}_${additionalContext}`

      // Check cache first
      if (this.companyCache.has(cacheKey)) {
        const cached = this.companyCache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          logger.info('Using cached company research')
          return { success: true, ...cached.data }
        }
      }

      const systemInstructions = `You are a company research specialist focused on gaming industry companies. Research and provide insights about companies to help personalize cover letters.

Return JSON format:
{
  "companyOverview": "Brief company description",
  "culture": ["Key cultural values"],
  "projects": ["Notable games/projects"],
  "position": "Insights about the specific role",
  "talkingPoints": ["Points to mention in cover letter"],
  "hooks": ["Engaging opening lines or conversation starters"]
}`

      const userPrompt = `Research ${companyName}${jobTitle ? ` for the position of ${jobTitle}` : ''}${additionalContext ? `. Additional context: ${additionalContext}` : ''}.

Focus on gaming industry relevance, company culture, recent projects, and information that would be valuable for a cover letter.`

      const prompt = `${systemInstructions}\n\n${userPrompt}`
      const text = await ai.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 800,
      })
      const result = {
        success: true,
        content: typeof text === 'string' ? text : text.content || '',
      }

      if (result.success) {
        try {
          const parsedContent = JSON.parse(result.content)

          const response: CompanyResearchResult = {
            success: true,
            companyOverview: parsedContent.companyOverview,
            culture: parsedContent.culture || [],
            projects: parsedContent.projects || [],
            position: parsedContent.position,
            talkingPoints: parsedContent.talkingPoints || [],
            hooks: parsedContent.hooks || [],
          }

          // Cache the result
          this.companyCache.set(cacheKey, {
            timestamp: Date.now(),
            data: response,
          })

          logger.info('Company research completed successfully')
          return response
        } catch (parseError) {
          logger.warn('Failed to parse company research response:', parseError)

          return {
            success: false,
            error: 'Failed to parse research results',
            fallback: {
              companyOverview: `Research about ${companyName}`,
              culture: ['Professional gaming environment'],
              projects: ['Various gaming projects'],
              talkingPoints: [`Mention interest in ${companyName}`],
              hooks: [`I'm excited about the opportunity at ${companyName}`],
            },
          }
        }
      } else {
        logger.error('Company research failed')
        return {
          success: false,
          error: 'Research failed',
        }
      }
    } catch (error: any) {
      logger.error('Company research error:', error)
      return {
        success: false,
        error: error.message || 'Research failed',
      }
    }
  }

  /**
   * Review and score a cover letter
   */
  async reviewCoverLetter(
    coverLetterText: string,
    jobDescription = '',
    userProfile: any = {}
  ): Promise<ReviewResult> {
    try {
      await this.ensureAiReady()

      const systemInstructions = `You are a professional cover letter reviewer specializing in gaming industry applications. Analyze cover letters and provide detailed feedback.

Evaluate on these criteria:
1. Relevance to job description (25 points)
2. Gaming industry knowledge/passion (20 points)
3. Professional presentation (20 points)
4. Specific examples and achievements (15 points)
5. ATS compatibility (10 points)
6. Personalization and company research (10 points)

Return JSON format:
{
  "score": 85,
  "categoryScores": {
    "relevance": 22,
    "gaming_passion": 18,
    "presentation": 20,
    "examples": 12,
    "ats_compatibility": 8,
    "personalization": 5
  },
  "strengths": ["Strong technical background", "Clear gaming passion"],
  "weaknesses": ["Generic opening", "Missing company specifics"],
  "suggestions": ["Add specific company research", "Include metrics"],
  "atsCompliance": true,
  "revisionPriority": ["Add company specifics", "Strengthen opening"]
}`

      const userPrompt = `
COVER LETTER TO REVIEW:
${coverLetterText}

JOB DESCRIPTION:
${jobDescription}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Provide detailed review and scoring.`

      const prompt = `${systemInstructions}\n\n${userPrompt}`
      const text = await ai.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      })
      const result = {
        success: true,
        content: typeof text === 'string' ? text : text.content || '',
      }

      if (result.success) {
        try {
          const parsedContent = JSON.parse(result.content)

          const response: ReviewResult = {
            success: true,
            score: parsedContent.score || 0,
            categoryScores: parsedContent.categoryScores || {},
            strengths: parsedContent.strengths || [],
            weaknesses: parsedContent.weaknesses || [],
            suggestions: parsedContent.suggestions || [],
            atsCompliance: parsedContent.atsCompliance !== false,
            revisionPriority: parsedContent.revisionPriority || [],
          }

          logger.info('Cover letter review completed')
          return response
        } catch (parseError) {
          logger.warn('Failed to parse review response:', parseError)

          return {
            success: false,
            error: 'Failed to parse review results',
            score: 0,
            fallback: {
              score: 70,
              strengths: ['Content provided'],
              weaknesses: ['Needs detailed review'],
              suggestions: ['Consider professional review'],
            },
          }
        }
      } else {
        logger.error('Cover letter review failed')
        return {
          success: false,
          score: 0,
          error: 'Review failed',
        }
      }
    } catch (error: any) {
      logger.error('Cover letter review error:', error)
      return {
        success: false,
        score: 0,
        error: error.message || 'Review failed',
      }
    }
  }

  /**
   * Improve an existing cover letter
   */
  async improveCoverLetter(
    coverLetterText: string,
    improvementFocus: string[] = [],
    jobDescription = '',
    userProfile: any = {}
  ): Promise<ImprovementResult> {
    try {
      await this.ensureAiReady()

      const focusAreas =
        improvementFocus.length > 0
          ? improvementFocus.join(', ')
          : 'overall quality, relevance, and impact'

      const systemInstructions = `You are a professional cover letter editor specializing in gaming industry applications. Improve cover letters while maintaining the author's voice.

Focus areas: ${focusAreas}

Return JSON format:
{
  "improvedText": "Full improved cover letter text",
  "changes": ["Specific changes made"],
  "improvements": ["Improvement descriptions"],
  "keywordBoosts": ["Keywords added for ATS"]
}`

      const userPrompt = `
ORIGINAL COVER LETTER:
${coverLetterText}

JOB DESCRIPTION:
${jobDescription}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

IMPROVEMENT FOCUS: ${focusAreas}

Improve this cover letter while maintaining authenticity.`

      const prompt = `${systemInstructions}\n\n${userPrompt}`
      const text = await ai.generateText(prompt, {
        temperature: 0.5,
        maxTokens: 1200,
      })
      const result = {
        success: true,
        content: typeof text === 'string' ? text : text.content || '',
      }

      if (result.success) {
        try {
          const parsedContent = JSON.parse(result.content)

          const response: ImprovementResult = {
            success: true,
            improvedText: parsedContent.improvedText || coverLetterText,
            changes: parsedContent.changes || [],
            improvements: parsedContent.improvements || [],
            keywordBoosts: parsedContent.keywordBoosts || [],
          }

          logger.info('Cover letter improvement completed')
          return response
        } catch (parseError) {
          logger.warn('Failed to parse improvement response:', parseError)

          return {
            success: false,
            improvedText: coverLetterText,
            error: 'Failed to parse improvement results',
          }
        }
      } else {
        logger.error('Cover letter improvement failed')
        return {
          success: false,
          improvedText: coverLetterText,
          error: 'Improvement failed',
        }
      }
    } catch (error: any) {
      logger.error('Cover letter improvement error:', error)
      return {
        success: false,
        improvedText: coverLetterText,
        error: error.message || 'Improvement failed',
      }
    }
  }

  /**
   * Generate multiple variations of a cover letter
   */
  async generateVariations(
    baseContent: string,
    jobDescription = '',
    userProfile: any = {},
    count = 3
  ): Promise<VariationsResult> {
    try {
      await this.ensureAiReady()

      const systemInstructions = `You are a cover letter writer creating multiple variations of the same content. Generate ${count} different approaches while maintaining quality and relevance.

Variation approaches:
1. Conservative/Traditional
2. Creative/Dynamic  
3. Technical/Detail-focused

Return JSON format:
{
  "variations": [
    {
      "id": "conservative",
      "fullText": "Full cover letter text",
      "approach": "Conservative",
      "tone": "Professional and traditional",
      "differences": ["Key differences from original"]
    }
  ]
}`

      const userPrompt = `
BASE COVER LETTER:
${baseContent}

JOB DESCRIPTION:
${jobDescription}

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

Generate ${count} variations with different approaches and tones.`

      const prompt = `${systemInstructions}\n\n${userPrompt}`
      const text = await ai.generateText(prompt, {
        temperature: 0.8,
        maxTokens: 2000,
      })
      const result = {
        success: true,
        content: typeof text === 'string' ? text : text.content || '',
      }

      if (result.success) {
        try {
          const parsedContent = JSON.parse(result.content)

          const response: VariationsResult = {
            success: true,
            variations: parsedContent.variations || [],
          }

          logger.info(
            `Generated ${response.variations.length} cover letter variations`
          )
          return response
        } catch (parseError) {
          logger.warn('Failed to parse variations response:', parseError)

          return {
            success: false,
            variations: [],
            error: 'Failed to parse variation results',
          }
        }
      } else {
        logger.error('Cover letter variations failed')
        return {
          success: false,
          variations: [],
          error: 'Variation generation failed',
        }
      }
    } catch (error: any) {
      logger.error('Cover letter variations error:', error)
      return {
        success: false,
        variations: [],
        error: error.message || 'Variation generation failed',
      }
    }
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.generationCache.clear()
    this.companyCache.clear()
    logger.info('Cover letter service caches cleared')
  }
}

// Create and export singleton instance
export const aiCoverLetterService = new AICoverLetterService()
export default aiCoverLetterService

// Export types
export type {
  CoverLetterResult,
  CompanyResearchResult,
  ReviewResult,
  ImprovementResult,
  VariationsResult,
  GenerationOptions,
}
