/**
 * Steam Import Test - TypeScript version
 * Tests Steam API integration to identify issues
 */

import { DatabaseStudioService } from './src/services/database/DatabaseStudioService';

async function testSteamImport() {
  console.log('🎮 Testing Steam API studio import...\n');
  
  try {
    const databaseStudioService = new DatabaseStudioService();
    await databaseStudioService.init();
    
    // Clear database first
    await databaseStudioService.clearAll();
    console.log('📅 Cleared existing data\n');
    
    // Test just Steam integration (enabled by default now)
    const result = await databaseStudioService.importAllStudios();
    
    console.log('📊 Steam Import Results:');
    console.log('  Success:', result.success);
    console.log('  Total processed:', result.total);
    console.log('  Successfully imported:', result.imported);
    console.log('  Duration:', result.duration + 'ms');
    console.log('  Error count:', result.errors.length);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  First 5 errors:');
      result.errors.slice(0, 5).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // Get final database count
    const allStudios = await databaseStudioService.getAllStudios();
    console.log('\n🏢 Database Results:');
    console.log('  Total studios in database:', allStudios.length);
    
    // Break down by source
    const steamStudios = allStudios.filter(s => s.dataSource.includes('steam'));
    const staticStudios = allStudios.filter(s => !s.dataSource.includes('steam'));
    
    console.log('  From Steam API:', steamStudios.length);
    console.log('  From static sources:', staticStudios.length);
    
    if (steamStudios.length > 0) {
      console.log('\n🎯 Sample Steam Studios:');
      steamStudios.slice(0, 5).forEach((studio, i) => {
        console.log(`  ${i + 1}. ${studio.name} (${studio.games?.length || 0} games)`);
      });
    }
    
    console.log('\n✅ Steam integration test completed!');
    
  } catch (error) {
    console.error('❌ Steam import test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

testSteamImport();
