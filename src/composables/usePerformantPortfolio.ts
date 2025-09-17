import { computed, ref, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { PortfolioService } from '@/shared/services/PortfolioService'
import type { PortfolioProject } from '@/shared/types/portfolio'

// Performance-optimized portfolio composable for large collections
interface PortfolioItem {
  id: string
  title: string
  description: string
  type?: string
  game?: string
  skills?: string[]
  date?: string
  featured?: boolean
  url?: string
  thumbnail?: string
  metrics?: Record<string, number | string>
  createdAt?: string
  updatedAt?: string
  technologies?: string[]
  image?: string
  liveUrl?: string
  githubUrl?: string
  responsibilities?: string[]
  outcomes?: string[]
  role?: string
  platforms?: string[]
  engines?: string[]
  genres?: string[]
  links?: Array<{ label?: string; url: string; type?: string }>
  media?: Array<{ url: string; type?: string; caption?: string; alt?: string }>
  tags?: string[]
}

interface PortfolioStats {
  totalItems: number
  featuredItems: number
  itemsByType: Record<string, number>
  recentItemsCount: number
  topSkills: Array<{ skill: string; count: number }>
  completionRate: number
  // Additional properties for template compatibility
  totalProjects: number
  totalClips: number
  totalAchievements: number
  featuredCount: number
}

interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  hasMore: boolean
}

/**
 * Performance-optimized portfolio composable with virtualization and caching
 */
