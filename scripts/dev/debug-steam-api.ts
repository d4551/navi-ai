/**
 * Steam API Debug Test - Debug specific Steam API calls
 */

async function debugSteamAPI() {
  console.log('🔍 Debugging Steam API calls...\n');
  
  try {
    // Test 1: Get app list
    console.log('1. Testing Steam app list API...');
    const appListResponse = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v0002/');
    
    if (!appListResponse.ok) {
      console.log(`❌ App list API failed: ${appListResponse.status} ${appListResponse.statusText}`);
      return;
    }
    
    const appListData = await appListResponse.json();
    const apps = appListData.applist?.apps || [];
    console.log(`✅ Got ${apps.length} apps from Steam`);
    
    // Test 2: Try a few popular game IDs to see the response structure
    const testAppIds = [
      440,   // Team Fortress 2
      570,   // Dota 2  
      730,   // Counter-Strike 2
      1172470, // Apex Legends
      271590   // Grand Theft Auto V
    ];
    
    console.log('\n2. Testing app details API with known game IDs...');
    
    for (const appId of testAppIds) {
      try {
        console.log(`\n   Testing app ID ${appId}:`);
        const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`;
        console.log(`   URL: ${detailsUrl}`);
        
        const detailsResponse = await fetch(detailsUrl);
        console.log(`   Response status: ${detailsResponse.status}`);
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          console.log(`   Response keys: ${Object.keys(detailsData).join(', ')}`);
          
          const appData = detailsData[appId];
          if (appData) {
            console.log(`   App data success: ${appData.success}`);
            if (appData.success && appData.data) {
              console.log(`   Game name: ${appData.data.name}`);
              console.log(`   Game type: ${appData.data.type}`);
              console.log(`   Developers: ${appData.data.developers?.join(', ') || 'none'}`);
              console.log(`   Publishers: ${appData.data.publishers?.join(', ') || 'none'}`);
            } else {
              console.log(`   ❌ App data failed or missing`);
            }
          } else {
            console.log(`   ❌ No app data for ID ${appId}`);
          }
        } else {
          console.log(`   ❌ Request failed: ${detailsResponse.status}`);
        }
        
        // Small delay to be nice to Steam's servers
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.log(`   ❌ Error for app ${appId}:`, error.message);
      }
    }
    
    // Test 3: Look at the first few apps from the list
    console.log('\n3. Testing first few apps from the app list...');
    const firstApps = apps.slice(0, 10);
    
    for (const app of firstApps) {
      console.log(`\n   App: ${app.name} (ID: ${app.appid})`);
      try {
        const detailsResponse = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${app.appid}&filters=basic`
        );
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          const appData = detailsData[app.appid];
          
          if (appData?.success && appData.data) {
            console.log(`   ✅ Success - Type: ${appData.data.type}, Developers: ${appData.data.developers?.length || 0}`);
          } else {
            console.log(`   ⚠️  Failed or no data`);
          }
        } else {
          console.log(`   ❌ HTTP ${detailsResponse.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ Error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

debugSteamAPI();
