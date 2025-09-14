
import { unifiedStorage } from "@/utils/storage";
import { logger } from "@/shared/utils/logger";

export interface PortfolioMigrationState {
  version: number;
  migratedAt: Date;
  features: {
    enhancedPortfolio: boolean;
    templates: boolean;
    sharing: boolean;
    analytics: boolean;
    aiIntegration: boolean;
  };
}

  try {
    logger.info("Starting enhanced portfolio system migration...");

    // Check if migration already completed
    const migrationState = await unifiedStorage.get(
      "portfolio-migration-state",
    );
    if (migrationState?.completed) {
      logger.info("Enhanced portfolio migration already completed");
      return;
    }

    await initializePortfolioTables();

    await migrateExistingPortfolioData();

    await initializeTemplateSystem();

    await initializeSharingSystem();

    await initializeAnalyticsSystem();

    await initializeAIIntegration();

    // Mark migration as complete
    const newMigrationState: PortfolioMigrationState = {
      migratedAt: new Date(),
      features: {
        enhancedPortfolio: true,
        templates: true,
        sharing: true,
        analytics: true,
        aiIntegration: true,
      },
    };

    await unifiedStorage.set("portfolio-migration-state", newMigrationState);
    logger.info("Enhanced portfolio system migration completed successfully");
  } catch (_error) {
    logger.error("Enhanced portfolio migration failed:", error);
    throw error;
  }
}

