/**
 * Studio Import Integration Test
 * Tests the complete studio import flow with our fixed Steam integration
 */

import { SteamDataSource } from './src/services/ingestion/SteamDataSource';
import type { IngestionJob } from './src/services/ingestion/DataIngestionService';

interface SimpleStudio {
  id: string;
  name: string;
  description: string;
  location: string;
  games: string[];
  technologies: string[];
  dataSource: string[];
  confidence: number;
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function convertToSimpleStudio(raw: any): SimpleStudio {
  return {
    id: generateId(raw.name),
    name: raw.name,
    description: raw.description || `Gaming studio known for ${raw.games?.[0]?.name || 'game development'}`,
    location: raw.location || 'Unknown',
    games: raw.games?.map((g: any) => g.name).slice(0, 5) || [],
    technologies: ['Unity', 'C#', 'Steam SDK'], // Default gaming technologies
    dataSource: ['steam'],
    confidence: raw.confidence
  };
}

async function testStudioImportIntegration() {
  console.log('🏢 Testing Complete Studio Import Integration...\n');
  
  try {
    const steamSource = new SteamDataSource();
    
    // Test with a reasonable number for demonstration
    const testJob: IngestionJob = {
      id: 'integration-test-job',
      sourceId: 'steam',
      type: 'incremental',
      status: 'running',
      progress: 0,
      errors: [],
      metadata: { maxStudios: 20 } // This will fetch 200 apps (20 * 10)
    };
    
    console.log('🚀 Starting Steam studio import integration test...');
    console.log(`📊 Target: ${testJob.metadata.maxStudios} studios (fetching ${testJob.metadata.maxStudios * 10} apps)`);
    console.log('⏱️  This will take 2-3 minutes due to Steam rate limiting...\n');
    
    const startTime = Date.now();
    const rawStudios = await steamSource.fetchData(testJob);
    const fetchDuration = Date.now() - startTime;
    
    console.log('📊 Raw Steam Data Results:');
    console.log(`   Fetch duration: ${(fetchDuration / 1000).toFixed(1)}s`);
    console.log(`   Raw studios found: ${rawStudios.length}`);
    console.log(`   Job progress: ${testJob.progress}%`);
    console.log(`   Fetch errors: ${testJob.errors.length}`);
    
    if (rawStudios.length === 0) {
      console.log('\n❌ No studios found. Integration test failed.');
      return;
    }
    
    // Convert to simple studio format (like our services do)
    console.log('\n🔄 Converting to application format...');
    const simpleStudios: SimpleStudio[] = [];
    
    for (const raw of rawStudios) {
      if (raw.name && raw.confidence > 0.3) { // Reasonable threshold
        try {
          const simple = convertToSimpleStudio(raw);
          simpleStudios.push(simple);
        } catch (error) {
          console.log(`   ⚠️  Failed to convert studio ${raw.name}: ${error}`);
        }
      }
    }
    
    console.log(`   Converted ${simpleStudios.length} studios for application use`);
    
    // Analyze the converted studios
    console.log('\n📈 Integration Analysis:');
    
    const byConfidence = {
      high: simpleStudios.filter(s => s.confidence > 0.7).length,
      medium: simpleStudios.filter(s => s.confidence > 0.5 && s.confidence <= 0.7).length,
      low: simpleStudios.filter(s => s.confidence <= 0.5).length
    };
    
    console.log(`   High confidence (>70%): ${byConfidence.high}`);
    console.log(`   Medium confidence (50-70%): ${byConfidence.medium}`);
    console.log(`   Low confidence (≤50%): ${byConfidence.low}`);
    
    const gamesStats = {
      single: simpleStudios.filter(s => s.games.length === 1).length,
      multiple: simpleStudios.filter(s => s.games.length > 1).length,
      many: simpleStudios.filter(s => s.games.length >= 5).length,
    };
    
    console.log(`   Single game studios: ${gamesStats.single}`);
    console.log(`   Multi-game studios: ${gamesStats.multiple}`);
    console.log(`   Major studios (5+ games): ${gamesStats.many}`);
    
    // Show top studios
    console.log('\n🏆 Top Studios Found:');
    const topStudios = simpleStudios
      .sort((a, b) => b.games.length - a.games.length)
      .slice(0, 10);
      
    topStudios.forEach((studio, i) => {
      console.log(`   ${i + 1}. ${studio.name}`);
      console.log(`      Games: ${studio.games.length} (${studio.games.slice(0, 3).join(', ')}${studio.games.length > 3 ? '...' : ''})`);
      console.log(`      Confidence: ${(studio.confidence * 100).toFixed(1)}%`);
      console.log(`      ID: ${studio.id}`);
      console.log('');
    });
    
    // Simulate database storage (what would happen in real app)
    console.log('💾 Simulating Database Storage:');
    let storedCount = 0;
    let skippedCount = 0;
    
    for (const studio of simpleStudios) {
      if (studio.confidence > 0.4 && studio.games.length > 0) {
        storedCount++;
        // In real app: await studioRepository.create(studio);
      } else {
        skippedCount++;
      }
    }
    
    console.log(`   Would store: ${storedCount} studios`);
    console.log(`   Would skip: ${skippedCount} studios (low confidence/no games)`);
    
    const totalDuration = Date.now() - startTime;
    console.log(`\n✅ Integration test completed in ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`🎯 Steam integration is working and would import ${storedCount} gaming studios`);
    
    // Performance metrics
    const appsPerSecond = (testJob.metadata.maxStudios * 10) / (fetchDuration / 1000);
    const studiosPerSecond = rawStudios.length / (fetchDuration / 1000);
    
    console.log('\n📊 Performance Metrics:');
    console.log(`   Apps processed per second: ${appsPerSecond.toFixed(2)}`);
    console.log(`   Studios found per second: ${studiosPerSecond.toFixed(2)}`);
    console.log(`   Success rate: ${((rawStudios.length / (testJob.metadata.maxStudios * 10)) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

testStudioImportIntegration();
