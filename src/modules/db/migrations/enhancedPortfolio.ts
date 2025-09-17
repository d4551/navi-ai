/**
 * Enhanced Portfolio Database Migration
 * Sets up advanced portfolio system with templates, sharing, and analytics
 */

import { unifiedStorage } from '@/utils/storage'
import { logger } from '@/shared/utils/logger'

export interface PortfolioMigrationState {
  version: number
  migratedAt: Date
  features: {
    enhancedPortfolio: boolean
    templates: boolean
    sharing: boolean
    analytics: boolean
    aiIntegration: boolean
  }
}

export async function runEnhancedPortfolioMigration(): Promise<void> {
  try {
    logger.info('Starting enhanced portfolio system migration...')

    // Check if migration already completed
    const migrationState = await unifiedStorage.get('portfolio-migration-state')
    if (migrationState?.version >= 2) {
      logger.info('Enhanced portfolio migration already completed')
      return
    }

    // Step 1: Initialize enhanced portfolio tables
    await initializePortfolioTables()

    // Step 2: Migrate existing portfolio data
    await migrateExistingPortfolioData()

    // Step 3: Initialize template system
    await initializeTemplateSystem()

    // Step 4: Set up sharing infrastructure
    await initializeSharingSystem()

    // Step 5: Initialize analytics tables
    await initializeAnalyticsSystem()

    // Step 6: Set up AI integration
    await initializeAIIntegration()

    // Mark migration as complete
    const newMigrationState: PortfolioMigrationState = {
      version: 2,
      migratedAt: new Date(),
      features: {
        enhancedPortfolio: true,
        templates: true,
        sharing: true,
        analytics: true,
        aiIntegration: true,
      },
    }

    await unifiedStorage.set('portfolio-migration-state', newMigrationState)
    logger.info('Enhanced portfolio system migration completed successfully')
  } catch (error) {
    logger.error('Enhanced portfolio migration failed:', error)
    throw error
  }
}

async function initializePortfolioTables(): Promise<void> {
  logger.info('Initializing enhanced portfolio database tables...')

  // Enhanced portfolio structure
  const portfolioSchema = {
    version: 2,
    tables: {
      portfolios: {
        id: 'string',
        personalInfo: 'object',
        projects: 'array',
        skills: 'object',
        theme: 'object',
        seo: 'object',
        settings: 'object',
        version: 'number',
        createdAt: 'date',
        updatedAt: 'date',
      },
      portfolioProjects: {
        id: 'string',
        portfolioId: 'string',
        title: 'string',
        description: 'string',
        longDescription: 'string',
        category: 'string',
        status: 'string',
        technologies: 'array',
        role: 'string',
        teamSize: 'number',
        duration: 'object',
        media: 'object',
        links: 'object',
        achievements: 'array',
        challenges: 'array',
        featured: 'boolean',
        order: 'number',
        metadata: 'object',
        createdAt: 'date',
        updatedAt: 'date',
      },
      portfolioTemplates: {
        id: 'string',
        name: 'string',
        description: 'string',
        category: 'string',
        type: 'string',
        structure: 'object',
        aiPrompts: 'object',
        preview: 'object',
        tags: 'array',
        difficulty: 'string',
        estimatedTime: 'number',
        isBuiltIn: 'boolean',
        usageCount: 'number',
        createdAt: 'date',
        updatedAt: 'date',
      },
      sharedPortfolios: {
        id: 'string',
        portfolioId: 'string',
        url: 'string',
        title: 'string',
        description: 'string',
        settings: 'object',
        analytics: 'object',
        isActive: 'boolean',
        createdAt: 'date',
        lastViewed: 'date',
      },
      portfolioAnalytics: {
        id: 'string',
        shareId: 'string',
        event: 'string',
        data: 'object',
        timestamp: 'date',
        sessionId: 'string',
        userAgent: 'string',
        referrer: 'string',
      },
    },
  }

  await unifiedStorage.set('portfolio-schema', portfolioSchema)
  logger.info('Portfolio database schema initialized')
}

