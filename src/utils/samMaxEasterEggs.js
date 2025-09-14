/**
 * Sam & Max Style Easter Eggs
 * Inspired by the classic adventure game series with witty dialogue and absurd humor
 * Enhanced with noir crime theme animations and detective interactions
 */

import { noirAnimations } from './noirAnimations.js';
import { logger } from '@/shared/utils/logger'

export const SAM_MAX_QUOTES = {
  BOARD_CLICKS: [
    "Sam: 'The Board' has all the latest gaming gigs, Max!",
    "Max: 'Can we arrest the jobs that don't pay enough?'",
    "Sam: 'These job postings are more organized than our case files.'",
    "Max: 'I wonder if any of these jobs involve hyperkinetic rabbity things...'",
    "Sam: 'Look Max, a Lead Game Designer position! Perfect for your creative chaos.'",
    "Max: 'Do they have health insurance for cartoon violence injuries?'",
    "Sam: 'This job board is our most reliable informant, Max.'",
    "Max: 'Should we interrogate the HR departments?'",
    "Sam: 'Every job posting tells a story of corporate intrigue.'",
    "Max: 'I bet the CEOs are all secretly crime bosses!'",
    "Sam: 'The gaming industry - where creativity meets commerce.'",
    "Max: 'Can I list 'professional troublemaker' as work experience?'"
  ],
  
  PROFILE_CLICKS: [
    "Sam: 'The Profile is where we keep all your professional dirt, Max.'",
    "Max: 'Can I list 'professional troublemaker' as a skill?'",
    "Sam: 'Your resume is looking sharp. Almost as sharp as your teeth.'",
    "Max: 'I put down 'advanced mayhem' under special abilities.'",
    "Sam: 'Remember to update your LinkedIn... oh wait, this IS better than LinkedIn.'",
    "Max: 'Can I add 'immunity to logic' as a qualification?'"
  ],
  
  AI_CLICKS: [
    "Sam: 'NAVI is our artificial intelligence assistant, Max.'",
    "Max: 'Is it smarter than a hyperkinetic rabbity thing?'",
    "Sam: 'NAVI helps match your gaming skills to career opportunities.'",
    "Max: 'Can it help me get a job as a professional chaos agent?'",
    "Sam: 'The AI recommendations are surprisingly accurate.'",
    "Max: 'Does it know about my secret stash of cheat codes?'"
  ],
  
  RANDOM_CLICKS: [
    "Max: 'This website has more personality than most NPCs!'",
    "Sam: 'Gaming careers are the future, Max. The cyberpunk future.'",
    "Max: 'I bet I could speedrun a job interview!'",
    "Sam: 'Remember when getting a job just meant showing up?'",
    "Max: 'These glass morphism effects are smoother than my one-liners!'",
    "Sam: 'The RGB lighting makes everything look more professional.'"
  ],

  KONAMI_ACTIVATION: [
    "Max: 'UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A!'",
    "Sam: 'Max, that's the Konami Code, not our case number.'",
    "Max: 'I just unlocked 30 extra lives for my career!'",
    "Sam: 'Well, I suppose we all need cheat codes sometimes.'"
  ],

  ACHIEVEMENT_UNLOCKS: [
    "Max: 'ACHIEVEMENT UNLOCKED! Do I get a trophy made of cheese?'",
    "Sam: 'That's another step toward your gaming industry domination, Max.'",
    "Max: 'I'm collecting achievements faster than speeding tickets!'",
    "Sam: 'Your professional development is as chaotic as expected.'"
  ],

  ERROR_MESSAGES: [
    "Max: 'Error 404: Max not found! Wait, here I am!'",
    "Sam: 'Technical difficulties are just puzzles in disguise, Max.'",
    "Max: 'Is this a bug or a feature? I can never tell!'",
    "Sam: 'Every good adventure has a few glitches along the way.'"
  ],

  SUSPECTS_CLICKS: [
    "Sam: 'The Suspects... every game studio has something to hide, Max.'",
    "Max: 'Should we read them their Miranda rights before hiring?'",
    "Sam: 'This surveillance data is more detailed than our actual case files.'",
    "Max: 'I bet they're all plotting to make games more addictive!'",
    "Sam: 'The persona profiles reveal their true corporate nature.'",
    "Max: 'Can we arrest them for making pay-to-win games?'",
    "Sam: 'Every studio is a suspect until proven innocent... of bad game design.'",
    "Max: 'Look Sam! This one has a suspicion level of 5! Must be EA!'",
    "Sam: 'The threat assessment is crucial for career safety, Max.'",
    "Max: 'I wonder if any of them have secret underground lairs...'"
  ],

  CASE_DASHBOARD_CLICKS: [
    "Sam: 'The Case Dashboard - our command center for gaming career operations.'",
    "Max: 'Are we solving the mystery of why I'm unemployed?'",
    "Sam: 'Every great detective needs a proper operations center.'",
    "Max: 'Can we add a 'Most Wanted' section for dream jobs?'",
    "Sam: 'The evidence is mounting that you need to update your portfolio.'",
    "Max: 'I bet there's a conspiracy to keep hyperkinetic rabbity things unemployed!'",
    "Sam: 'Detective work and job hunting require the same attention to detail.'",
    "Max: 'This dashboard has more RGB than a gaming rig!'"
  ]
};

