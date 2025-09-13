// Test script to manually trigger achievement popup modal
// This can be run in the browser console or as a standalone script

import gamificationEvents from './src/shared/services/GamificationEvents.js'

// Function to test achievement popup
function testAchievementPopup() {
  console.log('Testing achievement popup modal...')

  // Trigger an achievement unlocked event
  gamificationEvents.emit('achievement_unlocked', {
    id: 'test_achievement',
    name: 'Test Achievement',
    description: 'This is a test achievement to verify the popup modal works',
    icon: 'mdi-trophy-variant',
    xp: 100
  })

  console.log('Achievement event emitted!')
}

// Function to test XP gain popup
function testXPGainPopup() {
  console.log('Testing XP gain popup...')

  gamificationEvents.emit('xp_awarded', {
    amount: 50,
    reason: 'Test Action',
    newXP: 150,
    oldLevel: 1,
    newLevel: 1
  })

  console.log('XP gain event emitted!')
}

// Function to test level up
function testLevelUp() {
  console.log('Testing level up celebration...')

  gamificationEvents.emit('level_up', {
    oldLevel: 1,
    newLevel: 2,
    title: 'Player'
  })

  console.log('Level up event emitted!')
}

// Export functions for use
if (typeof window !== 'undefined') {
  window.testAchievementPopup = testAchievementPopup
  window.testXPGainPopup = testXPGainPopup
  window.testLevelUp = testLevelUp
  console.log('Test functions available:')
  console.log('- testAchievementPopup()')
  console.log('- testXPGainPopup()')
  console.log('- testLevelUp()')
}

export { testAchievementPopup, testXPGainPopup, testLevelUp }
