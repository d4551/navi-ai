/**
 * Portfolio Template System
 * Advanced template management with AI generation and customization
 */

import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { PortfolioTemplate } from '@/composables/useEnhancedPortfolio'

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templates: PortfolioTemplate[]
}

export interface TemplateValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export function usePortfolioTemplates() {
  // State
  const templates = ref<PortfolioTemplate[]>([])
  const categories = ref<TemplateCategory[]>([])
  const customTemplates = useStorage(
    'custom-portfolio-templates',
    [] as PortfolioTemplate[]
  )
  const templateUsage = useStorage(
    'template-usage-stats',
    {} as Record<string, number>
  )

  // Built-in Templates
  const builtInTemplates: PortfolioTemplate[] = [
    {
      id: 'game-dev-showcase',
      name: 'Game Development Showcase',
      description:
        'Complete game project presentation with technical details and gameplay features',
      category: 'gaming',
      type: 'project',
      structure: {
        title: 'Game Development Project',
        sections: [
          {
            id: 'hero',
            title: 'Project Hero',
            type: 'showcase',
            content: {
              title: '',
              subtitle: '',
              heroImage: '',
              callToAction: 'Play Game',
            },
            order: 1,
            required: true,
          },
          {
            id: 'overview',
            title: 'Game Overview',
            type: 'text',
            content: {
              description: '',
              genre: '',
              platform: '',
              playerCount: '',
              ageRating: '',
            },
            order: 2,
            required: true,
          },
          {
            id: 'gameplay',
            title: 'Gameplay Features',
            type: 'list',
            content: {
              features: [],
              mechanics: [],
              uniqueElements: [],
            },
            order: 3,
            required: true,
          },
          {
            id: 'technical',
            title: 'Technical Implementation',
            type: 'list',
            content: {
              engine: '',
              languages: [],
              frameworks: [],
              tools: [],
              challenges: [],
              solutions: [],
            },
            order: 4,
            required: false,
          },
          {
            id: 'media-gallery',
            title: 'Media Gallery',
            type: 'media',
            content: {
              screenshots: [],
              videos: [],
              gifs: [],
              conceptArt: [],
            },
            order: 5,
            required: false,
          },
          {
            id: 'development-timeline',
            title: 'Development Timeline',
            type: 'timeline',
            content: {
              milestones: [],
              duration: '',
              teamSize: '',
              role: '',
            },
            order: 6,
            required: false,
          },
          {
            id: 'achievements',
            title: 'Project Achievements',
            type: 'stats',
            content: {
              downloads: 0,
              ratings: 0,
              awards: [],
              recognition: [],
            },
            order: 7,
            required: false,
          },
        ],
        suggestedMedia: [
          'gameplay-trailer',
          'feature-screenshots',
          'behind-scenes-video',
          'concept-art-gallery',
          'technical-diagrams',
        ],
        requiredFields: [
          'title',
          'description',
          'genre',
          'platform',
          'technologies',
        ],
      },
      aiPrompts: {
        description:
          'Create an engaging description for a {genre} game called {title} built with {engine}. Highlight innovative gameplay mechanics and technical achievements.',
        achievements:
          'List impressive achievements and metrics for this game project including downloads, ratings, awards, and player feedback.',
        technologies:
          'Explain the technical implementation of {title}, including {engine} features used, programming challenges solved, and architecture decisions.',
      },
      preview: {
        thumbnail: '/templates/previews/game-dev-showcase.jpg',
        demoUrl: '/templates/demos/game-dev-showcase',
      },
      tags: ['game-development', 'technical', 'creative', 'showcase'],
      difficulty: 'intermediate',
      estimatedTime: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'esports-achievement',
      name: 'Esports Achievement',
      description:
        'Professional esports accomplishment with tournament results and statistics',
      category: 'gaming',
      type: 'achievement',
      structure: {
        title: 'Competitive Gaming Achievement',
        sections: [
          {
            id: 'achievement-header',
            title: 'Achievement Header',
            type: 'showcase',
            content: {
              title: '',
              game: '',
              achievement: '',
              date: '',
              placement: '',
              prize: '',
            },
            order: 1,
            required: true,
          },
          {
            id: 'tournament-details',
            title: 'Tournament Details',
            type: 'text',
            content: {
              tournamentName: '',
              organizer: '',
              participants: 0,
              format: '',
              duration: '',
            },
            order: 2,
            required: true,
          },
          {
            id: 'performance-stats',
            title: 'Performance Statistics',
            type: 'stats',
            content: {
              winRate: 0,
              kda: '',
              averageScore: 0,
              bestPerformance: '',
              consistency: '',
            },
            order: 3,
            required: false,
          },
          {
            id: 'tournament-journey',
            title: 'Tournament Journey',
            type: 'timeline',
            content: {
              matches: [],
              keyMoments: [],
              challenges: [],
              strategy: '',
            },
            order: 4,
            required: false,
          },
          {
            id: 'team-composition',
            title: 'Team & Strategy',
            type: 'list',
            content: {
              teammates: [],
              roles: [],
              strategy: [],
              preparation: [],
            },
            order: 5,
            required: false,
          },
        ],
        suggestedMedia: [
          'tournament-highlights',
          'victory-celebration',
          'team-photos',
          'match-screenshots',
          'statistics-graphs',
        ],
        requiredFields: [
          'game',
          'tournament',
          'achievement',
          'date',
          'placement',
        ],
      },
      aiPrompts: {
        description:
          'Write a compelling narrative about achieving {placement} place in {tournament} for {game}. Include the competitive journey and significance.',
        achievements:
          'Detail the statistical achievements and performance metrics that led to this competitive success in {game}.',
        technologies:
          'Describe the skills, strategies, and mental preparation techniques used to achieve this competitive result.',
      },
      preview: {
        thumbnail: '/templates/previews/esports-achievement.jpg',
      },
      tags: ['esports', 'competitive', 'achievement', 'gaming'],
      difficulty: 'beginner',
      estimatedTime: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'web-app-portfolio',
      name: 'Web Application Portfolio',
      description: 'Professional web application showcase with technical depth',
      category: 'web',
      type: 'project',
      structure: {
        title: 'Web Application Project',
        sections: [
          {
            id: 'app-overview',
            title: 'Application Overview',
            type: 'showcase',
            content: {
              title: '',
              tagline: '',
              liveUrl: '',
              githubUrl: '',
              description: '',
            },
            order: 1,
            required: true,
          },
          {
            id: 'problem-solution',
            title: 'Problem & Solution',
            type: 'text',
            content: {
              problemStatement: '',
              targetAudience: '',
              solution: '',
              impact: '',
            },
            order: 2,
            required: true,
          },
          {
            id: 'key-features',
            title: 'Key Features',
            type: 'list',
            content: {
              coreFeatures: [],
              userExperience: [],
              accessibility: [],
              performance: [],
            },
            order: 3,
            required: true,
          },
          {
            id: 'tech-stack',
            title: 'Technical Stack',
            type: 'list',
            content: {
              frontend: [],
              backend: [],
              database: [],
              deployment: [],
              testing: [],
              monitoring: [],
            },
            order: 4,
            required: true,
          },
          {
            id: 'architecture',
            title: 'System Architecture',
            type: 'text',
            content: {
              overview: '',
              patterns: [],
              scalability: '',
              security: '',
            },
            order: 5,
            required: false,
          },
          {
            id: 'responsive-demo',
            title: 'Responsive Design Demo',
            type: 'media',
            content: {
              desktopScreenshots: [],
              mobileScreenshots: [],
              tabletScreenshots: [],
              interactionVideos: [],
            },
            order: 6,
            required: false,
          },
          {
            id: 'performance-metrics',
            title: 'Performance Metrics',
            type: 'stats',
            content: {
              lighthouse: {},
              loadTime: '',
              userMetrics: {},
              businessMetrics: {},
            },
            order: 7,
            required: false,
          },
        ],
        suggestedMedia: [
          'application-screenshots',
          'user-flow-videos',
          'mobile-responsive-demo',
          'code-quality-reports',
          'performance-graphs',
        ],
        requiredFields: [
          'title',
          'description',
          'technologies',
          'liveUrl',
          'problemStatement',
        ],
      },
      aiPrompts: {
        description:
          'Create a professional description for a {appType} web application built with {technologies}. Emphasize user value and technical innovation.',
        achievements:
          'Highlight the technical achievements, performance optimizations, and user experience improvements in this web application.',
        technologies:
          'Explain the technology stack choices for {title}, including architecture decisions, scalability considerations, and development best practices.',
      },
      preview: {
        thumbnail: '/templates/previews/web-app-portfolio.jpg',
        demoUrl: '/templates/demos/web-app-portfolio',
      },
      tags: ['web-development', 'full-stack', 'technical', 'professional'],
      difficulty: 'advanced',
      estimatedTime: 90,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'creative-showcase',
      name: 'Creative Showcase',
      description: 'Artistic and creative work presentation for portfolios',
      category: 'creative',
      type: 'showcase',
      structure: {
        title: 'Creative Project Showcase',
        sections: [
          {
            id: 'creative-hero',
            title: 'Creative Hero',
            type: 'showcase',
            content: {
              title: '',
              artistStatement: '',
              featuredImage: '',
              medium: '',
              year: '',
            },
            order: 1,
            required: true,
          },
          {
            id: 'concept-inspiration',
            title: 'Concept & Inspiration',
            type: 'text',
            content: {
              concept: '',
              inspiration: '',
              research: '',
              references: [],
            },
            order: 2,
            required: true,
          },
          {
            id: 'creative-process',
            title: 'Creative Process',
            type: 'timeline',
            content: {
              stages: [],
              techniques: [],
              iterations: [],
              challenges: [],
            },
            order: 3,
            required: false,
          },
          {
            id: 'portfolio-gallery',
            title: 'Portfolio Gallery',
            type: 'media',
            content: {
              finalArtwork: [],
              processImages: [],
              detailShots: [],
              alternativeVersions: [],
            },
            order: 4,
            required: true,
          },
          {
            id: 'technical-details',
            title: 'Technical Details',
            type: 'list',
            content: {
              software: [],
              techniques: [],
              materials: [],
              dimensions: '',
              duration: '',
            },
            order: 5,
            required: false,
          },
        ],
        suggestedMedia: [
          'high-res-artwork',
          'process-videos',
          'detail-photographs',
          'concept-sketches',
          'technique-demonstrations',
        ],
        requiredFields: ['title', 'medium', 'concept', 'year'],
      },
      aiPrompts: {
        description:
          'Write an artistic description for a {medium} piece titled {title}. Include the creative vision and artistic significance.',
        achievements:
          'Describe the artistic achievements, techniques mastered, and creative innovations in this {medium} work.',
        technologies:
          'Detail the tools, software, and techniques used to create this {medium} artwork, including any innovative approaches.',
      },
      preview: {
        thumbnail: '/templates/previews/creative-showcase.jpg',
      },
      tags: ['creative', 'artistic', 'visual', 'portfolio'],
      difficulty: 'beginner',
      estimatedTime: 45,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Template Categories
  const templateCategories: TemplateCategory[] = [
    {
      id: 'gaming',
      name: 'Gaming & Esports',
      description:
        'Templates for game development projects and competitive gaming achievements',
      icon: 'mdi-gamepad-variant',
      templates: [],
    },
    {
      id: 'web',
      name: 'Web Development',
      description:
        'Professional web application and website portfolio templates',
      icon: 'mdi-web',
      templates: [],
    },
    {
      id: 'mobile',
      name: 'Mobile Development',
      description: 'Mobile app development showcase templates',
      icon: 'mdi-cellphone',
      templates: [],
    },
    {
      id: 'creative',
      name: 'Creative & Design',
      description: 'Artistic work and creative project presentation templates',
      icon: 'mdi-palette',
      templates: [],
    },
    {
      id: 'technical',
      name: 'Technical Projects',
      description: 'Technical implementation and engineering project templates',
      icon: 'mdi-cog',
      templates: [],
    },
  ]

  // Computed
  const allTemplates = computed(() => [
    ...builtInTemplates,
    ...customTemplates.value,
  ])

  const categorizedTemplates = computed(() => {
    const cats = [...templateCategories]

    cats.forEach(category => {
      category.templates = allTemplates.value.filter(
        t => t.category === category.id
      )
    })

    return cats
  })

  const popularTemplates = computed(() => {
    return allTemplates.value
      .sort(
        (a, b) =>
          (templateUsage.value[b.id] || 0) - (templateUsage.value[a.id] || 0)
      )
      .slice(0, 6)
  })

  const recentTemplates = computed(() => {
    return allTemplates.value
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 4)
  })

  // Functions
  function getTemplate(id: string): PortfolioTemplate | undefined {
    return allTemplates.value.find(t => t.id === id)
  }

  function getTemplatesByCategory(categoryId: string): PortfolioTemplate[] {
    return allTemplates.value.filter(t => t.category === categoryId)
  }

  function getTemplatesByType(type: string): PortfolioTemplate[] {
    return allTemplates.value.filter(t => t.type === type)
  }

  function getTemplatesByDifficulty(difficulty: string): PortfolioTemplate[] {
    return allTemplates.value.filter(t => t.difficulty === difficulty)
  }

  function searchTemplates(query: string): PortfolioTemplate[] {
    const lowercaseQuery = query.toLowerCase()
    return allTemplates.value.filter(
      template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  function trackTemplateUsage(templateId: string) {
    templateUsage.value[templateId] = (templateUsage.value[templateId] || 0) + 1
  }

  function validateTemplate(template: PortfolioTemplate): TemplateValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Required field validation
    if (!template.name) errors.push('Template name is required')
    if (!template.description) errors.push('Template description is required')
    if (!template.category) errors.push('Template category is required')
    if (!template.type) errors.push('Template type is required')

    // Structure validation
    if (!template.structure.sections.length) {
      errors.push('Template must have at least one section')
    }

    const requiredSections = template.structure.sections.filter(s => s.required)
    if (requiredSections.length === 0) {
      warnings.push('Consider marking at least one section as required')
    }

    // AI prompts validation
    if (!template.aiPrompts.description) {
      warnings.push(
        'Adding an AI description prompt will improve user experience'
      )
    }

    // Tags validation
    if (template.tags.length === 0) {
      warnings.push('Adding tags will improve template discoverability')
    }

    // Suggestions
    if (template.estimatedTime > 120) {
      suggestions.push('Consider breaking this into multiple smaller templates')
    }

    if (!template.preview.thumbnail) {
      suggestions.push(
        'Adding a preview thumbnail will improve template appeal'
      )
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    }
  }

  function createCustomTemplate(
    templateData: Omit<PortfolioTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): PortfolioTemplate {
    const template: PortfolioTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const validation = validateTemplate(template)
    if (!validation.isValid) {
      throw new Error(
        `Template validation failed: ${validation.errors.join(', ')}`
      )
    }

    customTemplates.value.push(template)
    return template
  }

  function updateCustomTemplate(
    id: string,
    updates: Partial<PortfolioTemplate>
  ): PortfolioTemplate | null {
    const index = customTemplates.value.findIndex(t => t.id === id)
    if (index === -1) return null

    const updatedTemplate = {
      ...customTemplates.value[index],
      ...updates,
      updatedAt: new Date(),
    }

    const validation = validateTemplate(updatedTemplate)
    if (!validation.isValid) {
      throw new Error(
        `Template validation failed: ${validation.errors.join(', ')}`
      )
    }

    customTemplates.value[index] = updatedTemplate
    return updatedTemplate
  }

  function deleteCustomTemplate(id: string): boolean {
    const index = customTemplates.value.findIndex(t => t.id === id)
    if (index === -1) return false

    customTemplates.value.splice(index, 1)
    return true
  }

  function duplicateTemplate(
    id: string,
    newName?: string
  ): PortfolioTemplate | null {
    const original = getTemplate(id)
    if (!original) return null

    const duplicate = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }

    return createCustomTemplate(duplicate as any)
  }

  function exportTemplate(id: string): string {
    const template = getTemplate(id)
    if (!template) throw new Error('Template not found')

    return JSON.stringify(template, null, 2)
  }

  function importTemplate(templateJson: string): PortfolioTemplate {
    try {
      const templateData = JSON.parse(templateJson)

      // Remove ID to create new template
      delete templateData.id
      delete templateData.createdAt
      delete templateData.updatedAt

      return createCustomTemplate(templateData)
    } catch {
      throw new Error('Invalid template format')
    }
  }

  // Initialize
  function initialize() {
    templates.value = builtInTemplates
    categories.value = templateCategories
  }

  return {
    // State
    templates: allTemplates,
    categories: categorizedTemplates,
    popularTemplates,
    recentTemplates,
    customTemplates,
    templateUsage,

    // Functions
    getTemplate,
    getTemplatesByCategory,
    getTemplatesByType,
    getTemplatesByDifficulty,
    searchTemplates,
    trackTemplateUsage,
    validateTemplate,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    initialize,
  }
}
