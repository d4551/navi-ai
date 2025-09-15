/**
 * XP and Achievement System
 * Gamifies the career development process with points, levels, and achievements
 */

import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import gamificationEvents from '@/shared/services/GamificationEvents'
import { logger } from '@/shared/utils/logger'
import { easterEggs } from '@/utils/easterEggs'

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500, 12000, 16000, 21000, 27000, 34000, 42000, 51000, 61000, 72000, 84000, 100000
]

const XP_REWARDS = {
  // Profile completion
  'profile_complete': 50,
  'profile_photo_added': 25,
  'skills_added': 30,
  'experience_added': 40,
  
  // Resume building
  'resume_created': 75,
  'resume_exported': 25,
  'resume_updated': 15,
  
  // Job applications
  'first_application': 100,
  'job_applied': 20,
  'application_interview': 50,
  'application_offer': 100,
  
  // AI interactions
  'ai_chat_started': 10,
  'ai_chat_completed': 25,
  'ai_recommendation_used': 30,
  
  // Skill development
  'skill_mapped': 20,
  'interview_practiced': 40,
  'mock_interview_completed': 60,
  
  // Social features
  'studio_explored': 15,
  'networking_contact': 25,
  'referral_requested': 30,
  
  // Achievement multipliers
  'daily_login': 10,
  'weekly_active': 50,
  'monthly_dedicated': 150
}

const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your profile information',
    icon: 'mdi-account',
    requirement: { type: 'profile_complete', count: 1 },
    xpReward: 100,
    unlocked: false
  },
  {
    id: 'job_hunter',
    name: 'Job Hunter',
    description: 'Apply to your first job',
    icon: 'mdi-target',
    requirement: { type: 'first_application', count: 1 },
    xpReward: 150,
    unlocked: false
  },
  {
    id: 'persistent_seeker',
    name: 'Persistent Seeker',
    description: 'Apply to 10 different positions',
    icon: 'mdi-fire',
    requirement: { type: 'job_applied', count: 10 },
    xpReward: 200,
    unlocked: false
  },
  {
    id: 'ai_collaborator',
    name: 'AI Collaborator',
    description: 'Use AI assistance 5 times',
    icon: '🤖',
    requirement: { type: 'ai_chat_completed', count: 5 },
    xpReward: 125,
    unlocked: false
  },
  {
    id: 'skill_mapper',
    name: 'Skill Mapper',
    description: 'Map 15 gaming skills to career opportunities',
    icon: '🗺️',
    requirement: { type: 'skill_mapped', count: 15 },
    xpReward: 175,
    unlocked: false
  },
  {
    id: 'interview_master',
    name: 'Interview Master',
    description: 'Complete 5 mock interviews',
    icon: '🎤',
    requirement: { type: 'mock_interview_completed', count: 5 },
    xpReward: 250,
    unlocked: false
  },
  {
    id: 'networking_ninja',
    name: 'Networking Ninja',
    description: 'Connect with professionals at 10 different studios',
    icon: '🥷',
    requirement: { type: 'networking_contact', count: 10 },
    xpReward: 300,
    unlocked: false
  },
  {
    id: 'career_champion',
    name: 'Career Champion',
    description: 'Reach level 10',
    icon: '🏆',
    requirement: { type: 'level', count: 10 },
    xpReward: 500,
    unlocked: false
  },
  {
    id: 'gaming_legend',
    name: 'Gaming Legend',
    description: 'Reach level 20 and unlock all features',
    icon: '👑',
    requirement: { type: 'level', count: 20 },
    xpReward: 1000,
    unlocked: false
  }
]

