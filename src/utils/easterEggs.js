/**
 * NAVI Easter Eggs System
 * =======================
 * Sam & Max Adventures inspired easter eggs and interactions
 * Crime noir gaming references and hidden functionality
 * Enhanced with RGB effects and achievement system
 */

import { logger } from '@/shared/utils/logger'

export class EasterEggManager {
  constructor() {
    this.achievements = new Set()
    this.sequences = {
      konami: {
        code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'],
        current: [],
        triggered: false,
        reward: 'Developer Mode Unlocked!'
      },
      gamer: {
        code: ['KeyG', 'KeyA', 'KeyM', 'KeyE', 'KeyR'],
        current: [],
        triggered: false,
        reward: 'Gamer Mode Activated!'
      },
      epic: {
        code: ['KeyE', 'KeyP', 'KeyI', 'KeyC'],
        current: [],
        triggered: false,
        reward: 'Epic Achievement Unlocked!'
      }
    }
    this.initialized = false
  }

  initialize() {
    if (this.initialized) return
    
    // Keyboard listener for sequence detection
    document.addEventListener('keydown', (event) => this.handleKeyDown(event))
    
    // Click counter for secret achievements
    this.setupClickCounters()
    
    // Time-based achievements
    this.setupTimeBasedAchievements()
    
    this.initialized = true
    logger.debug('Easter egg manager initialized')
  }

