/**
 * Gaming-Focused Icon System
 * Enhanced icons and easter eggs for a more immersive gaming experience
 */

export const GAMING_ICONS = {
  // Navigation Icons with Gaming Flair
  DASHBOARD: 'mdi-gamepad-variant',
  THE_BOARD: 'mdi-bulletin-board',
  RESUME: 'mdi-scroll-text',
  COVER_LETTER: 'mdi-email-seal',
  PORTFOLIO: 'mdi-treasure-chest',
  SKILLS: 'mdi-sword',
  THE_PROFILE: 'mdi-account-cog',
  INTERVIEW: 'mdi-microphone-variant',
  
  // Gaming Job Types
  PROGRAMMER: 'mdi-code-braces',
  GAME_DESIGNER: 'mdi-puzzle-edit',
  ARTIST: 'mdi-palette',
  PRODUCER: 'mdi-clipboard-list',
  QA_TESTER: 'mdi-bug',
  COMMUNITY: 'mdi-account-group',
  
  // Gaming Companies
  STUDIOS: {
    'riot-games': 'mdi-sword-cross',
    'epic-games': 'mdi-rocket-launch',
    'electronic-arts': 'mdi-gamepad-square',
    'valve-corporation': 'mdi-steam',
    'ubisoft': 'mdi-tower',
    'naughty-dog': 'mdi-dog',
    'cd-projekt-red': 'mdi-city-variant',
    'unity-technologies': 'mdi-unity',
    'supercell': 'mdi-cellphone',
    'mihoyo': 'mdi-star-shooting'
  },
  
  // Game Genres
  GENRES: {
    'battle-royale': 'mdi-target-variant',
    'moba': 'mdi-tournament',
    'fps': 'mdi-crosshairs-gps',
    'rpg': 'mdi-wizard-hat',
    'strategy': 'mdi-chess-king',
    'simulation': 'mdi-city',
    'sandbox': 'mdi-cube-outline',
    'fighting': 'mdi-boxing-glove',
    'racing': 'mdi-car-sports',
    'puzzle': 'mdi-puzzle'
  },
  
  // Achievement & XP Icons
  ACHIEVEMENTS: {
    'first-steps': 'mdi-baby-face',
    'job-hunter': 'mdi-crosshairs',
    'persistent-seeker': 'mdi-fire',
    'ai-collaborator': 'mdi-robot-love',
    'skill-mapper': 'mdi-map-legend',
    'interview-master': 'mdi-microphone-variant',
    'networking-ninja': 'mdi-ninja',
    'career-champion': 'mdi-trophy',
    'gaming-legend': 'mdi-crown'
  },
  
  // Status Icons
  STATUS: {
    online: 'mdi-circle',
    offline: 'mdi-circle-outline',
    busy: 'mdi-minus-circle',
    away: 'mdi-clock-outline',
    invisible: 'mdi-ghost'
  },
  
  // Fun Easter Egg Icons
  EASTER_EGGS: {
    konami: 'mdi-gamepad-up',
    secret: 'mdi-eye-off',
    cheat: 'mdi-console',
    bonus: 'mdi-gift',
    hidden: 'mdi-treasure-chest',
    rare: 'mdi-diamond-stone',
    legendary: 'mdi-star-circle'
  }
}

// Gaming-specific icon animations
export const ICON_ANIMATIONS = {
  PULSE: 'gaming-icon-pulse',
  BOUNCE: 'gaming-icon-bounce', 
  GLOW: 'gaming-icon-glow',
  ROTATE: 'gaming-icon-rotate',
  SHAKE: 'gaming-icon-shake',
  FLOAT: 'gaming-icon-float'
}

// Easter egg icon sequences
export const ICON_SEQUENCES = {
  KONAMI: [
    'mdi-chevron-up', 'mdi-chevron-up', 
    'mdi-chevron-down', 'mdi-chevron-down',
    'mdi-chevron-left', 'mdi-chevron-right',
    'mdi-chevron-left', 'mdi-chevron-right',
    'mdi-alpha-b', 'mdi-alpha-a'
  ],
  LEVEL_UP: [
    'mdi-star', 'mdi-star-shooting', 'mdi-trophy', 'mdi-crown'
  ]
}

// Dynamic icon getter with context awareness
export function getContextualIcon(context, item) {
  switch (context) {
    case 'navigation':
      return GAMING_ICONS[item.toUpperCase().replace('-', '_')] || 'mdi-gamepad'
      
    case 'studio':
      return GAMING_ICONS.STUDIOS[item] || 'mdi-office-building'
      
    case 'genre':
      return GAMING_ICONS.GENRES[item] || 'mdi-gamepad-variant'
      
    case 'job-type':
      return GAMING_ICONS[item.toUpperCase().replace('-', '_')] || 'mdi-briefcase'
      
    case 'achievement':
      return GAMING_ICONS.ACHIEVEMENTS[item] || 'mdi-trophy'
      
    default:
      return 'mdi-gamepad'
  }
}

