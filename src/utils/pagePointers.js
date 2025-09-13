// Page Pointers Utility - Central registry for page components and routing
// Ensures all page references are correct and provides dynamic component loading

import { logger } from "@/shared/utils/logger";
import { serviceRegistry, gamingStudioService } from "@/shared/services";

// Page component registry with lazy loading
export const PAGE_COMPONENTS = {
  // Main application pages
  dashboard: () => import("@/views/Dashboard.vue"),

  // Document builders (unified)
  // Canonical unified Document Builder for resume & cover letter
  resumeBuilder: () => import("@/views/DocumentBuilder.vue"),
  coverLetterBuilder: () => import("@/views/DocumentBuilder.vue"),

  // Portfolio system (canonical)
  portfolioStudio: () => import("@/views/PortfolioStudio.vue"),
  // Legacy variants removed; point any lingering references to canonical
  portfolioGenerator: () => import("@/views/PortfolioStudio.vue"),
  modernPortfolio: () => import("@/views/PortfolioStudio.vue"),

  // Job search and gaming
  jobSearch: () => import("@/views/JobSearch.vue"),
  // Gaming jobs consolidated under unified JobSearch
  gamingJobsListing: () => import("@/views/JobSearch.vue"),
  skillMapper: () => import("@/views/SkillMapper.vue"),

  // Interview preparation
  gamingInterview: () => import("@/views/GamingInterview.vue"),

  // System and demo pages
  settings: () => import("@/views/Settings.vue"),
  realTimeDemo: () => import("@/views/RealTimeDemo.vue"),

  // MUI components demo
  muiExample: () => import("@/components/examples/MuiExampleUsage.vue"),

  // Sub-components for resume building
  "resume.personalInfo": () => import("@/views/resume/PersonalInfoForm.vue"),
  "resume.experience": () => import("@/views/resume/ExperienceList.vue"),
  "resume.education": () => import("@/views/resume/EducationList.vue"),
  "resume.skills": () => import("@/views/resume/SkillsEditor.vue"),
  "resume.additional": () =>
    import("@/views/resume/AdditionalExperienceList.vue"),
  "resume.preview": () => import("@/views/resume/PreviewPanel.vue"),
  "resume.actions": () => import("@/views/resume/ActionsPanel.vue"),

  // Cover letter components
  "coverLetter.tabs": () => import("@/views/coverletter/CoverLetterTabs.vue"),
  "coverLetter.content": () =>
    import("@/views/coverletter/CoverLetterContentForm.vue"),
  "coverLetter.jobInfo": () => import("@/views/coverletter/JobInfoForm.vue"),
  "coverLetter.preview": () =>
    import("@/views/coverletter/CoverLetterPreview.vue"),
};

