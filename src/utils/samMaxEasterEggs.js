
import { noirAnimations } from "./noirAnimations.js";
import { logger } from "@/shared/utils/logger";

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
    "Max: 'Can I list 'professional troublemaker' as work experience?'",
  ],

  PROFILE_CLICKS: [
    "Sam: 'The Profile is where we keep all your professional dirt, Max.'",
    "Max: 'Can I list 'professional troublemaker' as a skill?'",
    "Sam: 'Your resume is looking sharp. Almost as sharp as your teeth.'",
    "Max: 'I put down 'advanced mayhem' under special abilities.'",
    "Sam: 'Remember to update your LinkedIn... oh wait, this IS better than LinkedIn.'",
    "Max: 'Can I add 'immunity to logic' as a qualification?'",
  ],

  AI_CLICKS: [
    "Sam: 'NAVI is our artificial intelligence assistant, Max.'",
    "Max: 'Is it smarter than a hyperkinetic rabbity thing?'",
    "Sam: 'NAVI helps match your gaming skills to career opportunities.'",
    "Max: 'Can it help me get a job as a professional chaos agent?'",
    "Sam: 'The AI recommendations are surprisingly accurate.'",
    "Max: 'Does it know about my secret stash of cheat codes?'",
  ],

  RANDOM_CLICKS: [
    "Max: 'This website has more personality than most NPCs!'",
    "Sam: 'Gaming careers are the future, Max. The cyberpunk future.'",
    "Max: 'I bet I could speedrun a job interview!'",
    "Sam: 'Remember when getting a job just meant showing up?'",
    "Max: 'These glass morphism effects are smoother than my one-liners!'",
    "Sam: 'The RGB lighting makes everything look more professional.'",
  ],

  KONAMI_ACTIVATION: [
    "Max: 'UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A!'",
    "Sam: 'Max, that's the Konami Code, not our case number.'",
    "Sam: 'Well, I suppose we all need cheat codes sometimes.'",
  ],

  ACHIEVEMENT_UNLOCKS: [
    "Max: 'ACHIEVEMENT UNLOCKED! Do I get a trophy made of cheese?'",
    "Sam: 'That's another step toward your gaming industry domination, Max.'",
    "Max: 'I'm collecting achievements faster than speeding tickets!'",
    "Sam: 'Your professional development is as chaotic as expected.'",
  ],

  ERROR_MESSAGES: [
    "Sam: 'Technical difficulties are just puzzles in disguise, Max.'",
    "Max: 'Is this a bug or a feature? I can never tell!'",
    "Sam: 'Every good adventure has a few glitches along the way.'",
  ],

  SUSPECTS_CLICKS: [
    "Sam: 'Studios... every game studio has something to hide, Max.'",
    "Max: 'Should we read them their Miranda rights before hiring?'",
    "Sam: 'This surveillance data is more detailed than our actual case files.'",
    "Max: 'I bet they're all plotting to make games more addictive!'",
    "Sam: 'The persona profiles reveal their true corporate nature.'",
    "Max: 'Can we arrest them for making pay-to-win games?'",
    "Sam: 'Every studio is a suspect until proven innocent... of bad game design.'",
    "Sam: 'The threat assessment is crucial for career safety, Max.'",
    "Max: 'I wonder if any of them have secret underground lairs...'",
  ],

  CASE_DASHBOARD_CLICKS: [
    "Sam: 'The Case Dashboard - our command center for gaming career operations.'",
    "Max: 'Are we solving the mystery of why I'm unemployed?'",
    "Sam: 'Every great detective needs a proper operations center.'",
    "Max: 'Can we add a 'Most Wanted' section for dream jobs?'",
    "Sam: 'The evidence is mounting that you need to update your portfolio.'",
    "Max: 'I bet there's a conspiracy to keep hyperkinetic rabbity things unemployed!'",
    "Sam: 'Detective work and job hunting require the same attention to detail.'",
    "Max: 'This dashboard has more RGB than a gaming rig!'",
  ],
};

