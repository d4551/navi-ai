/**
 * GeminiCVCL - API Handler for Gemini Integration
 * Handles all interactions with the Gemini API
 */

/**
 * GeminiApp class for interacting with Navi AI API
 */
class GeminiApp {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
    this.model = 'models/gemini-1.5-flash' // Default model
    this.maxRetries = 3 // Add retry mechanism
    this.retryDelayMs = 1000 // Delay between retries in milliseconds
  }

  /**
   * Set the model to use for generation
   * @param {string} modelName - Model name or full path
   * @return {GeminiApp} This instance for chaining
   */
  setModel(modelName) {
    if (modelName.startsWith('models/')) {
      this.model = modelName
    } else {
      this.model = `models/${modelName}`
    }
    return this
  }

  /**
   * Set configuration for API retries
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delayMs - Delay between retries in milliseconds
   * @return {GeminiApp} This instance for chaining
   */
  setRetryConfig(maxRetries, delayMs) {
    this.maxRetries = maxRetries
    this.retryDelayMs = delayMs
    return this
  }

  /**
   * Generate content using Gemini model with retry mechanism
   * @param {string} prompt - Text prompt for content generation
   * @param {Object} options - Generation options
   * @return {Object} Generated content or error
   */
  async generateContent(prompt, options = {}) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature:
          options.temperature !== undefined ? options.temperature : 0.7,
        topK: options.topK !== undefined ? options.topK : 40,
        topP: options.topP !== undefined ? options.topP : 0.95,
        maxOutputTokens:
          options.maxOutputTokens !== undefined
            ? options.maxOutputTokens
            : 1024,
      },
    }

    // Add system instructions if provided
    if (options.systemInstructions) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstructions }],
      }
    }

    // Add safety settings if provided
    if (options.safetySettings) {
      payload.safetySettings = options.safetySettings
    }

    let attempts = 0
    let lastError = null

    while (attempts < this.maxRetries) {
      try {
        const response = await UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
        })

        const responseCode = response.getResponseCode()
        const responseText = response.getContentText()

        // Handle rate limiting (429) and server errors (5xx)
        if (
          responseCode === 429 ||
          (responseCode >= 500 && responseCode < 600)
        ) {
          attempts++
          lastError = `API Error: ${responseCode} - ${responseText}`

          if (attempts < this.maxRetries) {
            // Exponential backoff
            const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
            Utilities.sleep(delay)
            continue
          }
        } else if (responseCode !== 200) {
          console.error(`Error: ${responseCode} - ${responseText}`)
          return {
            error: true,
            message: `API Error: ${responseCode}`,
            details: responseText,
            timestamp: new Date().toISOString(),
          }
        }

        const jsonResponse = JSON.parse(responseText)

        // Handle potential content filtering or error scenarios
        if (
          jsonResponse.promptFeedback &&
          jsonResponse.promptFeedback.blockReason
        ) {
          return {
            error: true,
            message: 'Content filtered',
            reason: jsonResponse.promptFeedback.blockReason,
            details: jsonResponse.promptFeedback,
            timestamp: new Date().toISOString(),
          }
        }

        if (!jsonResponse.candidates || jsonResponse.candidates.length === 0) {
          return {
            error: true,
            message: 'No content generated',
            details: 'The API returned no candidates',
            timestamp: new Date().toISOString(),
          }
        }

        // Check if content was blocked
        if (jsonResponse.candidates[0].finishReason === 'SAFETY') {
          return {
            error: true,
            message: 'Content filtered for safety reasons',
            details:
              jsonResponse.candidates[0].safetyRatings ||
              'No details available',
            timestamp: new Date().toISOString(),
          }
        }

        return {
          text: jsonResponse.candidates[0].content.parts[0].text,
          raw: jsonResponse,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        attempts++
        lastError = error.toString()

        if (attempts < this.maxRetries) {
          // Exponential backoff
          const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
          Utilities.sleep(delay)
        }
      }
    }

    console.error(`Failed after ${attempts} attempts. Last error: ${lastError}`)
    return {
      error: true,
      message: `Exception after ${attempts} attempts: ${lastError}`,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Start a chat session with history
   * @param {Array} history - Initial chat history
   * @return {GeminiChat} New chat session
   */
  startChat(history = []) {
    return new GeminiChat(
      this.apiKey,
      this.model,
      history,
      this.maxRetries,
      this.retryDelayMs
    )
  }

  /**
   * List available models with retry mechanism
   * @return {Array|Object} List of models or error information
   */
  async listModels() {
    const url = `${this.baseUrl}/models?key=${this.apiKey}`

    let attempts = 0
    let lastError = null

    while (attempts < this.maxRetries) {
      try {
        const response = await UrlFetchApp.fetch(url, {
          method: 'get',
          muteHttpExceptions: true,
        })

        const responseCode = response.getResponseCode()
        const responseText = response.getContentText()

        if (
          responseCode === 429 ||
          (responseCode >= 500 && responseCode < 600)
        ) {
          attempts++
          lastError = `API Error: ${responseCode} - ${responseText}`

          if (attempts < this.maxRetries) {
            // Exponential backoff
            const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
            Utilities.sleep(delay)
            continue
          }
        } else if (responseCode !== 200) {
          console.error(`Error: ${responseCode} - ${responseText}`)
          return {
            error: true,
            message: `API Error: ${responseCode}`,
            details: responseText,
          }
        }

        const jsonResponse = JSON.parse(responseText)
        return jsonResponse.models.filter(model =>
          model.name.includes('gemini')
        )
      } catch (error) {
        attempts++
        lastError = error.toString()

        if (attempts < this.maxRetries) {
          // Exponential backoff
          const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
          Utilities.sleep(delay)
        }
      }
    }

    console.error(
      `Failed to list models after ${attempts} attempts. Last error: ${lastError}`
    )
    return {
      error: true,
      message: `Exception after ${attempts} attempts: ${lastError}`,
    }
  }
}

