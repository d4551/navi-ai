/**
 * Enhanced Portfolio System with AI Features, Templates, and Sharing
 * Comprehensive portfolio management with interactive shareables
 */

import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { PortfolioRepository, type Portfolio, type PortfolioProject } from '@/modules/db/repositories/portfolio'
import { logger } from '@/shared/utils/logger'

// AI Integration type (fallback if not available)
interface AIIntegration {
  generateContent: (_type: string, _prompt: string, _context?: any, _options?: any) => Promise<any>
  isConfigured: { value: boolean }
}

function useAIIntegration(): AIIntegration {
  // Fallback implementation since AI integration module has type issues
  return {
    generateContent: async () => ({ text: '' }),
    isConfigured: { value: false }
  }
}

export interface PortfolioTemplate {
  id: string
  name: string
  description: string
  category: 'gaming' | 'web' | 'mobile' | 'creative' | 'technical'
  type: 'project' | 'achievement' | 'experience' | 'showcase'
  structure: {
    title: string
    sections: PortfolioSection[]
    suggestedMedia: string[]
    requiredFields: string[]
  }
  aiPrompts: {
    description: string
    achievements: string
    technologies: string
  }
  preview: {
    thumbnail: string
    demoUrl?: string
  }
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioSection {
  id: string
  title: string
  type: 'text' | 'media' | 'list' | 'stats' | 'timeline' | 'showcase'
  content: any
  order: number
  required: boolean
}

export interface ShareablePortfolio {
  id: string
  title: string
  description: string
  url: string
  type: 'public' | 'private' | 'password'
  password?: string
  expiresAt?: Date
  analytics: {
    views: number
    uniqueViews: number
    lastViewed: Date
    referrers: Record<string, number>
  }
  settings: {
    allowDownload: boolean
    showContact: boolean
    watermark: boolean
    theme: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface AIPortfolioSuggestion {
  type: 'improvement' | 'missing' | 'enhancement' | 'template'
  title: string
  description: string
  action: string
  priority: 'low' | 'medium' | 'high'
  category: string
  implementation?: {
    steps: string[]
    estimatedTime: number
    difficulty: string
  }
}

export function useEnhancedPortfolio() {
  // State
  const portfolio = ref<Portfolio | null>(null)
  const templates = ref<PortfolioTemplate[]>([])
  const shareables = ref<ShareablePortfolio[]>([])
  const aiSuggestions = ref<AIPortfolioSuggestion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Persistence
  const savedTemplates = useStorage('portfolio-custom-templates', [] as PortfolioTemplate[])
  const recentProjects = useStorage('portfolio-recent-projects', [] as string[])
  const userPreferences = useStorage('portfolio-preferences', {
    defaultTheme: 'modern',
    autoSave: true,
    aiAssistance: true,
    analytics: true
  })

  // AI Integration
  const { generateContent, isConfigured: isAIConfigured } = useAIIntegration()

  // Computed
  const projects = computed(() => portfolio.value?.projects || [])
  const featuredProjects = computed(() => projects.value.filter(p => p.featured))
  const projectsByCategory = computed(() => {
    const groups: Record<string, PortfolioProject[]> = {}
    projects.value.forEach(project => {
      if (!groups[project.category]) groups[project.category] = []
      groups[project.category].push(project)
    })
    return groups
  })

  const portfolioStats = computed(() => {
    const totalProjects = projects.value.length
    const completedProjects = projects.value.filter(p => p.status === 'completed').length
    const technologies = [...new Set(projects.value.flatMap(p => p.technologies))]
    
    return {
      totalProjects,
      completedProjects,
      inProgress: projects.value.filter(p => p.status === 'in-progress').length,
      technologies: technologies.length,
      topTechnologies: technologies.slice(0, 10),
      averageProjectDuration: calculateAverageProjectDuration(),
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
    }
  })

  // Load portfolio data
  async function loadPortfolio() {
    try {
      loading.value = true
      error.value = null
      
      portfolio.value = await PortfolioRepository.get()
      
      if (!portfolio.value) {
        // Create default portfolio
        portfolio.value = await PortfolioRepository.create({
          personalInfo: {
            name: '',
            title: 'Gaming Professional',
            bio: '',
            social: {}
          },
          projects: [],
          skills: {
            primary: [],
            secondary: [],
            tools: []
          },
          theme: {
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            layout: 'grid',
            showContact: true,
            showSkills: true
          },
          seo: {}
        })
      }

      await loadTemplates()
      await loadShareables()
      
      if (userPreferences.value.aiAssistance && isAIConfigured.value) {
        await generateAISuggestions()
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load portfolio'
      logger.error('Failed to load portfolio:', err)
    } finally {
      loading.value = false
    }
  }

  // Templates Management
  async function loadTemplates() {
    templates.value = [
      ...getBuiltInTemplates(),
      ...savedTemplates.value
    ]
  }

  function getBuiltInTemplates(): PortfolioTemplate[] {
    return [
      {
        id: 'game-project',
        name: 'Game Development Project',
        description: 'Showcase a complete game development project with technical details',
        category: 'gaming',
        type: 'project',
        structure: {
          title: 'Game Project Showcase',
          sections: [
            {
              id: 'overview',
              title: 'Project Overview',
              type: 'text',
              content: '',
              order: 1,
              required: true
            },
            {
              id: 'gameplay',
              title: 'Gameplay & Features',
              type: 'showcase',
              content: '',
              order: 2,
              required: true
            },
            {
              id: 'technical',
              title: 'Technical Implementation',
              type: 'list',
              content: [],
              order: 3,
              required: false
            },
            {
              id: 'media',
              title: 'Screenshots & Videos',
              type: 'media',
              content: [],
              order: 4,
              required: false
            }
          ],
          suggestedMedia: ['gameplay-video', 'screenshots', 'concept-art'],
          requiredFields: ['title', 'description', 'technologies', 'role']
        },
        aiPrompts: {
          description: 'Write a compelling description for a {gameType} game project that demonstrates {skills} skills',
          achievements: 'List key achievements and milestones for this game development project',
          technologies: 'Suggest appropriate technologies and tools for a {gameType} game project'
        },
        preview: {
          thumbnail: '/templates/game-project-preview.jpg'
        },
        tags: ['game-development', 'technical', 'creative'],
        difficulty: 'intermediate',
        estimatedTime: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'competitive-achievement',
        name: 'Competitive Gaming Achievement',
        description: 'Highlight competitive gaming accomplishments and tournaments',
        category: 'gaming',
        type: 'achievement',
        structure: {
          title: 'Competitive Achievement',
          sections: [
            {
              id: 'achievement',
              title: 'Achievement Details',
              type: 'text',
              content: '',
              order: 1,
              required: true
            },
            {
              id: 'stats',
              title: 'Performance Statistics',
              type: 'stats',
              content: {},
              order: 2,
              required: false
            },
            {
              id: 'timeline',
              title: 'Tournament Timeline',
              type: 'timeline',
              content: [],
              order: 3,
              required: false
            }
          ],
          suggestedMedia: ['tournament-photos', 'match-highlights', 'certificates'],
          requiredFields: ['title', 'game', 'achievement', 'date']
        },
        aiPrompts: {
          description: 'Write an impressive description for a {game} competitive achievement: {achievement}',
          achievements: 'Break down the significance of this competitive gaming achievement',
          technologies: 'What skills and strategies were key to achieving this competitive result?'
        },
        preview: {
          thumbnail: '/templates/competitive-preview.jpg'
        },
        tags: ['esports', 'competitive', 'achievement'],
        difficulty: 'beginner',
        estimatedTime: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'web-portfolio',
        name: 'Web Development Portfolio',
        description: 'Professional web development project showcase',
        category: 'web',
        type: 'project',
        structure: {
          title: 'Web Development Project',
          sections: [
            {
              id: 'overview',
              title: 'Project Overview',
              type: 'text',
              content: '',
              order: 1,
              required: true
            },
            {
              id: 'features',
              title: 'Key Features',
              type: 'list',
              content: [],
              order: 2,
              required: true
            },
            {
              id: 'technical-stack',
              title: 'Technical Stack',
              type: 'list',
              content: [],
              order: 3,
              required: true
            },
            {
              id: 'live-demo',
              title: 'Live Demo',
              type: 'showcase',
              content: '',
              order: 4,
              required: false
            }
          ],
          suggestedMedia: ['website-screenshots', 'mobile-responsive', 'code-snippets'],
          requiredFields: ['title', 'description', 'technologies', 'liveUrl']
        },
        aiPrompts: {
          description: 'Create a professional description for a {projectType} web application built with {technologies}',
          achievements: 'List the key technical achievements and challenges overcome in this web project',
          technologies: 'Explain the technology choices and architecture for this web development project'
        },
        preview: {
          thumbnail: '/templates/web-portfolio-preview.jpg'
        },
        tags: ['web-development', 'frontend', 'backend'],
        difficulty: 'intermediate',
        estimatedTime: 35,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  async function createCustomTemplate(templateData: Omit<PortfolioTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const template: PortfolioTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    savedTemplates.value.push(template)
    templates.value.push(template)
    
    logger.info('Custom template created:', template.name)
    return template
  }

  async function generateTemplateWithAI(templateType: string, requirements: string) {
    if (!isAIConfigured.value) {
      throw new Error('AI not configured')
    }

    try {
      const prompt = `Create a portfolio template for ${templateType} with the following requirements: ${requirements}. 
      Return a JSON structure with template name, description, sections, and suggested content.`
      
      const response = await generateContent('template-generation', prompt, {
        templateType,
        requirements
      }, {
        format: 'json',
        temperature: 0.7
      })

      if (response?.data) {
        return await createCustomTemplate(response.data)
      }
      
      throw new Error('Failed to generate template with AI')
    } catch (err) {
      logger.error('AI template generation failed:', err)
      throw err
    }
  }

  // Project Management
  async function createProject(projectData: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt' | 'order'>) {
    try {
      const project = await PortfolioRepository.addProject(projectData)
      
      // Update recent projects
      recentProjects.value.unshift(project.id)
      recentProjects.value = recentProjects.value.slice(0, 10)
      
      // Reload portfolio
      await loadPortfolio()
      
      logger.info('Project created:', project.title)
      return project
    } catch (err) {
      logger.error('Failed to create project:', err)
      throw err
    }
  }

  async function updateProject(projectId: string, updates: Partial<PortfolioProject>) {
    try {
      const project = await PortfolioRepository.updateProject(projectId, updates)
      
      if (userPreferences.value.autoSave) {
        await loadPortfolio() // Refresh data
      }
      
      return project
    } catch (err) {
      logger.error('Failed to update project:', err)
      throw err
    }
  }

  async function deleteProject(projectId: string) {
    try {
      await PortfolioRepository.deleteProject(projectId)
      await loadPortfolio()
      
      // Remove from recent projects
      recentProjects.value = recentProjects.value.filter(id => id !== projectId)
      
      logger.info('Project deleted:', projectId)
    } catch (err) {
      logger.error('Failed to delete project:', err)
      throw err
    }
  }

  // AI Features
  async function generateAISuggestions() {
    if (!isAIConfigured.value || !portfolio.value) return

    try {
      const portfolioContext = {
        projectCount: projects.value.length,
        categories: Object.keys(projectsByCategory.value),
        technologies: portfolioStats.value.topTechnologies,
        completionRate: portfolioStats.value.completionRate
      }

      const prompt = `Analyze this portfolio and provide improvement suggestions:
      ${JSON.stringify(portfolioContext)}
      
      Suggest improvements for:
      1. Missing project categories
      2. Portfolio completeness
      3. Professional presentation
      4. Technical depth
      5. Industry alignment`

      const response = await generateContent('portfolio-analysis', prompt, portfolioContext, {
        format: 'json',
        temperature: 0.3
      })

      if (response?.suggestions) {
        aiSuggestions.value = response.suggestions
      }
    } catch (err) {
      logger.error('Failed to generate AI suggestions:', err)
    }
  }

  async function generateProjectDescription(projectData: Partial<PortfolioProject>) {
    if (!isAIConfigured.value) {
      throw new Error('AI not configured')
    }

    const prompt = `Write a professional portfolio description for a ${projectData.category} project:
    Title: ${projectData.title}
    Technologies: ${projectData.technologies?.join(', ')}
    Role: ${projectData.role}
    
    Make it compelling and highlight technical achievements.`

    try {
      const response = await generateContent('project-description', prompt, projectData, {
        temperature: 0.7,
        maxTokens: 300
      })

      return response?.text || response?.data?.description || ''
    } catch (err) {
      logger.error('Failed to generate project description:', err)
      throw err
    }
  }

  // Sharing Features
  async function createShareablePortfolio(options: {
    title: string
    description: string
    projectIds?: string[]
    type: 'public' | 'private' | 'password'
    password?: string
    expiresAt?: Date
    settings: ShareablePortfolio['settings']
  }) {
    const shareable: ShareablePortfolio = {
      id: crypto.randomUUID(),
      ...options,
      url: `${window.location.origin}/portfolio/shared/${crypto.randomUUID()}`,
      analytics: {
        views: 0,
        uniqueViews: 0,
        lastViewed: new Date(),
        referrers: {}
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    shareables.value.push(shareable)
    
    // Store shareable data
    await saveShareableData(shareable, options.projectIds)
    
    logger.info('Shareable portfolio created:', shareable.id)
    return shareable
  }

  async function saveShareableData(shareable: ShareablePortfolio, projectIds?: string[]) {
    const portfolioData = { ...portfolio.value }
    
    if (projectIds && portfolioData.projects) {
      portfolioData.projects = portfolioData.projects.filter(p => projectIds.includes(p.id))
    }

    // Save to storage with shareable ID
    await PortfolioRepository.create({
      ...portfolioData,
      id: shareable.id
    } as any)
  }

  // Analytics
  function trackShareableView(shareableId: string, referrer?: string) {
    const shareable = shareables.value.find(s => s.id === shareableId)
    if (!shareable) return

    shareable.analytics.views++
    shareable.analytics.lastViewed = new Date()
    
    if (referrer) {
      shareable.analytics.referrers[referrer] = (shareable.analytics.referrers[referrer] || 0) + 1
    }
  }

  // Utility functions
  function calculateAverageProjectDuration() {
    const completedProjects = projects.value.filter(p => 
      p.status === 'completed' && p.duration?.startDate && p.duration?.endDate
    )

    if (completedProjects.length === 0) return 0

    const totalDays = completedProjects.reduce((sum, project) => {
      const start = new Date(project.duration!.startDate)
      const end = new Date(project.duration!.endDate!)
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)

    return Math.round(totalDays / completedProjects.length)
  }

  // Auto-save functionality
  watch(portfolio, async (newPortfolio) => {
    if (userPreferences.value.autoSave && newPortfolio) {
      try {
        await PortfolioRepository.update(newPortfolio)
      } catch (err) {
        logger.error('Auto-save failed:', err)
      }
    }
  }, { deep: true })

  async function loadShareables() {
    // Load shareable portfolios from storage
    // This would typically come from a backend API
    shareables.value = []
  }

  return {
    // State
    portfolio,
    projects,
    featuredProjects,
    projectsByCategory,
    portfolioStats,
    templates,
    shareables,
    aiSuggestions,
    loading,
    error,
    
    // Preferences
    userPreferences,
    recentProjects,
    
    // Actions
    loadPortfolio,
    createProject,
    updateProject,
    deleteProject,
    
    // Templates
    createCustomTemplate,
    generateTemplateWithAI,
    
    // AI Features
    generateAISuggestions,
    generateProjectDescription,
    
    // Sharing
    createShareablePortfolio,
    trackShareableView,
    
    // Utils
    calculateAverageProjectDuration
  }
}