export const SAM_MAX_INTERACTIONS = {
  DOUBLE_CLICK_RESPONSES: [
    "Max: 'Stop clicking me! I'm not a stress ball!'",
    "Sam: 'Patience, Max. Good things come to those who don't click frantically.'",
    "Max: 'CLICK CLICK CLICK! Am I a button now?'",
    "Sam: 'Your enthusiasm is noted and slightly concerning.'",
  ],

  IDLE_COMMENTS: [
    "Max: 'Are we going to stare at the screen all day, Sam?'",
    "Sam: 'Sometimes the best career moves require careful observation, Max.'",
    "Max: 'I'm bored. Can we arrest someone for not hiring us yet?'",
    "Sam: 'Patience is a virtue in both detective work and job hunting.'",
  ],

  SECRET_AREAS: [
    "Max: 'Ooh! A secret area! Is there treasure?'",
    "Max: 'Secret areas are the best areas! Except for cheese areas.'",
    "Sam: 'Your curiosity serves you well in both gaming and career development.'",
  ],
};

class SamMaxEasterEggs {
  constructor() {
    this.lastQuote = "";
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
      const saved =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("samMaxCommentsVisible")
          : null;
      if (
        saved === "true" ||
        (typeof window !== "undefined" && window.__samMaxEggEnabled === true)
      ) {
        this.enabled = true;
      }
    } catch {
      // ignore storage errors
    }

    // Listen for activation/deactivation from Settings About egg
    if (typeof window !== "undefined") {
      window.addEventListener("sam-max-egg-activated", () => {
        this.enabled = true;
      });
      window.addEventListener("sam-max-egg-deactivated", () => {
        this.enabled = false;
        this.hideCommentBubble();
      });
    }