// Page metadata registry
export const PAGE_METADATA = {
  dashboard: {
    title: "Dashboard",
    icon: "mdi-view-dashboard",
    description: "Main application dashboard with overview and quick actions",
    muiTheme: true,
    requiresAuth: false,
    services: ["statistics", "userProfile"],
  },

  resumeBuilder: {
    title: "Resume Builder",
    icon: "mdi-file-document-edit-outline",
    description: "Professional resume builder with AI-powered suggestions",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai", "userProfile", "statistics"],
  },

  coverLetterBuilder: {
    title: "Cover Letter Builder",
    icon: "mdi-email-edit",
    description: "Personalized cover letter generator",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai", "userProfile"],
  },

  portfolioStudio: {
    title: "Portfolio",
    icon: "mdi-briefcase-variant",
    description:
      "Unified portfolio studio for projects, clips, and achievements",
    muiTheme: true,
    requiresAuth: false,
    services: ["userProfile", "statistics"],
  },
  // Legacy metadata aliases map to canonical portfolio
  portfolioGenerator: {
    title: "Portfolio",
    icon: "mdi-briefcase-variant",
    description:
      "Unified portfolio studio for projects, clips, and achievements",
    muiTheme: true,
    requiresAuth: false,
    services: ["userProfile", "statistics"],
  },
  modernPortfolio: {
    title: "Portfolio",
    icon: "mdi-briefcase-variant",
    description:
      "Unified portfolio studio for projects, clips, and achievements",
    muiTheme: true,
    requiresAuth: false,
    services: ["userProfile", "statistics"],
  },

  jobSearch: {
    title: "Job Search",
    icon: "mdi-magnify",
    description: "AI-powered job search and matching platform",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai", "gamingStudios", "userProfile"],
  },

  skillMapper: {
    title: "Skill Mapper",
    icon: "mdi-map",
    description: "Gaming skills to professional skills mapping tool",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai", "userProfile"],
  },

  gamingInterview: {
    title: "Interview Preparation",
    icon: "mdi-account-voice",
    description: "AI-powered interview preparation for gaming industry",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai", "gamingStudios", "userProfile"],
  },

  settings: {
    title: "Settings",
    icon: "mdi-cog",
    description: "Application settings and preferences",
    muiTheme: true,
    requiresAuth: false,
    services: ["userProfile", "ai"],
  },

  realTimeDemo: {
    title: "Real-time AI Demo",
    icon: "mdi-robot",
    description: "Demonstration of real-time AI capabilities",
    muiTheme: true,
    requiresAuth: false,
    services: ["ai"],
  },

  muiExample: {
    title: "MUI Components Demo",
    icon: "mdi-palette",
    description: "Demonstration of MUI-inspired Vue components",
    muiTheme: true,
    requiresAuth: false,
    services: ["gamingStudios", "ai", "userProfile"],
  },
};

// Route to component mapping
export const ROUTE_TO_COMPONENT = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/documents": "resumeBuilder",
  "/documents/resume": "resumeBuilder",
  "/documents/resume-new": "resumeBuilder",
  "/documents/cover-letter": "resumeBuilder",
  "/portfolio": "portfolioStudio",
  "/portfolio-modern": "portfolioStudio",
  "/portfolio/showcase": "portfolioStudio",
  "/portfolio/manage": "portfolioStudio",
  "/portfolio/analytics": "portfolioStudio",
  "/portfolio/templates": "portfolioStudio",
  "/jobs": "jobSearch",
  "/gaming-jobs": "jobSearch",
  "/skills": "skillMapper",
  "/interview": "gamingInterview",
  "/settings": "settings",
  "/demo/realtime": "realTimeDemo",
  "/demo/mui": "muiExample",

  // Legacy route mappings
  "/resume": "resumeBuilder",
  "/resume-new": "resumeBuilder",
  "/cover-letter": "resumeBuilder",
};

// Component validation and loading
export class PagePointerManager {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  // Get page component with caching
  async getPageComponent(pageKey) {
    if (!PAGE_COMPONENTS[pageKey]) {
      logger.error(`Page component '${pageKey}' not found`);
      throw new Error(`Unknown page component: ${pageKey}`);
    }

    // Return cached component if available
    if (this.cache.has(pageKey)) {
      return this.cache.get(pageKey);
    }

    // Return existing loading promise if component is being loaded
    if (this.loadingPromises.has(pageKey)) {
      return this.loadingPromises.get(pageKey);
    }

    // Load component
    const loadingPromise = this.loadComponent(pageKey);
    this.loadingPromises.set(pageKey, loadingPromise);

    try {
      const component = await loadingPromise;
      this.cache.set(pageKey, component);
      this.loadingPromises.delete(pageKey);
      return component;
    } catch (error) {
      this.loadingPromises.delete(pageKey);
      throw error;
    }
  }

  // Load component with error handling
  async loadComponent(pageKey) {
    try {
      logger.debug(`Loading page component: ${pageKey}`);
      const componentLoader = PAGE_COMPONENTS[pageKey];
      const module = await componentLoader();

      // Validate component
      if (!module.default) {
        throw new Error(
          `Component '${pageKey}' does not have a default export`,
        );
      }

      logger.debug(`Successfully loaded page component: ${pageKey}`);
      return module.default;
    } catch (error) {
      logger.error(`Failed to load page component '${pageKey}':`, error);
      throw error;
    }
  }

