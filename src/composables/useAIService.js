import { ref } from 'vue'
import { ai } from '@/shared/ai/canonical'
import { generateContent } from '@/utils/aiClient'

/**
 * AI Service Composable
 * Provides common AI analysis functions for various components
 */
export function useAIService() {
  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Analyze content with AI and return structured insights
   */
  const analyzeWithAI = async (prompt, options = {}) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to use the canonical AI service first, fallback to generateContent function
      let response
      try {
        // Check if AI service is properly initialized
        response = await ai.generateText(prompt, {
          maxTokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7
        })
        
        return response.content || response
      } catch {
        // Silently try fallback without console warnings
        try {
          response = await generateContent(prompt, '', {
            maxTokens: 500,
            temperature: 0.7,
            ...options
          })
          return response
        } catch {
          throw new Error('AI service not available - please configure your API key in settings')
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('AI analysis error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get AI-powered summary of text content
   */
  const summarizeWithAI = async (content, options = {}) => {
    const prompt = `Please summarize the following content concisely:\n\n${content}`
    return analyzeWithAI(prompt, options)
  }

  /**
   * Generate AI insights for career development
   */
  const generateCareerInsights = async (userData = {}, marketData = {}) => {
    const prompt = `
      Analyze career opportunities for a gaming professional with:
      Skills: ${userData.skills?.join(', ') || 'Not specified'}
      Experience: ${userData.experience || 'Not specified'}
      Interests: ${userData.interests?.join(', ') || 'Not specified'}
      
      Current market trends: ${JSON.stringify(marketData)}
      
      Provide structured insights including:
      - Market trends analysis
      - In-demand skills
      - Salary expectations
      - Growth opportunities
      - Personalized recommendations
    `

    return analyzeWithAI(prompt, { maxTokens: 800 })
  }

  return {
    isLoading,
    error,
    analyzeWithAI,
    summarizeWithAI,
    generateCareerInsights
  }
}
