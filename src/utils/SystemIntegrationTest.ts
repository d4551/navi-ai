
import { ai } from "@/shared/ai/canonical";
import { GameStudioService } from "@/services/GameStudioService";
import { GoogleAIStreamingService } from "@/shared/services/GoogleAIStreamingService";
import { databaseService } from "@/shared/services/DatabaseService";
import { unifiedStorage } from "@/utils/storage";
import { logger } from "@/shared/utils/logger";
import { getAppVersion } from "./version";

interface TestResult {
  component: string;
  test: string;
  status: "passed" | "failed" | "warning";
  message: string;
  duration: number;
  timestamp: Date;
}

interface SystemHealthReport {
  overallStatus: "healthy" | "degraded" | "critical";
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  results: TestResult[];
  systemInfo: {
    userAgent: string;
    platform: string;
    timestamp: Date;
    version: string;
  };
}

export class SystemIntegrationTest {
  private static instance: SystemIntegrationTest;
  private testResults: TestResult[] = [];

  private constructor() {}

  static getInstance(): SystemIntegrationTest {
    if (!SystemIntegrationTest.instance) {
      SystemIntegrationTest.instance = new SystemIntegrationTest();
    }
    return SystemIntegrationTest.instance;
  }

  async runFullSystemTest(): Promise<SystemHealthReport> {
    this.testResults = [];
    logger.info("Starting comprehensive system integration test...");

    // Test categories
    await this.testStorageIntegration();
    await this.testDatabaseConnectivity();
    await this.testAIServiceIntegration();
    await this.testGamingStudioServices();
    await this.testMediaStreamingCapabilities();
    await this.testThemeSystem();
    await this.testGamificationSystem();

    return this.generateHealthReport();
  }

  private async testStorageIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test basic storage operations
      const testKey = "system-test-" + Date.now();
      const testData = { test: true, timestamp: new Date() };

      await unifiedStorage.set(testKey, testData);
      const retrieved = await unifiedStorage.get(testKey);
      await unifiedStorage.remove(testKey);