  // Get component by route path
  async getComponentByRoute(routePath) {
    const pageKey = ROUTE_TO_COMPONENT[routePath];
    if (!pageKey) {
      logger.error(`No component mapped for route: ${routePath}`);
      throw new Error(`No component found for route: ${routePath}`);
    }

    return this.getPageComponent(pageKey);
  }

  // Get page metadata
  getPageMetadata(pageKey) {
    return PAGE_METADATA[pageKey] || null;
  }

  // Get metadata by route path
  getMetadataByRoute(routePath) {
    const pageKey = ROUTE_TO_COMPONENT[routePath];
    return pageKey ? this.getPageMetadata(pageKey) : null;
  }

  // Preload essential components
  async preloadComponents(componentKeys = []) {
    const essentialComponents =
      componentKeys.length > 0
        ? componentKeys
        : ["dashboard", "resumeBuilder", "jobSearch", "settings"];

    logger.info("Preloading essential components:", essentialComponents);

    const loadPromises = essentialComponents.map(async (key) => {
      try {
        await this.getPageComponent(key);
        logger.debug(`Preloaded component: ${key}`);
      } catch (error) {
        logger.warn(`Failed to preload component '${key}':`, error);
      }
    });

    await Promise.allSettled(loadPromises);
    logger.info("Component preloading completed");
  }

  // Validate all page pointers
  async validateAllPointers() {
    const results = {
      valid: [],
      invalid: [],
      errors: [],
    };

    for (const [pageKey, loader] of Object.entries(PAGE_COMPONENTS)) {
      try {
        await loader();
        results.valid.push(pageKey);
      } catch (error) {
        results.invalid.push(pageKey);
        results.errors.push({ pageKey, error: error.message });
      }
    }

    return results;
  }

  // Initialize required services for a page
  async initializePageServices(pageKey) {
    const metadata = this.getPageMetadata(pageKey);
    if (!metadata?.services) {
      return true;
    }

    const initPromises = metadata.services.map(async (serviceName) => {
      try {
        if (serviceName === "gamingStudios") {
          await gamingStudioService.initialize();
          return true;
        } else if (serviceRegistry.hasService(serviceName)) {
          // Service is already registered
          return true;
        } else {
          // Attempt to load service dynamically
          await serviceRegistry.loadService(
            serviceName,
            `@/services/${serviceName}`,
          );
          return true;
        }
      } catch (error) {
        logger.warn(
          `Failed to initialize service '${serviceName}' for page '${pageKey}':`,
          error,
        );
        return false;
      }
    });

    const results = await Promise.allSettled(initPromises);
    const failures = results.filter(
      (r) => r.status === "rejected" || r.value === false,
    );

    if (failures.length > 0) {
      logger.warn(`Some services failed to initialize for page '${pageKey}'`);
    }

    return failures.length === 0;
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedComponents: Array.from(this.cache.keys()),
      loadingComponents: Array.from(this.loadingPromises.keys()),
      cacheSize: this.cache.size,
      totalComponents: Object.keys(PAGE_COMPONENTS).length,
    };
  }

  // Clear cache
  clearCache(pageKeys = null) {
    if (pageKeys) {
      pageKeys.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// Create singleton instance
export const pagePointerManager = new PagePointerManager();


export const getPageComponent = (pageKey) =>
  pagePointerManager.getPageComponent(pageKey);
export const getComponentByRoute = (routePath) =>
  pagePointerManager.getComponentByRoute(routePath);
export const getPageMetadata = (pageKey) =>
  pagePointerManager.getPageMetadata(pageKey);
export const preloadComponents = (components) =>
  pagePointerManager.preloadComponents(components);
export const validateAllPointers = () =>
  pagePointerManager.validateAllPointers();

// Auto-preload essential components on initialization
if (typeof window !== "undefined") {
  // Delay preloading to avoid blocking initial render
  setTimeout(() => {
    pagePointerManager.preloadComponents().catch((error) => {
      logger.debug("Component preloading failed (non-critical):", error);
    });
  }, 2000);
}

export default pagePointerManager;
