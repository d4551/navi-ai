import { ref, computed } from "vue";
import { logger } from "@/shared/utils/logger";

// Global state for achievements
const achievements = ref(new Map());
const unlockedAchievements = ref(new Set());

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  // Document Building Achievements
  first_resume: {
    id: "first_resume",
    title: "Resume Builder",
    description: "Created your first resume",
    icon: "mdi-file-document",
    type: "document",
  },
  first_cover_letter: {
    id: "first_cover_letter",
    title: "Cover Letter Writer",
    description: "Created your first cover letter",
    icon: "mdi-email",
    type: "document",
  },
  document_master: {
    id: "document_master",
    title: "Document Master",
    icon: "mdi-trophy",
    type: "document",
  },

  // AI Interaction Achievements
  ai_assistant: {
    id: "ai_assistant",
    title: "AI Assistant",
    description: "Used AI assistance for the first time",
    icon: "mdi-robot",
    type: "ai",
  },
  ai_expert: {
    id: "ai_expert",
    title: "AI Expert",
    icon: "mdi-brain",
    type: "ai",
  },

  // Voice & TTS Achievements
  voice_enabled: {
    id: "voice_enabled",
    title: "Voice Activated",
    description: "Enabled voice features",
    icon: "mdi-microphone",
    type: "voice",
  },
  tts_user: {
    id: "tts_user",
    title: "Text-to-Speech User",
    icon: "mdi-volume-high",
    type: "voice",
  },

  // Job Search Achievements
  job_search_start: {
    id: "job_search_start",
    title: "Job Hunter",
    description: "Started your job search journey",
    icon: "mdi-briefcase-search",
    type: "jobs",
  },
  first_application: {
    id: "first_application",
    title: "First Application",
    description: "Applied to your first job",
    icon: "mdi-send",
    type: "jobs",
  },

  // Gaming Industry Achievements
  gaming_focus: {
    id: "gaming_focus",
    title: "Game Developer Path",
    description: "Focused your search on gaming industry",
    icon: "mdi-gamepad-variant",
    type: "gaming",
  },
  unity_expert: {
    id: "unity_expert",
    title: "Unity Expert",
    description: "Added Unity skills to your profile",
    icon: "mdi-unity",
    type: "gaming",
  },
  unreal_expert: {
    id: "unreal_expert",
    title: "Unreal Expert",
    description: "Added Unreal Engine skills to your profile",
    icon: "mdi-unreal",
    type: "gaming",
  },
};

// Load achievements from localStorage
const loadAchievements = () => {
  try {
    const stored = localStorage.getItem("navi_achievements");
    if (stored) {
      const data = JSON.parse(stored);
      unlockedAchievements.value = new Set(data.unlocked || []);

      // Initialize progress tracking
      data.progress?.forEach((value, key) => {
        achievements.value.set(key, value);
      });
    }
  } catch (_error) {
    logger.debug("Failed to load achievements:", error);
  }
};

// Save achievements to localStorage
const saveAchievements = () => {
  try {
    const data = {
      unlocked: Array.from(unlockedAchievements.value),
      progress: Object.fromEntries(achievements.value),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("navi_achievements", JSON.stringify(_data));
  } catch (_error) {
    logger.debug("Failed to save achievements:", error);
  }
};

// Check if an achievement is unlocked
const isAchievementUnlocked = (achievementId) => {
  return unlockedAchievements.value.has(achievementId);
};

// Unlock an achievement
const unlockAchievement = (achievementId) => {
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
  if (!achievement) {
    logger.warn("Unknown achievement:", achievementId);
    return false;
  }

  if (isAchievementUnlocked(achievementId)) {
    return false; // Already unlocked
  }

  unlockedAchievements.value.add(achievementId);
  saveAchievements();

  logger.info("Achievement unlocked:", achievement.title);

  // Show achievement notification
  showAchievementNotification(achievement);

  return true;
};

// Show achievement notification
const showAchievementNotification = (achievement) => {
  // Create and show a notification
  const notification = document.createElement("div");
  notification.className = "achievement-notification";
  notification.innerHTML = `
    <div class="achievement-content">
      <div class="achievement-icon">
        <i class="${achievement.icon}"></i>
      </div>
      <div class="achievement-text">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-points">+${achievement.points} points</div>
      </div>
    </div>
  `;

  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    color: white;
  `;

  // Add animation styles if not already present
    const styles = document.createElement("style");
    styles.id = "achievement-styles";
    styles.textContent = `
      @keyframes slideInRight {
        from {
        }
        to {
        }
      }
      .achievement-content {
        display: flex;
        align-items: center;
      }
      .achievement-icon {
      }
      .achievement-title {
        text-transform: uppercase;
      }
      .achievement-name {
      }
      .achievement-description {
      }
      .achievement-points {
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
};

// Track progress for incremental achievements
  const newValue = current + increment;
  achievements.value.set(key, newValue);
  saveAchievements();
  return newValue;
};

// Document-specific achievement tracking
const trackDocumentAchievement = (type, action = "created") => {
  logger.debug("Tracking document achievement:", { type, action });

  if (action === "created") {
    // Track first document creation
    if (type === "resume" && !isAchievementUnlocked("first_resume")) {
      unlockAchievement("first_resume");
    } else if (
      type === "cover_letter" &&
      !isAchievementUnlocked("first_cover_letter")
    ) {
      unlockAchievement("first_cover_letter");
    }

    // Track document master achievement
    const documentsCreated = trackProgress("documents_created");
      unlockAchievement("document_master");
    }
  }
};

