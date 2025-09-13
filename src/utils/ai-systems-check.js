
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppStore } from "@/stores/app";
import { logger } from "@/shared/utils/logger";

// Test configuration
const TEST_CONFIG = {
  testPrompt: 'Say "Hello, AI systems check successful!" - keep it brief.',
};

// Systems check results
let checkResults = {
  timestamp: new Date().toISOString(),
  environment: {},
  apiKey: {},
  connectivity: {},
  models: {},
  services: {},
  performance: {},
};

  logger.info(
  );

  try {
    // Reset results
    checkResults = {
      timestamp: new Date().toISOString(),
      environment: {},
      apiKey: {},
      connectivity: {},
      models: {},
      services: {},
      performance: {},
    };

    // Get API key from parameter or store
    const store = useAppStore();
    const testApiKey = apiKey || store.settings?.geminiApiKey;

    if (!testApiKey) {
      throw new Error(
        "No API key provided. Set one in Settings or pass as parameter.",
      );
    }

    // Run all checks
    await checkEnvironment();
    await checkApiKey(testApiKey);
    await checkConnectivity(testApiKey);
    await checkModelAvailability(testApiKey);
    await checkServiceIntegration();
    await checkPerformance(testApiKey);

    // Calculate overall score
    calculateOverallScore();

    // Display results
    displayResults();

    return checkResults;
  } catch (_error) {
    checkResults.overall = {
      status: "failed",
      error: error.message,
      issues: [error.message],
    };
    return checkResults;
  } finally {
    // end diagnostic
  }
}

  logger.debug("[SEARCH] Checking environment...");
  const start = performance.now();

  try {
    const env = {
      userAgent: navigator.userAgent,
      isElectron: !!(window.api || window.electronAPI),
      hasGoogleAI: typeof GoogleGenerativeAI !== "undefined",
      nodeEnv: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    };

    // Test Google AI SDK import
    try {
      const testInstance = new GoogleGenerativeAI("test");
      env.googleAIVersion = testInstance.constructor.name;
      env.sdkStatus = "loaded";
    } catch (_error) {
      env.sdkStatus = "error";
      env.sdkError = error.message;
    }

    // Check for required globals
    env.globals = {
      fetch: typeof fetch !== "undefined",
      console: typeof console !== "undefined",
      performance: typeof performance !== "undefined",
    };

    checkResults.environment = {
      ...env,
      duration: performance.now() - start,
      status: env.hasGoogleAI && env.sdkStatus === "loaded" ? "pass" : "fail",
    };

    logger.info(
    );
  } catch (_error) {
    checkResults.environment = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  const start = performance.now();

  try {
    const validation = {
      provided: !!apiKey,
      format: "invalid",
      prefix: "",
      structure: "invalid",
    };

    if (apiKey) {

      // Basic format validation
        validation.format = "valid";
        validation.structure = "google-ai-studio";
        validation.format = "possible";
        validation.structure = "unknown";
      }
    }

    checkResults.apiKey = {
      ...validation,
      duration: performance.now() - start,
      status: validation.format === "valid" ? "pass" : "fail",
    };

    logger.info(
    );
  } catch (_error) {
    checkResults.apiKey = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  const start = performance.now();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsResponse = await fetch(
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    const connectivity = {
      modelsEndpoint: {
        status: modelsResponse.ok ? "pass" : "fail",
        statusCode: modelsResponse.status,
        statusText: modelsResponse.statusText,
      },
    };

    if (modelsResponse.ok) {
      const data = await modelsResponse.json();
      connectivity.modelsEndpoint.hasGemini =
        data.models?.some((m) => m.name?.includes("gemini")) || false;
    }

    try {
      const result = await Promise.race([
        model.generateContent("Hello"),
        new Promise((_, reject) =>
        ),
      ]);

      const response = await result.response;
      connectivity.generation = {
        status: "pass",
        hasResponse: !!response,
        hasText: !!response.text(),
      };
    } catch (genError) {
      connectivity.generation = {
        status: "fail",
        error: genError.message,
      };
    }

    checkResults.connectivity = {
      ...connectivity,
      duration: performance.now() - start,
      status:
        connectivity.modelsEndpoint.status === "pass" &&
        connectivity.generation?.status === "pass"
          ? "pass"
          : "partial",
    };

    console.log(
      checkResults.connectivity.status,
    );
  } catch (_error) {
    checkResults.connectivity = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  console.log("[TARGET] Testing model availability...");
  const start = performance.now();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = {};

    // Test each model in TEST_CONFIG.testModels
    for (const modelName of TEST_CONFIG.testModels) {
      console.log(`  [FIX] Testing ${modelName}...`);

      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent(TEST_CONFIG.testPrompt),
          new Promise((_, reject) =>
          ),
        ]);

        const response = await result.response;
        const text = response.text();

        models[modelName] = {
          status: "available",
          responseLength: text.length,
          responsePreview:
        };
      } catch (modelError) {
        models[modelName] = {
          status: "unavailable",
          error: modelError.message,
        };
      }
    }

    const availableCount = Object.values(models).filter(
      (m) => m.status === "available",
    ).length;

    checkResults.models = {
      tested: models,
      availableCount,
      totalTested: TEST_CONFIG.testModels.length,
      availability: `${availableCount}/${TEST_CONFIG.testModels.length}`,
      duration: performance.now() - start,
    };

    console.log(
      checkResults.models.status,
    );
  } catch (_error) {
    checkResults.models = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  const start = performance.now();

  try {
    const services = {};

    // Test GeminiModelService
    try {
      const { geminiModelService } = await import(
        "@/services/GeminiModelService"
      );
      services.geminiModelService = {
        status: "imported",
        hasInstance: !!geminiModelService,
        methods: Object.getOwnPropertyNames(
          Object.getPrototypeOf(geminiModelService),
        ),
      };
    } catch (_error) {
      services.geminiModelService = {
        status: "error",
        error: error.message,
      };
    }

    // Test AI Client
    try {
      const aiClient = await import("@/utils/aiClient");
      services.aiClient = {
        status: "imported",
        exports: Object.keys(aiClient),
      };
    } catch (_error) {
      services.aiClient = {
        status: "error",
        error: error.message,
      };
    }

    // Test Gemini Service
    try {
      const GeminiService = await import("@/utils/gemini");
      services.geminiService = {
        status: "imported",
        hasDefaultExport: !!GeminiService.default,
      };
    } catch (_error) {
      services.geminiService = {
        status: "error",
        error: error.message,
      };
    }

    // Test App Store AI Status
    try {
      const store = useAppStore();
      services.appStore = {
        status: "available",
        hasAiStatus: !!store.aiStatus,
        hasSettings: !!store.settings,
        hasGeminiKey: !!store.settings?.geminiApiKey,
      };
    } catch (_error) {
      services.appStore = {
        status: "error",
        error: error.message,
      };
    }

    const serviceCount = Object.values(services).filter(
      (s) => s.status !== "error",
    ).length;

    checkResults.services = {
      tested: services,
      availableCount: serviceCount,
      totalTested: Object.keys(services).length,
      duration: performance.now() - start,
    };

    console.log(
      checkResults.services.status,
    );
  } catch (_error) {
    checkResults.services = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  const start = performance.now();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const tests = [];

      const testStart = performance.now();
      try {
        const response = await result.response;
        const text = response.text();

        tests.push({
          duration: performance.now() - testStart,
          status: "success",
          responseLength: text.length,
        });
      } catch (_error) {
        tests.push({
          duration: performance.now() - testStart,
          status: "error",
          error: error.message,
        });
      }
    }

    const successfulTests = tests.filter((t) => t.status === "success");
    const averageTime =
          successfulTests.length

    checkResults.performance = {
      tests,
      successfulTests: successfulTests.length,
      averageResponseTime: Math.round(averageTime),
      maxResponseTime: Math.max(...tests.map((t) => t.duration)),
      minResponseTime: Math.min(
        ...tests.filter((t) => t.status === "success").map((t) => t.duration),
      ),
      duration: performance.now() - start,
    };

    console.log(
      checkResults.performance.status,
    );
  } catch (_error) {
    checkResults.performance = {
      status: "error",
      error: error.message,
      duration: performance.now() - start,
    };
  }
}

  const checks = [
    checkResults.environment,
    checkResults.apiKey,
    checkResults.connectivity,
    checkResults.models,
    checkResults.services,
    checkResults.performance,
  ];

  const issues = [];

  checks.forEach((check, index) => {
    const checkName = Object.keys(checkResults)[index];

    if (check.status === "pass") {
    } else if (check.status === "partial") {
    } else if (check.status === "fail") {
      issues.push(`${checkName}: failed`);
    } else if (check.status === "error") {
      issues.push(`${checkName}: error - ${check.error}`);
    }
  });

  // Determine overall status
  let status = "fail";

  checkResults.overall = {
    status,
    score,
    issues,
  };
}

  console.log("\n[STATS] SYSTEMS CHECK RESULTS");

  // Overall status
  const statusEmoji = {
  };

  console.log(
    `${statusEmoji[checkResults.overall.status]} Overall Status: ${checkResults.overall.summary}`,
  );

    console.log("\n[WARNING]  Issues found:");
    checkResults.overall.issues.forEach((issue) =>
      console.log(`   • ${issue}`),
    );
  }

  // Detailed results

  Object.entries(checkResults).forEach(([section, results]) => {
    if (section === "overall" || section === "timestamp") return;

    const emoji =
      results.status === "pass"
        : results.status === "partial"
          : results.status === "error"

    console.log(
      `${emoji} ${section}: ${results.status} (${Math.round(results.duration)}ms)`,
    );

    if (results.error) {
      console.log(`     Error: ${results.error}`);
    }
  });

  // Performance summary
  if (checkResults.performance?.averageResponseTime) {
    console.log(
    );
  }

  // Model availability
  if (checkResults.models?.availability) {
    console.log(
      `[TARGET] Models: ${checkResults.models.availability} available`,
    );
  }

  console.log("\n[TARGET] Recommendations:");

    console.log("   • Check your API key and internet connection");
    console.log("   • Verify API key permissions in Google AI Studio");
  }

  if (checkResults.connectivity?.status !== "pass") {
    console.log("   • Test API connectivity from Google AI Studio");
  }

    console.log("   • Check model permissions and quotas");
  }

  console.log("\n[MAGIC] Systems check completed!");
}

  const store = useAppStore();
  const apiKey = store.settings?.geminiApiKey;

  if (!apiKey) {
    return { status: "no-api-key" };
  }

  console.log("[LAUNCH] Running quick AI check...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const start = performance.now();
    const result = await model.generateContent('Say "Quick check successful!"');
    const response = await result.response;
    const text = response.text();
    const duration = performance.now() - start;

    console.log(
    );
    return {
      status: "success",
      response: text,
      duration: Math.round(duration),
    };
  } catch (_error) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