      if (retrieved && retrieved.test === true) {
        this.addTestResult(
          "Storage",
          "Basic CRUD operations",
          "passed",
          "Storage read/write/delete operations working correctly",
          startTime,
        );
      } else {
        this.addTestResult(
          "Storage",
          "Basic CRUD operations",
          "failed",
          "Storage operations not working as expected",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Storage",
        "Basic CRUD operations",
        "failed",
        `Storage test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testDatabaseConnectivity(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test database initialization (treat resolve as success)
      await databaseService.initialize();
      this.addTestResult(
        "Database",
        "Service initialization",
        "passed",
        "Database service initialized successfully",
        startTime,
      );

      // Test data persistence
      const testMessage = {
        id: "test-" + Date.now(),
        content: "System integration test message",
        role: "system" as const,
        timestamp: new Date(),
      };

      let messageSaved = false;
      try {
        // Some implementations might not return a value; success is no-throw
        await Promise.resolve(databaseService.saveMessage(testMessage) as any);
        messageSaved = true;
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (/not implemented/i.test(msg)) {
          this.addTestResult(
            "Database",
            "Message persistence",
            "warning",
            "saveMessage not implemented; skipping persistence check",
            startTime,
          );
        } else {
          this.addTestResult(
            "Database",
            "Message persistence",
            "failed",
            `Message save failed: ${msg}`,
            startTime,
          );
        }
      }
      if (messageSaved) {
        this.addTestResult(
          "Database",
          "Message persistence",
          "passed",
          "Message saved successfully",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Database",
        "Connectivity test",
        "failed",
        `Database test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testAIServiceIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test AI service status
      const aiStatus = ai.getStatus();

      if (aiStatus.initialized) {
        this.addTestResult(
          "AI Service",
          "Initialization check",
          "passed",
          "AI service is initialized",
          startTime,
        );
      } else {
        this.addTestResult(
          "AI Service",
          "Initialization check",
          "warning",
          "AI service not initialized",
          startTime,
        );
      }

      const aiConfigStatus = ai.getStatus();

      if (
        aiConfigStatus.availableProviders &&
      ) {
        this.addTestResult(
          "AI Service",
          "Provider configuration",
          "passed",
          `${aiConfigStatus.availableProviders.length} AI providers available`,
          startTime,
        );
      } else {
        this.addTestResult(
          "AI Service",
          "Provider configuration",
          "failed",
          "No AI providers configured",
          startTime,
        );
      }

      // Test Google AI Streaming Service
      const streamingService = GoogleAIStreamingService.getInstance();

      if (streamingService) {
        this.addTestResult(
          "AI Service",
          "Streaming service",
          "passed",
          "Google AI Streaming service accessible",
          startTime,
        );
      } else {
        this.addTestResult(
          "AI Service",
          "Streaming service",
          "failed",
          "Google AI Streaming service not accessible",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "AI Service",
        "Integration test",
        "failed",
        `AI service test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testGamingStudioServices(): Promise<void> {
    const startTime = Date.now();

    try {
      const studioService = GameStudioService.getInstance();

      if (
        studios &&
        Array.isArray(studios.studios) &&
      ) {
        this.addTestResult(
          "Gaming Studios",
          "Data retrieval",
          "passed",
          `Retrieved ${studios.studios.length} studios from ${studios.total} total`,
          startTime,
        );
      } else {
        this.addTestResult(
          "Gaming Studios",
          "Data retrieval",
          "warning",
          "No gaming studios found in database",
          startTime,
        );
      }

      const searchResults = await studioService.searchStudios("Unity");

      if (Array.isArray(searchResults)) {
        this.addTestResult(
          "Gaming Studios",
          "passed",
          `Search returned ${searchResults.length} results`,
          startTime,
        );
      } else {
        this.addTestResult(
          "Gaming Studios",
          "failed",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Gaming Studios",
        "Service test",
        "failed",
        `Gaming studio service test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testMediaStreamingCapabilities(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check browser media support
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );

      if (hasMediaDevices) {
        this.addTestResult(
          "Media Streaming",
          "Browser support",
          "passed",
          "Browser supports media streaming APIs",
          startTime,
        );
      } else {
        this.addTestResult(
          "Media Streaming",
          "Browser support",
          "warning",
          "Browser media streaming support limited",
          startTime,
        );
      }

      // Check screen sharing support
      const hasScreenShare = !!(
        navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
      );

      if (hasScreenShare) {
        this.addTestResult(
          "Media Streaming",
          "Screen sharing support",
          "passed",
          "Screen sharing APIs available",
          startTime,
        );
      } else {
        this.addTestResult(
          "Media Streaming",
          "Screen sharing support",
          "warning",
          "Screen sharing not supported in this browser",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Media Streaming",
        "Capability test",
        "failed",
        `Media streaming test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testThemeSystem(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check for CSS custom properties
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue(
      );

      if (primaryColor && primaryColor.trim()) {
        this.addTestResult(
          "Theme System",
          "CSS variables",
          "passed",
          "Theme system CSS variables are loaded",
          startTime,
        );
      } else {
        this.addTestResult(
          "Theme System",
          "CSS variables",
          "warning",
          "Some theme CSS variables may not be loaded",
          startTime,
        );
      }

      const currentTheme = document.documentElement.getAttribute("data-theme");

      if (currentTheme) {
        this.addTestResult(
          "Theme System",
          "Theme detection",
          "passed",
          `Current theme: ${currentTheme}`,
          startTime,
        );
      } else {
        this.addTestResult(
          "Theme System",
          "Theme detection",
          "warning",
          "No theme attribute detected on document",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Theme System",
        "System test",
        "failed",
        `Theme system test failed: ${_error}`,
        startTime,
      );
    }
  }

  private async testGamificationSystem(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test user progress data
      const userProgressKey = "userProgress";
      const userProgress = await unifiedStorage.get(userProgressKey);

      if (userProgress && userProgress.level) {
        this.addTestResult(
          "Gamification",
          "User progress data",
          "passed",
          `User level ${userProgress.level} found`,
          startTime,
        );
      } else {
        this.addTestResult(
          "Gamification",
          "User progress data",
          "warning",
          "No user progress data found",
          startTime,
        );
      }

      // Test achievements data
      const achievementsKey = "userAchievements";
      const achievements = await unifiedStorage.get(achievementsKey);

      if (achievements && Array.isArray(achievements)) {
        this.addTestResult(
          "Gamification",
          "Achievements system",
          "passed",
          `${achievements.length} achievements found`,
          startTime,
        );
      } else {
        this.addTestResult(
          "Gamification",
          "Achievements system",
          "warning",
          "No achievements data found",
          startTime,
        );
      }
    } catch (_error) {
      this.addTestResult(
        "Gamification",
        "System test",
        "failed",
        `Gamification system test failed: ${_error}`,
        startTime,
      );
    }
  }

  private addTestResult(
    component: string,
    test: string,
    status: "passed" | "failed" | "warning",
    message: string,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;

    this.testResults.push({
      component,
      test,
      status,
      message,
      duration,
      timestamp: new Date(),
    });

    // Log the result
    const logLevel =
      status === "failed" ? "error" : status === "warning" ? "warn" : "info";
    logger[logLevel](
      `[System Test] ${component} - ${test}: ${message} (${duration}ms)`,
    );
  }

  private generateHealthReport(): SystemHealthReport {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (r) => r.status === "passed",
    ).length;
    const failedTests = this.testResults.filter(
      (r) => r.status === "failed",
    ).length;
    const warningTests = this.testResults.filter(
      (r) => r.status === "warning",
    ).length;

    let overallStatus: "healthy" | "degraded" | "critical";

      overallStatus = "healthy";
      overallStatus = "degraded";
    } else {
      overallStatus = "critical";
    }

    const report: SystemHealthReport = {
      overallStatus,
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      results: this.testResults,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date(),
        version: getAppVersion(),
      },
    };

    logger.info(
      `System Integration Test Complete: ${overallStatus.toUpperCase()} (${passedTests}/${totalTests} passed)`,
    );

    return report;
  }

  async runQuickHealthCheck(): Promise<{
    status: "healthy" | "degraded" | "critical";
    message: string;
  }> {
    const startTime = Date.now();

    try {
      // Quick tests for critical systems
      const aiStatus = ai.getStatus();
      const hasStorage = !!unifiedStorage;
      const hasTheme = !!getComputedStyle(
        document.documentElement,

      const criticalIssues: string[] = [];

      if (!aiStatus.initialized)
        criticalIssues.push("AI service not initialized");
      if (!hasStorage) criticalIssues.push("Storage system unavailable");
      if (!hasTheme) criticalIssues.push("Theme system not loaded");

      const duration = Date.now() - startTime;

        return {
          status: "healthy",
          message: `All critical systems operational (${duration}ms)`,
        };
        return {
          status: "degraded",
          message: `Minor issues detected: ${criticalIssues.join(", ")} (${duration}ms)`,
        };
      } else {
        return {
          status: "critical",
          message: `Critical issues detected: ${criticalIssues.join(", ")} (${duration}ms)`,
        };
      }
    } catch (_error) {
      return {
        status: "critical",
        message: `Health check failed: ${_error}`,
      };
    }
  }

  getPerformanceMetrics() {
    const performanceData = {
      memory: (performance as any).memory
        ? {
            used:
              Math.round(
            total:
              Math.round(
            limit:
              Math.round(
          }
        : null,
      timing: performance.timing
        ? {
            pageLoad:
              performance.timing.loadEventEnd -
              performance.timing.navigationStart,
            domReady:
              performance.timing.domContentLoadedEventEnd -
              performance.timing.navigationStart,
            firstPaint: (performance as any).getEntriesByType
              ? (performance as any)
                  .getEntriesByType("paint")
                  .find((entry: any) => entry.name === "first-contentful-paint")
                  ?.startTime
              : null,
          }
        : null,
      connection: (navigator as any).connection
        ? {
            type: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt,
          }
        : null,
    };

    return performanceData;
  }
}

// Export singleton instance
export const systemIntegrationTest = SystemIntegrationTest.getInstance();
