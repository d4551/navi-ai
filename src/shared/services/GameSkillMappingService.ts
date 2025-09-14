
import { generateContent } from "@/utils/aiClient";
import type {
  SkillMapping,
  CareerPathway,
  IndustryRole,
  TrendingSkill,
  ReadinessAssessment,
  GameToIndustryTranslation,
} from "@/shared/types/skillMapping";

export class GameSkillMappingService {
  async analyzeGamingExperience(input: {
    description: string;
    gamingProfiles?: string[];
    achievements?: string[];
    documents?: File[];
  }): Promise<SkillMapping[]> {
    try {
      const prompt = `Analyze this gaming background for professional skill mapping:

Gaming Description: ${input.description}
Gaming Profiles: ${input.gamingProfiles?.join(", ") || "None provided"}
Achievements: ${input.achievements?.join(", ") || "None provided"}

For each identifiable skill, provide:

Focus on skills valuable in these gaming industry areas:
- Game Development (Design, Programming, Art, Audio)
- Esports & Competitive Gaming
- Content Creation & Streaming
- Community Management
- Game Testing & QA
- Live Operations
- Game Marketing
- Technical Art & Tools

Return JSON array with format:
{
  "gameExpression": "specific game activity/role",
  "transferableSkill": "professional equivalent",
  "category": "leadership|community|technical|creative|analytical",
  "demandLevel": "high|medium|low"
}`;

      const result = await generateContent(
        prompt,
        "You are a gaming industry career expert. Return valid JSON only.",
      );

      // Clean the response to handle markdown-formatted JSON
      const cleanedResult = this.cleanJsonResponse(_result);
      const mappings = JSON.parse(cleanedResult) as SkillMapping[];
      return this.enrichSkillMappings(mappings);
    } catch (_error) {
      console.error("Gaming experience analysis failed:", error);
      throw error;
    }
  }

