/**
 * Complete Steam Import - Run full Steam integration to get thousands of studios
 */

import { databaseStudioService } from './src/services/database/DatabaseStudioService.js';

async function completeSteamImport() {
  console.log('🎮 Starting FULL Steam API integration...\n');
  console.log('⏱️  This will take 10-30 minutes to complete due to Steam rate limits');
  console.log('📊 Expected to import 1,000+ gaming studios from Steam API\n');
  
  try {
    await databaseStudioService.init();
    
    // Clear existing data to start fresh
    console.log('🧹 Clearing existing studios...');
    await databaseStudioService.clearAll();
    
    // Run FULL import with Steam enabled
    console.log('🚀 Starting import with Steam API enabled...\n');
    const result = await databaseStudioService.importAllStudios(true); // Enable Steam!
    
    console.log('\n📊 FINAL Steam Import Results:');
    console.log('  ✅ Success:', result.success);
    console.log('  📈 Total processed:', result.total);
    console.log('  💾 Successfully imported:', result.imported);
    console.log('  ⏱️  Total duration:', (result.duration / 1000 / 60).toFixed(1) + ' minutes');
    console.log('  ⚠️  Error count:', result.errors.length);
    
    // Get final counts
    const allStudios = await databaseStudioService.getAllStudios();
    const steamStudios = allStudios.filter(s => s.dataSource.includes('steam'));
    const staticStudios = allStudios.filter(s => !s.dataSource.includes('steam'));
    
    console.log('\n🏢 Final Database Statistics:');
    console.log('  📊 Total studios in database:', allStudios.length);
    console.log('  🎮 From Steam API:', steamStudios.length);
    console.log('  📋 From static sources:', staticStudios.length);
    
    if (steamStudios.length > 0) {
      console.log('\n🎯 Sample Steam Studios:');
      steamStudios.slice(0, 10).forEach((studio, i) => {
        console.log(`  ${i + 1}. ${studio.name} (${studio.games?.length || 0} games, confidence: ${studio.confidence?.toFixed(2) || 'N/A'})`);
      });
      
      // Show confidence distribution
      const highConfidence = steamStudios.filter(s => s.confidence > 0.7).length;
      const mediumConfidence = steamStudios.filter(s => s.confidence > 0.4 && s.confidence <= 0.7).length;
      const lowConfidence = steamStudios.filter(s => s.confidence <= 0.4).length;
      
      console.log('\n📈 Steam Studios by Confidence:');
      console.log(`  🔥 High (>0.7): ${highConfidence} studios`);
      console.log(`  ⚡ Medium (0.4-0.7): ${mediumConfidence} studios`);
      console.log(`  💡 Lower (<0.4): ${lowConfidence} studios`);
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Sample errors:');
      result.errors.slice(0, 5).forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    console.log(`\n🎉 SUCCESS! Imported ${allStudios.length} total gaming studios to SQLite database`);
    console.log(`🎮 Steam API provided ${steamStudios.length} additional real studios`);
    
  } catch (error) {
    console.error('\n❌ Steam import failed:', error);
  }
}

// Run it
completeSteamImport();