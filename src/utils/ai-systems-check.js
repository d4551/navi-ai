/**
 * Google AI SDK Systems Check
 * Comprehensive diagnostic tool to verify Google AI integration
 *
 * Run this in browser console: await window.runAISystemsCheck()
 * Or import and call: import { runAISystemsCheck } from '@/utils/ai-systems-check'
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { useAppStore } from '@/stores/app'
import { logger } from '@/shared/utils/logger'

// Test configuration
const TEST_CONFIG = {
  testPrompt: 'Say "Hello, AI systems check successful!" - keep it brief.',
  testModels: ['gemini-1.5-flash', 'gemini-1.5-pro'], // Removed deprecated gemini-pro
  maxTimeout: 30000, // 30 seconds
  retryAttempts: 2,
}

// Systems check results
let checkResults = {
  timestamp: new Date().toISOString(),
  environment: {},
  apiKey: {},
  connectivity: {},
  models: {},
  services: {},
  performance: {},
  overall: { status: 'pending', score: 0, issues: [] },
}

/**
 * Main systems check function
 */
export async function runAISystemsCheck(apiKey = null) {
  logger.info(
    '🤖 Google AI SDK Systems Check: starting comprehensive diagnostic...'
  )

  try {
    // Reset results
    checkResults = {
      timestamp: new Date().toISOString(),
      environment: {},
      apiKey: {},
      connectivity: {},
      models: {},
      services: {},
      performance: {},
      overall: { status: 'running', score: 0, issues: [] },
    }

    // Get API key from parameter or store
    const store = useAppStore()
    const testApiKey = apiKey || store.settings?.geminiApiKey

    if (!testApiKey) {
      throw new Error(
        'No API key provided. Set one in Settings or pass as parameter.'
      )
    }

    // Run all checks
    await checkEnvironment()
    await checkApiKey(testApiKey)
    await checkConnectivity(testApiKey)
    await checkModelAvailability(testApiKey)
    await checkServiceIntegration()
    await checkPerformance(testApiKey)

    // Calculate overall score
    calculateOverallScore()

    // Display results
    displayResults()

    return checkResults
  } catch (error) {
    logger.error('❌ Systems check failed:', error)
    checkResults.overall = {
      status: 'failed',
      score: 0,
      error: error.message,
      issues: [error.message],
    }
    return checkResults
  } finally {
    // end diagnostic
  }
}

/**
 * Check environment and dependencies
 */
async function checkEnvironment() {
  logger.debug('[SEARCH] Checking environment...')
  const start = performance.now()

  try {
    const env = {
      userAgent: navigator.userAgent,
      isElectron: !!(window.api || window.electronAPI),
      hasGoogleAI: typeof GoogleGenerativeAI !== 'undefined',
      nodeEnv: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    }

    // Test Google AI SDK import
    try {
      const testInstance = new GoogleGenerativeAI('test')
      env.googleAIVersion = testInstance.constructor.name
      env.sdkStatus = 'loaded'
    } catch (error) {
      env.sdkStatus = 'error'
      env.sdkError = error.message
    }

    // Check for required globals
    env.globals = {
      fetch: typeof fetch !== 'undefined',
      console: typeof console !== 'undefined',
      performance: typeof performance !== 'undefined',
    }

    checkResults.environment = {
      ...env,
      duration: performance.now() - start,
      status: env.hasGoogleAI && env.sdkStatus === 'loaded' ? 'pass' : 'fail',
    }

    logger.info(
      `✅ Environment check completed: ${checkResults.environment.status}`
    )
  } catch (error) {
    checkResults.environment = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    logger.error('❌ Environment check failed:', error)
  }
}

/**
 * Validate API key format and basic properties
 */
async function checkApiKey(apiKey) {
  logger.debug('🔑 Validating API key...')
  const start = performance.now()

  try {
    const validation = {
      provided: !!apiKey,
      format: 'invalid',
      length: apiKey?.length || 0,
      prefix: '',
      structure: 'invalid',
    }

    if (apiKey) {
      validation.prefix = apiKey.substring(0, 8) + '...'

      // Basic format validation
      if (apiKey.length >= 30 && apiKey.startsWith('AIza')) {
        validation.format = 'valid'
        validation.structure = 'google-ai-studio'
      } else if (apiKey.length >= 20) {
        validation.format = 'possible'
        validation.structure = 'unknown'
      }
    }

    checkResults.apiKey = {
      ...validation,
      duration: performance.now() - start,
      status: validation.format === 'valid' ? 'pass' : 'fail',
    }

    logger.info(
      `✅ API key validation completed: ${checkResults.apiKey.status}`
    )
  } catch (error) {
    checkResults.apiKey = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    logger.error('❌ API key validation failed:', error)
  }
}

