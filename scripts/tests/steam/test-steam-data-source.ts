/**
 * Steam Data Source Test - Direct test of Steam API integration
 * Tests the Steam data source without database dependencies
 */

import { SteamDataSource } from './src/services/ingestion/SteamDataSource'
import type { IngestionJob } from './src/services/ingestion/DataIngestionService'

async function testSteamDataSource() {
  console.log('🎮 Testing Steam Data Source directly...\n')

  try {
    const steamSource = new SteamDataSource()

    // Test connection first
    console.log('🔗 Testing Steam API connection...')
    const canConnect = await steamSource.testConnection()
    console.log(
      `   Steam API connection: ${canConnect ? '✅ Connected' : '❌ Failed'}`
    )

    if (!canConnect) {
      console.log('❌ Cannot connect to Steam API. Exiting.')
      return
    }

    // Get source info
    const sourceInfo = steamSource.getSourceInfo()
    console.log('\n📊 Steam Source Info:')
    console.log(`   Name: ${sourceInfo.name}`)
    console.log(`   Description: ${sourceInfo.description}`)
    console.log(`   Estimated studio count: ${sourceInfo.estimatedStudioCount}`)
    console.log(`   Data quality: ${sourceInfo.dataQuality}`)
    console.log(`   Requires API key: ${sourceInfo.requiresApiKey}`)

    // Create a test job
    const testJob: IngestionJob = {
      id: 'test-steam-job',
      sourceId: 'steam',
      type: 'incremental',
      status: 'running',
      progress: 0,
      errors: [],
      metadata: { maxStudios: 10 }, // Start small for testing
    }

    console.log('\n🚀 Fetching studio data from Steam API...')
    console.log('   This may take a minute due to Steam rate limiting...')

    const startTime = Date.now()
    const studios = await steamSource.fetchData(testJob)
    const duration = Date.now() - startTime

    console.log('\n📊 Steam Data Results:')
    console.log(`   Duration: ${duration}ms (${(duration / 1000).toFixed(1)}s)`)
    console.log(`   Studios found: ${studios.length}`)
    console.log(`   Job progress: ${testJob.progress}%`)
    console.log(`   Errors: ${testJob.errors.length}`)

    if (testJob.errors.length > 0) {
      console.log('\n⚠️  Errors during fetch:')
      testJob.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`)
      })
    }

    if (studios.length > 0) {
      console.log('\n🎯 Sample Studios Found:')
      studios.slice(0, 5).forEach((studio, i) => {
        console.log(`   ${i + 1}. ${studio.name}`)
        console.log(`      Games: ${studio.games?.length || 0}`)
        console.log(
          `      Confidence: ${(studio.confidence * 100).toFixed(1)}%`
        )
        console.log(`      Location: ${studio.location}`)
        console.log(`      Source: ${studio.sourceId}`)
        if (studio.games && studio.games.length > 0) {
          console.log(
            `      Top games: ${studio.games
              .slice(0, 3)
              .map(g => g.name)
              .join(', ')}`
          )
        }
        console.log('')
      })

      // Analyze the data
      const highConfidenceStudios = studios.filter(s => s.confidence > 0.7)
      const mediumConfidenceStudios = studios.filter(
        s => s.confidence > 0.5 && s.confidence <= 0.7
      )
      const lowConfidenceStudios = studios.filter(s => s.confidence <= 0.5)

      console.log('📈 Confidence Analysis:')
      console.log(`   High confidence (>70%): ${highConfidenceStudios.length}`)
      console.log(
        `   Medium confidence (50-70%): ${mediumConfidenceStudios.length}`
      )
      console.log(`   Low confidence (<50%): ${lowConfidenceStudios.length}`)

      const gamesPerStudio = studios.map(s => s.games?.length || 0)
      const avgGames =
        gamesPerStudio.reduce((a, b) => a + b, 0) / gamesPerStudio.length
      const maxGames = Math.max(...gamesPerStudio)

      console.log('\n🎮 Game Portfolio Analysis:')
      console.log(`   Average games per studio: ${avgGames.toFixed(1)}`)
      console.log(`   Maximum games for a studio: ${maxGames}`)

      console.log('\n✅ Steam Data Source test completed successfully!')
    } else {
      console.log('\n⚠️  No studios found. This might indicate an issue with:')
      console.log('   - Steam API rate limiting')
      console.log('   - Steam API changes')
      console.log('   - Network connectivity')
      console.log('   - Filtering criteria too strict')
    }
  } catch (error) {
    console.error('❌ Steam Data Source test failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

testSteamDataSource()