  async getTrendingSkills(): Promise<TrendingSkill[]> {

Focus on:
- Emerging technologies (AR/VR, AI, Cloud Gaming)
- Live service game operations
- Cross-platform development
- Community & creator economy
- Data-driven design
- Accessibility in gaming
- Sustainable game development

For each skill provide:
- Skill name
- Demand growth percentage
- Average salary range
- Required for roles
- Learning resources

Return JSON format:
{
  "skill": "skill name",
  "description": "brief description",
  "difficulty": "beginner|intermediate|advanced"
}`;

    try {
      const result = await generateContent(
        prompt,
        "You are a gaming industry analyst. Return valid JSON array only.",
      );

      // Clean the response to handle markdown-formatted JSON
      const cleanedResult = this.cleanJsonResponse(result || "[]");
      return JSON.parse(cleanedResult) as TrendingSkill[];
    } catch (_error) {
      console.error("Trending skills fetch failed:", error);
      return this.getFallbackTrendingSkills();
    }
  }

  async getRoleSkillRequirements(roleId: string): Promise<IndustryRole> {
    const roleMap = {
      "game-designer": "Game Designer",
      "community-manager": "Community Manager",
      "gameplay-programmer": "Gameplay Programmer",
      "technical-artist": "Technical Artist",
      producer: "Game Producer",
      "qa-engineer": "QA Engineer",
      "level-designer": "Level Designer",
      "narrative-designer": "Narrative Designer",
      "live-ops-manager": "Live Operations Manager",
      "esports-coordinator": "Esports Coordinator",
    };

    const roleName = (roleMap as Record<string, string>)[roleId] || roleId;

    const prompt = `Provide detailed skill requirements for a ${roleName} role in the gaming industry.

Include:

Return JSON format:
{
  "id": "${roleId}",
  "title": "${roleName}",
  "description": "role overview",
  "salaryRanges": {
  },
  "careerProgression": [
  ],
  "industryDemand": "high|medium|low",
  "remoteWorkFriendly": true|false
}`;

    try {
      const result = await generateContent(
        prompt,
        "You are a gaming industry HR specialist. Return valid JSON only.",
      );

      // Clean the response to handle markdown-formatted JSON
      const cleanedResult = this.cleanJsonResponse(_result);
      return JSON.parse(cleanedResult) as IndustryRole;
    } catch (_error) {
      console.error("Role requirements fetch failed:", error);
      throw error;
    }
  }

  calculateReadinessScore(
    userSkills: SkillMapping[],
    targetRole?: string,
  ): ReadinessAssessment {
    const categories = {
      technical: this.calculateCategoryScore(userSkills, "technical"),
      soft: this.calculateCategoryScore(userSkills, "leadership", "community"),
      industry: this.calculateIndustryKnowledgeScore(userSkills),
      portfolio: this.calculatePortfolioScore(userSkills),
    };

    const overallScore =

    return {
      overallScore: Math.round(overallScore),
      categories: {
        technical: {
          score: categories.technical,
          feedback: this.getTechnicalFeedback(categories.technical),
        },
        softSkills: {
          score: categories.soft,
          feedback: this.getSoftSkillsFeedback(categories.soft),
        },
        industryKnowledge: {
          score: categories.industry,
          feedback: this.getIndustryFeedback(categories.industry),
        },
        portfolio: {
          score: categories.portfolio,
          feedback: this.getPortfolioFeedback(categories.portfolio),
        },
      },
      improvementSuggestions: this.getImprovementSuggestions(categories),
      nextSteps: this.getNextSteps(categories, targetRole),
      lastAssessed: new Date(),
    };
  }

  async getGameToIndustryTranslations(): Promise<GameToIndustryTranslation[]> {
    const examples: GameToIndustryTranslation[] = [
      {
        gameActivity: "Guild Management in WoW",
        professionalEquivalent: "Community Manager, Producer",
        industries: ["Game Development", "Social Media", "Event Management"],
        skillsRequired: ["Leadership", "Communication", "Event Planning"],
        evidenceTypes: ["community", "achievement"],
        difficultyToTransition: "moderate",
        famousExamples: [
          {
            name: "Various Blizzard CMs",
            description:
              "Many Blizzard community managers started as guild leaders",
            achievement: "Community Leadership",
            relevantSkills: ["Leadership", "Communication"],
          },
        ],
      },
      {
        gameActivity: "Meta Analysis in LoL",
        professionalEquivalent: "Systems Designer, Data Analyst",
        industries: [
          "Game Design",
          "Business Intelligence",
          "Product Management",
        ],
        skillsRequired: [
          "Data Analysis",
          "Pattern Recognition",
          "Strategic Thinking",
        ],
        evidenceTypes: ["stats", "document"],
        difficultyToTransition: "moderate",
        famousExamples: [
          {
            name: "Riot Design Team",
            description: "Riot's design team includes many former pro players",
            achievement: "Game Design Innovation",
            relevantSkills: ["Systems Design", "Data Analysis"],
          },
        ],
      },
      {
        gameActivity: "Speedrun Route Optimization",
        professionalEquivalent: "Process Optimization, QA Engineer",
        industries: ["Game Testing", "Operations", "Software Engineering"],
        skillsRequired: [
          "Process Optimization",
          "Attention to Detail",
          "Problem Solving",
        ],
        evidenceTypes: ["clip", "stats"],
        difficultyToTransition: "easy",
        famousExamples: [
          {
            name: "GDQ Community",
            description: "GDQ speedrunners often become game testers",
            achievement: "Process Optimization",
            relevantSkills: ["Testing", "Optimization"],
          },
        ],
      },
      {
        gameActivity: "Streaming & Content Creation",
        professionalEquivalent: "Marketing, Community Manager",
        industries: ["Marketing", "Content Strategy", "Brand Management"],
        skillsRequired: [
          "Content Creation",
          "Public Speaking",
          "Brand Building",
        ],
        evidenceTypes: ["portfolio_piece", "stats"],
        difficultyToTransition: "easy",
        famousExamples: [
          {
            name: "Industry Streamers",
            description:
              "Many gaming companies hire former streamers for marketing roles",
            achievement: "Content Marketing",
            relevantSkills: ["Marketing", "Community Building"],
          },
        ],
      },
      {
        gameActivity: "Game Modding",
        professionalEquivalent: "Game Developer, Level Designer",
        industries: [
          "Game Development",
          "Software Engineering",
          "Technical Art",
        ],
        evidenceTypes: ["portfolio_piece", "achievement"],
        difficultyToTransition: "moderate",
        famousExamples: [
          {
            name: "Counter-Strike and DOTA",
            description: "Originally mods that became commercial games",
            achievement: "Technical Innovation",
            relevantSkills: ["Programming", "Game Design"],
          },
        ],
      },
    ];

    return examples;
  }

  generateCareerPathways(userSkills: SkillMapping[]): CareerPathway[] {
    const pathways: CareerPathway[] = [];

    // Analyze skill strengths to suggest pathways
    const skillCategories = this.categorizeSkills(userSkills);

      pathways.push({
        id: "producer-path",
        title: "Game Producer",
        description: "Lead game development teams and projects",
        matchScore: this.calculatePathwayMatch(userSkills, "producer"),
        stages: [
          {
            title: "Associate Producer",
            description: "Learn project management basics",
          },
          {
            title: "Producer",
            description: "Manage full game projects",
          },
          {
            title: "Senior Producer",
            description: "Lead multiple projects and teams",
          },
        ],
        requiredSkills: [
          "Project Management",
          "Team Leadership",
          "Communication",
        ],
        jobMarketTrend: "growing",
      });
    }

      pathways.push({
        id: "developer-path",
        title: "Game Developer",
        description:
          "Create games through programming and technical implementation",
        matchScore: this.calculatePathwayMatch(userSkills, "developer"),
        stages: [
          {
            title: "Junior Developer",
          },
          {
            title: "Game Developer",
            description: "Develop game features",
          },
          {
            title: "Senior Developer",
            description: "Architect game systems",
          },
        ],
        requiredSkills: ["Programming", "Game Engines", "Problem Solving"],
        jobMarketTrend: "growing",
      });
    }

      pathways.push({
        id: "designer-path",
        title: "Game Designer",
        description: "Design gameplay mechanics and player experiences",
        matchScore: this.calculatePathwayMatch(userSkills, "designer"),
        stages: [
          {
            title: "Junior Designer",
            description: "Create design documents",
          },
          {
            title: "Game Designer",
            description: "Design game systems",
          },
          {
            title: "Lead Designer",
            description: "Guide overall game vision",
          },
        ],
        requiredSkills: [
          "Game Design",
          "Systems Thinking",
          "Player Psychology",
        ],
        jobMarketTrend: "growing",
      });
    }

    return pathways.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Private helper methods

  private cleanJsonResponse(response: string): string {
    if (!response) return "[]";

    // Remove markdown code blocks
    let cleaned = response.trim();

    // Remove ```json and ``` markers

    // Remove any remaining ``` markers

    // Trim whitespace
    cleaned = cleaned.trim();

    // If it doesn't start with [ or {, try to find JSON in the response
    if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
      if (jsonMatch) {
      }
    }

