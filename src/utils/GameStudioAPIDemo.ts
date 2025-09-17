/**
 * Enhanced Studio API Demonstration
 * Shows how to use all the JavaScript API queries you provided
 */

import { StudioDataIntegrator } from './StudioDataIntegrator'
import { EnhancedPublicAPIDataSource } from '../services/ingestion/EnhancedPublicAPIDataSource'
import { logger } from '../shared/utils/logger'

// Example demonstrating all the API queries you provided
export class GameStudioAPIDemo {
  private apiSource: EnhancedPublicAPIDataSource
  private integrator?: StudioDataIntegrator

  constructor(githubToken?: string, dbPath?: string) {
    this.apiSource = new EnhancedPublicAPIDataSource(githubToken)

    if (dbPath) {
      this.integrator = new StudioDataIntegrator(dbPath, githubToken)
    }
  }

  async demonstrateWikidataQueries() {
    console.log('\n[SEARCH] Demonstrating Wikidata SPARQL Queries...')

    // This uses the enhanced Wikidata queries internally
    const mockJob = {
      id: 'demo-wikidata',
      sourceId: 'wikidata',
      type: 'full_sync' as const,
      status: 'running' as const,
      progress: 0,
      errors: [],
      metadata: { maxStudios: 10 },
    }

    try {
      const studios = await this.apiSource.fetchData(mockJob)
      const wikidataStudios = studios.filter(s => s.sourceId === 'wikidata')

      console.log(`   ✅ Found ${wikidataStudios.length} studios from Wikidata`)

      if (wikidataStudios.length > 0) {
        const sample = wikidataStudios[0]
        console.log('   📋 Sample studio:', {
          name: sample.name,
          location: sample.location,
          metadata: {
            foundedDate: sample.metadata?.foundedDate,
            employeeCount: sample.metadata?.employeeCount,
            games: sample.metadata?.games?.length || 0,
          },
        })
      }
    } catch (error) {
      console.log('   ❌ Wikidata query failed:', error)
    }
  }

  async demonstrateGitHubQueries() {
    console.log('\n🐙 Demonstrating GitHub API Queries...')

    try {
      // Test GitHub connectivity
      const isConnected = await this.apiSource.testConnection()
      console.log(`   🔗 GitHub API accessible: ${isConnected ? '✅' : '❌'}`)

      const mockJob = {
        id: 'demo-github',
        sourceId: 'github',
        type: 'full_sync' as const,
        status: 'running' as const,
        progress: 0,
        errors: [],
        metadata: { maxStudios: 5 },
      }

      const studios = await this.apiSource.fetchData(mockJob)
      const githubStudios = studios.filter(s => s.sourceId === 'github')

      console.log(`   ✅ Found ${githubStudios.length} studios from GitHub`)

      if (githubStudios.length > 0) {
        const sample = githubStudios[0]
        console.log('   📋 Sample GitHub organization:', {
          name: sample.name,
          repos: sample.metadata?.publicRepos,
          gameProjects: sample.metadata?.gameProjects,
          followers: sample.metadata?.followers,
        })
      }
    } catch (error) {
      console.log('   ❌ GitHub query failed:', error)
    }
  }

  async demonstrateWikipediaQueries() {
    console.log('\n📚 Demonstrating Wikipedia API Queries...')

    try {
      const mockJob = {
        id: 'demo-wikipedia',
        sourceId: 'wikipedia',
        type: 'full_sync' as const,
        status: 'running' as const,
        progress: 0,
        errors: [],
        metadata: { maxStudios: 10 },
      }

      const studios = await this.apiSource.fetchData(mockJob)
      const wikipediaStudios = studios.filter(s => s.sourceId === 'wikipedia')

      console.log(
        `   ✅ Found ${wikipediaStudios.length} studios from Wikipedia`
      )

      if (wikipediaStudios.length > 0) {
        const sample = wikipediaStudios[0]
        console.log('   📋 Sample Wikipedia page:', {
          name: sample.name,
          hasDescription:
            !!sample.description && sample.description.length > 50,
          categories: sample.metadata?.categories?.length || 0,
          hasThumbnail: !!sample.metadata?.thumbnail,
        })
      }
    } catch (error) {
      console.log('   ❌ Wikipedia query failed:', error)
    }
  }

  async demonstrateDBpediaQueries() {
    console.log('\n🔗 Demonstrating DBpedia SPARQL Queries...')

    try {
      const mockJob = {
        id: 'demo-dbpedia',
        sourceId: 'dbpedia',
        type: 'full_sync' as const,
        status: 'running' as const,
        progress: 0,
        errors: [],
        metadata: { maxStudios: 10 },
      }

      const studios = await this.apiSource.fetchData(mockJob)
      const dbpediaStudios = studios.filter(s => s.sourceId === 'dbpedia')

      console.log(`   ✅ Found ${dbpediaStudios.length} studios from DBpedia`)

      if (dbpediaStudios.length > 0) {
        const sample = dbpediaStudios[0]
        console.log('   📋 Sample DBpedia entry:', {
          name: sample.name,
          hasAbstract: !!sample.description && sample.description.length > 100,
          foundedDate: sample.metadata?.foundedDate,
          website: sample.websites?.[0],
        })
      }
    } catch (error) {
      console.log('   ❌ DBpedia query failed:', error)
    }
  }