// Gaming-themed icon randomizer for easter eggs
export function getRandomGamingIcon() {
  const iconSets = [
    'mdi-controller-classic', 'mdi-gamepad-variant', 'mdi-keyboard-variant',
    'mdi-mouse-variant', 'mdi-headset-dock', 'mdi-monitor-speaker',
    'mdi-dice-multiple', 'mdi-cards-playing', 'mdi-rocket',
    'mdi-sword', 'mdi-shield', 'mdi-magic-staff', 'mdi-bow-arrow'
  ]
  return iconSets[Math.floor(Math.random() * iconSets.length)]
}

// Special effects for gaming icons
export function addIconEffect(element, effect, duration = 2000) {
  if (!element) return
  
  element.classList.add(effect)
  
  setTimeout(() => {
    if (element.classList) {
      element.classList.remove(effect)
    }
  }, duration)
}

// Icon rarity system for gamification
export const ICON_RARITY = {
  COMMON: {
    color: '#8e8e8e',
    glow: 'none',
    chance: 70
  },
  UNCOMMON: {
    color: '#1eff00',
    glow: '0 0 10px #1eff00',
    chance: 20
  },
  RARE: {
    color: '#0070dd',
    glow: '0 0 15px #0070dd',
    chance: 7
  },
  EPIC: {
    color: '#a335ee',
    glow: '0 0 20px #a335ee',
    chance: 2.5
  },
  LEGENDARY: {
    color: '#ff8000',
    glow: '0 0 25px #ff8000',
    chance: 0.5
  }
}

export function getIconRarity() {
  const roll = Math.random() * 100
  
  if (roll < 0.5) return 'LEGENDARY'
  if (roll < 3) return 'EPIC'
  if (roll < 10) return 'RARE'
  if (roll < 30) return 'UNCOMMON'
  return 'COMMON'
}

// Initialize gaming icon system
export function initializeGamingIcons() {
  // Add CSS for icon animations
  if (document.getElementById('gaming-icons-styles')) return
  
  const style = document.createElement('style')
  style.id = 'gaming-icons-styles'
  style.textContent = `
    @keyframes gaming-icon-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes gaming-icon-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes gaming-icon-glow {
      0%, 100% { filter: drop-shadow(0 0 5px var(--rgb-green)); }
      50% { filter: drop-shadow(0 0 15px var(--rgb-blue)); }
    }
    
    @keyframes gaming-icon-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes gaming-icon-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    @keyframes gaming-icon-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .gaming-icon-pulse { animation: gaming-icon-pulse 2s infinite; }
    .gaming-icon-bounce { animation: gaming-icon-bounce 1.5s infinite; }
    .gaming-icon-glow { animation: gaming-icon-glow 3s infinite; }
    .gaming-icon-rotate { animation: gaming-icon-rotate 2s linear infinite; }
    .gaming-icon-shake { animation: gaming-icon-shake 0.5s infinite; }
    .gaming-icon-float { animation: gaming-icon-float 3s ease-in-out infinite; }
    
    .icon-rarity-common { color: #8e8e8e; }
    .icon-rarity-uncommon { 
      color: #1eff00; 
      filter: drop-shadow(0 0 5px #1eff00);
    }
    .icon-rarity-rare { 
      color: #0070dd; 
      filter: drop-shadow(0 0 8px #0070dd);
    }
    .icon-rarity-epic { 
      color: #a335ee; 
      filter: drop-shadow(0 0 12px #a335ee);
    }
    .icon-rarity-legendary { 
      color: #ff8000; 
      filter: drop-shadow(0 0 15px #ff8000);
      animation: gaming-icon-glow 2s infinite;
    }
    
    .gaming-icon-interactive:hover {
      transform: scale(1.1);
      transition: all 0.2s ease;
    }
    
    .gaming-icon-secret {
      opacity: 0.1;
      transition: opacity 0.3s ease;
    }
    
    .gaming-icon-secret:hover {
      opacity: 1;
    }
  `
  
  document.head.appendChild(style)
}

// Secret icon finder easter egg
export function findSecretIcons() {
  const icons = document.querySelectorAll('.mdi')
  let secretCount = 0
  
  icons.forEach((icon, _index) => {
    if (Math.random() < 0.05) { // 5% chance
      icon.classList.add('gaming-icon-secret')
      icon.title = `Secret Icon #${secretCount + 1} - Click for bonus XP!`
      icon.addEventListener('click', () => {
        icon.classList.remove('gaming-icon-secret')
        icon.classList.add('gaming-icon-bounce')
        
        // Award XP or trigger achievement
        if (window.xpSystem) {
          window.xpSystem.awardXP('secret_icon_found', 10)
        }
        
        setTimeout(() => {
          icon.classList.remove('gaming-icon-bounce')
        }, 1500)
      })
      secretCount++
    }
  })
  
  if (secretCount > 0) {
    console.log(`[GAME] Found ${secretCount} secret icons! Click them for bonus XP!`)
  }
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeGamingIcons()
    
    // Add secret icon finder after page loads
    setTimeout(findSecretIcons, 2000)
  })
}

export default GAMING_ICONS