import { z } from "zod";

// Get API key from environment as fallback
const getDefaultApiKey = () => {
  return (
    (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
    (typeof process !== "undefined" &&
      (process as any)?.env?.VITE_GEMINI_API_KEY) ||
    ""
  );
};

// Canonical Settings Schema (single source of truth)
// Keep this in sync with Settings UI and store wiring
export const SETTINGS_SCHEMA = z
  .object({
    // AI
    geminiApiKey: z.string().trim().optional().default(getDefaultApiKey()),
    selectedModel: z.string().min(1).default("gemini-2.5-flash"),
    suggestionsSyncMinutes: z.number().int().min(1).max(60).default(7),

    // Theme & UX
    theme: z.enum(["light", "dark", "auto"]).default("light"),
    autoSave: z.boolean().default(true),
    chatCuesMuted: z.boolean().default(false),
    fairyBubbleSize: z.enum(["hidden", "small", "full"]).default("full"),
    // Input UX
    pushToTalk: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
    language: z.string().min(2).default("en"),
    analytics: z.boolean().default(false),
    crashReports: z.boolean().default(false),
    dataEncryption: z.boolean().default(false),
    syncDisabled: z.boolean().default(false),
    anonymizeData: z.boolean().default(true),
    coverLetterAutoAdvance: z.boolean().default(false),
    notifications: z
      .object({
        updates: z.boolean().default(true),
        errors: z.boolean().default(true),
        success: z.boolean().default(true),
        chat: z.boolean().default(true),
      })
      .default({ updates: true, errors: true, success: true, chat: true }),

    // Voice / Audio
    voiceMode: z.boolean().default(false),
    voiceLang: z.string().min(2).default("en-US"),
    ttsVoice: z.string().optional().default(""),
    voiceHandsFree: z.boolean().default(false),
    ttsProvider: z.enum(["system", "gemini", "kokoro"]).default("system"),
    kokoroModel: z.string().optional().default("default"),
    sttProvider: z.enum(["system", "gemini"]).default("system"),
    geminiVoice: z.string().optional().default(""),
    selectedMicId: z.string().optional().default(""),
    selectedSpeakerId: z.string().optional().default(""),
    speechRate: z.number().min(0.5).max(2).default(0.85),
    speechPitch: z.number().min(0.5).max(2).default(1.0),
    speechVolume: z.number().min(0).max(1).default(0.9),

    // Portfolio preferences
    portfolioSort: z.enum(["recent", "title", "type"]).default("recent"),
    portfolioFilter: z
      .enum(["all", "project", "open-source", "writing", "other"])
      .default("all"),
    portfolioLayout: z.enum(["grid", "list", "timeline"]).default("grid"),
    portfolioShowAnalytics: z.boolean().default(true),

    // Developer settings (advanced/debug options)
    debugMode: z.boolean().default(false),
    verboseLogging: z.boolean().default(false),
    performanceMonitoring: z.boolean().default(false),
    showComponentOutlines: z.boolean().default(false),
    experimentalFeatures: z.boolean().default(false),
    betaUIComponents: z.boolean().default(false),
    apiTimeout: z.number().int().min(5).max(120).default(30),
    memoryLimit: z.number().int().min(256).max(2048).default(512),
    cacheDuration: z.number().int().min(1).max(1440).default(15),
    maxConcurrentRequests: z.number().int().min(1).max(10).default(3),

    // Streaming settings
    streaming: z
      .object({
        video: z
          .object({
            enabled: z.boolean().default(false),
            selectedCameraId: z.string().optional().default(""),
            resolution: z.enum(["720p", "1080p", "4k"]).default("720p"),
            frameRate: z.number().int().min(5).max(60).default(30),
            autoStart: z.boolean().default(false),
            showPreview: z.boolean().default(true),
          })
          .default({
            enabled: false,
            selectedCameraId: "",
            resolution: "720p",
            frameRate: 30,
            autoStart: false,
            showPreview: true,
          }),
        screen: z
          .object({
            enabled: z.boolean().default(false),
            shareAudio: z.boolean().default(false),
            resolution: z.enum(["720p", "1080p", "4k"]).default("1080p"),
            frameRate: z.number().int().min(5).max(30).default(10),
            cursor: z.enum(["show", "hide", "motion"]).default("show"),
            autoStart: z.boolean().default(false),
          })
          .default({
            enabled: false,
            shareAudio: false,
            resolution: "1080p",
            frameRate: 10,
            cursor: "show",
            autoStart: false,
          }),
        aiStreaming: z
          .object({
            enabled: z.boolean().default(false),
            model: z.string().default("gemini-2.5-flash"),
            fps: z.number().int().min(1).max(30).default(5),
            maxTokens: z.number().int().min(100).max(4000).default(1000),
            temperature: z.number().min(0).max(2).default(0.7),
            systemPrompt: z
              .string()
              .default(
                "You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.",
              ),
            analysisType: z
              .enum(["continuous", "on-demand", "interval"])
              .default("continuous"),
            analysisInterval: z.number().int().min(5).max(300).default(10),
            saveResponses: z.boolean().default(true),
            startRealtimeOnRecord: z.boolean().default(false),
            startRealtimeOnScreenStart: z.boolean().default(false),
          })
          .default({
            enabled: false,
            model: "gemini-2.5-flash",
            fps: 5,
            maxTokens: 1000,
            temperature: 0.7,
            systemPrompt:
              "You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.",
            analysisType: "continuous",
            analysisInterval: 10,
            saveResponses: true,
            startRealtimeOnRecord: false,
            startRealtimeOnScreenStart: false,
          }),
      })
      .default({
        video: {
          enabled: false,
          selectedCameraId: "",
          resolution: "720p",
          frameRate: 30,
          autoStart: false,
          showPreview: true,
        },
        screen: {
          enabled: false,
          shareAudio: false,
          resolution: "1080p",
          frameRate: 10,
          cursor: "show",
        },
        aiStreaming: {
          enabled: false,
          model: "gemini-2.5-flash",
          fps: 5,
          maxTokens: 1000,
          temperature: 0.7,
          systemPrompt:
            "You are a helpful AI assistant analyzing live video feed. Describe what you see and provide relevant insights.",
          analysisType: "continuous",
          analysisInterval: 10,
          saveResponses: true,
        },
      }),

    // Job Board APIs Configuration
    jobBoardApis: z
      .object({
        // Job Board Sources
        enabledSources: z
          .array(z.string())
          .default(["indeed", "linkedin", "glassdoor"]),

        // API Keys for premium sources
        indeedPublisher: z.string().optional().default(""),
        remoteOkApiKey: z.string().optional().default(""),
        jSearchApiKey: z.string().optional().default(""),

        // Search preferences
        defaultLocation: z.string().default(""),
        defaultKeywords: z
          .array(z.string())
          .default(["software engineer", "developer"]),
        maxResultsPerSource: z.number().int().min(10).max(100).default(25),
        searchRadius: z.number().int().min(0).max(100).default(25), // miles

        // Gaming-specific settings
        gamingJobsOnly: z.boolean().default(false),
        preferredGameEngines: z
          .array(z.string())
          .default(["Unity", "Unreal Engine"]),
        preferredStudioTypes: z.array(z.string()).default(["aaa", "indie"]),

        // Filters and preferences
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        jobTypes: z
          .array(z.enum(["full-time", "part-time", "contract", "internship"]))
          .default(["full-time"]),
        experienceLevels: z
          .array(z.enum(["entry", "mid", "senior", "lead"]))
          .default(["mid", "senior"]),
        remoteWorkPreference: z
          .enum(["any", "remote-only", "hybrid", "onsite"])
          .default("any"),

        // Alert settings
        jobAlertsEnabled: z.boolean().default(false),
        alertFrequency: z
          .enum(["daily", "weekly", "monthly"])
          .default("weekly"),
        alertKeywords: z.array(z.string()).default([]),

        // Data management
        cacheResults: z.boolean().default(true),
        cacheDuration: z.number().int().min(1).max(168).default(24), // hours
        autoRefresh: z.boolean().default(false),
        refreshInterval: z.number().int().min(1).max(24).default(6), // hours

        // Privacy settings
        anonymizeApplications: z.boolean().default(true),
        shareDataWithPartners: z.boolean().default(false),
      })
      .default({
        enabledSources: ["indeed", "linkedin", "glassdoor"],
        indeedPublisher: "",
        remoteOkApiKey: "",
        jSearchApiKey: "",
        defaultLocation: "",
        defaultKeywords: ["software engineer", "developer"],
        maxResultsPerSource: 25,
        searchRadius: 25,
        gamingJobsOnly: false,
        preferredGameEngines: ["Unity", "Unreal Engine"],
        preferredStudioTypes: ["aaa", "indie"],
        jobTypes: ["full-time"],
        experienceLevels: ["mid", "senior"],
        remoteWorkPreference: "any",
        jobAlertsEnabled: false,
        alertFrequency: "weekly",
        alertKeywords: [],
        cacheResults: true,
        cacheDuration: 24,
        autoRefresh: false,
        refreshInterval: 6,
        anonymizeApplications: true,
        shareDataWithPartners: false,
      }),
  })
  .strict();

export type Settings = z.infer<typeof SETTINGS_SCHEMA>;

// Defaults (derived from schema)
export const DEFAULT_SETTINGS: Settings = SETTINGS_SCHEMA.parse({});

// Merge + sanitize a partial patch into current settings
export function mergeSettings(
  current: Settings,
  patch: Partial<Settings>,
): Settings {
  // Filter unknown keys first to avoid failing strict schema
  const allowedKeys = Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>;
  const filtered: Partial<Settings> = {};
  for (const key of allowedKeys) {
    if (key in patch) {
      // Shallow assign primitive keys
      // Handle nested object merges
      if (key === "notifications" && patch.notifications) {
        filtered.notifications = {
          ...current.notifications,
          ...patch.notifications,
        };
      } else if (key === "streaming" && patch.streaming) {
        filtered.streaming = {
          ...current.streaming,
          video: {
            ...current.streaming.video,
            ...patch.streaming.video,
          },
          screen: {
            ...current.streaming.screen,
            ...patch.streaming.screen,
          },
          aiStreaming: {
            ...current.streaming.aiStreaming,
            ...patch.streaming.aiStreaming,
          },
        };
      } else {
        filtered[key] = (patch as any)[key];
      }
    }
  }

  // Candidate with filtered patch
  const candidate: Settings = { ...current, ...filtered } as Settings;

  // Clamp known numeric ranges before validation
  if (typeof candidate.speechRate === "number") {
    candidate.speechRate = Math.min(2, Math.max(0.5, candidate.speechRate));
  }
  if (typeof candidate.speechPitch === "number") {
    candidate.speechPitch = Math.min(2, Math.max(0.5, candidate.speechPitch));
  }
  if (typeof candidate.speechVolume === "number") {
    candidate.speechVolume = Math.min(1, Math.max(0, candidate.speechVolume));
  }
  if (typeof candidate.suggestionsSyncMinutes === "number") {
    candidate.suggestionsSyncMinutes = Math.min(
      60,
      Math.max(1, Math.round(candidate.suggestionsSyncMinutes)),
    );
  }

  const result = SETTINGS_SCHEMA.safeParse(candidate);
  return result.success ? result.data : current;
}