/**
 * Test basic connectivity to Google AI API
 */
async function checkConnectivity(apiKey) {
  logger.debug('🌐 Testing API connectivity...')
  const start = performance.now()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    // Test 1: List models (basic connectivity)
    logger.debug('  📡 Testing model listing...')
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const connectivity = {
      modelsEndpoint: {
        status: modelsResponse.ok ? 'pass' : 'fail',
        statusCode: modelsResponse.status,
        statusText: modelsResponse.statusText,
      },
    }

    if (modelsResponse.ok) {
      const data = await modelsResponse.json()
      connectivity.modelsEndpoint.modelCount = data.models?.length || 0
      connectivity.modelsEndpoint.hasGemini =
        data.models?.some(m => m.name?.includes('gemini')) || false
    }

    // Test 2: Simple generation request
    console.log('  🧠 Testing content generation...')
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await Promise.race([
        model.generateContent('Hello'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Generation timeout')), 10000)
        ),
      ])

      const response = await result.response
      connectivity.generation = {
        status: 'pass',
        hasResponse: !!response,
        hasText: !!response.text(),
      }
    } catch (genError) {
      connectivity.generation = {
        status: 'fail',
        error: genError.message,
      }
    }

    checkResults.connectivity = {
      ...connectivity,
      duration: performance.now() - start,
      status:
        connectivity.modelsEndpoint.status === 'pass' &&
        connectivity.generation?.status === 'pass'
          ? 'pass'
          : 'partial',
    }

    console.log(
      '✅ Connectivity check completed:',
      checkResults.connectivity.status
    )
  } catch (error) {
    checkResults.connectivity = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    console.error('❌ Connectivity check failed:', error)
  }
}

/**
 * Test model availability and capabilities
 */
async function checkModelAvailability(apiKey) {
  console.log('[TARGET] Testing model availability...')
  const start = performance.now()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const models = {}

    // Test each model in TEST_CONFIG.testModels
    for (const modelName of TEST_CONFIG.testModels) {
      console.log(`  [FIX] Testing ${modelName}...`)

      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await Promise.race([
          model.generateContent(TEST_CONFIG.testPrompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Model timeout')), 15000)
          ),
        ])

        const response = await result.response
        const text = response.text()

        models[modelName] = {
          status: 'available',
          responseLength: text.length,
          hasValidResponse: text.length > 0,
          responsePreview:
            text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        }
      } catch (modelError) {
        models[modelName] = {
          status: 'unavailable',
          error: modelError.message,
        }
      }
    }

    const availableCount = Object.values(models).filter(
      m => m.status === 'available'
    ).length

    checkResults.models = {
      tested: models,
      availableCount,
      totalTested: TEST_CONFIG.testModels.length,
      availability: `${availableCount}/${TEST_CONFIG.testModels.length}`,
      duration: performance.now() - start,
      status: availableCount > 0 ? 'pass' : 'fail',
    }

    console.log(
      '✅ Model availability check completed:',
      checkResults.models.status
    )
  } catch (error) {
    checkResults.models = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    console.error('❌ Model availability check failed:', error)
  }
}

/**
 * Test service integrations within the app
 */
