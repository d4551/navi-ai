
export interface Challenge {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  action: string;
  progress?: number;
  category: "profile" | "content" | "skills" | "practice" | "engagement";
  difficulty: "easy" | "medium" | "hard";
  timeEstimate?: string;
  icon?: string;
}

export interface UserProgress {
  profileCompletion?: number;
  resumeCount?: number;
  skillsCount?: number;
  portfolioCount?: number;
  interviewSessions?: number;
  lastJobSearch?: Date;
  hasApiKey?: boolean;
  achievementsCount?: number;
  streakDays?: number;
}

class ChallengeService {
  private challengeTemplates: Record<
    string,
    Omit<Challenge, "id" | "completed">
  > = {
    // Profile Challenges
    "complete-profile": {
      title: "Complete Your Gaming Profile",
      description: "Finish setting up your professional gaming profile",
      action: "profile",
      category: "profile",
      difficulty: "easy",
      icon: "mdi-account-edit",
    },
    "add-gaming-experience": {
      title: "Add Gaming Experience",
      description: "Document your gaming background and achievements",
      action: "profile",
      category: "profile",
      difficulty: "easy",
      icon: "mdi-gamepad-variant",
    },

    // Content Creation Challenges
    "build-first-resume": {
      title: "Create Your First Resume",
      description: "Build your first gaming industry resume",
      action: "resume",
      category: "content",
      difficulty: "medium",
      icon: "mdi-file-document-outline-edit",
    },
    "enhance-resume": {
      title: "Enhance Your Resume",
      description: "Add more sections and improve your existing resume",
      action: "resume",
      category: "content",
      difficulty: "medium",
      icon: "mdi-file-star",
    },
    "create-portfolio-item": {
      title: "Add Portfolio Showcase",
      description: "Create a new portfolio item to showcase your work",
      action: "portfolio",
      category: "content",
      difficulty: "medium",
      icon: "mdi-folder-plus",
    },

    // Skills Challenges
    "map-gaming-skills": {
      title: "Map Your Gaming Skills",
      description: "Use the skill mapper to identify transferable skills",
      action: "skills",
      category: "skills",
      difficulty: "easy",
      icon: "mdi-brain",
    },
    "skill-assessment": {
      title: "Complete Skills Assessment",
      description: "Take the comprehensive skills assessment",
      action: "skills",
      category: "skills",
      difficulty: "medium",
      icon: "mdi-clipboard-check",
    },

    // Practice Challenges
    "first-interview": {
      title: "Practice Mock Interview",
      description: "Complete your first practice interview session",
      action: "interview",
      category: "practice",
      difficulty: "hard",
      icon: "mdi-microphone",
    },
    "interview-marathon": {
      title: "Interview Marathon",
      action: "interview",
      category: "practice",
      difficulty: "hard",
      icon: "mdi-trophy",
    },

    // Setup & Configuration
    "setup-ai-features": {
      title: "Enable AI Features",
      description: "Configure your Gemini API key to unlock AI features",
      action: "settings",
      category: "profile",
      difficulty: "easy",
      icon: "mdi-robot",
    },

    // Engagement Challenges
    "explore-opportunities": {
      title: "Explore Job Opportunities",
      description: "Browse gaming industry job listings",
      action: "jobs",
      category: "engagement",
      difficulty: "easy",
      icon: "mdi-magnify",
    },
    "daily-streak": {
      title: "Maintain Daily Streak",
      action: "dashboard",
      category: "engagement",
      difficulty: "medium",
      icon: "mdi-fire",
    },
  };

  generateDailyChallenges(
    userProgress: UserProgress,
  ): Challenge[] {
    const challenges: Challenge[] = [];
    const availableTemplates = { ...this.challengeTemplates };

    // Profile completion challenges
      challenges.push(
        this.createChallenge("complete-profile", {
          xp: Math.max(
          ),
        }),
      );
      delete availableTemplates["add-gaming-experience"];
    }

    // Resume building challenges
      challenges.push(this.createChallenge("build-first-resume"));
      challenges.push(
        this.createChallenge("enhance-resume", {
        }),
      );
    }

    // Skills challenges
      challenges.push(
        this.createChallenge("map-gaming-skills", {
        }),
      );
    } else if (
    ) {
      challenges.push(this.createChallenge("skill-assessment"));
    }

    // Interview practice challenges
    if (
      !userProgress.interviewSessions ||
    ) {
      challenges.push(this.createChallenge("first-interview"));
      challenges.push(
        this.createChallenge("interview-marathon", {
        }),
      );
    }

    // Portfolio challenges
      challenges.push(
        this.createChallenge("create-portfolio-item", {
        }),
      );
    }

    // API setup challenge
    if (!userProgress.hasApiKey) {
      challenges.push(this.createChallenge("setup-ai-features"));
    }

    // Job search challenge (weekly)
    if (!userProgress.lastJobSearch || userProgress.lastJobSearch < weekAgo) {
      challenges.push(this.createChallenge("explore-opportunities"));
    }

    // Streak challenge
    if (
    ) {
      challenges.push(
        this.createChallenge("daily-streak", {
        }),
      );
    }

    // Fill remaining slots with engagement challenges if needed
    const remainingSlots = maxChallenges - challenges.length;
      const engagementChallenges = Object.keys(availableTemplates)
        .filter((key) => availableTemplates[key].category === "engagement")

      engagementChallenges.forEach((key) => {
        challenges.push(this.createChallenge(key));
      });
    }

    // Return only up to maxChallenges, prioritized by XP value
  }

  private createChallenge(
    templateKey: string,
    overrides: Partial<Challenge> = {},
  ): Challenge {
    const template = this.challengeTemplates[templateKey];
    if (!template) {
      throw new Error(`Challenge template '${templateKey}' not found`);
    }

    return {
      id: `challenge-${templateKey}-${Date.now()}`,
      ...template,
      completed: false,
      ...overrides,
    };
  }

  completeChallenge(challengeId: string, userChallenges: Challenge[]): number {
    const challenge = userChallenges.find((c) => c.id === challengeId);

    challenge.completed = true;
    return challenge.xp;
  }

  getChallengeProgress(challenges: Challenge[]): {
    completed: number;
    total: number;
    totalXP: number;
    earnedXP: number;
    progressPercent: number;
  } {
    const completed = challenges.filter((c) => c.completed).length;
    const total = challenges.length;
    const earnedXP = challenges
      .filter((c) => c.completed)
    const progressPercent =

    return {
      completed,
      total,
      totalXP,
      earnedXP,
      progressPercent,
    };
  }

  getChallengesByCategory(
    challenges: Challenge[],
  ): Record<string, Challenge[]> {
    return challenges.reduce(
      (groups, challenge) => {
        const category = challenge.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(challenge);
        return groups;
      },
      {} as Record<string, Challenge[]>,
    );
  }

  getRecommendedChallenge(challenges: Challenge[]): Challenge | null {
    const incomplete = challenges.filter((c) => !c.completed);

    // Prioritize by: easy difficulty first, then highest XP
    return incomplete.sort((a, b) => {
      return b.xp - a.xp;
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();
export default challengeService;