/**
 * GeminiChat class for handling chat conversations
 */
class GeminiChat {
  /**
   * Create a new chat session
   * @param {string} apiKey - Gemini API key
   * @param {string} model - Model to use
   * @param {Array} history - Initial chat history
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} retryDelayMs - Delay between retries in milliseconds
   */
  constructor(
    apiKey,
    model,
    history = [],
    maxRetries = 3,
    retryDelayMs = 1000
  ) {
    this.apiKey = apiKey
    this.model = model
    this.history = history
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
    this.maxRetries = maxRetries
    this.retryDelayMs = retryDelayMs
  }

  /**
   * Send a message in the chat with retry mechanism
   * @param {string} message - User message
   * @param {Object} options - Generation options
   * @return {Object} Chat response or error
   */
  async sendMessage(message, options = {}) {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`

    // Add user message to history
    this.history.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const payload = {
      contents: this.history,
      generationConfig: {
        temperature:
          options.temperature !== undefined ? options.temperature : 0.7,
        topK: options.topK !== undefined ? options.topK : 40,
        topP: options.topP !== undefined ? options.topP : 0.95,
        maxOutputTokens:
          options.maxOutputTokens !== undefined
            ? options.maxOutputTokens
            : 1024,
      },
    }

    // Add system instructions if provided
    if (options.systemInstructions) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstructions }],
      }
    }

    // Add safety settings if provided
    if (options.safetySettings) {
      payload.safetySettings = options.safetySettings
    }

    let attempts = 0
    let lastError = null

    while (attempts < this.maxRetries) {
      try {
        const response = await UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
        })

        const responseCode = response.getResponseCode()
        const responseText = response.getContentText()

        if (
          responseCode === 429 ||
          (responseCode >= 500 && responseCode < 600)
        ) {
          attempts++
          lastError = `API Error: ${responseCode} - ${responseText}`

          if (attempts < this.maxRetries) {
            // Exponential backoff
            const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
            Utilities.sleep(delay)
            continue
          }
        } else if (responseCode !== 200) {
          console.error(`Error: ${responseCode} - ${responseText}`)
          return {
            error: true,
            message: `API Error: ${responseCode}`,
            details: responseText,
          }
        }

        const jsonResponse = JSON.parse(responseText)

        // Handle potential safety filtering
        if (
          jsonResponse.promptFeedback &&
          jsonResponse.promptFeedback.blockReason
        ) {
          return {
            error: true,
            message: 'Message filtered',
            reason: jsonResponse.promptFeedback.blockReason,
            details: jsonResponse.promptFeedback,
          }
        }

        if (!jsonResponse.candidates || jsonResponse.candidates.length === 0) {
          return {
            error: true,
            message: 'No content generated',
            details: 'The API returned no candidates',
          }
        }

        const modelResponse = jsonResponse.candidates[0].content

        // Check if content was blocked
        if (jsonResponse.candidates[0].finishReason === 'SAFETY') {
          return {
            error: true,
            message: 'Content filtered for safety reasons',
            details:
              jsonResponse.candidates[0].safetyRatings ||
              'No details available',
          }
        }

        // Add model response to history
        this.history.push(modelResponse)

        return {
          text: modelResponse.parts[0].text,
          raw: jsonResponse,
        }
      } catch (error) {
        attempts++
        lastError = error.toString()

        if (attempts < this.maxRetries) {
          // Exponential backoff
          const delay = this.retryDelayMs * Math.pow(2, attempts - 1)
          Utilities.sleep(delay)
        }
      }
    }

    console.error(
      `Failed to send message after ${attempts} attempts. Last error: ${lastError}`
    )
    return {
      error: true,
      message: `Exception after ${attempts} attempts: ${lastError}`,
    }
  }

  /**
   * Get the current chat history
   * @return {Array} Chat history
   */
  getHistory() {
    return this.history
  }

  /**
   * Clear the chat history
   * @return {GeminiChat} This instance for chaining
   */
  clearHistory() {
    this.history = []
    return this
  }

  /**
   * Edit the chat history to modify previous exchanges
   * @param {number} index - Index in history to modify
   * @param {Object} newContent - New content to set
   * @return {GeminiChat} This instance for chaining
   */
  editHistory(index, newContent) {
    if (index >= 0 && index < this.history.length) {
      this.history[index] = newContent
    }
    return this
  }

  /**
   * Remove the last exchange from history
   * @return {GeminiChat} This instance for chaining
   */
  removeLastExchange() {
    // Remove the last model and user message pair
    if (this.history.length >= 2) {
      this.history.splice(this.history.length - 2, 2)
    }
    return this
  }
}

/**
 * Factory function to create a Gemini instance with optimized settings
 * @param {Object} options - Optional configuration
 * @return {GeminiApp|null} Gemini instance or null if no API key
 */
function createGeminiInstance(options = {}) {
  const props = PropertiesService.getUserProperties()
  const apiKey = props.getProperty(USER_PROPS_KEYS.API_KEY)
  if (!apiKey) return null

  const gemini = new GeminiApp(apiKey)

  // Set retry configuration if provided
  if (options.maxRetries !== undefined || options.retryDelayMs !== undefined) {
    gemini.setRetryConfig(options.maxRetries || 3, options.retryDelayMs || 1000)
  }

  return gemini
}

/**
 * Generate text using Gemini API
 * @param {string} prompt - Text prompt
 * @param {Object} options - Generation options
 * @return {Object} Generated content or error information
 */
function generateWithGemini(prompt, options = {}) {
  const gemini = createGeminiInstance({
    maxRetries: options.maxRetries || 3,
    retryDelayMs: options.retryDelayMs || 1000,
  })

  if (!gemini) {
    return {
      error: true,
      message: 'API Key not found. Please set up your Gemini API key.',
      timestamp: new Date().toISOString(),
    }
  }

  const modelName =
    options.model ||
    PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.MODEL) ||
    'gemini-1.5-flash'
  gemini.setModel(modelName)

  // Start timer for performance logging
  const startTime = new Date().getTime()

  try {
    const result = gemini.generateContent(prompt, options)

    // Log performance for monitoring
    const endTime = new Date().getTime()
    const executionTime = endTime - startTime

    // Performance logging removed for production

    return result
  } catch (error) {
    console.error(`Error in generateWithGemini: ${error}`)
    return {
      error: true,
      message: error.toString(),
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Generate content with user preferences from settings
 * @param {string} prompt - Text prompt
 * @param {Object} customOptions - Custom generation options
 * @return {Object} Generated content or error information
 */
function generateWithUserSettings(prompt, customOptions = {}) {
  try {
    const props = PropertiesService.getUserProperties()
    const settings = JSON.parse(
      props.getProperty(USER_PROPS_KEYS.SETTINGS) || '{}'
    )

    const options = {
      model: props.getProperty(USER_PROPS_KEYS.MODEL) || 'gemini-1.5-flash',
      temperature:
        settings.temperature !== undefined ? settings.temperature : 0.7,
      maxOutputTokens:
        settings.maxTokens !== undefined ? settings.maxTokens : 1024,
      ...customOptions,
    }

    return generateWithGemini(prompt, options)
  } catch (error) {
    console.error(`Error in generateWithUserSettings: ${error}`)
    return {
      error: true,
      message: `Failed to generate content: ${error.toString()}`,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Create a Gemini chat instance with user preferences
 * @param {Array} history - Initial chat history
 * @return {GeminiChat|null} Chat instance or null if error
 */
function createGeminiChatWithUserSettings(history = []) {
  try {
    const gemini = createGeminiInstance()
    if (!gemini) {
      return null
    }

    // Apply user's preferred model
    const props = PropertiesService.getUserProperties()
    const modelName =
      props.getProperty(USER_PROPS_KEYS.MODEL) || 'gemini-1.5-flash'
    gemini.setModel(modelName)

    // Get retry settings from user preferences if available
    const settings = JSON.parse(
      props.getProperty(USER_PROPS_KEYS.SETTINGS) || '{}'
    )
    if (settings.maxRetries || settings.retryDelayMs) {
      gemini.setRetryConfig(
        settings.maxRetries || 3,
        settings.retryDelayMs || 1000
      )
    }

    return gemini.startChat(history)
  } catch (error) {
    console.error(`Error creating chat instance: ${error}`)
    return null
  }
}

/**
 * Format raw model data for UI display
 * @param {Array} models - Raw model data from API
 * @return {Array} Formatted model data for UI
 */
function formatModels(models) {
  if (!models || !Array.isArray(models)) {
    return []
  }

  // Group by model families for better UI organization
  const modelFamilies = {
    'gemini-1.5': {
      name: 'Gemini 1.5',
      description: 'Latest multimodal model with advanced reasoning',
      models: [],
    },
    'gemini-pro': {
      name: 'Gemini Pro',
      description: 'Text-focused models with reliable performance',
      models: [],
    },
    other: {
      name: 'Other Models',
      description: 'Additional specialized models',
      models: [],
    },
  }

  // Process models
  const processedModels = models.map(model => {
    const name = model.name.split('/').pop()
    // Create user-friendly display names
    let displayName = name
    let family = 'other'

    if (name.includes('gemini-1.5-flash')) {
      displayName = 'Gemini 1.5 Flash (Fast)'
      family = 'gemini-1.5'
    } else if (name.includes('gemini-1.5-pro')) {
      displayName = 'Gemini 1.5 Pro (Powerful)'
      family = 'gemini-1.5'
    } else if (name.includes('gemini-pro')) {
      displayName = 'Gemini Pro'
      family = 'gemini-pro'
    } else if (name.includes('gemini-1.5')) {
      displayName = name.replace('gemini-1.5-', 'Gemini 1.5 ')
      family = 'gemini-1.5'
    }

    const formatted = {
      id: name,
      name: displayName,
      description: model.description || getModelDescription(name),
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
      family: family,
    }

    // Add to appropriate family
    modelFamilies[family].models.push(formatted)

    return formatted
  })

  // Sort models within each family by name
  for (const familyKey in modelFamilies) {
    modelFamilies[familyKey].models.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Additional processing to add recommeneded models flag
  const recommendedIds = ['gemini-1.5-flash', 'gemini-1.5-pro']
  processedModels.forEach(model => {
    model.recommended = recommendedIds.includes(model.id)
  })

  return processedModels
}

/**
 * Validate API key and initialize available models
 * @param {string} apiKey - Gemini API key to validate
 * @return {Object} Validation result and model data
 */
function validateAndInitializeModels(apiKey) {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, message: 'API key is empty' }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
    })

    const responseCode = response.getResponseCode()
    if (responseCode !== 200) {
      const errorText = response.getContentText()
      return {
        valid: false,
        message: `API Error: ${responseCode} - ${errorText}`,
        timestamp: new Date().toISOString(),
      }
    }

    const jsonResponse = JSON.parse(response.getContentText())
    const models = jsonResponse.models.filter(model =>
      model.name.includes('gemini')
    )

    // Format models for UI display
    const formattedModels = formatModels(models)

    // Cache the models
    PropertiesService.getUserProperties().setProperty(
      'availableModels',
      JSON.stringify(formattedModels)
    )
    PropertiesService.getUserProperties().setProperty(
      'modelsLastUpdated',
      new Date().toISOString()
    )

    return {
      valid: true,
      models: formattedModels,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Exception validating API key: ${error}`)
    return {
      valid: false,
      message: `Exception: ${error.toString()}`,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Generate resume content based on user input
 */
function generateResumeContent(userInfo) {
  const systemPrompt = `You are a professional resume writer for gaming-to-career transitions.
Guidelines:
- Be concise, specific, and achievement-focused.
- Quantify results where possible.
- Translate gaming experience to professional competencies without exaggeration.
- If critical details are missing, ask up to 3 clarifying questions first.`

  const prompt = `Create professional resume content for a ${userInfo.jobTitle} with the following details:
  
  Experience: ${userInfo.experience}
  Education: ${userInfo.education}
  Skills: ${userInfo.skills}
  
  Please format the resume content into these sections:
  1. Summary/Profile (gaming-to-professional transitions)
  2. Experience (bullet points; quantify results)
  3. Education
  4. Skills (technical + soft; include gaming-derived where relevant)
  
  For each position in the experience section, focus on achievements and quantifiable results.`

  return generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.2,
  })
}