async function checkServiceIntegration() {
  console.log('🔗 Testing service integrations...')
  const start = performance.now()

  try {
    const services = {}

    // Test GeminiModelService
    try {
      const { geminiModelService } = await import(
        '@/services/GeminiModelService'
      )
      services.geminiModelService = {
        status: 'imported',
        hasInstance: !!geminiModelService,
        methods: Object.getOwnPropertyNames(
          Object.getPrototypeOf(geminiModelService)
        ),
      }
    } catch (error) {
      services.geminiModelService = {
        status: 'error',
        error: error.message,
      }
    }

    // Test AI Client
    try {
      const aiClient = await import('@/utils/aiClient')
      services.aiClient = {
        status: 'imported',
        exports: Object.keys(aiClient),
        hasInitialize: typeof aiClient.initializeAI === 'function',
      }
    } catch (error) {
      services.aiClient = {
        status: 'error',
        error: error.message,
      }
    }

    // Test Gemini Service
    try {
      const GeminiService = await import('@/utils/gemini')
      services.geminiService = {
        status: 'imported',
        isClass: typeof GeminiService.default === 'function',
        hasDefaultExport: !!GeminiService.default,
      }
    } catch (error) {
      services.geminiService = {
        status: 'error',
        error: error.message,
      }
    }

    // Test App Store AI Status
    try {
      const store = useAppStore()
      services.appStore = {
        status: 'available',
        hasAiStatus: !!store.aiStatus,
        hasSettings: !!store.settings,
        hasGeminiKey: !!store.settings?.geminiApiKey,
      }
    } catch (error) {
      services.appStore = {
        status: 'error',
        error: error.message,
      }
    }

    const serviceCount = Object.values(services).filter(
      s => s.status !== 'error'
    ).length

    checkResults.services = {
      tested: services,
      availableCount: serviceCount,
      totalTested: Object.keys(services).length,
      duration: performance.now() - start,
      status: serviceCount >= 3 ? 'pass' : 'partial',
    }

    console.log(
      '✅ Service integration check completed:',
      checkResults.services.status
    )
  } catch (error) {
    checkResults.services = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    console.error('❌ Service integration check failed:', error)
  }
}

/**
 * Test performance and response times
 */
async function checkPerformance(apiKey) {
  console.log('⚡ Testing performance...')
  const start = performance.now()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const tests = []

    // Run 3 quick generation tests
    for (let i = 0; i < 3; i++) {
      const testStart = performance.now()
      try {
        const result = await model.generateContent(`Test ${i + 1}: Say "OK"`)
        const response = await result.response
        const text = response.text()

        tests.push({
          test: i + 1,
          duration: performance.now() - testStart,
          status: 'success',
          responseLength: text.length,
        })
      } catch (error) {
        tests.push({
          test: i + 1,
          duration: performance.now() - testStart,
          status: 'error',
          error: error.message,
        })
      }
    }

    const successfulTests = tests.filter(t => t.status === 'success')
    const averageTime =
      successfulTests.length > 0
        ? successfulTests.reduce((sum, t) => sum + t.duration, 0) /
          successfulTests.length
        : 0

    checkResults.performance = {
      tests,
      successfulTests: successfulTests.length,
      averageResponseTime: Math.round(averageTime),
      maxResponseTime: Math.max(...tests.map(t => t.duration)),
      minResponseTime: Math.min(
        ...tests.filter(t => t.status === 'success').map(t => t.duration)
      ),
      duration: performance.now() - start,
      status: successfulTests.length >= 2 ? 'pass' : 'fail',
    }

    console.log(
      '✅ Performance check completed:',
      checkResults.performance.status
    )
  } catch (error) {
    checkResults.performance = {
      status: 'error',
      error: error.message,
      duration: performance.now() - start,
    }
    console.error('❌ Performance check failed:', error)
  }
}

/**
 * Calculate overall system score
 */
function calculateOverallScore() {
  const checks = [
    checkResults.environment,
    checkResults.apiKey,
    checkResults.connectivity,
    checkResults.models,
    checkResults.services,
    checkResults.performance,
  ]

  let score = 0
  const issues = []

  checks.forEach((check, index) => {
    const checkName = Object.keys(checkResults)[index]

    if (check.status === 'pass') {
      score += 20
    } else if (check.status === 'partial') {
      score += 10
      issues.push(`${checkName}: partial functionality`)
    } else if (check.status === 'fail') {
      issues.push(`${checkName}: failed`)
    } else if (check.status === 'error') {
      issues.push(`${checkName}: error - ${check.error}`)
    }
  })

  // Determine overall status
  let status = 'fail'
  if (score >= 100) status = 'excellent'
  else if (score >= 80) status = 'good'
  else if (score >= 60) status = 'partial'

  checkResults.overall = {
    status,
    score,
    issues,
    summary: `${score}/120 points - ${status.toUpperCase()}`,
  }
}

/**
 * Display formatted results
 */