export const SAM_MAX_INTERACTIONS = {
  DOUBLE_CLICK_RESPONSES: [
    "Max: 'Stop clicking me! I'm not a stress ball!'",
    "Sam: 'Patience, Max. Good things come to those who don't click frantically.'",
    "Max: 'CLICK CLICK CLICK! Am I a button now?'",
    "Sam: 'Your enthusiasm is noted and slightly concerning.'"
  ],

  IDLE_COMMENTS: [
    "Max: 'Are we going to stare at the screen all day, Sam?'",
    "Sam: 'Sometimes the best career moves require careful observation, Max.'",
    "Max: 'I'm bored. Can we arrest someone for not hiring us yet?'",
    "Sam: 'Patience is a virtue in both detective work and job hunting.'"
  ],

  SECRET_AREAS: [
    "Max: 'Ooh! A secret area! Is there treasure?'",
    "Sam: 'You found a hidden feature, Max. Consider it a professional easter egg.'",
    "Max: 'Secret areas are the best areas! Except for cheese areas.'",
    "Sam: 'Your curiosity serves you well in both gaming and career development.'"
  ]
};

class SamMaxEasterEggs {
  constructor() {
    this.clickCount = 0;
    this.lastQuote = '';
    this.idleTimer = null;
    this.commentElement = null;
    this.initialized = false;
    // Disabled by default; enabled via About tab egg toggle
    this.enabled = false;
  }

  initialize() {
    if (this.initialized) return;
    
    this.createCommentBubble();
    this.setupClickHandlers();
    this.setupIdleTimer();
    this.setupSpecialInteractions();
    
    // Respect persisted preference or global flag
    try {
      const saved = (typeof localStorage !== 'undefined')
        ? localStorage.getItem('samMaxCommentsVisible')
        : null;
      if (saved === 'true' || (typeof window !== 'undefined' && window.__samMaxEggEnabled === true)) {
        this.enabled = true;
      }
    } catch (_) {
      // ignore storage errors
    }
    
    // Listen for activation/deactivation from Settings About egg
    if (typeof window !== 'undefined') {
      window.addEventListener('sam-max-egg-activated', () => {
        this.enabled = true;
      });
      window.addEventListener('sam-max-egg-deactivated', () => {
        this.enabled = false;
        this.hideCommentBubble();
      });
    }
    
    this.initialized = true;
    logger.info('[GAME] Sam & Max Easter Eggs initialized! Click around to hear their commentary.');
  }

  createCommentBubble() {
    this.commentElement = document.createElement('div');
    this.commentElement.id = 'sam-max-bubble';
    this.commentElement.className = 'sam-max-comment-bubble';
    this.commentElement.innerHTML = `
      <div class="bubble-content">
        <div class="characters">
          <span class="sam">🕵️</span>
          <span class="max">🐰</span>
        </div>
        <div class="dialogue-text"></div>
      </div>
    `;
    
    // Add CSS for the bubble
    this.addCommentBubbleStyles();
    
    document.body.appendChild(this.commentElement);
    this.hideCommentBubble();
  }

