// Central service registry and exports (canonical)
export { aiService } from "./AIService";
export { canonicalAIClient as default } from "./CanonicalAIClient";
export { canonicalAIClient } from "./CanonicalAIClient";
export { default as StatisticsService } from "./StatisticsService";
export { logger } from "@/shared/utils/logger";
export { PortfolioService } from "./PortfolioService";
export { callImageGenerator } from "./ImageGeneratorService";

// App-level services
export { userProfileService } from "@/services/UserProfileService";
// Canonical studio service (TypeScript). Maintain alias for compatibility.
export { gameStudioService as gamingStudioService } from "@/services/GameStudioService";

// Service routing utilities
export const createServiceRouter = (services: Record<string, any>) => {
  return {
    getService: (name: string) => services[name],
    hasService: (name: string) => name in services,
    listServices: () => Object.keys(services),
    registerService: (name: string, service: any) => {
      services[name] = service;
    },
  };
};

// Service registry factory for lazy loading
export const createLazyServiceRegistry = () => {
  const services: Record<string, any> = {};

  return createServiceRouter({
    async loadService(name: string, importPath: string) {
      if (!services[name]) {
        try {
          const module = await import(importPath);
          services[name] = module.default || module[name] || module;
        } catch (error) {
          const loggerModule = await import("@/shared/utils/logger");
          loggerModule.logger.error(`Failed to load service ${name}:`, error);
          throw error;
        }
      }
      return services[name];
    },
    ...services,
  });
};

// Default service registry for common app services
export const serviceRegistry = createLazyServiceRegistry();