async function migrateExistingPortfolioData(): Promise<void> {
  logger.info('Migrating existing portfolio data...')

  try {
    // Get existing portfolio data from app store
    const existingPortfolio = await unifiedStorage.get('user')?.portfolio

    if (
      existingPortfolio &&
      Array.isArray(existingPortfolio) &&
      existingPortfolio.length > 0
    ) {
      logger.info(
        `Found ${existingPortfolio.length} existing portfolio items to migrate`
      )

      // Convert legacy portfolio items to new format
      const migratedProjects = existingPortfolio.map(
        (item: any, index: number) => ({
          id: item.id || crypto.randomUUID(),
          title: item.title || 'Untitled Project',
          description: item.description || '',
          longDescription: item.longDescription || item.description || '',
          category: mapLegacyType(item.type),
          status: item.status || 'completed',
          technologies: item.skills || item.technologies || [],
          role: item.role || 'Developer',
          teamSize: item.teamSize || 1,
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
        })
      )

      // Create new portfolio structure
      const newPortfolio = {
        id: crypto.randomUUID(),
        personalInfo: {
          name: '',
          title: 'Gaming Professional',
          bio: '',
          location: '',
          email: '',
          website: '',
          social: {},
        },
        projects: migratedProjects,
        skills: {
          primary: extractSkillsFromProjects(migratedProjects, 'primary'),
          secondary: extractSkillsFromProjects(migratedProjects, 'secondary'),
          tools: extractSkillsFromProjects(migratedProjects, 'tools'),
        },
        theme: {
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          layout: 'grid',
          showContact: true,
          showSkills: true,
        },
        seo: {
          title: 'Gaming Portfolio',
          description: 'Professional gaming industry portfolio',
          keywords: ['gaming', 'portfolio', 'developer'],
        },
        settings: {
          autoSave: true,
          analytics: true,
          sharing: true,
        },
        version: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Save migrated portfolio
      await unifiedStorage.set('portfolio', newPortfolio)

      // Backup original data
      await unifiedStorage.set('portfolio-legacy-backup', existingPortfolio)

      logger.info('Portfolio data migration completed successfully')
    } else {
      logger.info('No existing portfolio data found to migrate')
    }
  } catch (error) {
    logger.error('Portfolio data migration failed:', error)
    throw error
  }
}

async function initializeTemplateSystem(): Promise<void> {
  logger.info('Initializing portfolio template system...')

  const builtInTemplates = [
    {
      id: 'game-dev-basic',
      name: 'Basic Game Development',
      description: 'Simple game project showcase template',
      category: 'gaming',
      type: 'project',
      structure: {
        title: 'Game Project',
        sections: [
          {
            id: 'overview',
            title: 'Project Overview',
            type: 'text',
            content: '',
            order: 1,
            required: true,
          },
          {
            id: 'features',
            title: 'Game Features',
            type: 'list',
            content: [],
            order: 2,
            required: true,
          },
          {
            id: 'technical',
            title: 'Technical Details',
            type: 'list',
            content: [],
            order: 3,
            required: false,
          },
        ],
        suggestedMedia: ['gameplay-video', 'screenshots'],
        requiredFields: ['title', 'description', 'technologies'],
      },
      aiPrompts: {
        description:
          'Create a description for a {genre} game project built with {engine}',
        achievements: 'List achievements for this game development project',
        technologies: 'Describe the technical implementation of this game',
      },
      preview: {
        thumbnail: '/templates/game-dev-basic.jpg',
      },
      tags: ['game', 'development', 'basic'],
      difficulty: 'beginner',
      estimatedTime: 30,
      isBuiltIn: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'web-app-basic',
      name: 'Basic Web Application',
      description: 'Simple web application showcase template',
      category: 'web',
      type: 'project',
      structure: {
        title: 'Web Application',
        sections: [
          {
            id: 'overview',
            title: 'Application Overview',
            type: 'text',
            content: '',
            order: 1,
            required: true,
          },
          {
            id: 'features',
            title: 'Key Features',
            type: 'list',
            content: [],
            order: 2,
            required: true,
          },
          {
            id: 'stack',
            title: 'Technology Stack',
            type: 'list',
            content: [],
            order: 3,
            required: true,
          },
        ],
        suggestedMedia: ['screenshots', 'demo-video'],
        requiredFields: ['title', 'description', 'technologies', 'liveUrl'],
      },
      aiPrompts: {
        description:
          'Create a description for a {type} web application using {technologies}',
        achievements: 'List technical achievements for this web project',
        technologies: 'Explain the technology choices for this web application',
      },
      preview: {
        thumbnail: '/templates/web-app-basic.jpg',
      },
      tags: ['web', 'application', 'basic'],
      difficulty: 'beginner',
      estimatedTime: 25,
      isBuiltIn: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Save built-in templates
  for (const template of builtInTemplates) {
    await unifiedStorage.set(`template-${template.id}`, template)
  }

  // Initialize template index
  await unifiedStorage.set(
    'portfolio-templates-index',
    builtInTemplates.map(t => t.id)
  )

  logger.info('Portfolio template system initialized')
}

async function initializeSharingSystem(): Promise<void> {
  logger.info('Initializing portfolio sharing system...')

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
      maxActiveShares: 5,
      maxViewsPerMonth: 10000,
      maxCustomTemplates: 10,
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
  }

  await unifiedStorage.set('portfolio-sharing-config', sharingConfig)
  await unifiedStorage.set('shared-portfolios-index', [])

  logger.info('Portfolio sharing system initialized')
}

async function initializeAnalyticsSystem(): Promise<void> {
  logger.info('Initializing portfolio analytics system...')

  const analyticsConfig = {
    enabled: true,
    retentionDays: 90,
    aggregationIntervals: ['daily', 'weekly', 'monthly'],
    events: [
      'page_view',
      'project_view',
      'download',
      'contact_click',
      'share_created',
      'template_used',
    ],
    privacy: {
      anonymizeIPs: true,
      respectDNT: true,
      cookieConsent: true,
    },
  }

  await unifiedStorage.set('portfolio-analytics-config', analyticsConfig)
  await unifiedStorage.set('portfolio-analytics-summary', {
    totalViews: 0,
    totalShares: 0,
    totalDownloads: 0,
    popularProjects: [],
    topReferrers: {},
    lastUpdated: new Date(),
  })

  logger.info('Portfolio analytics system initialized')
}

async function initializeAIIntegration(): Promise<void> {
  logger.info('Initializing AI integration for portfolios...')

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
      requestsPerDay: 50,
      tokensPerRequest: 1000,
    },
    templates: {
      projectDescription:
        'Create a professional portfolio description for a {type} project called {title} using {technologies}. Highlight key features and technical achievements.',
      achievementSummary:
        'Summarize the key achievements and impacts of this {type} project: {description}',
      skillExtraction:
        'Extract relevant skills and technologies from this project description: {description}',
      seoOptimization:
        'Generate SEO-optimized title, description, and keywords for this portfolio project: {title} - {description}',
    },
  }

  await unifiedStorage.set('portfolio-ai-config', aiConfig)

  logger.info('AI integration for portfolios initialized')
}

// Helper functions
function mapLegacyType(legacyType: string): string {
  const typeMap: Record<string, string> = {
    achievement: 'game',
    project: 'game',
    tournament: 'game',
    leadership: 'other',
    content: 'other',
    clip: 'other',
    competition: 'game',
  }

  return typeMap[legacyType] || 'other'
}

function extractSkillsFromProjects(
  projects: any[],
  category: 'primary' | 'secondary' | 'tools'
): string[] {
  const allSkills = projects.flatMap(p => p.technologies || [])
  const skillCounts = allSkills.reduce(
    (counts: Record<string, number>, skill: string) => {
      counts[skill] = (counts[skill] || 0) + 1
      return counts
    },
    {}
  )

  const sortedSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([skill]) => skill)

  switch (category) {
    case 'primary':
      return sortedSkills.slice(0, 8) // Top 8 most used skills
    case 'secondary':
      return sortedSkills.slice(8, 16) // Next 8 skills
    case 'tools':
      return sortedSkills.slice(16, 24) // Additional tools/technologies
    default:
      return []
  }
}

export default {
  runEnhancedPortfolioMigration,
}