  handleKeyDown(event) {
    // Check each sequence
    Object.keys(this.sequences).forEach(seqName => {
      const sequence = this.sequences[seqName]
      
      if (sequence.triggered) return
      
      // Add key to current sequence
      sequence.current.push(event.code)
      
      // Keep only the last N keys (length of the target sequence)
      if (sequence.current.length > sequence.code.length) {
        sequence.current.shift()
      }
      
      // Check if sequence matches
      if (this.arraysEqual(sequence.current, sequence.code)) {
        this.triggerEasterEgg(seqName, sequence.reward)
        sequence.triggered = true
      }
    })
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index])
  }

  triggerEasterEgg(type, reward) {
    logger.info(`Easter egg triggered: ${type}`)
    
    switch (type) {
      case 'konami':
        this.activateKonamiCode()
        break
      case 'gamer':
        this.activateGamerMode()
        break
      case 'epic':
        this.showEpicEffect()
        break
    }
    
    this.showAchievement(reward)
    this.achievements.add(type)
    
    // Store in localStorage
    localStorage.setItem('geminiacv_easter_eggs', JSON.stringify([...this.achievements]))
  }

  activateKonamiCode() {
    // Rainbow border effect
    document.body.style.setProperty('--easter-egg-active', '1')
    document.body.classList.add('konami-mode')
    
    // Add developer tools
    this.addDeveloperTools()
    
    // Particle effect
    this.createParticleEffect('🚀', 30)
    
    setTimeout(() => {
      document.body.classList.remove('konami-mode')
    }, 10000)
  }

  activateGamerMode() {
    // Gaming aesthetic enhancements
    document.body.classList.add('ultra-gamer-mode')
    
    // RGB lighting effects
    this.addRGBLighting()
    
    // Sound effects (if available)
    this.playSound('levelup')
    
    // Gaming particles
    this.createParticleEffect('🎮', 25)
    
    setTimeout(() => {
      document.body.classList.remove('ultra-gamer-mode')
    }, 15000)
  }

  showEpicEffect() {
    // Epic explosion effect
    this.createParticleEffect(['⭐', '✨', '🌟', '💫'], 50)
    
    // Screen flash
    const flash = document.createElement('div')
    flash.className = 'epic-flash'
    flash.style.cssText = `
      position: fixed; /* Use .overlay-fixed-full class from design system */
      background: linear-gradient(45deg, #ff00ff, #00ffff, #ffff00);
      opacity: 0.8;
      z-index: 10000;
      pointer-events: none;
      animation: epicFlash 1s ease-out forwards;
    `
    
    document.body.appendChild(flash)
    
    setTimeout(() => {
      document.body.removeChild(flash)
    }, 1000)
  }

  createParticleEffect(emoji, count = 20) {
    const emojis = Array.isArray(emoji) ? emoji : [emoji]
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const particle = document.createElement('div')
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)]
        particle.className = 'easter-egg-particle'
        particle.style.cssText = `
          position: fixed;
          top: ${Math.random() * 100}vh;
          left: ${Math.random() * 100}vw;
          font-size: ${Math.random() * 2 + 1}rem;
          z-index: 9999;
          pointer-events: none;
          animation: particleFloat ${Math.random() * 3 + 2}s ease-out forwards;
        `
        
        document.body.appendChild(particle)
        
        setTimeout(() => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle)
          }
        }, 5000)
      }, i * 100)
    }
  }

  showAchievement(title) {
    const achievement = document.createElement('div')
    achievement.className = 'achievement-popup'
    achievement.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-desc">${title}</div>
        </div>
      </div>
    `
    achievement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem;
      border-radius: 12px;
      z-index: 10001;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: achievementSlide 4s ease-out forwards;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    `
    
    document.body.appendChild(achievement)
    
    setTimeout(() => {
      if (document.body.contains(achievement)) {
        document.body.removeChild(achievement)
      }
    }, 4000)
  }

  setupClickCounters() {
    // Track logo clicks
    let logoClicks = 0
    document.addEventListener('click', (event) => {
      if (event.target.closest('.logo, [class*="logo"]')) {
        logoClicks++
        if (logoClicks === 10) {
          this.showAchievement('Logo Enthusiast - Clicked logo 10 times!')
          this.createParticleEffect('🎯', 15)
        }
      }
    })
    
    // Track AI fairy interactions
    let fairyClicks = 0
    document.addEventListener('click', (event) => {
      if (event.target.closest('.ai-fairy, [class*="fairy"]')) {
        fairyClicks++
        if (fairyClicks === 5) {
          this.showAchievement('Fairy Whisperer - Befriended the AI fairy!')
          this.createParticleEffect('🧚‍♀️', 20)
        }
      }
    })
  }

  setupTimeBasedAchievements() {
    // Night owl achievement
    const currentHour = new Date().getHours()
    if (currentHour >= 23 || currentHour <= 5) {
      setTimeout(() => {
        this.showAchievement('Night Owl - Using the app during late hours!')
        this.createParticleEffect('🦉', 10)
      }, 30000) // After 30 seconds
    }
    
    // Session length achievements
    setTimeout(() => {
      this.showAchievement('Dedicated User - 5 minutes of exploration!')
      this.createParticleEffect('⏱️', 8)
    }, 5 * 60 * 1000) // 5 minutes
    
    setTimeout(() => {
      this.showAchievement('Career Explorer - 15 minutes of job hunting!')
      this.createParticleEffect('💼', 15)
    }, 15 * 60 * 1000) // 15 minutes
  }

  addDeveloperTools() {
    if (document.getElementById('easter-dev-tools')) return
    
    const devTools = document.createElement('div')
    devTools.id = 'easter-dev-tools'
    devTools.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.9);
        color: #00ff00;
        padding: 1rem;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
        border: 1px solid #00ff00;
      ">
        <div>[LAUNCH] DEVELOPER MODE ACTIVE</div>
        <div>Press 'I' to inspect elements</div>
        <div>Press 'C' to clear console</div>
        <div>Press 'Esc' to close</div>
      </div>
    `
    
    document.body.appendChild(devTools)
    
    const handleDevKeys = (event) => {
      if (event.key === 'i' || event.key === 'I') {
        console.log('[SEARCH] Inspect mode activated')
      } else if (event.key === 'c' || event.key === 'C') {
        console.clear()
        console.log('🧹 Console cleared')
      } else if (event.key === 'Escape') {
        document.body.removeChild(devTools)
        document.removeEventListener('keydown', handleDevKeys)
      }
    }
    
    document.addEventListener('keydown', handleDevKeys)
    
    setTimeout(() => {
      if (document.getElementById('easter-dev-tools')) {
        document.body.removeChild(devTools)
        document.removeEventListener('keydown', handleDevKeys)
      }
    }, 30000) // Auto-close after 30 seconds
  }

  addRGBLighting() {
    if (document.getElementById('rgb-lighting')) return
    
    const style = document.createElement('style')
    style.id = 'rgb-lighting'
    style.textContent = `
      .ultra-gamer-mode {
        --rgb-animation-speed: 2s;
      }
      
      .ultra-gamer-mode .glass-card,
      .ultra-gamer-mode .ultra-glass-card {
        animation: rgbBorder var(--rgb-animation-speed) linear infinite !important;
      }
      
      @keyframes rgbBorder {
        0% { border-color: #ff0000; box-shadow: 0 0 10px #ff0000; }
        16% { border-color: #ff8800; box-shadow: 0 0 10px #ff8800; }
        33% { border-color: #ffff00; box-shadow: 0 0 10px #ffff00; }
        50% { border-color: #00ff00; box-shadow: 0 0 10px #00ff00; }
        66% { border-color: #0088ff; box-shadow: 0 0 10px #0088ff; }
        83% { border-color: #8800ff; box-shadow: 0 0 10px #8800ff; }
        100% { border-color: #ff0000; box-shadow: 0 0 10px #ff0000; }
      }
    `
    
    document.head.appendChild(style)
    
    setTimeout(() => {
      if (document.getElementById('rgb-lighting')) {
        document.head.removeChild(style)
      }
    }, 15000)
  }

  playSound(type) {
    // Simple sound synthesis using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (type === 'levelup') {
        // Level up sound sequence
        const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            osc.connect(gain)
            gain.connect(audioContext.destination)
            
            osc.frequency.value = freq
            osc.type = 'triangle'
            gain.gain.setValueAtTime(0.1, audioContext.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
            
            osc.start(audioContext.currentTime)
            osc.stop(audioContext.currentTime + 0.3)
          }, index * 150)
        })
      }
    } catch (error) {
      logger.debug('Web Audio API not available', error)
    }
  }

  getUnlockedAchievements() {
    try {
      const stored = localStorage.getItem('geminiacv_easter_eggs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  addCustomCSS() {
    if (document.getElementById('easter-egg-styles')) return
    
    const style = document.createElement('style')
    style.id = 'easter-egg-styles'
    style.textContent = `
      @keyframes particleFloat {
        0% {
          opacity: 1;
          transform: translateY(0) rotate(0deg) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) rotate(360deg) scale(0.5);
        }
      }
      
      @keyframes achievementSlide {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        10%, 90% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes epicFlash {
        0% {
          opacity: 0.8;
        }
        50% {
          opacity: 0.4;
        }
        100% {
          opacity: 0;
        }
      }
      
      .achievement-popup {
        animation: achievementSlide 4s ease-out forwards;
      }
      
      .achievement-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .achievement-icon {
        font-size: 2rem;
      }
      
      .achievement-title {
        font-weight: bold;
        font-size: 0.9rem;
      }
      
      .achievement-desc {
        font-size: 0.8rem;
        opacity: 0.9;
      }
      
      .konami-mode {
        animation: konamiRainbow 2s linear infinite;
      }
      
      @keyframes konamiRainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `
    
    document.head.appendChild(style)
  }

  destroy() {
    this.initialized = false
    
    // Remove custom CSS
    const styles = document.getElementById('easter-egg-styles')
    if (styles) {
      document.head.removeChild(styles)
    }
    
    // Clear any active effects
    document.body.classList.remove('konami-mode', 'ultra-gamer-mode')
  }
}

// Global instance
export const easterEggs = new EasterEggManager()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    easterEggs.addCustomCSS()
    easterEggs.initialize()
  })
}