export function useXPSystem() {
  const store = useAppStore()
  
  // Reactive state
  const currentXP = ref(store.gamification?.xp || 0)
  const achievements = ref(store.gamification?.achievements || [...ACHIEVEMENTS])
  const actionHistory = ref(store.gamification?.actionHistory || [])
  const streaks = ref(store.gamification?.streaks || { daily: 0, weekly: 0 })
  
  // Computed values
  const currentLevel = computed(() => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (currentXP.value >= LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  })
  
  const nextLevelXP = computed(() => {
    const nextLevel = Math.min(currentLevel.value, LEVEL_THRESHOLDS.length - 1)
    return LEVEL_THRESHOLDS[nextLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  })
  
  const progressToNextLevel = computed(() => {
    const currentLevelXP = LEVEL_THRESHOLDS[Math.max(0, currentLevel.value - 1)]
    const nextLevelRequirement = nextLevelXP.value
    const progress = (currentXP.value - currentLevelXP) / (nextLevelRequirement - currentLevelXP)
    return Math.min(Math.max(progress, 0), 1) * 100
  })
  
  const unlockedAchievements = computed(() => {
    return achievements.value.filter(achievement => achievement.unlocked)
  })
  
  const availableAchievements = computed(() => {
    return achievements.value.filter(achievement => !achievement.unlocked)
  })
  
  const _totalXPFromAchievements = computed(() => {
    return unlockedAchievements.value.reduce((total, achievement) => total + achievement.xpReward, 0)
  })
  
  // Methods
  function awardXP(action, customAmount = null, context = {}) {
    const amount = customAmount || XP_REWARDS[action] || 0
    
    if (amount === 0) {
      logger.warn(`No XP reward defined for action: ${action}`)
      return
    }
    
    const oldLevel = currentLevel.value
    currentXP.value += amount
    const newLevel = currentLevel.value
    
    // Record action
    actionHistory.value.unshift({
      action,
      xp: amount,
      timestamp: new Date().toISOString(),
      context
    })
    
    // Keep only last 100 actions
    if (actionHistory.value.length > 100) {
      actionHistory.value = actionHistory.value.slice(0, 100)
    }
    
    // Check for level up
    if (newLevel > oldLevel) {
      handleLevelUp(oldLevel, newLevel)
    }

    try {
      gamificationEvents.emit('xp_awarded', { amount, reason: action, newXP: currentXP.value, oldLevel: oldLevel, newLevel })
      if (newLevel > oldLevel) {
        gamificationEvents.emit('level_up', { oldLevel, newLevel })
      }
    } catch {}
    
    // Check for achievement unlocks
    checkAchievements(action)
    
    // Save to store
    saveGameState()
    
    logger.debug(`XP awarded: +${amount} for ${action}. Total: ${currentXP.value}`)
    
    return {
      xpGained: amount,
      totalXP: currentXP.value,
      leveledUp: newLevel > oldLevel,
      newLevel,
      oldLevel
    }
  }
  
  function handleLevelUp(oldLevel, newLevel) {
    logger.info(`Level up! ${oldLevel} → ${newLevel}`)
    
    // Show celebration
    showLevelUpNotification(newLevel)
    
    // Award bonus XP for major milestones
    if (newLevel % 5 === 0) {
      const bonusXP = newLevel * 10
      currentXP.value += bonusXP
      showXPNotification(`Milestone Bonus: +${bonusXP} XP!`, 'bonus')
    }
    
    // Unlock new features at certain levels
    unlockFeatures(newLevel)
    
    // Easter egg effects
    easterEggs.createParticleEffect(['🎉', '✨', '🌟'], 20)
    easterEggs.playSound('levelup')
  }
  
  function checkAchievements(_action) {
    achievements.value.forEach(achievement => {
      if (achievement.unlocked) return
      
      const { type, count } = achievement.requirement
      let currentCount = 0
      
      if (type === 'level') {
        currentCount = currentLevel.value
      } else {
        currentCount = actionHistory.value.filter(h => h.action === type).length
      }
      
      if (currentCount >= count) {
        unlockAchievement(achievement)
      }
    })
  }
  
  function unlockAchievement(achievement) {
    achievement.unlocked = true
    currentXP.value += achievement.xpReward
    
    logger.info(`Achievement unlocked: ${achievement.name}`)
    
    showAchievementNotification(achievement)
    try {
      gamificationEvents.emit('achievement_unlocked', { id: achievement.id, name: achievement.name, description: achievement.description, xp: achievement.xpReward, icon: achievement.icon })
    } catch {}
    easterEggs.createParticleEffect(achievement.icon, 15)
    
    saveGameState()
  }
  
  function showLevelUpNotification(level) {
    const notification = {
      type: 'level-up',
      title: 'Level Up!',
      message: `You've reached level ${level}!`,
      icon: '⬆️',
      duration: 5000
    }
    
    showGameNotification(notification)
  }
  
  function showAchievementNotification(achievement) {
    const notification = {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${achievement.icon} ${achievement.name}`,
      description: achievement.description,
      icon: achievement.icon,
      duration: 6000
    }
    
    showGameNotification(notification)
  }
  
  function showXPNotification(message, type = 'xp') {
    const notification = {
      type,
      title: 'XP Gained!',
      message,
      icon: '⭐',
      duration: 3000
    }
    
    showGameNotification(notification)
  }
  
  function showGameNotification(notification) {
    // Create and show notification element
    const element = document.createElement('div')
    element.className = `game-notification ${notification.type}`
    element.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${notification.icon}</div>
        <div class="notification-text">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          ${notification.description ? `<div class="notification-description">${notification.description}</div>` : ''}
        </div>
      </div>
    `
    
    element.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem;
      border-radius: 12px;
      z-index: 10001;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      animation: notificationSlide 0.5s ease-out;
      max-width: 320px;
    `
    
    document.body.appendChild(element)
    
    setTimeout(() => {
      if (document.body.contains(element)) {
        element.style.animation = 'notificationSlideOut 0.5s ease-in forwards'
        setTimeout(() => {
          if (document.body.contains(element)) {
            document.body.removeChild(element)
          }
        }, 500)
      }
    }, notification.duration)
  }
  
  function unlockFeatures(level) {
    const featureUnlocks = {
      5: ['Advanced AI features', 'Custom resume templates'],
      10: ['Portfolio generator', 'Interview simulator'],
      15: ['Networking tools', 'Salary negotiator'],
      20: ['All premium features', 'Career mentorship']
    }
    
    if (featureUnlocks[level]) {
      const features = featureUnlocks[level]
      showXPNotification(`New features unlocked: ${features.join(', ')}`, 'feature')
    }
  }
  
  function getRecentActions(limit = 10) {
    return actionHistory.value.slice(0, limit)
  }
  
  function getAchievementProgress(achievementId) {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (!achievement || achievement.unlocked) return null
    
    const { type, count } = achievement.requirement
    let current = 0
    
    if (type === 'level') {
      current = currentLevel.value
    } else {
      current = actionHistory.value.filter(h => h.action === type).length
    }
    
    return {
      current: Math.min(current, count),
      target: count,
      percentage: (current / count) * 100
    }
  }
  
  function saveGameState() {
    const gameState = {
      xp: currentXP.value,
      achievements: achievements.value,
      actionHistory: actionHistory.value,
      streaks: streaks.value,
      lastSave: new Date().toISOString()
    }
    
    store.updateGamificationData(gameState)
  }
  
  function resetProgress() {
    currentXP.value = 0
    achievements.value = [...ACHIEVEMENTS]
    actionHistory.value = []
    streaks.value = { daily: 0, weekly: 0 }
    saveGameState()
    logger.info('XP system progress reset')
  }
  
  function exportStats() {
    return {
      level: currentLevel.value,
      xp: currentXP.value,
      achievements: unlockedAchievements.value.length,
      totalAchievements: ACHIEVEMENTS.length,
      recentActions: getRecentActions(20),
      streaks: streaks.value
    }
  }
  
  // Auto-save periodically
  let autoSaveInterval
  function startAutoSave() {
    autoSaveInterval = setInterval(saveGameState, 30000) // Every 30 seconds
  }
  
  function stopAutoSave() {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }
  
  // Initialize CSS for notifications
  function initializeCSS() {
    if (document.getElementById('xp-system-styles')) return
    
    const style = document.createElement('style')
    style.id = 'xp-system-styles'
    style.textContent = `
      @keyframes notificationSlide {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes notificationSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      .game-notification {
        font-family: 'Inter', sans-serif;
      }
      
      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }
      
      .notification-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      
      .notification-title {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      
      .notification-message {
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .notification-description {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-top: 0.25rem;
      }
      
      .game-notification.level-up {
        background: linear-gradient(135deg, #f093fb, #f5576c);
      }
      
      .game-notification.achievement {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
      }
      
      .game-notification.xp {
        background: linear-gradient(135deg, #43e97b, #38f9d7);
      }
      
      .game-notification.bonus {
        background: linear-gradient(135deg, #fa709a, #fee140);
      }
      
      .game-notification.feature {
        background: linear-gradient(135deg, #a8edea, #fed6e3);
        color: var(--text-primary);
      }
    `
    
    document.head.appendChild(style)
  }
  
  // Initialize on creation
  initializeCSS()
  startAutoSave()
  
  return {
    // State
    currentXP: computed(() => currentXP.value),
    currentLevel,
    nextLevelXP,
    progressToNextLevel,
    achievements: computed(() => achievements.value),
    unlockedAchievements,
    availableAchievements,
    actionHistory: computed(() => actionHistory.value),
    
    // Methods
    awardXP,
    getRecentActions,
    getAchievementProgress,
    resetProgress,
    exportStats,
    saveGameState,
    stopAutoSave
  }
}

export default useXPSystem
