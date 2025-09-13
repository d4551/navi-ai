
export interface paths {
  "/ai/init": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["aiInit"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ai/generate": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["aiGenerateText"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/ai/models": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["aiListModels"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/jobs": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["jobsSearch"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/jobs/match": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["jobsMatch"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/jobs/recommend": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["jobsRecommend"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/export/resume": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["exportResume"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/export/portfolio": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["exportPortfolio"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/interview/start": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["interviewStart"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/interview/{sessionId}/next": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["interviewNext"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/interview/{sessionId}/submit": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations["interviewSubmit"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/settings": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations["settingsGet"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations["settingsPatch"];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AIInitResponse: {
      success?: boolean;
      model?: string;
      timestamp?: number;
      error?: string | null;
    };
    Model: {
      id?: string;
      description?: string;
    };
    AITextRequest: {
      prompt: string;
      systemInstructions?: string;
      options?: {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxTokens?: number;
        model?: string;
      };
    };
    AITextResponse: {
      text?: string;
      latencyMs?: number;
    };
    Job: {
      id?: string;
      title?: string;
      company?: string;
      location?: string;
      remote?: boolean;
      salary?: {
        min?: number;
        max?: number;
        currency?: string;
      };
      description?: string;
      postedDate?: string;
      source?: string;
    };
    JobAggregationResult: {
      jobs?: components["schemas"]["Job"][];
      sources?: string[];
      totalFound?: number;
      errors?: string[];
      processingTime?: number;
    };
    ResumeExportRequest: {
      data?: Record<string, never>;
      formats?: ("pdf" | "json" | "markdown" | "html" | "docx")[];
      options?: Record<string, never>;
    };
    PortfolioExportRequest: {
      items?: Record<string, never>[];
      format?: "pdf" | "image" | "zip";
      options?: Record<string, never>;
    };
    Settings: {
      [key: string]: unknown;
    };
    InterviewConfig: {
      role?: string;
      difficulty?: "easy" | "medium" | "hard";
      language?: string;
    };
    InterviewSession: {
      id?: string;
      startedAt?: string;
      stats?: Record<string, never>;
    };
    InterviewQuestion: {
      id?: string;
      text?: string;
      type?: string;
    };
    InterviewEvaluation: {
      score?: number;
      feedback?: string;
    };
    UserProfile: {
      id?: string;
      name?: string;
      email?: string;
      skills?: string[];
      experience?: number;
      interests?: string[];
      location?: string;
      salaryExpectation?: {
        min?: number;
        max?: number;
      };
      workStyle?: "remote" | "hybrid" | "onsite";
      rolePreferences?: string[];
      companySize?: string;
      technologies?: string[];
    };
    MatchResult: {
      jobId?: string;
      matchScore?: number;
      matchBreakdown?: {
        skillsMatch?: number;
        experienceMatch?: number;
        locationMatch?: number;
        salaryMatch?: number;
        cultureMatch?: number;
        technologyMatch?: number;
      };
      missingSkills?: string[];
      recommendedSkills?: string[];
      strengths?: string[];
      improvementAreas?: string[];
    };
  };
  responses: {
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": {
          error?: string;
        };
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  aiInit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          apiKey: string;
          model?: string;
        };
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AIInitResponse"];
        };
      };
    };
  };
  aiGenerateText: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["AITextRequest"];
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["AITextResponse"];
        };
      };
    };
  };
  aiListModels: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Model"][];
        };
      };
    };
  };
  jobsSearch: {
    parameters: {
      query?: {
        query?: string;
        location?: string;
        remoteOnly?: boolean;
        limit?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["JobAggregationResult"];
        };
      };
    };
  };
  jobsMatch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          profile?: components["schemas"]["UserProfile"];
          jobs?: components["schemas"]["Job"][];
        };
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            success?: boolean;
            data?: components["schemas"]["MatchResult"][];
          };
        };
      };
    };
  };
  jobsRecommend: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          profile?: components["schemas"]["UserProfile"];
          jobs?: components["schemas"]["Job"][];
          limit?: number;
        };
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            success?: boolean;
            data?: components["schemas"]["MatchResult"][];
          };
        };
      };
    };
  };
  exportResume: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ResumeExportRequest"];
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            format?: "pdf" | "json" | "markdown" | "html" | "docx";
            data?: string;
          };
        };
      };
    };
  };
  exportPortfolio: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["PortfolioExportRequest"];
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            format?: "pdf" | "image" | "zip";
            data?: string;
          };
        };
      };
    };
  };
  interviewStart: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["InterviewConfig"];
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InterviewSession"];
        };
      };
    };
  };
  interviewNext: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        sessionId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InterviewQuestion"];
        };
      };
    };
  };
  interviewSubmit: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        sessionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          response?: string;
        };
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["InterviewEvaluation"];
        };
      };
    };
  };
  settingsGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Settings"];
        };
      };
    };
  };
  settingsPatch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          [key: string]: unknown;
        };
      };
    };
    responses: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Settings"];
        };
      };
    };
  };
}
