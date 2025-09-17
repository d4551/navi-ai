#!/usr/bin/env node

/**
 * Standalone AI Systems Check Script
 * Run with: node scripts/ai-systems-check.js [API_KEY]
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

async function runNodeSystemsCheck(apiKey) {
  console.log(colorize('\n🤖 Google AI SDK Systems Check (Node.js)', 'cyan'))
  console.log(colorize('='.repeat(50), 'blue'))

  let score = 0
  const issues = []

  try {
    // 1. Check environment
    console.log(colorize('\n📋 Environment Check', 'yellow'))

    console.log('  ✓ Node.js version:', process.version)
    console.log('  ✓ Platform:', process.platform)

    try {
      const packageJson = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      )
      console.log('  ✓ Project:', packageJson.name, packageJson.version)
      score += 10
    } catch {
      console.log(colorize('  ❌ Cannot read package.json', 'red'))
      issues.push('package.json not found')
    }

    // 2. Check Google AI SDK
    console.log(colorize('\n🔧 Google AI SDK Check', 'yellow'))

    try {
      const testInstance = new GoogleGenerativeAI('test')
      console.log('  ✓ GoogleGenerativeAI class imported successfully')
      console.log('  ✓ SDK instance created:', testInstance.constructor.name)
      score += 20
    } catch (error) {
      console.log(colorize('  ❌ SDK import failed:', error.message, 'red'))
      issues.push('Google AI SDK not available')
    }

    // 3. API Key validation
    console.log(colorize('\n🔑 API Key Validation', 'yellow'))

    if (!apiKey) {
      console.log(colorize('  ⚠️  No API key provided', 'yellow'))
      console.log('     Usage: node scripts/ai-systems-check.js YOUR_API_KEY')
      issues.push('No API key provided')
    } else {
      if (apiKey.length >= 30 && apiKey.startsWith('AIza')) {
        console.log('  ✓ API key format looks valid')
        console.log('  ✓ Key prefix:', apiKey.substring(0, 8) + '...')
        score += 20
      } else {
        console.log(colorize('  ❌ API key format invalid', 'red'))
        issues.push('Invalid API key format')
      }
    }

    // 4. Connectivity test
    if (apiKey && apiKey.length >= 30) {
      console.log(colorize('\n🌐 Connectivity Test', 'yellow'))

      try {
        const genAI = new GoogleGenerativeAI(apiKey)

        // Test models endpoint
        console.log('  📡 Testing models endpoint...')
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        )

        if (response.ok) {
          const data = await response.json()
          const geminiModels =
            data.models?.filter(m => m.name?.includes('gemini')) || []
          console.log(
            `  ✓ Models endpoint: ${response.status} ${response.statusText}`
          )
          console.log(`  ✓ Found ${geminiModels.length} Gemini models`)
          score += 20
        } else {
          console.log(
            colorize(`  ❌ Models endpoint failed: ${response.status}`, 'red')
          )
          issues.push(`API endpoint error: ${response.status}`)
        }

        // Test generation
        console.log('  🧠 Testing content generation...')
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const start = Date.now()

        const result = await Promise.race([
          model.generateContent('Say "Hello from Node.js systems check!"'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Generation timeout')), 15000)
          ),
        ])

        const genResponse = await result.response
        const text = genResponse.text()
        const duration = Date.now() - start

        console.log('  ✓ Generation successful!')
        console.log(
          `  ✓ Response: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
        )
        console.log(`  ✓ Response time: ${duration}ms`)
        score += 30
      } catch (error) {
        console.log(
          colorize(`  ❌ Connectivity test failed: ${error.message}`, 'red')
        )
        issues.push(`Connectivity error: ${error.message}`)
      }
    }

    // 5. Results
    console.log(colorize('\n📊 Results Summary', 'magenta'))
    console.log('='.repeat(50))

    const maxScore = 100
    const percentage = Math.round((score / maxScore) * 100)

    let status = 'FAIL'
    let statusColor = 'red'

    if (percentage >= 80) {
      status = 'EXCELLENT'
      statusColor = 'green'
    } else if (percentage >= 60) {
      status = 'GOOD'
      statusColor = 'yellow'
    } else if (percentage >= 40) {
      status = 'PARTIAL'
      statusColor = 'yellow'
    }

    console.log(
      colorize(
        `Overall Score: ${score}/${maxScore} (${percentage}%) - ${status}`,
        statusColor
      )
    )

    if (issues.length > 0) {
      console.log(colorize('\n⚠️ Issues Found:', 'yellow'))
      issues.forEach(issue => console.log(`   • ${issue}`))
    }

    if (percentage >= 80) {
      console.log(colorize('\n🎉 All systems operational!', 'green'))
    } else if (percentage >= 40) {
      console.log(colorize('\n⚠️ Some systems need attention', 'yellow'))
    } else {
      console.log(
        colorize('\n❌ Multiple systems require configuration', 'red')
      )
    }

    console.log(colorize('\n💡 Next Steps:', 'cyan'))

    if (!apiKey) {
      console.log(
        '   • Get a free API key from https://aistudio.google.com/apikey'
      )
    } else if (issues.some(i => i.includes('API'))) {
      console.log(
        '   • Check your API key at https://aistudio.google.com/apikey'
      )
      console.log('   • Verify API key permissions for Generative AI')
    }

    if (percentage < 80) {
      console.log('   • Run: npm install @google/generative-ai')
      console.log('   • Check your internet connection')
    }

    console.log(colorize('\n✨ Systems check completed!\n', 'cyan'))

    return { score, percentage, status, issues }
  } catch (error) {
    console.error(
      colorize(`\n❌ Systems check failed: ${error.message}`, 'red')
    )
    return { score: 0, percentage: 0, status: 'ERROR', issues: [error.message] }
  }
}

// Main execution
async function main() {
  const apiKey = process.argv[2]

  if (!apiKey) {
    console.log(colorize('\n⚠️ No API key provided', 'yellow'))
    console.log('Usage: node scripts/ai-systems-check.js YOUR_GEMINI_API_KEY')
    console.log('\nOr run a basic check without API key:')
    console.log('node scripts/ai-systems-check.js --basic')
  }

  if (apiKey === '--basic') {
    await runNodeSystemsCheck(null)
  } else {
    await runNodeSystemsCheck(apiKey)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { runNodeSystemsCheck }
