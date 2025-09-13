
import { ref, computed, watch } from "vue";
import { useStorage } from "@vueuse/core";
import {
  PortfolioRepository,
  type Portfolio,
  type PortfolioProject,
} from "@/modules/db/repositories/portfolio";
import { logger } from "@/shared/utils/logger";

// AI Integration type (fallback if not available)
interface AIIntegration {
  generateContent: (
    _type: string,
    _prompt: string,
    _context?: any,
    _options?: any,
  ) => Promise<any>;
  isConfigured: { value: boolean };
}

  // Fallback implementation since AI integration module has type issues
  return {
    generateContent: async () => ({ text: "" }),
    isConfigured: { value: false },
  };
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: "gaming" | "web" | "mobile" | "creative" | "technical";
  type: "project" | "achievement" | "experience" | "showcase";
  structure: {
    title: string;
    sections: PortfolioSection[];
    suggestedMedia: string[];
    requiredFields: string[];
  };
  aiPrompts: {
    description: string;
    achievements: string;
    technologies: string;
  };
  preview: {
    thumbnail: string;
    demoUrl?: string;
  };
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSection {
  id: string;
  title: string;
  type: "text" | "media" | "list" | "stats" | "timeline" | "showcase";
  content: any;
  order: number;
  required: boolean;
}

export interface ShareablePortfolio {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "public" | "private" | "password";
  password?: string;
  expiresAt?: Date;
  analytics: {
    views: number;
    uniqueViews: number;
    lastViewed: Date;
    referrers: Record<string, number>;
  };
  settings: {
    allowDownload: boolean;
    showContact: boolean;
    watermark: boolean;
    theme: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AIPortfolioSuggestion {
  type: "improvement" | "missing" | "enhancement" | "template";
  title: string;
  description: string;
  action: string;
  priority: "low" | "medium" | "high";
  category: string;
  implementation?: {
    steps: string[];
    estimatedTime: number;
    difficulty: string;
  };
}

  // State
  const portfolio = ref<Portfolio | null>(null);
  const templates = ref<PortfolioTemplate[]>([]);
  const shareables = ref<ShareablePortfolio[]>([]);
  const aiSuggestions = ref<AIPortfolioSuggestion[]>([]);
  const loading = ref(false);
  const _error = ref<string | null>(null);

  // Persistence
  const savedTemplates = useStorage(
    "portfolio-custom-templates",
    [] as PortfolioTemplate[],
  );
  const recentProjects = useStorage(
    "portfolio-recent-projects",
    [] as string[],
  );
  const userPreferences = useStorage("portfolio-preferences", {
    defaultTheme: "modern",
    autoSave: true,
    aiAssistance: true,
    analytics: true,
  });

  // AI Integration
  const { generateContent, isConfigured: isAIConfigured } = useAIIntegration();

  // Computed
  const projects = computed(() => portfolio.value?.projects || []);
  const featuredProjects = computed(() =>
    projects.value.filter((p) => p.featured),
  );
  const projectsByCategory = computed(() => {
    const groups: Record<string, PortfolioProject[]> = {};
    projects.value.forEach((project) => {
      if (!groups[project.category]) groups[project.category] = [];
      groups[project.category].push(project);
    });
    return groups;
  });

  const portfolioStats = computed(() => {
    const totalProjects = projects.value.length;
    const completedProjects = projects.value.filter(
      (p) => p.status === "completed",
    ).length;
    const technologies = [
      ...new Set(projects.value.flatMap((p) => p.technologies)),
    ];

    return {
      totalProjects,
      completedProjects,
      inProgress: projects.value.filter((p) => p.status === "in-progress")
        .length,
      technologies: technologies.length,
      averageProjectDuration: calculateAverageProjectDuration(),
      completionRate:
    };
  });

  // Load portfolio data
    try {
      loading.value = true;
      error.value = null;

      portfolio.value = await PortfolioRepository.get();

      if (!portfolio.value) {
        // Create default portfolio
        portfolio.value = await PortfolioRepository.create({
          personalInfo: {
            name: "",
            title: "Gaming Professional",
            bio: "",
            social: {},
          },
          projects: [],
          skills: {
            primary: [],
            secondary: [],
            tools: [],
          },
          theme: {
            layout: "grid",
            showContact: true,
            showSkills: true,
          },
          seo: {},
        });
      }

      await loadTemplates();
      await loadShareables();

      if (userPreferences.value.aiAssistance && isAIConfigured.value) {
        await generateAISuggestions();
      }
    } catch (_err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load portfolio";
      logger.error("Failed to load portfolio:", err);
    } finally {
      loading.value = false;
    }
  }