// Export for global access
if (typeof window !== "undefined") {
  window.runAISystemsCheck = runAISystemsCheck;
  window.quickAICheck = quickAICheck;

  window.testGoogleAI = async (apiKey) => {
    if (!apiKey) {
      return { error: "No API key provided" };
    }

    console.log("[LAUNCH] Quick Google AI test...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      const start = performance.now();
      const result = await model.generateContent(
        'Say "Test successful!" and nothing else.',
      );
      const response = await result.response;
      const text = response.text();
      const duration = performance.now() - start;

      const result_obj = {
        success: true,
        response: text,
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
      };

      return result_obj;
    } catch (_error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  };

  // Simple connection test without API key
  window.testGoogleAIConnection = async () => {

    try {
      const response = await fetch(
      );

        return { reachable: true, status: response.status };
      } else {
        console.log(
        );
        return { reachable: true, status: response.status };
      }
    } catch (_error) {
      return { reachable: false, error: error.message };
    }
  };

  console.log("  • runAISystemsCheck() - Full systems diagnostic");
  console.log("  • quickAICheck() - Quick API test using stored key");
  console.log('  • testGoogleAI("your-api-key") - Test with your API key');
  console.log("  • testGoogleAIConnection() - Test basic connectivity");
}

export default { runAISystemsCheck, quickAICheck };
