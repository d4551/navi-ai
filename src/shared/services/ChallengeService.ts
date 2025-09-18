/**
 * Challenge Service
 * Generates dynamic daily challenges based on user progress
 */

export interface Challenge {
  id: string
  title: string
  description: string
  xp: number
  completed: boolean
  action: string
  progress?: number
  category: 'profile' | 'content' | 'skills' | 'practice' | 'engagement'
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate?: string
  icon?: string
}

export interface UserProgress {
  profileCompletion?: number
  resumeCount?: number
  skillsCount?: number
  portfolioCount?: number
  interviewSessions?: number
  lastJobSearch?: Date
  hasApiKey?: boolean
  achievementsCount?: number
  streakDays?: number
}

class ChallengeService {
  private challengeTemplates: Record<
    string,
    Omit<Challenge, 'id' | 'completed'>
  > = {
    // Profile Challenges
    'complete-profile': {
      title: 'Complete Your Gaming Profile',
      description: 'Finish setting up your professional gaming profile',
      xp: 25,
      action: 'profile',
      category: 'profile',
      difficulty: 'easy',
      timeEstimate: '5 minutes',
      icon: 'mdi-account-edit',
    },
    'add-gaming-experience': {
      title: 'Add Gaming Experience',
      description: 'Document your gaming background and achievements',
      xp: 30,
      action: 'profile',
      category: 'profile',
      difficulty: 'easy',
      timeEstimate: '10 minutes',
      icon: 'mdi-gamepad-variant',
    },

    // Content Creation Challenges
    'build-first-resume': {
      title: 'Create Your First Resume',
      description: 'Build your first gaming industry resume',
      xp: 50,
      action: 'resume',
      category: 'content',
      difficulty: 'medium',
      timeEstimate: '20 minutes',
      icon: 'mdi-file-document-outline-edit',
    },
    'enhance-resume': {
      title: 'Enhance Your Resume',
      description: 'Add more sections and improve your existing resume',
      xp: 35,
      action: 'resume',
      category: 'content',
      difficulty: 'medium',
      timeEstimate: '15 minutes',
      icon: 'mdi-file-star',
    },
    'create-portfolio-item': {
      title: 'Add Portfolio Showcase',
      description: 'Create a new portfolio item to showcase your work',
      xp: 40,
      action: 'portfolio',
      category: 'content',
      difficulty: 'medium',
      timeEstimate: '25 minutes',
      icon: 'mdi-folder-plus',
    },

    // Skills Challenges
    'map-gaming-skills': {
      title: 'Map Your Gaming Skills',
      description: 'Use the skill mapper to identify transferable skills',
      xp: 30,
      action: 'skills',
      category: 'skills',
      difficulty: 'easy',
      timeEstimate: '15 minutes',
      icon: 'mdi-brain',
    },
    'skill-assessment': {
      title: 'Complete Skills Assessment',
      description: 'Take the comprehensive skills assessment',
      xp: 45,
      action: 'skills',
      category: 'skills',
      difficulty: 'medium',
      timeEstimate: '30 minutes',
      icon: 'mdi-clipboard-check',
    },

    // Practice Challenges
    'first-interview': {
      title: 'Practice Mock Interview',
      description: 'Complete your first practice interview session',
      xp: 60,
      action: 'interview',
      category: 'practice',
      difficulty: 'hard',
      timeEstimate: '45 minutes',
      icon: 'mdi-microphone',
    },
    'interview-marathon': {
      title: 'Interview Marathon',
      description: 'Complete 3 interview sessions in different roles',
      xp: 100,
      action: 'interview',
      category: 'practice',
      difficulty: 'hard',
      timeEstimate: '2 hours',
      icon: 'mdi-trophy',
    },

    // Setup & Configuration
    'setup-ai-features': {
      title: 'Enable AI Features',
      description: 'Configure your Gemini API key to unlock AI features',
      xp: 25,
      action: 'settings',
      category: 'profile',
      difficulty: 'easy',
      timeEstimate: '5 minutes',
      icon: 'mdi-robot',
    },

    // Engagement Challenges
    'explore-opportunities': {
      title: 'Explore Job Opportunities',
      description: 'Browse gaming industry job listings',
      xp: 20,
      action: 'jobs',
      category: 'engagement',
      difficulty: 'easy',
      timeEstimate: '10 minutes',
      icon: 'mdi-magnify',
    },
    'daily-streak': {
      title: 'Maintain Daily Streak',
      description: 'Use NAVI for 7 consecutive days',
      xp: 75,
      action: 'dashboard',
      category: 'engagement',
      difficulty: 'medium',
      timeEstimate: '5 min/day',
      icon: 'mdi-fire',
    },
  }

