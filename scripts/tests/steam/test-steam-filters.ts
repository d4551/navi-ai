/**
 * Steam API Filter Test - Test different Steam API filters to get developer info
 */

async function testSteamFilters() {
  console.log('🎮 Testing Steam API filters for developer data...\n');
  
  const testAppId = 440; // Team Fortress 2 - known game
  
  const filters = [
    'basic',
    'all',
    'developers',
    'publishers',
    '',  // no filter
  ];
  
  for (const filter of filters) {
    console.log(`\n📋 Testing filter: "${filter}"`);
    
    try {
      const url = filter 
        ? `https://store.steampowered.com/api/appdetails?appids=${testAppId}&filters=${filter}`
        : `https://store.steampowered.com/api/appdetails?appids=${testAppId}`;
        
      console.log(`   URL: ${url}`);
      
      const response = await fetch(url);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const appData = data[testAppId];
        
        if (appData?.success && appData.data) {
          console.log(`   ✅ Success!`);
          console.log(`   Name: ${appData.data.name}`);
          console.log(`   Type: ${appData.data.type}`);
          console.log(`   Developers: ${JSON.stringify(appData.data.developers)}`);
          console.log(`   Publishers: ${JSON.stringify(appData.data.publishers)}`);
          
          // Show all available fields
          const fields = Object.keys(appData.data);
          console.log(`   Available fields: ${fields.slice(0, 10).join(', ')}${fields.length > 10 ? '...' : ''}`);
          
        } else {
          console.log(`   ❌ Failed or no data`);
        }
      } else {
        console.log(`   ❌ HTTP Error: ${response.status}`);
      }
      
      // Be nice to Steam's servers
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`   ❌ Error:`, error.message);
    }
  }
}

testSteamFilters();