function displayResults() {
  console.log('\n[STATS] SYSTEMS CHECK RESULTS')
  console.log('=' * 50)

  // Overall status
  const statusEmoji = {
    excellent: '🟢',
    good: '🟡',
    partial: '🟠',
    fail: '🔴',
  }

  console.log(
    `${statusEmoji[checkResults.overall.status]} Overall Status: ${checkResults.overall.summary}`
  )

  if (checkResults.overall.issues.length > 0) {
    console.log('\n[WARNING]  Issues found:')
    checkResults.overall.issues.forEach(issue => console.log(`   • ${issue}`))
  }

  // Detailed results
  console.log('\n📋 Detailed Results:')

  Object.entries(checkResults).forEach(([section, results]) => {
    if (section === 'overall' || section === 'timestamp') return

    const emoji =
      results.status === 'pass'
        ? '✅'
        : results.status === 'partial'
          ? '🟡'
          : results.status === 'error'
            ? '❌'
            : '⚪'

    console.log(
      `${emoji} ${section}: ${results.status} (${Math.round(results.duration)}ms)`
    )

    if (results.error) {
      console.log(`     Error: ${results.error}`)
    }
  })

  // Performance summary
  if (checkResults.performance?.averageResponseTime) {
    console.log(
      `\n⚡ Performance: ${checkResults.performance.averageResponseTime}ms average response time`
    )
  }

  // Model availability
  if (checkResults.models?.availability) {
    console.log(
      `[TARGET] Models: ${checkResults.models.availability} available`
    )
  }

  console.log('\n[TARGET] Recommendations:')

  if (checkResults.overall.score < 60) {
    console.log('   • Check your API key and internet connection')
    console.log('   • Verify API key permissions in Google AI Studio')
  }

  if (checkResults.connectivity?.status !== 'pass') {
    console.log('   • Test API connectivity from Google AI Studio')
  }

  if (checkResults.models?.availableCount === 0) {
    console.log('   • Check model permissions and quotas')
  }

  console.log('\n[MAGIC] Systems check completed!')
}

/**
 * Quick diagnostic function for console use
 */
export async function quickAICheck() {
  const store = useAppStore()
  const apiKey = store.settings?.geminiApiKey

  if (!apiKey) {
    console.error('❌ No API key found. Configure one in Settings first.')
    return { status: 'no-api-key' }
  }

  console.log('[LAUNCH] Running quick AI check...')

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const start = performance.now()
    const result = await model.generateContent('Say "Quick check successful!"')
    const response = await result.response
    const text = response.text()
    const duration = performance.now() - start

    console.log(
      `✅ Quick check successful! Response: "${text}" (${Math.round(duration)}ms)`
    )
    return {
      status: 'success',
      response: text,
      duration: Math.round(duration),
    }
  } catch (error) {
    console.error('❌ Quick check failed:', error.message)
    return {
      status: 'error',
      error: error.message,
    }
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.runAISystemsCheck = runAISystemsCheck
  window.quickAICheck = quickAICheck

  // Expose test functions for easy console access
  window.testGoogleAI = async apiKey => {
    if (!apiKey) {
      console.error('❌ Usage: testGoogleAI("your-api-key-here")')
      return { error: 'No API key provided' }
    }

    console.log('[LAUNCH] Quick Google AI test...')

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const start = performance.now()
      const result = await model.generateContent(
        'Say "Test successful!" and nothing else.'
      )
      const response = await result.response
      const text = response.text()
      const duration = performance.now() - start

      const result_obj = {
        success: true,
        response: text,
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
      }

      console.log(`✅ Success! Response: "${text}" (${result_obj.duration}ms)`)
      return result_obj
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Simple connection test without API key
  window.testGoogleAIConnection = async () => {
    console.log('🌐 Testing Google AI API connectivity...')

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models'
      )

      if (response.status === 401) {
        console.log('✅ Google AI API is reachable (401 = needs API key)')
        return { reachable: true, status: response.status }
      } else {
        console.log(
          `🌐 Google AI API responded with status: ${response.status}`
        )
        return { reachable: true, status: response.status }
      }
    } catch (error) {
      console.error(`❌ Cannot reach Google AI API: ${error.message}`)
      return { reachable: false, error: error.message }
    }
  }

  console.log('🤖 AI Systems Check utilities loaded!')
  console.log('Available functions:')
  console.log('  • runAISystemsCheck() - Full systems diagnostic')
  console.log('  • quickAICheck() - Quick API test using stored key')
  console.log('  • testGoogleAI("your-api-key") - Test with your API key')
  console.log('  • testGoogleAIConnection() - Test basic connectivity')
}

export default { runAISystemsCheck, quickAICheck }