  /**
   * Generates daily challenges based on user progress
   */
  generateDailyChallenges(
    userProgress: UserProgress,
    maxChallenges: number = 5
  ): Challenge[] {
    const challenges: Challenge[] = []
    const availableTemplates = { ...this.challengeTemplates }

    // Profile completion challenges
    if ((userProgress.profileCompletion || 0) < 100) {
      challenges.push(
        this.createChallenge('complete-profile', {
          description: `${100 - (userProgress.profileCompletion || 0)}% remaining to complete`,
          progress: userProgress.profileCompletion || 0,
          xp: Math.max(
            20,
            Math.floor((100 - (userProgress.profileCompletion || 0)) / 5)
          ),
        })
      )
      delete availableTemplates['add-gaming-experience']
    }

    // Resume building challenges
    if (!userProgress.resumeCount || userProgress.resumeCount === 0) {
      challenges.push(this.createChallenge('build-first-resume'))
    } else if (userProgress.resumeCount < 3) {
      challenges.push(
        this.createChallenge('enhance-resume', {
          description: `Create ${3 - userProgress.resumeCount} more resume variations`,
          progress: (userProgress.resumeCount / 3) * 100,
        })
      )
    }

    // Skills challenges
    if ((userProgress.skillsCount || 0) < 5) {
      challenges.push(
        this.createChallenge('map-gaming-skills', {
          description: `Add ${5 - (userProgress.skillsCount || 0)} more skills`,
          progress: ((userProgress.skillsCount || 0) / 5) * 100,
        })
      )
    } else if (
      (userProgress.skillsCount || 0) >= 5 &&
      (userProgress.skillsCount || 0) < 15
    ) {
      challenges.push(this.createChallenge('skill-assessment'))
    }

    // Interview practice challenges
    if (
      !userProgress.interviewSessions ||
      userProgress.interviewSessions === 0
    ) {
      challenges.push(this.createChallenge('first-interview'))
    } else if (userProgress.interviewSessions < 5) {
      challenges.push(
        this.createChallenge('interview-marathon', {
          description: `Complete ${5 - userProgress.interviewSessions} more interview sessions`,
          progress: (userProgress.interviewSessions / 5) * 100,
        })
      )
    }

    // Portfolio challenges
    if ((userProgress.portfolioCount || 0) < 3) {
      challenges.push(
        this.createChallenge('create-portfolio-item', {
          description: `Add ${3 - (userProgress.portfolioCount || 0)} more portfolio items`,
          progress: ((userProgress.portfolioCount || 0) / 3) * 100,
        })
      )
    }

    // API setup challenge
    if (!userProgress.hasApiKey) {
      challenges.push(this.createChallenge('setup-ai-features'))
    }

    // Job search challenge (weekly)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (!userProgress.lastJobSearch || userProgress.lastJobSearch < weekAgo) {
      challenges.push(this.createChallenge('explore-opportunities'))
    }

    // Streak challenge
    if (
      (userProgress.streakDays || 0) >= 3 &&
      (userProgress.streakDays || 0) < 7
    ) {
      challenges.push(
        this.createChallenge('daily-streak', {
          description: `${7 - (userProgress.streakDays || 0)} more days to complete`,
          progress: ((userProgress.streakDays || 0) / 7) * 100,
        })
      )
    }

    // Fill remaining slots with engagement challenges if needed
    const remainingSlots = maxChallenges - challenges.length
    if (remainingSlots > 0) {
      const engagementChallenges = Object.keys(availableTemplates)
        .filter(key => availableTemplates[key].category === 'engagement')
        .slice(0, remainingSlots)

      engagementChallenges.forEach(key => {
        challenges.push(this.createChallenge(key))
      })
    }

    // Return only up to maxChallenges, prioritized by XP value
    return challenges.sort((a, b) => b.xp - a.xp).slice(0, maxChallenges)
  }

  /**
   * Creates a challenge from a template
   */
  private createChallenge(
    templateKey: string,
    overrides: Partial<Challenge> = {}
  ): Challenge {
    const template = this.challengeTemplates[templateKey]
    if (!template) {
      throw new Error(`Challenge template '${templateKey}' not found`)
    }

    return {
      id: `challenge-${templateKey}-${Date.now()}`,
      ...template,
      completed: false,
      ...overrides,
    }
  }

  /**
   * Marks a challenge as completed and returns XP earned
   */
  completeChallenge(challengeId: string, userChallenges: Challenge[]): number {
    const challenge = userChallenges.find(c => c.id === challengeId)
    if (!challenge) return 0

    challenge.completed = true
    return challenge.xp
  }

  /**
   * Gets progress summary for all challenges
   */
  getChallengeProgress(challenges: Challenge[]): {
    completed: number
    total: number
    totalXP: number
    earnedXP: number
    progressPercent: number
  } {
    const completed = challenges.filter(c => c.completed).length
    const total = challenges.length
    const totalXP = challenges.reduce((sum, c) => sum + c.xp, 0)
    const earnedXP = challenges
      .filter(c => c.completed)
      .reduce((sum, c) => sum + c.xp, 0)
    const progressPercent =
      total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      completed,
      total,
      totalXP,
      earnedXP,
      progressPercent,
    }
  }

  /**
   * Gets challenges grouped by category
   */
  getChallengesByCategory(
    challenges: Challenge[]
  ): Record<string, Challenge[]> {
    return challenges.reduce(
      (groups, challenge) => {
        const category = challenge.category
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(challenge)
        return groups
      },
      {} as Record<string, Challenge[]>
    )
  }

  /**
   * Gets recommended next challenge for user
   */
  getRecommendedChallenge(challenges: Challenge[]): Challenge | null {
    const incomplete = challenges.filter(c => !c.completed)
    if (incomplete.length === 0) return null

    // Prioritize by: easy difficulty first, then highest XP
    return incomplete.sort((a, b) => {
      if (a.difficulty === 'easy' && b.difficulty !== 'easy') return -1
      if (b.difficulty === 'easy' && a.difficulty !== 'easy') return 1
      return b.xp - a.xp
    })[0]
  }
}

// Export singleton instance
export const challengeService = new ChallengeService()
export default challengeService
