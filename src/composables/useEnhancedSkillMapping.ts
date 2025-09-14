/**
 * Enhanced Skill Mapping Composable
 * Provides reactive state and methods for advanced gaming industry skill mapping
 */

import { ref, reactive, computed } from 'vue'
import { gameSkillMappingService } from '@/shared/services/GameSkillMappingService'
import { ExportService } from '@/utils/export'
import html2canvas from 'html2canvas'
import type { 
  SkillMapping, 
  TrendingSkill, 
  CareerPathway, 
  IndustryRole,
  ReadinessAssessment,
  SkillWebVisualization,
  GameToIndustryTranslation,
  SkillExportOptions,
  SkillEvidence
} from '@/shared/types/skillMapping'

export function useEnhancedSkillMapping() {
  // Core state
  const mappedSkills = ref<SkillMapping[]>([])
  const suggestedSkills = ref<SkillMapping[]>([])
  const trendingSkills = ref<TrendingSkill[]>([])
  const careerPathways = ref<CareerPathway[]>([])
  const industryRoles = ref<IndustryRole[]>([])
  const readinessAssessment = ref<ReadinessAssessment | null>(null)

  // UI state
  const isAnalyzing = ref(false)
  const isLoadingTrends = ref(false)
  const selectedSkill = ref<SkillMapping | null>(null)
  const selectedPathway = ref<CareerPathway | null>(null)
  const viewMode = ref<'visual' | 'guided' | 'pathways'>('visual')

  // Web visualization state
  const skillWebData = reactive<SkillWebVisualization>({
    nodes: [],
    connections: [],
    dimensions: {
      width: 800,
      height: 600,
      centerX: 400,
      centerY: 300
    },
    categories: [],
    interactionMode: 'view'
  })

  // Analysis input state
  const analysisInput = reactive({
    description: '',
    gamingProfiles: [] as string[],
    achievements: [] as string[],
    documents: [] as File[]
  })

  // Computed properties
  const skillsByCategory = computed(() => {
    const categories: Record<string, SkillMapping[]> = {}
    mappedSkills.value.forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = []
      }
      categories[skill.category].push(skill)
    })
    return categories
  })

  const topSkillCategories = computed(() => {
    const categoryScores = Object.entries(skillsByCategory.value).map(([category, skills]) => ({
      category,
      count: skills.length,
      avgConfidence: skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length,
      score: skills.length * (skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length) / 100
    }))
    return categoryScores.sort((a, b) => b.score - a.score)
  })

  const industryReadinessScore = computed(() => {
    if (!readinessAssessment.value) return 0
    return readinessAssessment.value.overallScore
  })

  const careerMatches = computed(() => {
    return careerPathways.value
      .map(pathway => ({
        role: pathway.title,
        match: pathway.matchScore,
        pathway
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 5)
  })

  // Core methods
  async function analyzeGamingExperience() {
    if (!analysisInput.description.trim()) {
      throw new Error('Please provide a description of your gaming experience')
    }

    isAnalyzing.value = true
    try {
      const mappings = await gameSkillMappingService.analyzeGamingExperience({
        description: analysisInput.description,
        gamingProfiles: analysisInput.gamingProfiles.filter(p => p.trim()),
        achievements: analysisInput.achievements.filter(a => a.trim()),
        documents: analysisInput.documents
      })

      suggestedSkills.value = mappings
      generateSkillWebVisualization()
      
      return mappings
    } finally {
      isAnalyzing.value = false
    }
  }

  async function loadTrendingSkills() {
    isLoadingTrends.value = true
    try {
      const trends = await gameSkillMappingService.getTrendingSkills()
      trendingSkills.value = trends
      return trends
    } finally {
      isLoadingTrends.value = false
    }
  }

  async function loadRoleRequirements(roleId: string) {
    try {
      const role = await gameSkillMappingService.getRoleSkillRequirements(roleId)
      
      // Update or add to roles array
      const existingIndex = industryRoles.value.findIndex(r => r.id === roleId)
      if (existingIndex >= 0) {
        industryRoles.value[existingIndex] = role
      } else {
        industryRoles.value.push(role)
      }
      
      return role
    } catch (error) {
      console.error('Failed to load role requirements:', error)
      throw error
    }
  }

  function calculateReadinessAssessment(targetRole?: string) {
    const assessment = gameSkillMappingService.calculateReadinessScore(
      mappedSkills.value,
      targetRole
    )
    readinessAssessment.value = {
      ...assessment,
      lastAssessed: new Date()
    }
    return assessment
  }

  function generateCareerPathways() {
    const pathways = gameSkillMappingService.generateCareerPathways(mappedSkills.value)
    careerPathways.value = pathways
    return pathways
  }

  // Skill management
  function acceptSuggestedSkill(suggestion: SkillMapping) {
    // Ensure suggestion has a stable id
    const suggestionId = suggestion?.id || `suggest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const skill: SkillMapping = {
      ...suggestion,
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      verified: false,
      evidence: [],
      createdAt: new Date(),
      aiGenerated: true
    }

    mappedSkills.value.push(skill)

    // Remove from suggestions by id when present, otherwise by content match
    suggestedSkills.value = suggestedSkills.value.filter((s) => {
      if (s.id) return s.id !== suggestionId
      // Fallback: compare essential fields
      return !(
        s.gameExpression === suggestion.gameExpression &&
        s.transferableSkill === suggestion.transferableSkill &&
        JSON.stringify(s.industryApplications || []) === JSON.stringify(suggestion.industryApplications || [])
      )
    })

    // Regenerate visualizations and assessments
    generateSkillWebVisualization()
    calculateReadinessAssessment()
    generateCareerPathways()
  }

  function dismissSuggestedSkill(suggestion: SkillMapping) {
    if (!suggestion) return
    const suggestionId = suggestion?.id
    suggestedSkills.value = suggestedSkills.value.filter((s) => {
      if (suggestionId) return s.id !== suggestionId
      // Fallback by content when id is missing
      return !(
        s.gameExpression === suggestion.gameExpression &&
        s.transferableSkill === suggestion.transferableSkill &&
        JSON.stringify(s.industryApplications || []) === JSON.stringify(suggestion.industryApplications || [])
      )
    })
  }

  function removeSkill(skillId: string) {
    mappedSkills.value = mappedSkills.value.filter(s => s.id !== skillId)
    generateSkillWebVisualization()
    calculateReadinessAssessment()
    generateCareerPathways()
  }

  function updateSkill(skillId: string, updates: Partial<SkillMapping>) {
    const skillIndex = mappedSkills.value.findIndex(s => s.id === skillId)
    if (skillIndex >= 0) {
      mappedSkills.value[skillIndex] = {
        ...mappedSkills.value[skillIndex],
        ...updates,
        updatedAt: new Date()
      }
      generateSkillWebVisualization()
    }
  }

  function addEvidence(skillId: string, evidence: Omit<SkillEvidence, 'id' | 'createdAt'>) {
    const skill = mappedSkills.value.find(s => s.id === skillId)
    if (skill) {
      const newEvidence: SkillEvidence = {
        ...evidence,
        id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        verificationStatus: 'pending' as const
      }
      skill.evidence.push(newEvidence)
      skill.verified = skill.evidence.length > 0
      generateSkillWebVisualization()
    }
  }

  // Visual skill web methods
  function generateSkillWebVisualization() {
    const { centerX, centerY } = skillWebData.dimensions
    
    // Reset nodes and connections
    skillWebData.nodes = []
    skillWebData.connections = []

    // Central "You" node
    skillWebData.nodes.push({
      id: 'central',
      type: 'central',
      label: 'You',
      x: centerX,
      y: centerY,
      radius: 40,
      color: '#3b82f6'
    })

    // Category nodes
    const categories = Object.keys(skillsByCategory.value)
    const angleStep = (2 * Math.PI) / categories.length
    
    categories.forEach((category, index) => {
      const angle = index * angleStep
      const categoryRadius = 150
      const x = centerX + Math.cos(angle) * categoryRadius
      const y = centerY + Math.sin(angle) * categoryRadius
      const skills = skillsByCategory.value[category]
      
      // Calculate category strength based on skills
      const avgConfidence = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length
      const strength = avgConfidence > 80 ? 'strong' : avgConfidence > 60 ? 'moderate' : 'weak'
      const radius = 20 + (skills.length * 3)

      skillWebData.nodes.push({
        id: `category-${category}`,
        type: 'category',
        label: category.charAt(0).toUpperCase() + category.slice(1),
        x,
        y,
        radius,
        strength,
        color: getCategoryColor(category),
        connections: ['central']
      })

      // Add connection to central node
      skillWebData.connections.push({
        from: 'central',
        to: `category-${category}`,
        strength,
        type: 'primary'
      })

      // Individual skill nodes around category
      const skillAngleStep = (2 * Math.PI) / skills.length
      skills.forEach((skill, skillIndex) => {
        const skillAngle = angle + (skillIndex * skillAngleStep) / 2
        const skillRadius = 80
        const skillX = x + Math.cos(skillAngle) * skillRadius
        const skillY = y + Math.sin(skillAngle) * skillRadius
        const skillStrength = skill.confidence > 80 ? 'strong' : skill.confidence > 60 ? 'moderate' : 'weak'

        skillWebData.nodes.push({
          id: skill.id,
          type: 'skill',
          label: skill.gameExpression.length > 20 
            ? skill.gameExpression.substring(0, 20) + '...' 
            : skill.gameExpression,
          x: skillX,
          y: skillY,
          radius: 8,
          strength: skillStrength,
          connections: [`category-${category}`]
        })

        skillWebData.connections.push({
          from: `category-${category}`,
          to: skill.id,
          strength: skillStrength,
          type: 'secondary'
        })
      })
    })

    skillWebData.categories = categories as any
  }

  function getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      leadership: '#f59e0b',
      technical: '#10b981',
      creative: '#8b5cf6',
      community: '#3b82f6',
      analytical: '#ef4444',
      communication: '#06b6d4',
      project_management: '#f97316'
    }
    return colorMap[category] || '#6b7280'
  }

  function selectSkillNode(nodeId: string) {
    if (nodeId.startsWith('category-')) return
    
    const skill = mappedSkills.value.find(s => s.id === nodeId)
    if (skill) {
      selectedSkill.value = skill
    }
  }

  // Export methods
  async function exportSkills(options: SkillExportOptions) {
    try {
      if (options.format === 'json') {
        const exportData = {
          skills: mappedSkills.value,
          readiness: readinessAssessment.value,
          pathways: careerPathways.value,
          exportedAt: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        })
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'gaming-skills-export.json'
        link.click()
        
        URL.revokeObjectURL(url)
        return true
      }

      // Build a detached export container with minimal, theme-aware styling
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-10000px'
      container.style.top = '0'
      container.style.width = '1000px'
      container.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || '#fff'
      container.innerHTML = `
        <style>
          .skills-export { font-family: var(--font-family-primary, system-ui); color: var(--text-primary); padding: 24px; }
          .skills-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px; }
          .skills-title { font-size: 24px; font-weight: 800; letter-spacing: .2px; }
          .skills-meta { color: var(--text-secondary); font-size: 12px; }
          .readiness { background: var(--glass-surface); border:1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
          .grid { display:grid; grid-template-columns: 2fr 1fr; gap: 16px; }
          .card { background: var(--glass-surface); border:1px solid var(--glass-border); border-radius: 12px; padding: 16px; }
          .card h3 { margin: 0 0 8px 0; font-size: 16px; }
          .list { margin: 0; padding: 0; list-style: none; }
          .list li { padding: 6px 0; border-bottom: 1px solid var(--glass-border); font-size: 13px; }
          .list li:last-child { border-bottom: 0; }
          .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; border:1px solid var(--glass-border); background: var(--glass-elevated); }
        </style>
        <div class="skills-export">
          <div class="skills-header">
            <div class="skills-title">Gaming Skills Export</div>
            <div class="skills-meta">${new Date().toLocaleString()}</div>
          </div>
          <div class="readiness">
            <div><strong>Industry Readiness:</strong> ${(industryReadinessScore.value || 0).toFixed(0)}%</div>
          </div>
          <div class="grid">
            <div class="card">
              <h3>Top Skill Categories</h3>
              <ul class="list">
                ${topSkillCategories.value.slice(0,6).map(c => `<li>${c.category} — <span class="badge">${(c.avgConfidence||0).toFixed(0)}% avg</span></li>`).join('')}
              </ul>
            </div>
            <div class="card">
              <h3>Top Career Matches</h3>
              <ul class="list">
                ${careerMatches.value.map(m => `<li>${m.role} — <span class="badge">${(m.match||0).toFixed(0)}%</span></li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="card" style="margin-top:16px;">
            <h3>Mapped Skills (${mappedSkills.value.length})</h3>
            <ul class="list">
              ${mappedSkills.value.slice(0,200).map(s => `<li>${s.gameExpression} → <em>${s.transferableSkill || '—'}</em> <span class="badge">${(s.confidence||0).toFixed(0)}%</span></li>`).join('')}
            </ul>
          </div>
        </div>
      `

      document.body.appendChild(container)

      if (options.format === 'pdf') {
        await ExportService.exportElementToPDF(container, options?.targetStudio ? `${options.targetStudio}-skills` : 'gaming-skills')
        document.body.removeChild(container)
        return true
      }

      if (options.format === 'image') {
        const canvas = await html2canvas(container, { scale: 2 })
        const dataUrl = canvas.toDataURL('image/png')
        document.body.removeChild(container)
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = (options?.targetStudio ? `${options.targetStudio}-skills` : 'gaming-skills') + '.png'
        a.click()
        return true
      }

      // Unknown format
      document.body.removeChild(container)
      return false
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  async function createStudioTailoredExport(studioName: string) {
    // Filter and prioritize skills based on studio preferences
    const tailoredSkills = mappedSkills.value.filter(skill =>
      skill.industryApplications.some(app => 
        app.toLowerCase().includes('game') ||
        app.toLowerCase().includes('design') ||
        app.toLowerCase().includes('development')
      )
    ).sort((a, b) => b.confidence - a.confidence)

    return exportSkills({
      format: 'pdf',
      framework: 'custom',
      targetStudio: studioName,
      includeEvidence: true,
      includeAnalysis: true,
      includeReadiness: true,
      customSections: [
        {
          title: `Skills Relevant to ${studioName}`,
          skills: tailoredSkills.map(s => s.id),
          description: `Key gaming skills that align with ${studioName}'s culture and requirements`,
          priority: 1
        }
      ]
    })
  }

  // Game-to-industry translation
  async function getGameToIndustryTranslations(): Promise<GameToIndustryTranslation[]> {
    return gameSkillMappingService.getGameToIndustryTranslations()
  }

  // Initialize with some defaults if needed
  function initialize() {
    generateSkillWebVisualization()
    loadTrendingSkills()
  }

  return {
    // State
    mappedSkills,
    suggestedSkills,
    trendingSkills,
    careerPathways,
    industryRoles,
    readinessAssessment,
    selectedSkill,
    selectedPathway,
    viewMode,
    skillWebData,
    analysisInput,
    isAnalyzing,
    isLoadingTrends,

    // Computed
    skillsByCategory,
    topSkillCategories,
    industryReadinessScore,
    careerMatches,

    // Methods
    analyzeGamingExperience,
    loadTrendingSkills,
    loadRoleRequirements,
    calculateReadinessAssessment,
    generateCareerPathways,
    acceptSuggestedSkill,
    removeSkill,
    updateSkill,
    addEvidence,
    generateSkillWebVisualization,
    selectSkillNode,
    exportSkills,
    createStudioTailoredExport,
    getGameToIndustryTranslations,
    dismissSuggestedSkill,
    initialize
  }
}