  async demonstrateDataAggregation() {
    console.log('\n🔄 Demonstrating Complete Data Aggregation...')

    try {
      const mockJob = {
        id: 'demo-aggregation',
        sourceId: 'enhanced-public-apis',
        type: 'full_sync' as const,
        status: 'running' as const,
        progress: 0,
        errors: [],
        metadata: { maxStudios: 50 },
      }

      console.log('   ⏳ Fetching from all APIs (this may take a moment)...')
      const studios = await this.apiSource.fetchData(mockJob)

      // Analyze the aggregated data
      const sourceBreakdown = studios.reduce(
        (acc, studio) => {
          const sources = studio.metadata?.sources || [studio.sourceId]
          sources.forEach((source: string) => {
            acc[source] = (acc[source] || 0) + 1
          })
          return acc
        },
        {} as Record<string, number>
      )

      const multiSourceStudios = studios.filter(
        s => s.metadata?.sources && s.metadata.sources.length > 1
      )

      const highConfidenceStudios = studios.filter(s => s.confidence >= 0.8)

      console.log('\n   [STATS] Aggregation Results:')
      console.log(`      🏢 Total unique studios: ${studios.length}`)
      console.log(`      🔗 Multi-source studios: ${multiSourceStudios.length}`)
      console.log(
        `      ⭐ High confidence (≥0.8): ${highConfidenceStudios.length}`
      )

      console.log('\n   📋 Source breakdown:')
      Object.entries(sourceBreakdown).forEach(([source, count]) => {
        console.log(`      ${source}: ${count}`)
      })

      // Show examples of data quality
      if (multiSourceStudios.length > 0) {
        console.log('\n   [STAR] Sample multi-source studio:')
        const sample = multiSourceStudios[0]
        console.log(`      Name: ${sample.name}`)
        console.log(`      Sources: ${sample.metadata?.sources?.join(', ')}`)
        console.log(`      Confidence: ${sample.confidence}`)
        console.log(`      Websites: ${sample.websites?.length || 0}`)
      }
    } catch (error) {
      console.log('   ❌ Aggregation failed:', error)
    }
  }

  async demonstrateDatabaseIntegration() {
    if (!this.integrator) {
      console.log(
        '\n[WARNING]  Database integration skipped (no database path provided)'
      )
      return
    }

    console.log('\n💾 Demonstrating SQLite Database Integration...')

    try {
      // Fetch and store a small batch
      const result = await this.integrator.fetchAndStoreStudios(30)

      console.log('   📁 Storage results:')
      console.log(`      New studios: ${result.new}`)
      console.log(`      Updated studios: ${result.updated}`)
      console.log(`      Total processed: ${result.total}`)

      // Show database statistics
      const stats = this.integrator.getStudioStats()
      console.log('\n   📈 Database stats:')
      console.log(`      Total in database: ${stats.total}`)
      console.log(`      Average confidence: ${stats.avgConfidence}`)
      console.log(`      High confidence count: ${stats.highConfidence}`)

      // Demonstrate search functionality
      const searchResults = this.integrator.searchStudios('game')
      console.log(
        `\n   [SEARCH] Search for "game": ${searchResults.length} results`
      )

      if (searchResults.length > 0) {
        console.log(`      Top result: ${searchResults[0].name}`)
      }
    } catch (error) {
      console.log('   ❌ Database integration failed:', error)
    } finally {
      this.integrator.close()
    }
  }

  async demonstrateUtilityFunctions() {
    console.log('\n🛠️  Demonstrating Utility Functions...')

    // Show the source information
    const sourceInfo = this.apiSource.getSourceInfo()
    console.log('   📋 Enhanced API Source Info:')
    console.log(`      ID: ${sourceInfo.id}`)
    console.log(`      Name: ${sourceInfo.name}`)
    console.log(`      Estimated Count: ${sourceInfo.estimatedStudioCount}`)
    console.log(`      Data Quality: ${sourceInfo.dataQuality}`)

    console.log('\n   [STAR] Features:')
    sourceInfo.features?.forEach(feature => {
      console.log(`      • ${feature}`)
    })

    console.log('\n   📚 Data Sources:')
    sourceInfo.sources?.forEach(source => {
      console.log(`      • ${source}`)
    })
  }

  async runFullDemo() {
    console.log('[GAME] Enhanced Gaming Studio API Demonstration')
    console.log('==========================================')

    try {
      await this.demonstrateUtilityFunctions()
      await this.demonstrateWikidataQueries()
      await this.demonstrateGitHubQueries()
      await this.demonstrateWikipediaQueries()
      await this.demonstrateDBpediaQueries()
      await this.demonstrateDataAggregation()
      await this.demonstrateDatabaseIntegration()

      console.log('\n[SUCCESS] Demo completed successfully!')
    } catch (error) {
      console.error('\n❌ Demo failed:', error)
      throw error
    }
  }
}

// Run the demo if called directly
export async function runEnhancedAPIDemo(
  githubToken?: string,
  dbPath?: string
) {
  const demo = new GameStudioAPIDemo(githubToken, dbPath)
  return demo.runFullDemo()
}

// CLI interface
if (typeof globalThis !== 'undefined' && (globalThis as any).process?.argv) {
  const githubToken = process.env.GITHUB_TOKEN
  const dbPath = process.env.DB_PATH || './data/navi.db'

  runEnhancedAPIDemo(githubToken, dbPath)
    .then(() => {
      logger.info('Enhanced API demo completed')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Enhanced API demo failed:', error)
      process.exit(1)
    })
}

export default GameStudioAPIDemo
