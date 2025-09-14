
import { logger } from "@/shared/utils/logger";

export class EasterEggManager {
  constructor() {
    this.achievements = new Set();
    this.sequences = {
      konami: {
        code: [
          "ArrowUp",
          "ArrowUp",
          "ArrowDown",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "ArrowLeft",
          "ArrowRight",
          "KeyB",
          "KeyA",
        ],
        current: [],
        triggered: false,
        reward: "Developer Mode Unlocked!",
      },
      gamer: {
        code: ["KeyG", "KeyA", "KeyM", "KeyE", "KeyR"],
        current: [],
        triggered: false,
        reward: "Gamer Mode Activated!",
      },
      epic: {
        code: ["KeyE", "KeyP", "KeyI", "KeyC"],
        current: [],
        triggered: false,
        reward: "Epic Achievement Unlocked!",
      },
    };
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Keyboard listener for sequence detection
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));

    // Click counter for secret achievements
    this.setupClickCounters();

    // Time-based achievements
    this.setupTimeBasedAchievements();

    this.initialized = true;
  }

  handleKeyDown(event) {
    // Check each sequence
    Object.keys(this.sequences).forEach((seqName) => {
      const sequence = this.sequences[seqName];

      if (sequence.triggered) return;

      // Add key to current sequence
      sequence.current.push(event.code);

      // Keep only the last N keys (length of the target sequence)
      if (sequence.current.length > sequence.code.length) {
        sequence.current.shift();
      }

      // Check if sequence matches
      if (this.arraysEqual(sequence.current, sequence.code)) {
        this.triggerEasterEgg(seqName, sequence.reward);
        sequence.triggered = true;
      }
    });
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  triggerEasterEgg(type, reward) {

    switch (type) {
      case "konami":
        this.activateKonamiCode();
        break;
      case "gamer":
        this.activateGamerMode();
        break;
      case "epic":
        this.showEpicEffect();
        break;
    }

    this.showAchievement(reward);
    this.achievements.add(type);

    // Store in localStorage
    localStorage.setItem(
      "geminiacv_easter_eggs",
      JSON.stringify([...this.achievements]),
    );
  }

  activateKonamiCode() {
    // Rainbow border effect
    document.body.classList.add("konami-mode");

    // Add developer tools
    this.addDeveloperTools();

    // Particle effect

    setTimeout(() => {
      document.body.classList.remove("konami-mode");
  }

  activateGamerMode() {
    // Gaming aesthetic enhancements
    document.body.classList.add("ultra-gamer-mode");

    // RGB lighting effects
    this.addRGBLighting();

    // Sound effects (if available)
    this.playSound("levelup");

    // Gaming particles

    setTimeout(() => {
      document.body.classList.remove("ultra-gamer-mode");
  }

  showEpicEffect() {
    // Epic explosion effect

    // Screen flash
    const flash = document.createElement("div");
    flash.className = "epic-flash";
    flash.style.cssText = `
      pointer-events: none;
    `;

    document.body.appendChild(flash);

    setTimeout(() => {
      document.body.removeChild(flash);
  }

    const emojis = Array.isArray(emoji) ? emoji : [emoji];

      setTimeout(() => {
        const particle = document.createElement("div");
        particle.textContent =
        particle.className = "easter-egg-particle";
        particle.style.cssText = `
          position: fixed;
          pointer-events: none;
        `;

        document.body.appendChild(particle);

        setTimeout(() => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle);
          }
    }
  }

  showAchievement(title) {
    const achievement = document.createElement("div");
    achievement.className = "achievement-popup";
    achievement.innerHTML = `
      <div class="achievement-content">
        <div class="achievement-text">
          <div class="achievement-title">Achievement Unlocked!</div>
          <div class="achievement-desc">${title}</div>
        </div>
      </div>
    `;
    achievement.style.cssText = `
      position: fixed;
      color: white;
    `;

    document.body.appendChild(achievement);

    setTimeout(() => {
      if (document.body.contains(achievement)) {
        document.body.removeChild(achievement);
      }
  }

  setupClickCounters() {
    // Track logo clicks
    document.addEventListener("click", (event) => {
        logoClicks++;
        }
      }
    });

    // Track AI fairy interactions
    document.addEventListener("click", (event) => {
        fairyClicks++;
          this.showAchievement("Fairy Whisperer - Befriended the AI fairy!");
        }
      }
    });
  }

  setupTimeBasedAchievements() {
    // Night owl achievement
    const currentHour = new Date().getHours();
      setTimeout(() => {
        this.showAchievement("Night Owl - Using the app during late hours!");
    }

    // Session length achievements
    setTimeout(
      () => {
      },

    setTimeout(
      () => {
      },
  }

  addDeveloperTools() {
    if (document.getElementById("easter-dev-tools")) return;

    const devTools = document.createElement("div");
    devTools.id = "easter-dev-tools";
    devTools.innerHTML = `
      <div style="
        position: fixed;
        font-family: 'Courier New', monospace;
      ">
        <div>[LAUNCH] DEVELOPER MODE ACTIVE</div>
        <div>Press 'I' to inspect elements</div>
        <div>Press 'C' to clear console</div>
        <div>Press 'Esc' to close</div>
      </div>
    `;

    document.body.appendChild(devTools);

    const handleDevKeys = (event) => {
      if (event.key === "i" || event.key === "I") {
        console.log("[SEARCH] Inspect mode activated");
      } else if (event.key === "c" || event.key === "C") {
        console.clear();
      } else if (event.key === "Escape") {
        document.body.removeChild(devTools);
        document.removeEventListener("keydown", handleDevKeys);
      }
    };

    document.addEventListener("keydown", handleDevKeys);

    setTimeout(() => {
      if (document.getElementById("easter-dev-tools")) {
        document.body.removeChild(devTools);
        document.removeEventListener("keydown", handleDevKeys);
      }
  }

  addRGBLighting() {
    if (document.getElementById("rgb-lighting")) return;

    const style = document.createElement("style");
    style.id = "rgb-lighting";
    style.textContent = `
      .ultra-gamer-mode {
      }
      
      .ultra-gamer-mode .glass-card,
      .ultra-gamer-mode .ultra-glass-card {
        animation: rgbBorder var(--rgb-animation-speed) linear infinite !important;
      }
      
      @keyframes rgbBorder {
      }
    `;

    document.head.appendChild(style);

    setTimeout(() => {
      if (document.getElementById("rgb-lighting")) {
        document.head.removeChild(style);
      }
  }

  playSound(type) {
    // Simple sound synthesis using Web Audio API
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "levelup") {
        // Level up sound sequence
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.frequency.value = freq;
            osc.type = "triangle";
            gain.gain.exponentialRampToValueAtTime(
            );

            osc.start(audioContext.currentTime);
        });
      }
    } catch (_error) {
      logger.debug("Web Audio API not available", error);
    }
  }

  getUnlockedAchievements() {
    try {
      const stored = localStorage.getItem("geminiacv_easter_eggs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addCustomCSS() {
    if (document.getElementById("easter-egg-styles")) return;

    const style = document.createElement("style");
    style.id = "easter-egg-styles";
    style.textContent = `
      @keyframes particleFloat {
        }
        }
      }
      
      @keyframes achievementSlide {
        }
        }
        }
      }
      
      @keyframes epicFlash {
        }
        }
        }
      }
      
      .achievement-popup {
      }
      
      .achievement-content {
        display: flex;
        align-items: center;
      }
      
      .achievement-icon {
      }
      
      .achievement-title {
        font-weight: bold;
      }
      
      .achievement-desc {
      }
      
      .konami-mode {
      }
      
      @keyframes konamiRainbow {
      }
    `;

    document.head.appendChild(style);
  }

  destroy() {
    this.initialized = false;

    // Remove custom CSS
    const styles = document.getElementById("easter-egg-styles");
    if (styles) {
      document.head.removeChild(styles);
    }

    // Clear any active effects
    document.body.classList.remove("konami-mode", "ultra-gamer-mode");
  }
}

// Global instance
export const easterEggs = new EasterEggManager();

// Auto-initialize when imported
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    easterEggs.addCustomCSS();
    easterEggs.initialize();
  });
}
