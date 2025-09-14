
export const GAMING_ICONS = {
  // Navigation Icons with Gaming Flair
  DASHBOARD: "mdi-gamepad-variant",
  THE_BOARD: "mdi-bulletin-board",
  RESUME: "mdi-scroll-text",
  COVER_LETTER: "mdi-email-seal",
  PORTFOLIO: "mdi-treasure-chest",
  SKILLS: "mdi-sword",
  THE_PROFILE: "mdi-account-cog",
  INTERVIEW: "mdi-microphone-variant",

  // Gaming Job Types
  PROGRAMMER: "mdi-code-braces",
  GAME_DESIGNER: "mdi-puzzle-edit",
  ARTIST: "mdi-palette",
  PRODUCER: "mdi-clipboard-list",
  QA_TESTER: "mdi-bug",
  COMMUNITY: "mdi-account-group",

  // Gaming Companies
  STUDIOS: {
    "riot-games": "mdi-sword-cross",
    "epic-games": "mdi-rocket-launch",
    "electronic-arts": "mdi-gamepad-square",
    "valve-corporation": "mdi-steam",
    ubisoft: "mdi-tower",
    "naughty-dog": "mdi-dog",
    "cd-projekt-red": "mdi-city-variant",
    "unity-technologies": "mdi-unity",
    supercell: "mdi-cellphone",
    mihoyo: "mdi-star-shooting",
  },

  // Game Genres
  GENRES: {
    "battle-royale": "mdi-target-variant",
    moba: "mdi-tournament",
    fps: "mdi-crosshairs-gps",
    rpg: "mdi-wizard-hat",
    strategy: "mdi-chess-king",
    simulation: "mdi-city",
    sandbox: "mdi-cube-outline",
    fighting: "mdi-boxing-glove",
    racing: "mdi-car-sports",
    puzzle: "mdi-puzzle",
  },

  // Achievement & XP Icons
  ACHIEVEMENTS: {
    "first-steps": "mdi-baby-face",
    "job-hunter": "mdi-crosshairs",
    "persistent-seeker": "mdi-fire",
    "ai-collaborator": "mdi-robot-love",
    "skill-mapper": "mdi-map-legend",
    "interview-master": "mdi-microphone-variant",
    "networking-ninja": "mdi-ninja",
    "career-champion": "mdi-trophy",
    "gaming-legend": "mdi-crown",
  },

  // Status Icons
  STATUS: {
    online: "mdi-circle",
    offline: "mdi-circle-outline",
    busy: "mdi-minus-circle",
    away: "mdi-clock-outline",
    invisible: "mdi-ghost",
  },

  EASTER_EGGS: {
    konami: "mdi-gamepad-up",
    secret: "mdi-eye-off",
    cheat: "mdi-console",
    bonus: "mdi-gift",
    hidden: "mdi-treasure-chest",
    rare: "mdi-diamond-stone",
    legendary: "mdi-star-circle",
  },
};

// Gaming-specific icon animations
export const ICON_ANIMATIONS = {
  PULSE: "gaming-icon-pulse",
  BOUNCE: "gaming-icon-bounce",
  GLOW: "gaming-icon-glow",
  ROTATE: "gaming-icon-rotate",
  SHAKE: "gaming-icon-shake",
  FLOAT: "gaming-icon-float",
};

export const ICON_SEQUENCES = {
  KONAMI: [
    "mdi-chevron-up",
    "mdi-chevron-up",
    "mdi-chevron-down",
    "mdi-chevron-down",
    "mdi-chevron-left",
    "mdi-chevron-right",
    "mdi-chevron-left",
    "mdi-chevron-right",
    "mdi-alpha-b",
    "mdi-alpha-a",
  ],
  LEVEL_UP: ["mdi-star", "mdi-star-shooting", "mdi-trophy", "mdi-crown"],
};

// Dynamic icon getter with context awareness
  switch (_context) {
    case "navigation":
      return (
        GAMING_ICONS[item.toUpperCase().replace("-", "_")] || "mdi-gamepad"
      );

    case "studio":
      return GAMING_ICONS.STUDIOS[item] || "mdi-office-building";

    case "genre":
      return GAMING_ICONS.GENRES[item] || "mdi-gamepad-variant";

    case "job-type":
      return (
        GAMING_ICONS[item.toUpperCase().replace("-", "_")] || "mdi-briefcase"
      );

    case "achievement":
      return GAMING_ICONS.ACHIEVEMENTS[item] || "mdi-trophy";

    default:
      return "mdi-gamepad";
  }
}

  const iconSets = [
    "mdi-controller-classic",
    "mdi-gamepad-variant",
    "mdi-keyboard-variant",
    "mdi-mouse-variant",
    "mdi-headset-dock",
    "mdi-monitor-speaker",
    "mdi-dice-multiple",
    "mdi-cards-playing",
    "mdi-rocket",
    "mdi-sword",
    "mdi-shield",
    "mdi-magic-staff",
    "mdi-bow-arrow",
  ];
}

// Special effects for gaming icons
  if (!element) return;

  element.classList.add(effect);

  setTimeout(() => {
    if (element.classList) {
      element.classList.remove(effect);
    }
  }, duration);
}

// Icon rarity system for gamification
export const ICON_RARITY = {
  COMMON: {
    glow: "none",
  },
  UNCOMMON: {
  },
  RARE: {
  },
  EPIC: {
  },
  LEGENDARY: {
  },
};


  return "COMMON";
}

// Initialize gaming icon system
  // Add CSS for icon animations
  if (document.getElementById("gaming-icons-styles")) return;

  const style = document.createElement("style");
  style.id = "gaming-icons-styles";
  style.textContent = `
    @keyframes gaming-icon-pulse {
    }
    
    @keyframes gaming-icon-bounce {
    }
    
    @keyframes gaming-icon-glow {
    }
    
    @keyframes gaming-icon-rotate {
    }
    
    @keyframes gaming-icon-shake {
    }
    
    @keyframes gaming-icon-float {
    }
    
    
    .icon-rarity-uncommon { 
    }
    .icon-rarity-rare { 
    }
    .icon-rarity-epic { 
    }
    .icon-rarity-legendary { 
    }
    
    .gaming-icon-interactive:hover {
    }
    
    .gaming-icon-secret {
    }
    
    .gaming-icon-secret:hover {
    }
  `;

  document.head.appendChild(style);
}

  const icons = document.querySelectorAll(".mdi");

  icons.forEach((icon, _index) => {
      icon.classList.add("gaming-icon-secret");
      icon.addEventListener("click", () => {
        icon.classList.remove("gaming-icon-secret");
        icon.classList.add("gaming-icon-bounce");

        // Award XP or trigger achievement
        if (window.xpSystem) {
        }

        setTimeout(() => {
          icon.classList.remove("gaming-icon-bounce");
      });
      secretCount++;
    }
  });

    console.log(
      `[GAME] Found ${secretCount} secret icons! Click them for bonus XP!`,
    );
  }
}

// Auto-initialize when imported
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeGamingIcons();

    // Add secret icon finder after page loads
  });
}

export default GAMING_ICONS;