async function initializePortfolioTables() {
  logger.info("Initializing enhanced portfolio database tables...");

  // Enhanced portfolio structure
  const portfolioSchema = {
    tables: {
      portfolios: {
        id: "string",
        personalInfo: "object",
        projects: "array",
        skills: "object",
        theme: "object",
        seo: "object",
        settings: "object",
        version: "number",
        createdAt: "date",
        updatedAt: "date",
      },
      portfolioProjects: {
        id: "string",
        portfolioId: "string",
        title: "string",
        description: "string",
        longDescription: "string",
        category: "string",
        status: "string",
        technologies: "array",
        role: "string",
        teamSize: "number",
        duration: "object",
        media: "object",
        links: "object",
        achievements: "array",
        challenges: "array",
        featured: "boolean",
        order: "number",
        metadata: "object",
        createdAt: "date",
        updatedAt: "date",
      },
      portfolioTemplates: {
        id: "string",
        name: "string",
        description: "string",
        category: "string",
        type: "string",
        structure: "object",
        aiPrompts: "object",
        preview: "object",
        tags: "array",
        difficulty: "string",
        estimatedTime: "number",
        isBuiltIn: "boolean",
        usageCount: "number",
        createdAt: "date",
        updatedAt: "date",
      },
      sharedPortfolios: {
        id: "string",
        portfolioId: "string",
        url: "string",
        title: "string",
        description: "string",
        settings: "object",
        analytics: "object",
        isActive: "boolean",
        createdAt: "date",
        lastViewed: "date",
      },
      portfolioAnalytics: {
        id: "string",
        shareId: "string",
        event: "string",
        data: "object",
        timestamp: "date",
        sessionId: "string",
        userAgent: "string",
        referrer: "string",
      },
    },
  };

  await unifiedStorage.set("portfolio-schema", portfolioSchema);
  logger.info("Portfolio database schema initialized");
}

  logger.info("Migrating existing portfolio data...");

  try {
    // Get existing portfolio data from app store
    const existingPortfolio = await unifiedStorage.get("user")?.portfolio;

    if (
      existingPortfolio &&
      Array.isArray(existingPortfolio) &&
    ) {
      logger.info(
        `Found ${existingPortfolio.length} existing portfolio items to migrate`,
      );

      // Convert legacy portfolio items to new format
      const migratedProjects = existingPortfolio.map(
        (item: any, index: number) => ({
          id: item.id || crypto.randomUUID(),
          title: item.title || "Untitled Project",
          description: item.description || "",
          longDescription: item.longDescription || item.description || "",
          category: mapLegacyType(item.type),
          status: item.status || "completed",
          technologies: item.skills || item.technologies || [],
          role: item.role || "Developer",
          duration: {
            startDate: item.startDate ? new Date(item.startDate) : new Date(),
            endDate: item.endDate ? new Date(item.endDate) : new Date(),
          },
          media: {
            screenshots: item.media?.screenshots || [],
            videos: item.media?.videos || [],
            demos: item.url ? [item.url] : [],
          },
          links: {
            live: item.url || item.liveUrl,
            github: item.githubUrl,
            documentation: item.documentation,
            store: item.storeUrl,
          },
          achievements: item.achievements || [],
          challenges: item.challenges || [],
          featured: item.featured || false,
          order: index,
          metadata: {
            legacyId: item.id,
            migratedAt: new Date(),
            originalType: item.type,
          },
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: new Date(),
        }),
      );

      // Create new portfolio structure
      const newPortfolio = {
        id: crypto.randomUUID(),
        personalInfo: {
          name: "",
          title: "Gaming Professional",
          bio: "",
          location: "",
          email: "",
          website: "",
          social: {},
        },
        projects: migratedProjects,
        skills: {
          primary: extractSkillsFromProjects(migratedProjects, "primary"),
          secondary: extractSkillsFromProjects(migratedProjects, "secondary"),
          tools: extractSkillsFromProjects(migratedProjects, "tools"),
        },
        theme: {
          layout: "grid",
          showContact: true,
          showSkills: true,
        },
        seo: {
          title: "Gaming Portfolio",
          description: "Professional gaming industry portfolio",
          keywords: ["gaming", "portfolio", "developer"],
        },
        settings: {
          autoSave: true,
          analytics: true,
          sharing: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save migrated portfolio
      await unifiedStorage.set("portfolio", newPortfolio);

      // Backup original data
      await unifiedStorage.set("portfolio-legacy-backup", existingPortfolio);

      logger.info("Portfolio data migration completed successfully");
    } else {
      logger.info("No existing portfolio data found to migrate");
    }
  } catch (_error) {
    logger.error("Portfolio data migration failed:", error);
    throw error;
  }
}

  logger.info("Initializing portfolio template system...");

  const builtInTemplates = [
    {
      id: "game-dev-basic",
      name: "Basic Game Development",
      description: "Simple game project showcase template",
      category: "gaming",
      type: "project",
      structure: {
        title: "Game Project",
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
            title: "Game Features",
            type: "list",
            content: [],
            required: true,
          },
          {
            id: "technical",
            title: "Technical Details",
            type: "list",
            content: [],
            required: false,
          },
        ],
        suggestedMedia: ["gameplay-video", "screenshots"],
        requiredFields: ["title", "description", "technologies"],
      },
      aiPrompts: {
        description:
          "Create a description for a {genre} game project built with {engine}",
        achievements: "List achievements for this game development project",
        technologies: "Describe the technical implementation of this game",
      },
      preview: {
        thumbnail: "/templates/game-dev-basic.jpg",
      },
      tags: ["game", "development", "basic"],
      difficulty: "beginner",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "web-app-basic",
      name: "Basic Web Application",
      description: "Simple web application showcase template",
      category: "web",
      type: "project",
      structure: {
        title: "Web Application",
        sections: [
          {
            id: "overview",
            title: "Application Overview",
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
            id: "stack",
            title: "Technology Stack",
            type: "list",
            content: [],
            required: true,
          },
        ],
        suggestedMedia: ["screenshots", "demo-video"],
        requiredFields: ["title", "description", "technologies", "liveUrl"],
      },
      aiPrompts: {
        description:
          "Create a description for a {type} web application using {technologies}",
        achievements: "List technical achievements for this web project",
        technologies: "Explain the technology choices for this web application",
      },
      preview: {
        thumbnail: "/templates/web-app-basic.jpg",
      },
      tags: ["web", "application", "basic"],
      difficulty: "beginner",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Save built-in templates
  for (const template of builtInTemplates) {
    await unifiedStorage.set(`template-${template.id}`, template);
  }

  // Initialize template index
  await unifiedStorage.set(
    "portfolio-templates-index",
    builtInTemplates.map((t) => t.id),
  );

  logger.info("Portfolio template system initialized");
}

  logger.info("Initializing portfolio sharing system...");

  const sharingConfig = {
    enabled: true,
    features: {
      publicSharing: true,
      passwordProtection: true,
      customDomains: false, // Premium feature
      analytics: true,
      downloadTracking: true,
      customBranding: true,
    },
    limits: {
    },
    defaultSettings: {
      isPublic: false,
      allowDownload: true,
      showContactInfo: true,
      requirePassword: false,
      analytics: {
        enableTracking: true,
        trackDownloads: true,
        trackViewTime: true,
      },
      branding: {
        showWatermark: true,
      },
    },
  };

  await unifiedStorage.set("portfolio-sharing-config", sharingConfig);
  await unifiedStorage.set("shared-portfolios-index", []);

  logger.info("Portfolio sharing system initialized");
}

  logger.info("Initializing portfolio analytics system...");

  const analyticsConfig = {
    enabled: true,
    aggregationIntervals: ["daily", "weekly", "monthly"],
    events: [
      "page_view",
      "project_view",
      "download",
      "contact_click",
      "share_created",
      "template_used",
    ],
    privacy: {
      anonymizeIPs: true,
      respectDNT: true,
      cookieConsent: true,
    },
  };

  await unifiedStorage.set("portfolio-analytics-config", analyticsConfig);
  await unifiedStorage.set("portfolio-analytics-summary", {
    popularProjects: [],
    topReferrers: {},
    lastUpdated: new Date(),
  });

  logger.info("Portfolio analytics system initialized");
}

  logger.info("Initializing AI integration for portfolios...");

  const aiConfig = {
    enabled: true,
    features: {
      contentGeneration: true,
      templateCreation: true,
      suggestionEngine: true,
      autoTagging: true,
      seoOptimization: true,
    },
    limits: {
    },
    templates: {
      projectDescription:
        "Create a professional portfolio description for a {type} project called {title} using {technologies}. Highlight key features and technical achievements.",
      achievementSummary:
        "Summarize the key achievements and impacts of this {type} project: {description}",
      skillExtraction:
        "Extract relevant skills and technologies from this project description: {description}",
      seoOptimization:
        "Generate SEO-optimized title, description, and keywords for this portfolio project: {title} - {description}",
    },
  };

  await unifiedStorage.set("portfolio-ai-config", aiConfig);

  logger.info("AI integration for portfolios initialized");
}

  const typeMap: Record<string, string> = {
    achievement: "game",
    project: "game",
    tournament: "game",
    leadership: "other",
    content: "other",
    clip: "other",
    competition: "game",
  };

  return typeMap[legacyType] || "other";
}

  projects: any[],
  category: "primary" | "secondary" | "tools",
): string[] {
  const allSkills = projects.flatMap((p) => p.technologies || []);
  const skillCounts = allSkills.reduce(
    (counts: Record<string, number>, skill: string) => {
      return counts;
    },
    {},
  );

  const sortedSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([skill]) => skill);

  switch (category) {
    case "primary":
    case "secondary":
    case "tools":
    default:
      return [];
  }
}

export default {
  runEnhancedPortfolioMigration,
};
