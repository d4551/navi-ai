#!/usr/bin/env node

/**
 * Script to clean up router titles by removing emojis
 * Since the routes already have proper icon properties, we can remove the emoji prefixes
 */

const fs = require('fs');

const routerPath = '/workspaces/navi2/src/router/index.js';

// Emoji to clean title mappings
const TITLE_CLEANUPS = {
  '🎨 Portfolio Generator': 'Portfolio Generator',
  '🗺️ Skill Mapper': 'Skill Mapper', 
  '📋 Unified Job Board': 'Unified Job Board',
  '🎮 Gaming Jobs (Redirected)': 'Gaming Jobs (Redirected)',
  '🎤 Interview Prep': 'Interview Prep',
  '🎤 Interview Session': 'Interview Session',
  '⚡ Quick Practice': 'Quick Practice',
  '🎮 Studio Interview': 'Studio Interview',
  '🗣️ Behavioral Interview': 'Behavioral Interview',
  '💻 Technical Interview': 'Technical Interview',
  '👥 Panel Interview': 'Panel Interview',
  '💰 Salary Negotiation': 'Salary Negotiation',
  '📋 Interview Review': 'Interview Review',
  '🎮 Gaming Interview': 'Gaming Interview',
  '🤖 Live AI Chat': 'Live AI Chat',
  '🎮 Studios': 'Studios',
  '📊 STUDIO INTEL': 'STUDIO INTEL',
  '⚡ THE FLOW': 'THE FLOW',
  '⚙️ THE SYSTEM': 'THE SYSTEM',
  '⚙️ System & Settings': 'System & Settings',
  '🧪 Pathology': 'Pathology',
  '🎨 Style Showcase': 'Style Showcase'
};

function updateRouterTitles() {
  try {
    console.log('🔄 Cleaning up router titles...\n');
    
    const content = fs.readFileSync(routerPath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    // Replace each emoji title with clean version
    Object.entries(TITLE_CLEANUPS).forEach(([emojiTitle, cleanTitle]) => {
      const regex = new RegExp(`title: '${emojiTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
      const matches = updatedContent.match(regex);
      
      if (matches) {
        updatedContent = updatedContent.replace(regex, `title: '${cleanTitle}'`);
        changeCount += matches.length;
        console.log(`✓ Cleaned: "${emojiTitle}" → "${cleanTitle}"`);
      }
    });
    
    // Write back the updated content
    if (changeCount > 0) {
      fs.writeFileSync(routerPath, updatedContent, 'utf8');
      console.log(`\n📊 Summary: Updated ${changeCount} route titles`);
      console.log('✅ Router titles cleaned successfully!');
    } else {
      console.log('💚 No route titles needed cleaning!');
    }
    
  } catch (error) {
    console.error('❌ Error updating router titles:', error.message);
  }
}

updateRouterTitles();