    return cleaned || "[]";
  }

  private async enrichSkillMappings(
    mappings: SkillMapping[],
  ): Promise<SkillMapping[]> {
    return mappings.map((mapping) => ({
      ...mapping,
      id: this.generateSkillId(),
      createdAt: new Date(),
      evidence: [],
      verified: false,
    }));
  }

  private generateSkillId(): string {
  }

  private calculateCategoryScore(
    skills: SkillMapping[],
    ...categories: string[]
  ): number {
    const relevantSkills = skills.filter((skill) =>
      categories.some((cat) => skill.category?.includes(cat)),
    );


    const avgConfidence =
      relevantSkills.length;
  }

  private calculateIndustryKnowledgeScore(skills: SkillMapping[]): number {
    const industrySpecificSkills = skills.filter((skill) =>
      skill.industryApplications.some(
        (app) =>
          app.toLowerCase().includes("game") ||
          app.toLowerCase().includes("esports") ||
          app.toLowerCase().includes("streaming"),
      ),
    );

  }

  private calculatePortfolioScore(skills: SkillMapping[]): number {
    const skillsWithEvidence = skills.filter(
    );
  }

  private getTechnicalFeedback(score: number): string {
      return "Excellent technical foundation for gaming industry";
      return "Good technical skills, consider learning Unity or Unreal";
    return "Focus on building technical skills through online courses";
  }

  private getSoftSkillsFeedback(score: number): string {
      return "Good interpersonal skills, perfect for team environments";
    return "Work on communication and teamwork skills";
  }

  private getIndustryFeedback(score: number): string {
    return "Learn more about game development pipeline and industry practices";
  }

  private getPortfolioFeedback(score: number): string {
    return "Critical: Build portfolio to showcase your abilities";
  }

  private getImprovementSuggestions(
    categories: Record<string, number>,
  ): string[] {
    const suggestions: string[] = [];

      suggestions.push(
        "Create playable game prototypes to showcase design skills",
      );
    }

      suggestions.push("Learn industry-standard tools (Unity, Unreal, Figma)");
    }

      suggestions.push(
        "Follow gaming industry news and join professional communities",
      );
    }

    suggestions.push("Participate in game jams to build portfolio and network");

    return suggestions;
  }

  private getNextSteps(
    _categories: Record<string, number>,
    targetRole?: string,
  ): string[] {
    const steps: string[] = [];

    if (targetRole === "game-designer") {
      steps.push("Create design documents for your favorite games");
      steps.push("Build paper prototypes of game mechanics");
    } else if (targetRole === "community-manager") {
      steps.push("Build social media presence in gaming communities");
      steps.push("Volunteer as community moderator");
    } else {
      steps.push("Identify specific role and research requirements");
      steps.push("Connect with industry professionals on LinkedIn");
    }

    return steps;
  }

  private categorizeSkills(
    skills: SkillMapping[],
  ): Record<string, SkillMapping[]> {
    return {
      leadership: skills.filter((s) => s.category?.includes("leadership")),
      technical: skills.filter((s) => s.category?.includes("technical")),
      creative: skills.filter((s) => s.category?.includes("creative")),
      analytical: skills.filter((s) => s.category?.includes("analytical")),
      community: skills.filter((s) => s.category?.includes("community")),
    };
  }

  private calculatePathwayMatch(
    skills: SkillMapping[],
    pathway: "producer" | "developer" | "designer",
  ): number {
    const pathwaySkillMap = {
      producer: ["leadership", "community"],
      developer: ["technical"],
      designer: ["creative", "analytical"],
    };

    const relevantCategories = pathwaySkillMap[pathway] || [];
    const matchingSkills = skills.filter((skill) =>
      relevantCategories.some((cat: string) => skill.category?.includes(cat)),
    );

  }

  private getFallbackTrendingSkills(): TrendingSkill[] {
    return [
      {
        skill: "LiveOps Management",
        description:
          "Managing live game content, events, and player engagement post-launch",
        roles: [
          "Live Operations Manager",
          "Product Manager",
          "Community Manager",
        ],
        learningResources: ["Unity Learn", "Game Developer Conference talks"],
        difficulty: "intermediate",
      },
      {
        description:
          "Programming gameplay mechanics and tools in Unity game engine",
        roles: ["Game Developer", "Tools Programmer", "Technical Designer"],
        learningResources: ["Unity Learn", "Coursera", "YouTube tutorials"],
        difficulty: "intermediate",
      },
      {
        skill: "VR/AR Game Design",
        description:
          "Designing user experiences for virtual and augmented reality games",
        roles: ["VR Designer", "UX Designer", "Technical Artist"],
        learningResources: ["Meta Developer docs", "Unity XR Toolkit"],
        difficulty: "advanced",
      },
    ];
  }
}

// Create singleton instance
export const gameSkillMappingService = new GameSkillMappingService();