export function usePerformantPortfolio() {
  const store = useAppStore()

  // Performance settings
  const ITEMS_PER_PAGE = 20
  const CACHE_SIZE = 100
  const VIRTUALIZATION_THRESHOLD = 50

  // Reactive state
  const searchQuery = ref('')
  const filterType = ref('')
  const showFeaturedOnly = ref(false)
  const skillFilters = ref<string[]>([])
  const dateFrom = ref('')
  const dateTo = ref('')
  const sortMode = ref<'recent' | 'alphabetical' | 'type' | 'featured'>(
    'recent'
  )
  const currentPage = ref(1)
  const itemsPerPage = ref(ITEMS_PER_PAGE)
  const loading = ref(false)
  const loadingMore = ref(false)

  // Cache for filtered results
  const filteredCache = ref<Map<string, PortfolioItem[]>>(new Map())
  const lastCacheKey = ref('')

  // Virtualization state
  const virtualizedItems = ref<PortfolioItem[]>([])
  const visibleRange = ref({ start: 0, end: ITEMS_PER_PAGE })

  // Layout preferences
  const layout = computed({
    get: () => store.settings.portfolioLayout || 'grid',
    set: (val: 'grid' | 'list' | 'timeline') =>
      store.updatePortfolioLayout(val),
  })

  const showAnalytics = computed({
    get: () => !!store.settings.portfolioShowAnalytics,
    set: () => store.togglePortfolioAnalytics(),
  })

  // Portfolio items from store
  const items = computed(() => store.user.portfolio || [])

  // Generate cache key for current filters
  const cacheKey = computed(() => {
    return JSON.stringify({
      searchQuery: searchQuery.value,
      filterType: filterType.value,
      showFeaturedOnly: showFeaturedOnly.value,
      skillFilters: skillFilters.value.sort(),
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      sortMode: sortMode.value,
    })
  })

  // Filtered items with caching
  const filtered = computed(() => {
    const key = cacheKey.value

    // Check cache first
    if (filteredCache.value.has(key)) {
      return filteredCache.value.get(key)!
    }

    // Calculate filtered results
    const filters = {
      searchQuery: searchQuery.value,
      type: filterType.value,
      showFeaturedOnly: showFeaturedOnly.value,
      skillFilters: skillFilters.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      sortMode: sortMode.value,
    }

    const filteredItems = PortfolioService.filterItems(items.value, filters)
    const sortedItems = PortfolioService.sortItems(
      filteredItems,
      sortMode.value
    )

    // Update cache
    updateCache(key, sortedItems)

    return sortedItems
  })

  // Pagination state
  const pagination = computed((): PaginationState => {
    const totalItems = filtered.value.length
    const totalPages = Math.ceil(totalItems / itemsPerPage.value)

    return {
      currentPage: currentPage.value,
      itemsPerPage: itemsPerPage.value,
      totalPages,
      hasMore: currentPage.value < totalPages,
    }
  })

  // Paginated items for current page
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filtered.value.slice(start, end)
  })

  // Items for infinite scroll (accumulated)
  const infiniteItems = computed(() => {
    const itemCount = currentPage.value * itemsPerPage.value
    return filtered.value.slice(0, itemCount)
  })

  // Portfolio statistics with memoization
  const stats = computed((): PortfolioStats => {
    return PortfolioService.generateStats(items.value)
  })

  const topSkills = computed(() => stats.value.topSkills)

  // Performance optimization methods
  function updateCache(key: string, data: PortfolioItem[]) {
    // Limit cache size
    if (filteredCache.value.size >= CACHE_SIZE) {
      const firstKey = filteredCache.value.keys().next().value
      filteredCache.value.delete(firstKey)
    }

    filteredCache.value.set(key, data)
    lastCacheKey.value = key
  }

  function clearCache() {
    filteredCache.value.clear()
    lastCacheKey.value = ''
  }

  // Virtualization for large lists
  function updateVisibleRange(startIndex: number, endIndex: number) {
    visibleRange.value = { start: startIndex, end: endIndex }
    virtualizedItems.value = filtered.value.slice(startIndex, endIndex)
  }

  function shouldVirtualize(): boolean {
    return filtered.value.length > VIRTUALIZATION_THRESHOLD
  }

  // Pagination methods
  function nextPage() {
    if (pagination.value.hasMore) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= pagination.value.totalPages) {
      currentPage.value = page
    }
  }

  // Infinite scroll support
  async function loadMoreItems() {
    if (loadingMore.value || !pagination.value.hasMore) return

    loadingMore.value = true

    try {
      // Simulate async loading if needed
      await nextTick()
      nextPage()
    } finally {
      loadingMore.value = false
    }
  }

  // Filter methods
  function clearFilters() {
    searchQuery.value = ''
    filterType.value = ''
    showFeaturedOnly.value = false
    skillFilters.value = []
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
    clearCache()
  }

  function addSkillFilter(skill: string) {
    if (!skillFilters.value.includes(skill)) {
      skillFilters.value.push(skill)
    }
  }

  function removeSkillFilter(skill: string) {
    const index = skillFilters.value.indexOf(skill)
    if (index !== -1) {
      skillFilters.value.splice(index, 1)
    }
  }

  // Item management with optimistic updates
  async function addItem(data: Partial<PortfolioProject | PortfolioItem>) {
    loading.value = true

    try {
      const newItem = createPortfolioItem(data)
      const validation = validateItem(newItem)

      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Optimistic update
      store.user.portfolio = store.user.portfolio || []
      store.user.portfolio.unshift(newItem)

      // Clear cache to force recomputation
      clearCache()

      await store.saveToStorage()

      return newItem
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: string, updates: Partial<PortfolioItem>) {
    loading.value = true

    try {
      const index = store.user.portfolio.findIndex(
        (item: any) => item.id === id
      )
      if (index === -1) {
        throw new Error('Portfolio item not found')
      }

      const updatedItem: PortfolioItem = {
        ...store.user.portfolio[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      const validation = validateItem(updatedItem)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Optimistic update
      store.user.portfolio[index] = updatedItem

      // Clear cache
      clearCache()

      await store.saveToStorage()

      return updatedItem
    } finally {
      loading.value = false
    }
  }

  async function removeItem(id: string) {
    loading.value = true

    try {
      const index = store.user.portfolio.findIndex(
        (item: any) => item.id === id
      )
      if (index === -1) {
        throw new Error('Portfolio item not found')
      }

      // Optimistic update
      store.user.portfolio.splice(index, 1)

      // Clear cache
      clearCache()

      await store.saveToStorage()
    } finally {
      loading.value = false
    }
  }

  async function toggleFeatured(id: string) {
    const item = store.user.portfolio.find(
      (portfolioItem: any) => portfolioItem.id === id
    )
    if (item) {
      await updateItem(id, { featured: !item.featured })
    }
  }

  // Bulk operations with batch processing
  async function bulkUpdate(ids: string[], updates: Partial<PortfolioItem>) {
    loading.value = true

    try {
      const promises = ids.map(id => updateItem(id, updates))
      await Promise.all(promises)
      clearCache()
    } finally {
      loading.value = false
    }
  }

  async function bulkDelete(ids: string[]) {
    loading.value = true

    try {
      // Remove items in reverse order to maintain indices
      const sortedIds = ids.sort((a, b) => {
        const indexA = store.user.portfolio.findIndex(
          (item: any) => item.id === a
        )
        const indexB = store.user.portfolio.findIndex(
          (item: any) => item.id === b
        )
        return indexB - indexA
      })

      for (const id of sortedIds) {
        const index = store.user.portfolio.findIndex(
          (item: any) => item.id === id
        )
        if (index !== -1) {
          store.user.portfolio.splice(index, 1)
        }
      }

      clearCache()
      await store.saveToStorage()
    } finally {
      loading.value = false
    }
  }

  // AI-powered utility functions
  async function suggestSkills(project: PortfolioItem): Promise<string[]> {
    try {
      // Extract skills from project data using AI analysis
      const projectText = `${project.title} ${project.description} ${project.technologies?.join(' ') || ''}`

      // Common gaming industry skills categorized
      const skillCategories = {
        programming: [
          'C++',
          'C#',
          'JavaScript',
          'Python',
          'Lua',
          'Rust',
          'Java',
        ],
        engines: [
          'Unity',
          'Unreal Engine',
          'Godot',
          'CryEngine',
          'GameMaker',
          'Construct',
        ],
        graphics: [
          '3D Modeling',
          'Animation',
          'Shader Programming',
          'VFX',
          'UI/UX Design',
        ],
        audio: [
          'Audio Implementation',
          'Sound Design',
          'Music Composition',
          'FMOD',
          'Wwise',
        ],
        tools: [
          'Git',
          'Perforce',
          'Jenkins',
          'Jira',
          'Confluence',
          'Maya',
          'Blender',
        ],
        platforms: ['PC', 'Console', 'Mobile', 'VR', 'AR', 'Web'],
        specializations: [
          'Gameplay Programming',
          'Engine Programming',
          'AI Programming',
          'Graphics Programming',
        ],
      }

      const suggestions: string[] = []
      const lowerProjectText = projectText.toLowerCase()

      // Analyze project content for skill matches
      Object.values(skillCategories)
        .flat()
        .forEach(skill => {
          if (
            lowerProjectText.includes(skill.toLowerCase()) &&
            !project.skills?.includes(skill)
          ) {
            suggestions.push(skill)
          }
        })

      // Add project type-specific suggestions
      if (project.type === 'game') {
        suggestions.push('Game Development', 'Player Experience Design')
      } else if (project.type === 'tool') {
        suggestions.push('Tool Development', 'Pipeline Optimization')
      }

      return suggestions.slice(0, 5) // Limit to top 5 suggestions
    } catch {
      return []
    }
  }

  async function autoTagProjects(): Promise<void> {
    loading.value = true

    try {
      const updates: Array<{ id: string; tags: string[] }> = []

      for (const item of items.value) {
        const existingTags = item.tags || []
        const generatedTags: string[] = []

        // Auto-generate tags based on content
        if (item.type) generatedTags.push(item.type)
        if (item.platforms?.length) generatedTags.push(...item.platforms)
        if (item.engines?.length) generatedTags.push(...item.engines)
        if (item.genres?.length) generatedTags.push(...item.genres)

        // Add technology-based tags
        if (item.technologies?.length) {
          item.technologies.forEach(tech => {
            if (
              ['Unity', 'Unreal', 'Godot'].some(engine => tech.includes(engine))
            ) {
              generatedTags.push('Game Engine')
            }
            if (['C++', 'C#', 'JavaScript'].includes(tech)) {
              generatedTags.push('Programming')
            }
          })
        }

        // Combine and deduplicate tags
        const newTags = [...new Set([...existingTags, ...generatedTags])]

        if (newTags.length !== existingTags.length) {
          updates.push({ id: item.id, tags: newTags })
        }
      }

      // Apply updates
      for (const update of updates) {
        await updateItem(update.id, { tags: update.tags })
      }

      clearCache()
    } finally {
      loading.value = false
    }
  }

  async function generateSummaries(): Promise<void> {
    loading.value = true

    try {
      for (const item of items.value) {
        if (!item.description || item.description.length < 50) {
          // Generate enhanced description based on available data
          const parts: string[] = []

          if (item.role) parts.push(`Served as ${item.role}`)
          if (item.technologies?.length) {
            parts.push(`using ${item.technologies.slice(0, 3).join(', ')}`)
          }
          if (item.platforms?.length) {
            parts.push(`for ${item.platforms.join(' and ')} platforms`)
          }
          if (item.responsibilities?.length) {
            parts.push(
              `Key responsibilities included ${item.responsibilities[0]}`
            )
          }
          if (item.outcomes?.length) {
            parts.push(`Achieved ${item.outcomes[0]}`)
          }

          const enhancedDescription = parts.join(' ') + '.'

          if (enhancedDescription.length > item.description?.length || 0) {
            await updateItem(item.id, { description: enhancedDescription })
          }
        }
      }

      clearCache()
    } finally {
      loading.value = false
    }
  }

  // Utility functions
  function createPortfolioItem(
    data: Partial<PortfolioProject | PortfolioItem>
  ): PortfolioItem {
    const id = PortfolioService.generateId()
    const now = new Date()

    return {
      id,
      title: data.title || '',
      description: data.description || '',
      type: (data as any).type || 'project',
      game: (data as any).game,
      skills: (data as any).skills || data.technologies || [],
      date:
        (data as any).date ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      featured: data.featured || false,
      url: (data as any).url || (data as any).liveUrl,
      thumbnail: (data as any).thumbnail || (data as any).image,
      metrics: data.metrics,
      technologies: data.technologies,
      liveUrl: (data as any).liveUrl,
      githubUrl: (data as any).githubUrl,
      responsibilities: (data as any).responsibilities,
      outcomes: (data as any).outcomes,
      role: (data as any).role,
      platforms: (data as any).platforms,
      engines: (data as any).engines,
      genres: (data as any).genres,
      links: (data as any).links,
      media: (data as any).media,
      tags: (data as any).tags || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  }

  function validateItem(item: Partial<PortfolioItem>) {
    return PortfolioService.validateItem(item as any)
  }

  // Export functionality
  function prepareExportData(
    options: { includeFeaturedOnly?: boolean; includeAnalytics?: boolean } = {}
  ) {
    const exportItems = options.includeFeaturedOnly
      ? filtered.value.filter(item => item.featured)
      : filtered.value

    return PortfolioService.prepareExportData(
      exportItems,
      { name: store.user.name, email: store.user.email },
      options as any
    )
  }

  // Watch for filter changes to reset pagination
  watch(
    [
      searchQuery,
      filterType,
      showFeaturedOnly,
      skillFilters,
      dateFrom,
      dateTo,
      sortMode,
    ],
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )

  // Cleanup cache when component unmounts
  function cleanup() {
    clearCache()
  }

  return {
    // State
    store,
    items,
    filtered,
    paginatedItems,
    infiniteItems,
    virtualizedItems,
    stats,
    topSkills,
    loading,
    loadingMore,

    // Pagination
    pagination,
    currentPage,
    itemsPerPage,
    nextPage,
    prevPage,
    goToPage,
    loadMoreItems,

    // Filters
    searchQuery,
    filterType,
    showFeaturedOnly,
    skillFilters,
    dateFrom,
    dateTo,
    sortMode,
    clearFilters,
    addSkillFilter,
    removeSkillFilter,

    // Layout
    layout,
    showAnalytics,

    // Performance
    shouldVirtualize,
    updateVisibleRange,
    visibleRange,
    clearCache,

    // Item Management
    addItem,
    updateItem,
    removeItem,
    toggleFeatured,
    bulkUpdate,
    bulkDelete,
    validateItem,
    createPortfolioItem,

    // AI Methods
    suggestSkills,
    autoTagProjects,
    generateSummaries,

    // Utilities
    prepareExportData,
    cleanup,

    // Legacy compatibility
    generateStats: () => PortfolioService.generateStats(items.value),
    parseItemDate: PortfolioService.parseItemDate,
  }
}

// Legacy compatibility export
export { usePerformantPortfolio as usePortfolio }