/**
 * Generate a targeted resume and cover letter based on a job posting
 */
function generateTargetedDocuments(resumeContent, jobPostingUrl) {
  const systemPrompt = `You are an expert in resume tailoring and cover letter writing for gamers.
Guidelines:
- Tailor content precisely to the posting.
- Use keywords naturally.
- Keep tone professional and confident.
- If the posting is vague, ask 1–2 clarifying questions before drafting.`

  const prompt = `Using the following resume content:
  
  ${resumeContent}
  
  And this job posting URL: ${jobPostingUrl}
  
  1. Create a tailored resume that highlights the most relevant skills and experiences for this specific job.
  2. Write a compelling cover letter that connects the candidate's background to the requirements of the job.
  3. Identify 5–10 keywords from the job posting to include in both documents.
  
  Format your response with clear headers: "TAILORED RESUME", "COVER LETTER", and "KEYWORDS".`

  return generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.3,
    maxOutputTokens: 2048,
  })
}

/**
 * Retrieve available models from Gemini API
 */
function listGeminiModels() {
  const gemini = createGeminiInstance()
  if (!gemini) {
    return {
      error: true,
      message: 'API Key not found. Please set up your Gemini API key.',
    }
  }

  return gemini.listModels()
}

/**
 * Fetch and cache available models when validating API key
 */