    this.initialized = true;
    logger.info(
    );
  }

  createCommentBubble() {
    this.commentElement = document.createElement("div");
    this.commentElement.id = "sam-max-bubble";
    this.commentElement.className = "sam-max-comment-bubble";
    this.commentElement.innerHTML = `
      <div class="bubble-content">
        <div class="characters">
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
    if (document.getElementById("sam-max-styles")) return;

    const style = document.createElement("style");
    style.id = "sam-max-styles";
    style.textContent = `
      .sam-max-comment-bubble {
        position: fixed;
        top: var(--spacing-lg);
        right: var(--spacing-lg);
        background: var(--glass-surface-elevated);
        border-radius: var(--border-radius-xl);
        padding: var(--spacing-lg);
        transition: all var(--transition-normal) var(--easing-ease-out);
        font-family: var(--font-primary);
      }
      
      .sam-max-comment-bubble.visible {
      }
      
      @keyframes bubbleEntrance {
        }
        }
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
        );
        border-radius: inherit;
      }
      
      .sam-max-comment-bubble .characters {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }
      
      .sam-max-comment-bubble .sam {
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble .sam:hover {
      }
      
      .sam-max-comment-bubble .max {
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble .max:hover {
      }
      
      @keyframes max-bounce {
      }
      
      .sam-max-comment-bubble .dialogue-text {
        font-size: var(--font-size-sm);
        line-height: var(--line-height-relaxed);
        font-weight: var(--font-weight-medium);
        transition: all var(--transition-normal);
      }
      
      .sam-max-comment-bubble:hover .dialogue-text {
      }
      
      .sam-max-comment-bubble::before {
        content: '';
        position: absolute;
        right: var(--spacing-xl);
      }
      
      .sam-max-comment-bubble::after {
        content: '';
        position: absolute;
      }
      
      [data-theme="dark"] .sam-max-comment-bubble {
      }
      
      [data-theme="dark"] .sam-max-comment-bubble .dialogue-text {
      }
      
      [data-theme="dark"] .sam-max-comment-bubble::before {
      }
      
      [data-theme="dark"] .sam-max-comment-bubble::after {
      }
      
      [data-theme="light"] .sam-max-comment-bubble {
        background: var(--glass-surface-elevated);
      }
      
      [data-theme="light"] .sam-max-comment-bubble .dialogue-text {
      }
      
        .sam-max-comment-bubble {
          right: var(--spacing-md);
          left: var(--spacing-md);
          max-width: none;
          border-radius: var(--border-radius-lg);
        }
        
        .sam-max-comment-bubble .characters {
        }
        
        .sam-max-comment-bubble .dialogue-text {
          font-size: var(--font-size-xs);
        }
        
        .sam-max-comment-bubble::before {
          right: var(--spacing-lg);
        }
        
        .sam-max-comment-bubble::after {
        }
      }
      
      @media (prefers-contrast: high) {
        .sam-max-comment-bubble {
          border-color: var(--text-primary);
        }
        
        .sam-max-comment-bubble .dialogue-text {
          color: var(--text-primary);
          text-shadow: none;
        }
      }
      
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

    if (!this.commentElement || !this.enabled) return;

    const dialogueText = this.commentElement.querySelector(".dialogue-text");
    dialogueText.textContent = text;

    this.commentElement.classList.add("visible");

    // Hide after duration
    setTimeout(() => {
      this.hideCommentBubble();
    }, duration);
  }

  hideCommentBubble() {
    if (this.commentElement) {
      this.commentElement.classList.remove("visible");
    }
  }

  getRandomQuote(category) {
    const quotes = SAM_MAX_QUOTES[category] || SAM_MAX_QUOTES.RANDOM_CLICKS;
    let quote;

    // Avoid repeating the same quote
    do {

    this.lastQuote = quote;
    return quote;
  }

  setupClickHandlers() {
    // The Board clicks (Job Search)
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
      );
      if (target) {
        this.showComment(this.getRandomQuote("BOARD_CLICKS"));
        return;
      }
    });

    // Studios clicks (Studios)
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
      );
      if (target) {
        this.showComment(this.getRandomQuote("SUSPECTS_CLICKS"));

        // Add special noir animations for suspect interactions
          const suspectCard = target.closest(".studio-card, .suspect-card");
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
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
      );
      if (target) {
        this.showComment(this.getRandomQuote("CASE_DASHBOARD_CLICKS"));

        // Add detective spotlight effect
          noirAnimations.detectiveSpotlight(target);
        }
        return;
      }
    });

    // The Profile clicks
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
      );
      if (target) {
        this.showComment(this.getRandomQuote("PROFILE_CLICKS"));
        return;
      }
    });

    // AI/NAVI clicks
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
      );
      if (target) {
        this.showComment(this.getRandomQuote("AI_CLICKS"));

        // Add matrix rain effect for AI interactions
        }
        return;
      }
    });

    // Random clicks with low probability
    document.addEventListener("click", (_event) => {
        this.showComment(this.getRandomQuote("RANDOM_CLICKS"));
      }
    });

    // Double click detection
    document.addEventListener("click", (_event) => {
      const currentTime = Date.now();
        const quotes = SAM_MAX_INTERACTIONS.DOUBLE_CLICK_RESPONSES;
      }
      lastClickTime = currentTime;
    });
  }

  setupIdleTimer() {

    const resetIdleTimer = () => {
    };

    // Reset timer on user activity
    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetIdleTimer, true);
      },
    );

    // Check for idle state every second
    setInterval(() => {
      idleTime++;

        const quotes = SAM_MAX_INTERACTIONS.IDLE_COMMENTS;
        this.showComment(
        );
      }

      }
  }

  setupSpecialInteractions() {
    // Konami code detection with special effects
    document.addEventListener("konami-activated", () => {

      // Trigger dramatic screen shake and matrix rain
      setTimeout(() => {
    });

    // Achievement unlocks
    document.addEventListener("achievement-unlocked", (_event) => {
      setTimeout(() => {
    });

    // Error handling with glitch effects
    window.addEventListener("error", (_event) => {

        // Add glitch effect on errors
        const mainContent =
          document.querySelector(".main-content") || document.body;
      }
    });

    // Secret area discovery
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("gaming-icon-secret")) {
        const quotes = SAM_MAX_INTERACTIONS.SECRET_AREAS;
        this.showComment(
        );
      }
    });
  }

  // Special interaction: clicking on the comment bubble itself
  setupBubbleInteraction() {
    if (!this.commentElement) return;

    this.commentElement.addEventListener("click", () => {
      bubbleClicks++;

      const responses = [
        "Max: 'Hey! Stop poking the fourth wall!'",
        "Sam: 'The comment bubble is not interactive... or is it?'",
        "Max: 'Are you trying to break the website by clicking me?'",
        "Sam: 'I suppose even UI elements need attention sometimes.'",
      ];

      if (bubbleClicks <= responses.length) {
      } else {
        this.showComment(
          "Max: 'Okay, you've clicked enough. Go find a job!'",
        );
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
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Delay initialization slightly to ensure other systems are ready
    setTimeout(() => {
      samMaxEasterEggs.initialize();
  });
}

export default samMaxEasterEggs;