// AI-specific achievement tracking
const trackAIAchievement = (action = "used") => {
  logger.debug("Tracking AI achievement:", { action });

  if (action === "used") {
    if (!isAchievementUnlocked("ai_assistant")) {
      unlockAchievement("ai_assistant");
    }

    const aiUsage = trackProgress("ai_usage");
      unlockAchievement("ai_expert");
    }
  }
};

// Voice-specific achievement tracking
const trackVoiceAchievement = (type, action = "enabled") => {
  logger.debug("Tracking voice achievement:", { type, action });

  if (action === "enabled") {
    if (type === "voice" && !isAchievementUnlocked("voice_enabled")) {
      unlockAchievement("voice_enabled");
    } else if (type === "tts" && !isAchievementUnlocked("tts_user")) {
      unlockAchievement("tts_user");
    }
  }
};

// Job search achievement tracking
const trackJobAchievement = (action, data = {}) => {
  logger.debug("Tracking job achievement:", { action, data });

  switch (action) {
    case "search_started":
      if (!isAchievementUnlocked("job_search_start")) {
        unlockAchievement("job_search_start");
      }
      break;

    case "application_submitted":
      if (!isAchievementUnlocked("first_application")) {
        unlockAchievement("first_application");
      }
      break;

    case "gaming_focus":
      if (!isAchievementUnlocked("gaming_focus")) {
        unlockAchievement("gaming_focus");
      }
      break;
  }
};

// Skill-specific achievement tracking
const trackSkillAchievement = (skill) => {
  logger.debug("Tracking skill achievement:", { skill });

  const skillLower = skill.toLowerCase();

  if (skillLower.includes("unity") && !isAchievementUnlocked("unity_expert")) {
    unlockAchievement("unity_expert");
  } else if (
    skillLower.includes("unreal") &&
    !isAchievementUnlocked("unreal_expert")
  ) {
    unlockAchievement("unreal_expert");
  }
};

// Get all unlocked achievements
const getUnlockedAchievements = () => {
  return Array.from(unlockedAchievements.value)
    .map((id) => ACHIEVEMENT_DEFINITIONS[id])
    .filter(Boolean);
};

// Get total points earned
const getTotalPoints = () => {
  return getUnlockedAchievements().reduce(
    (total, achievement) => total + achievement.points,
  );
};

// Get achievements by type
const getAchievementsByType = (type) => {
  return Object.values(ACHIEVEMENT_DEFINITIONS)
    .filter((achievement) => achievement.type === type)
    .map((achievement) => ({
      ...achievement,
      unlocked: isAchievementUnlocked(achievement.id),
    }));
};

// Get achievement progress
const getAchievementProgress = () => {
  const total = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const unlocked = unlockedAchievements.value.size;
  return {
    total,
    unlocked,
  };
};

// Computed properties
const totalAchievements = computed(
  () => Object.keys(ACHIEVEMENT_DEFINITIONS).length,
);
const unlockedCount = computed(() => unlockedAchievements.value.size);
const completionPercentage = computed(() =>
);
const totalPoints = computed(() => getTotalPoints());

// Initialize on first load
loadAchievements();

  return {
    // State
    achievements: achievements.value,
    unlockedAchievements: unlockedAchievements.value,

    // Computed
    totalAchievements,
    unlockedCount,
    completionPercentage,
    totalPoints,

    // Methods
    isAchievementUnlocked,
    unlockAchievement,
    trackProgress,
    trackDocumentAchievement,
    trackAIAchievement,
    trackVoiceAchievement,
    trackJobAchievement,
    trackSkillAchievement,
    getUnlockedAchievements,
    getTotalPoints,
    getAchievementsByType,
    getAchievementProgress,

    // Storage
    loadAchievements,
    saveAchievements,
  };
}

export default useAchievementTracker;