  addCommentBubbleStyles() {
    if (document.getElementById('sam-max-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'sam-max-styles';
    style.textContent = `
      .sam-max-comment-bubble {
        position: fixed;
        top: var(--spacing-lg);
        right: var(--spacing-lg);
        max-width: 350px;
        background: var(--glass-surface-elevated);
        border: 2px solid var(--color-gaming-500);
        border-radius: var(--border-radius-xl);
        padding: var(--spacing-lg);
        z-index: 10002;
        opacity: 0;
        transform: translateY(-20px);
        transition: all var(--transition-normal) var(--easing-ease-out);
        box-shadow: var(--shadow-xl), 0 0 20px rgba(0, 255, 136, 0.2);
        font-family: var(--font-primary);
        backdrop-filter: blur(20px) saturate(180%);
        border-image: linear-gradient(135deg, var(--color-gaming-500), var(--color-cyber-500)) 1;
      }
      
      .sam-max-comment-bubble.visible {
        opacity: 1;
        transform: translateY(0);
        animation: bubbleEntrance 0.5s var(--easing-ease-out) forwards;
      }
      
      @keyframes bubbleEntrance {
        0% {
          opacity: 0;
          transform: translateY(-20px) scale(0.9);
        }
        50% {
          opacity: 0.8;
          transform: translateY(-5px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .sam-max-comment-bubble .bubble-content {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-md);
        position: relative;
      }
      
      .sam-max-comment-bubble .bubble-content::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, 
          rgba(0, 255, 136, 0.1), 
          rgba(0, 217, 255, 0.1)
        );
        border-radius: inherit;
        opacity: 0.5;
        z-index: -1;
      }
      
      .sam-max-comment-bubble .characters {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        font-size: 1.5rem;
        flex-shrink: 0;
        filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.3));
      }
      
      .sam-max-comment-bubble .sam {
        filter: hue-rotate(200deg) brightness(1.1);
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble .sam:hover {
        filter: hue-rotate(200deg) brightness(1.3) scale(1.1);
        text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
      }
      
      .sam-max-comment-bubble .max {
        filter: hue-rotate(300deg) brightness(1.1);
        animation: max-bounce 2s infinite;
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble .max:hover {
        filter: hue-rotate(300deg) brightness(1.3) scale(1.1);
        text-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
        animation-duration: 1s;
      }
      
      @keyframes max-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      
      .sam-max-comment-bubble .dialogue-text {
        color: var(--color-gaming-400);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-relaxed);
        text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
        font-weight: var(--font-weight-medium);
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble:hover .dialogue-text {
        color: var(--color-gaming-300);
        text-shadow: 0 0 12px rgba(0, 255, 136, 0.6);
      }
      
      .sam-max-comment-bubble::before {
        content: '';
        position: absolute;
        bottom: -12px;
        right: var(--spacing-xl);
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 12px solid var(--color-gaming-500);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }
      
      .sam-max-comment-bubble::after {
        content: '';
        position: absolute;
        bottom: -8px;
        right: calc(var(--spacing-xl) + 2px);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid var(--glass-surface-elevated);
      }
      
      /* Dark theme support */
      [data-theme="dark"] .sam-max-comment-bubble {
        background: rgba(15, 15, 15, 0.95);
        border-color: var(--color-gaming-400);
        box-shadow: var(--shadow-xl), 0 0 25px rgba(0, 255, 136, 0.3);
      }
      
      [data-theme="dark"] .sam-max-comment-bubble .dialogue-text {
        color: var(--color-gaming-300);
        text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      }
      
      [data-theme="dark"] .sam-max-comment-bubble::before {
        border-top-color: var(--color-gaming-400);
      }
      
      [data-theme="dark"] .sam-max-comment-bubble::after {
        border-top-color: rgba(15, 15, 15, 0.95);
      }
      
      /* Light theme support */
      [data-theme="light"] .sam-max-comment-bubble {
        background: var(--glass-surface-elevated);
        border-color: var(--color-gaming-600);
        box-shadow: var(--shadow-xl), 0 0 15px rgba(0, 255, 136, 0.15);
      }
      
      [data-theme="light"] .sam-max-comment-bubble .dialogue-text {
        color: var(--color-gaming-700);
        text-shadow: 0 0 6px rgba(0, 255, 136, 0.3);
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .sam-max-comment-bubble {
          top: calc(var(--spacing-xl) + 56px); /* Account for mobile toggle */
          right: var(--spacing-md);
          left: var(--spacing-md);
          max-width: none;
          border-radius: var(--border-radius-lg);
        }
        
        .sam-max-comment-bubble .characters {
          font-size: 1.25rem;
        }
        
        .sam-max-comment-bubble .dialogue-text {
          font-size: var(--font-size-xs);
        }
        
        .sam-max-comment-bubble::before {
          right: var(--spacing-lg);
          border-left-width: 8px;
          border-right-width: 8px;
          border-top-width: 8px;
        }
        
        .sam-max-comment-bubble::after {
          right: calc(var(--spacing-lg) + 2px);
          border-left-width: 6px;
          border-right-width: 6px;
          border-top-width: 6px;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .sam-max-comment-bubble {
          border-width: 3px;
          border-color: var(--text-primary);
        }
        
        .sam-max-comment-bubble .dialogue-text {
          color: var(--text-primary);
          text-shadow: none;
        }
      }
      
      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .sam-max-comment-bubble {
          transition: opacity var(--transition-normal);
        }
        
        .sam-max-comment-bubble.visible {
          animation: none;
        }
        
        .sam-max-comment-bubble .max {
          animation: none;
        }
        
        .sam-max-comment-bubble .sam:hover,
        .sam-max-comment-bubble .max:hover {
          filter: none;
          transform: none;
          text-shadow: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  showComment(text, duration = 4000) {
    // Only show comments when the Easter egg has been explicitly enabled
    if (!this.commentElement || !this.enabled) return;
    
    const dialogueText = this.commentElement.querySelector('.dialogue-text');
    dialogueText.textContent = text;
    
    this.commentElement.classList.add('visible');
    
    // Hide after duration
    setTimeout(() => {
      this.hideCommentBubble();
    }, duration);
  }

  hideCommentBubble() {
    if (this.commentElement) {
      this.commentElement.classList.remove('visible');
    }
  }

  getRandomQuote(category) {
    const quotes = SAM_MAX_QUOTES[category] || SAM_MAX_QUOTES.RANDOM_CLICKS;
    let quote;
    
    // Avoid repeating the same quote
    do {
      quote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (quote === this.lastQuote && quotes.length > 1);
    
    this.lastQuote = quote;
    return quote;
  }

  setupClickHandlers() {
    // The Board clicks (Job Search)
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-nav-item="jobs"], [href*="/jobs"], .the-board');
      if (target) {
        this.showComment(this.getRandomQuote('BOARD_CLICKS'));
        return;
      }
    });

    // The Suspects clicks (Studios)
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[href*="/studios"], .the-suspects, .studio-card, .suspect-card');
      if (target) {
        this.showComment(this.getRandomQuote('SUSPECTS_CLICKS'));
        
        // Add special noir animations for suspect interactions
        if (Math.random() < 0.3) { // 30% chance
          const suspectCard = target.closest('.studio-card, .suspect-card');
          if (suspectCard) {
            noirAnimations.suspicionRising(suspectCard);
          } else {
            noirAnimations.investigationSweep(target);
          }
        }
        return;
      }
    });

    // Case Dashboard clicks
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[href*="/dashboard"], .case-dashboard, .detective-badge');
      if (target) {
        this.showComment(this.getRandomQuote('CASE_DASHBOARD_CLICKS'));
        
        // Add detective spotlight effect
        if (Math.random() < 0.25) { // 25% chance
          noirAnimations.detectiveSpotlight(target);
        }
        return;
      }
    });

    // The Profile clicks
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[href*="/settings"], .settings-link');
      if (target) {
        this.showComment(this.getRandomQuote('PROFILE_CLICKS'));
        return;
      }
    });

    // AI/NAVI clicks
    document.addEventListener('click', (event) => {
      const target = event.target.closest('.ai-fairy, .ai-status, [class*="ai-"], .fairy-chat');
      if (target) {
        this.showComment(this.getRandomQuote('AI_CLICKS'));
        
        // Add matrix rain effect for AI interactions
        if (Math.random() < 0.15) { // 15% chance
          noirAnimations.createMatrixRain(3000);
        }
        return;
      }
    });

    // Random clicks with low probability
    document.addEventListener('click', (_event) => {
      if (Math.random() < 0.05) { // 5% chance
        this.showComment(this.getRandomQuote('RANDOM_CLICKS'));
      }
    });

    // Double click detection
    let lastClickTime = 0;
    document.addEventListener('click', (_event) => {
      const currentTime = Date.now();
      if (currentTime - lastClickTime < 400) {
        const quotes = SAM_MAX_INTERACTIONS.DOUBLE_CLICK_RESPONSES;
        this.showComment(quotes[Math.floor(Math.random() * quotes.length)]);
      }
      lastClickTime = currentTime;
    });
  }

  setupIdleTimer() {
    let idleTime = 0;
    
    const resetIdleTimer = () => {
      idleTime = 0;
    };

    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Check for idle state every second
    setInterval(() => {
      idleTime++;
      
      // Show idle comment after 30 seconds
      if (idleTime === 30) {
        const quotes = SAM_MAX_INTERACTIONS.IDLE_COMMENTS;
        this.showComment(quotes[Math.floor(Math.random() * quotes.length)], 3000);
      }
      
      // Show another comment after 2 minutes
      if (idleTime === 120) {
        this.showComment(this.getRandomQuote('RANDOM_CLICKS'), 3000);
        idleTime = 0; // Reset to avoid spamming
      }
    }, 1000);
  }

  setupSpecialInteractions() {
    // Konami code detection with special effects
    document.addEventListener('konami-activated', () => {
      this.showComment(this.getRandomQuote('KONAMI_ACTIVATION'), 5000);
      
      // Trigger dramatic screen shake and matrix rain
      noirAnimations.screenShake(2, 800);
      setTimeout(() => {
        noirAnimations.createMatrixRain(8000);
      }, 500);
    });

    // Achievement unlocks
    document.addEventListener('achievement-unlocked', (_event) => {
      setTimeout(() => {
        this.showComment(this.getRandomQuote('ACHIEVEMENT_UNLOCKS'), 4000);
      }, 1000); // Delay so it doesn't conflict with achievement popup
    });

    // Error handling with glitch effects
    window.addEventListener('error', (_event) => {
      if (Math.random() < 0.3) { // 30% chance to comment on errors
        this.showComment(this.getRandomQuote('ERROR_MESSAGES'), 3000);
        
        // Add glitch effect on errors
        const mainContent = document.querySelector('.main-content') || document.body;
        noirAnimations.noirGlitch(mainContent, 2);
      }
    });

    // Secret area discovery
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('gaming-icon-secret')) {
        const quotes = SAM_MAX_INTERACTIONS.SECRET_AREAS;
        this.showComment(quotes[Math.floor(Math.random() * quotes.length)], 4000);
      }
    });
  }

  // Special interaction: clicking on the comment bubble itself
  setupBubbleInteraction() {
    if (!this.commentElement) return;
    
    let bubbleClicks = 0;
    this.commentElement.addEventListener('click', () => {
      bubbleClicks++;
      
      const responses = [
        "Max: 'Hey! Stop poking the fourth wall!'",
        "Sam: 'The comment bubble is not interactive... or is it?'",
        "Max: 'Are you trying to break the website by clicking me?'",
        "Sam: 'I suppose even UI elements need attention sometimes.'"
      ];
      
      if (bubbleClicks <= responses.length) {
        this.showComment(responses[bubbleClicks - 1], 3000);
      } else {
        this.showComment("Max: 'Okay, you've clicked enough. Go find a job!'", 3000);
      }
    });
  }

  // Public method to trigger specific comments
  triggerComment(category, customText = null) {
    const text = customText || this.getRandomQuote(category);
    this.showComment(text);
  }

  destroy() {
    if (this.commentElement) {
      this.commentElement.remove();
      this.commentElement = null;
    }
    
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
    
    this.initialized = false;
  }
}

// Global instance
export const samMaxEasterEggs = new SamMaxEasterEggs();

// Auto-initialize
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization slightly to ensure other systems are ready
    setTimeout(() => {
      samMaxEasterEggs.initialize();
    }, 1000);
  });
}

export default samMaxEasterEggs;