function validateApiKey(apiKey) {
  // Validate and fetch models from API
  const result = fetchModelsFromApi(apiKey)
  if (!result.error) {
    const formattedModels = formatModels(result.models)
    PropertiesService.getUserProperties().setProperty(
      'availableModels',
      JSON.stringify(formattedModels)
    )
    return formattedModels
  }
  return result
}

/**
 * Get appropriate display name for a model
 */
function getDisplayName(fullName, providedDisplayName) {
  return providedDisplayName || fullName.split(' ')[0]
}

/**
 * Get default description for a model
 */
function getModelDescription(modelName) {
  // Return description based on modelName
  const descriptions = {
    'gemini-1.5-flash': 'Fast and efficient.',
    // ...other models...
  }
  return descriptions[modelName] || 'No description available.'
}

/**
 * Get available models for UI display
 */
function getAvailableGeminiModels() {
  const props =
    PropertiesService.getUserProperties().getProperty('availableModels')
  if (props) return JSON.parse(props)
  // If not available, fetch using user API key.
  const apiKey =
    PropertiesService.getUserProperties().getProperty('geminiApiKey')
  return validateApiKey(apiKey)
}

/**
 * Refresh models explicitly, useful when changing API keys
 * Ensures a fresh fetch directly from the API
 */
function refreshAvailableModels() {
  PropertiesService.getUserProperties().deleteProperty('availableModels')
}

/**
 * List available models using direct API call
 */
function fetchAllAvailableModels(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
    })

    const responseCode = response.getResponseCode()
    if (responseCode !== 200) {
      console.error(`Error fetching models: ${responseCode}`)
      return { error: true, message: `API Error: ${responseCode}` }
    }

    const jsonResponse = JSON.parse(response.getContentText())

    // Extract all Gemini models
    return jsonResponse.models.filter(model => model.name.includes('gemini'))
  } catch (error) {
    console.error(`Exception fetching models: ${error}`)
    return { error: true, message: error.toString() }
  }
}
