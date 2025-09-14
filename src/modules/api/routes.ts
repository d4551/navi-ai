// API Routes Module
// Centralized route definitions and endpoint mapping

export const API_ROUTES = {
  // Job Search Routes
  JOBS: {
    SEARCH: '/jobs/search',
    RECOMMEND: '/jobs/recommend',
    SAVE: '/jobs/save',
    UNSAVE: '/jobs/unsave', 
    SAVED: '/jobs/saved',
    APPLY: '/jobs/apply',
    APPLICATIONS: '/jobs/applications'
  },

  // Resume Routes
  RESUME: {
    GET: '/resume',
    UPDATE: '/resume',
    EXPORT: '/resume/export',
    TEMPLATES: '/resume/templates',
    PREVIEW: '/resume/preview'
  },

  // Portfolio Routes
  PORTFOLIO: {
    GET: '/portfolio',
    UPDATE: '/portfolio',
    EXPORT: '/portfolio/export',
    PROJECTS: '/portfolio/projects',
    PREVIEW: '/portfolio/preview'
  },

  // AI Routes
  AI: {
    QUERY: '/ai/query',
    MODELS: '/ai/models',
    USAGE: '/ai/usage',
    MATCH_JOBS: '/ai/match-jobs',
    SCORE_RESUME: '/ai/score-resume',
    GENERATE_COVER_LETTER: '/ai/generate-cover-letter',
    INTERVIEW_PREP: '/ai/interview-prep'
  },

  // Provider Routes
  PROVIDERS: {
    HEALTH: '/providers/health',
    CONFIG: '/providers/config',
    STATUS: '/providers/status'
  },

  // User Routes
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    SETTINGS: '/user/settings'
  },

  // Company/Studio Routes
  STUDIOS: {
    SEARCH: '/studios/search',
    GET: '/studios/:id',
    NORMALIZE: '/studios/normalize'
  }
} as const;

// Route parameter types
export type RouteParams = {
  id?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
};

// Helper function to build URLs with parameters
export function buildURL(route: string, params?: RouteParams): string {
  let url = route;
  
  if (params) {
    // Replace path parameters (like :id)
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    
    // Add query parameters for remaining params
    const pathParamKeys = (route.match(/:(\w+)/g) || []).map(p => p.substring(1));
    const queryParams = Object.entries(params)
      .filter(([key]) => !pathParamKeys.includes(key))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    if (queryParams) {
      url += `?${queryParams}`;
    }
  }
  
  return url;
}

// OpenAPI route documentation structure
export const OPENAPI_ROUTES = {
  '/jobs/search': {
    post: {
      summary: 'Search for jobs',
      tags: ['Jobs'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobSearchRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Successful job search',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobSearchResponse' }
            }
          }
        }
      }
    }
  },
  
  '/resume/export': {
    post: {
      summary: 'Export resume in specified format',
      tags: ['Resume'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResumeExportRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Resume exported successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResumeExportResponse' }
            }
          }
        }
      }
    }
  },

  '/portfolio/export': {
    post: {
      summary: 'Export portfolio in specified format',
      tags: ['Portfolio'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PortfolioExportRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Portfolio exported successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PortfolioExportResponse' }
            }
          }
        }
      }
    }
  },

  '/ai/query': {
    post: {
      summary: 'Query AI model',
      tags: ['AI'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AIModelRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'AI query completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AIModelResponse' }
            }
          }
        }
      }
    }
  },

  '/ai/match-jobs': {
    post: {
      summary: 'Match jobs using AI',
      tags: ['AI'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/JobMatchRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Job matching completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobMatchResponse' }
            }
          }
        }
      }
    }
  },

  '/ai/score-resume': {
    post: {
      summary: 'Score resume against job requirements',
      tags: ['AI'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResumeScoreRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Resume scoring completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResumeScoreResponse' }
            }
          }
        }
      }
    }
  },

  '/ai/generate-cover-letter': {
    post: {
      summary: 'Generate cover letter for job application',
      tags: ['AI'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CoverLetterRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Cover letter generated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CoverLetterResponse' }
            }
          }
        }
      }
    }
  },

  '/ai/interview-prep': {
    post: {
      summary: 'Generate interview preparation materials',
      tags: ['AI'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InterviewPrepRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Interview preparation materials generated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InterviewPrepResponse' }
            }
          }
        }
      }
    }
  },

  '/providers/health': {
    get: {
      summary: 'Check provider health status',
      tags: ['Providers'],
      parameters: [
        {
          name: 'providers',
          in: 'query',
          schema: { type: 'array', items: { type: 'string' } },
          description: 'Specific providers to check'
        },
        {
          name: 'timeout',
          in: 'query',
          schema: { type: 'number' },
          description: 'Request timeout in milliseconds'
        }
      ],
      responses: {
        200: {
          description: 'Provider health check completed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProviderHealthResponse' }
            }
          }
        }
      }
    }
  }
};