  // Templates Management
    templates.value = [...getBuiltInTemplates(), ...savedTemplates.value];
  }

    return [
      {
        id: "game-project",
        name: "Game Development Project",
        description:
          "Showcase a complete game development project with technical details",
        category: "gaming",
        type: "project",
        structure: {
          title: "Game Project Showcase",
          sections: [
            {
              id: "overview",
              title: "Project Overview",
              type: "text",
              content: "",
              required: true,
            },
            {
              id: "gameplay",
              title: "Gameplay & Features",
              type: "showcase",
              content: "",
              required: true,
            },
            {
              id: "technical",
              title: "Technical Implementation",
              type: "list",
              content: [],
              required: false,
            },
            {
              id: "media",
              title: "Screenshots & Videos",
              type: "media",
              content: [],
              required: false,
            },
          ],
          suggestedMedia: ["gameplay-video", "screenshots", "concept-art"],
          requiredFields: ["title", "description", "technologies", "role"],
        },
        aiPrompts: {
          description:
            "Write a compelling description for a {gameType} game project that demonstrates {skills} skills",
          achievements:
            "List key achievements and milestones for this game development project",
          technologies:
            "Suggest appropriate technologies and tools for a {gameType} game project",
        },
        preview: {
          thumbnail: "/templates/game-project-preview.jpg",
        },
        tags: ["game-development", "technical", "creative"],
        difficulty: "intermediate",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "competitive-achievement",
        name: "Competitive Gaming Achievement",
        description:
          "Highlight competitive gaming accomplishments and tournaments",
        category: "gaming",
        type: "achievement",
        structure: {
          title: "Competitive Achievement",
          sections: [
            {
              id: "achievement",
              title: "Achievement Details",
              type: "text",
              content: "",
              required: true,
            },
            {
              id: "stats",
              title: "Performance Statistics",
              type: "stats",
              content: {},
              required: false,
            },
            {
              id: "timeline",
              title: "Tournament Timeline",
              type: "timeline",
              content: [],
              required: false,
            },
          ],
          suggestedMedia: [
            "tournament-photos",
            "match-highlights",
            "certificates",
          ],
          requiredFields: ["title", "game", "achievement", "date"],
        },
        aiPrompts: {
          description:
            "Write an impressive description for a {game} competitive achievement: {achievement}",
          achievements:
            "Break down the significance of this competitive gaming achievement",
          technologies:
            "What skills and strategies were key to achieving this competitive result?",
        },
        preview: {
          thumbnail: "/templates/competitive-preview.jpg",
        },
        tags: ["esports", "competitive", "achievement"],
        difficulty: "beginner",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "web-portfolio",
        name: "Web Development Portfolio",
        description: "Professional web development project showcase",
        category: "web",
        type: "project",
        structure: {
          title: "Web Development Project",
          sections: [
            {
              id: "overview",
              title: "Project Overview",
              type: "text",
              content: "",
              required: true,
            },
            {
              id: "features",
              title: "Key Features",
              type: "list",
              content: [],
              required: true,
            },
            {
              id: "technical-stack",
              title: "Technical Stack",
              type: "list",
              content: [],
              required: true,
            },
            {
              id: "live-demo",
              title: "Live Demo",
              type: "showcase",
              content: "",
              required: false,
            },
          ],
          suggestedMedia: [
            "website-screenshots",
            "mobile-responsive",
            "code-snippets",
          ],
          requiredFields: ["title", "description", "technologies", "liveUrl"],
        },
        aiPrompts: {
          description:
            "Create a professional description for a {projectType} web application built with {technologies}",
          achievements:
            "List the key technical achievements and challenges overcome in this web project",
          technologies:
            "Explain the technology choices and architecture for this web development project",
        },
        preview: {
          thumbnail: "/templates/web-portfolio-preview.jpg",
        },
        tags: ["web-development", "frontend", "backend"],
        difficulty: "intermediate",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

    templateData: Omit<PortfolioTemplate, "id" | "createdAt" | "updatedAt">,
  ) {
    const template: PortfolioTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    savedTemplates.value.push(template);
    templates.value.push(template);

    logger.info("Custom template created:", template.name);
    return template;
  }

    templateType: string,
    requirements: string,
  ) {
    if (!isAIConfigured.value) {
      throw new Error("AI not configured");
    }

    try {
      const prompt = `Create a portfolio template for ${templateType} with the following requirements: ${requirements}. 
      Return a JSON structure with template name, description, sections, and suggested content.`;

      const response = await generateContent(
        "template-generation",
        prompt,
        {
          templateType,
          requirements,
        },
        {
          format: "json",
        },
      );

      if (response?.data) {
        return await createCustomTemplate(response.data);
      }

      throw new Error("Failed to generate template with AI");
    } catch (_err) {
      logger.error("AI template generation failed:", err);
      throw err;
    }
  }

  // Project Management
    projectData: Omit<
      PortfolioProject,
      "id" | "createdAt" | "updatedAt" | "order"
    >,
  ) {
    try {
      const project = await PortfolioRepository.addProject(projectData);

      // Update recent projects
      recentProjects.value.unshift(project.id);

      // Reload portfolio
      await loadPortfolio();

      logger.info("Project created:", project.title);
      return project;
    } catch (_err) {
      logger.error("Failed to create project:", err);
      throw err;
    }
  }

    projectId: string,
    updates: Partial<PortfolioProject>,
  ) {
    try {
      const project = await PortfolioRepository.updateProject(
        projectId,
        updates,
      );

      if (userPreferences.value.autoSave) {
        await loadPortfolio(); // Refresh data
      }

      return project;
    } catch (_err) {
      logger.error("Failed to update project:", err);
      throw err;
    }
  }

    try {
      await PortfolioRepository.deleteProject(projectId);
      await loadPortfolio();

      // Remove from recent projects
      recentProjects.value = recentProjects.value.filter(
        (id) => id !== projectId,
      );

      logger.info("Project deleted:", projectId);
    } catch (_err) {
      logger.error("Failed to delete project:", err);
      throw err;
    }
  }

  // AI Features
    if (!isAIConfigured.value || !portfolio.value) return;

    try {
      const portfolioContext = {
        projectCount: projects.value.length,
        categories: Object.keys(projectsByCategory.value),
        technologies: portfolioStats.value.topTechnologies,
        completionRate: portfolioStats.value.completionRate,
      };

      const prompt = `Analyze this portfolio and provide improvement suggestions:
      ${JSON.stringify(portfolioContext)}
      
      Suggest improvements for:

      const response = await generateContent(
        "portfolio-analysis",
        prompt,
        portfolioContext,
        {
          format: "json",
        },
      );

      if (response?.suggestions) {
        aiSuggestions.value = response.suggestions;
      }
    } catch (_err) {
      logger.error("Failed to generate AI suggestions:", err);
    }
  }

    projectData: Partial<PortfolioProject>,
  ) {
    if (!isAIConfigured.value) {
      throw new Error("AI not configured");
    }

    const prompt = `Write a professional portfolio description for a ${projectData.category} project:
    Title: ${projectData.title}
    Technologies: ${projectData.technologies?.join(", ")}
    Role: ${projectData.role}
    
    Make it compelling and highlight technical achievements.`;

    try {
      const response = await generateContent(
        "project-description",
        prompt,
        projectData,
        {
        },
      );

      return response?.text || response?.data?.description || "";
    } catch (_err) {
      logger.error("Failed to generate project description:", err);
      throw err;
    }
  }

  // Sharing Features
    title: string;
    description: string;
    projectIds?: string[];
    type: "public" | "private" | "password";
    password?: string;
    expiresAt?: Date;
    settings: ShareablePortfolio["settings"];
  }) {
    const shareable: ShareablePortfolio = {
      id: crypto.randomUUID(),
      ...options,
      url: `${window.location.origin}/portfolio/shared/${crypto.randomUUID()}`,
      analytics: {
        lastViewed: new Date(),
        referrers: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shareables.value.push(shareable);

    // Store shareable data
    await saveShareableData(shareable, options.projectIds);

    logger.info("Shareable portfolio created:", shareable.id);
    return shareable;
  }

    shareable: ShareablePortfolio,
    projectIds?: string[],
  ) {
    const portfolioData = { ...portfolio.value };

    if (projectIds && portfolioData.projects) {
      portfolioData.projects = portfolioData.projects.filter((p) =>
        projectIds.includes(p.id),
      );
    }

    // Save to storage with shareable ID
    await PortfolioRepository.create({
      ...portfolioData,
      id: shareable.id,
    } as any);
  }

  // Analytics
    const shareable = shareables.value.find((s) => s.id === shareableId);
    if (!shareable) return;

    shareable.analytics.views++;
    shareable.analytics.lastViewed = new Date();

    if (referrer) {
      shareable.analytics.referrers[referrer] =
    }
  }

    const completedProjects = projects.value.filter(
      (p) =>
        p.status === "completed" &&
        p.duration?.startDate &&
        p.duration?.endDate,
    );


    const totalDays = completedProjects.reduce((sum, project) => {
      const start = new Date(project.duration!.startDate);
      const end = new Date(project.duration!.endDate!);
      return (
        sum +
      );

    return Math.round(totalDays / completedProjects.length);
  }

  watch(
    portfolio,
    async (newPortfolio) => {
      if (userPreferences.value.autoSave && newPortfolio) {
        try {
          await PortfolioRepository.update(newPortfolio);
        } catch (_err) {
          logger.error("Auto-save failed:", err);
        }
      }
    },
    { deep: true },
  );

    // Load shareable portfolios from storage
    // This would typically come from a backend API
    shareables.value = [];
  }

  return {
    // State
    portfolio,
    projects,
    featuredProjects,
    projectsByCategory,
    portfolioStats,
    templates,
    shareables,
    aiSuggestions,
    loading,
    error,

    // Preferences
    userPreferences,
    recentProjects,

    // Actions
    loadPortfolio,
    createProject,
    updateProject,
    deleteProject,

    // Templates
    createCustomTemplate,
    generateTemplateWithAI,

    // AI Features
    generateAISuggestions,
    generateProjectDescription,

    // Sharing
    createShareablePortfolio,
    trackShareableView,

    // Utils
    calculateAverageProjectDuration,
  };
}
