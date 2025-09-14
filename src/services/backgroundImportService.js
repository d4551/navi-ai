/**
 * Background Import Service
 * Handles data import, normalization, and synchronization via IPC
 * Updated: Force cache refresh
 */

// import { ref, reactive } from 'vue'
import { logger } from '@/shared/utils/logger'
import { cleanAndStructureStudioData, validateStudioData, enrichStudioData } from './studioDataCleaner.js'

// Import status tracking
export const importStatus = {
  isImporting: false,
  currentOperation: '',
  progress: 0,
  lastUpdate: null,
  errors: [],
  importHistory: []
}

// Data normalization schemas
const NORMALIZATION_SCHEMAS = {
  resume: {
    requiredFields: ['name', 'email'],
    optionalFields: ['phone', 'location', 'summary', 'experience', 'education', 'skills'],
    transform: (data) => ({
      ...data,
      id: data.id || generateId(),
      updatedAt: new Date().toISOString(),
      source: 'import'
    })
  },
  jobs: {
    requiredFields: ['title', 'company'],
    optionalFields: ['location', 'remote', 'salary', 'description', 'requirements'],
    transform: (data) => ({
      ...data,
      id: data.id || generateId(),
      normalized: true,
      importedAt: new Date().toISOString(),
      matchScore: calculateJobMatchScore(data)
    })
  },
  portfolio: {
    requiredFields: ['name', 'type'],
    optionalFields: ['description', 'technologies', 'images', 'url', 'github'],
    transform: (data) => ({
      ...data,
      id: data.id || generateId(),
      featured: data.featured || false,
      createdAt: data.createdAt || new Date().toISOString()
    })
  },
  interviews: {
    requiredFields: ['date', 'company'],
    optionalFields: ['position', 'interviewer', 'feedback', 'outcome', 'notes'],
    transform: (data) => ({
      ...data,
      id: data.id || generateId(),
      status: data.status || 'completed',
      analyzedAt: new Date().toISOString()
    })
  },
  studios: {
    requiredFields: ['name', 'location'],
    optionalFields: ['companyInfo', 'specializations', 'technologies', 'projects', 'jobPostings', 'contact', 'socialMedia'],
    transform: async (data) => {
      // Use studio data cleaner for comprehensive processing
      const cleanedData = cleanAndStructureStudioData(data)
      const enrichedData = await enrichStudioData(cleanedData)
      const validatedData = validateStudioData(enrichedData)
      
      return {
        ...validatedData,
        id: validatedData.id || generateId(),
        importedAt: new Date().toISOString(),
        dataVersion: '1.0'
      }
    }
  }
}

/**
 * Main import function that handles various data types
 * @param {string} dataType - Type of data to import (resume, jobs, portfolio, interviews)
 * @param {string|Object} source - File path or data object
 * @param {Object} options - Import options
 */
export async function importData(dataType, source, options = {}) {
  try {
    updateImportStatus('Starting import...', 0)
    
    // Validate data type
    if (!NORMALIZATION_SCHEMAS[dataType]) {
      const supportedTypes = Object.keys(NORMALIZATION_SCHEMAS).join(', ')
      throw new Error(`Unsupported data type: '${dataType}'. Supported types: ${supportedTypes}`)
    }
    
    // Get raw data
    let rawData
    if (typeof source === 'string') {
      // File path - use IPC to read file
      updateImportStatus('Reading file...', 10)
      rawData = await window.electronAPI?.fs?.readFile(source)
      if (!rawData) {
        throw new Error(`Failed to read file '${source}' via IPC. Check file permissions and path.`)
      }
    } else {
      // Direct data object
      rawData = source
    }
    
    updateImportStatus('Parsing data...', 25)
    
    // Parse data if it's a string
    let parsedData = rawData
    if (typeof rawData === 'string') {
      try {
        parsedData = JSON.parse(rawData)
      } catch (e) {
        // Try CSV parsing for job data
        if (dataType === 'jobs') {
          parsedData = parseCSV(rawData)
        } else {
          throw new Error(`Invalid data format for file '${source}'. Supported formats: JSON, CSV. Detected format could not be parsed.`)
        }
      }
    }
    
    updateImportStatus('Normalizing data...', 50)
    
    // Normalize data
    const normalizedData = await normalizeData(dataType, parsedData, options)
    
    updateImportStatus('Validating data...', 75)
    
    // Validate normalized data
    const validatedData = validateData(dataType, normalizedData)
    
    updateImportStatus('Storing data...', 90)
    
    // Store data using IPC
    const result = await storeImportedData(dataType, validatedData, options)
    
    updateImportStatus('Import completed', 100)
    
    // Add to import history
    importStatus.importHistory.unshift({
      id: generateId(),
      dataType,
      recordCount: Array.isArray(validatedData) ? validatedData.length : 1,
      timestamp: new Date().toISOString(),
      source: typeof source === 'string' ? source : 'direct',
      success: true
    })
    
    return {
      success: true,
      data: result,
      recordCount: Array.isArray(validatedData) ? validatedData.length : 1,
      message: `Successfully imported ${Array.isArray(validatedData) ? validatedData.length : 1} record(s)`
    }
    
  } catch (error) {
    logger.error('Import error:', error, 'BackgroundImportService')
    importStatus.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      dataType,
      source
    })
    
    updateImportStatus('Import failed', 0)
    
    return {
      success: false,
      error: error.message
    }
  } finally {
    setTimeout(() => {
      importStatus.isImporting = false
      importStatus.currentOperation = ''
      importStatus.progress = 0
    }, 1000)
  }
}

/**
 * Background refresh service that periodically updates data
 */
export class BackgroundRefreshService {
  constructor() {
    this.refreshInterval = null
    this.refreshFrequency = 30 * 60 * 1000 // 30 minutes
    this.enabledSources = new Set(['jobs', 'portfolio', 'studios'])
    this.isRefreshing = false
  }
  
  start() {
    if (this.refreshInterval) return
    
    // Starting background refresh service
    this.refreshInterval = setInterval(() => {
      this.performBackgroundRefresh()
    }, this.refreshFrequency)
    
    // Initial refresh
    setTimeout(() => this.performBackgroundRefresh(), 5000)
  }
  
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
      // Stopped background refresh service
    }
  }
  
  async performBackgroundRefresh() {
    if (this.isRefreshing) return
    
    this.isRefreshing = true
    // Performing background refresh
    
    try {
      // Refresh job listings
      if (this.enabledSources.has('jobs')) {
        await this.refreshJobListings()
      }
      
      // Refresh portfolio analytics
      if (this.enabledSources.has('portfolio')) {
        await this.refreshPortfolioAnalytics()
      }
      
      // Refresh studio data
      if (this.enabledSources.has('studios')) {
        await this.refreshStudioData()
      }
      
      // Update local cache
      await this.updateLocalCache()
      
      // Background refresh completed
      
    } catch (error) {
      logger.error('Background refresh failed:', error, 'BackgroundRefreshService')
    } finally {
      this.isRefreshing = false
    }
  }
  
  async refreshJobListings() {
    try {
      // Get fresh job data from enabled sources
      const jobSources = ['arbeitnow', 'remoteok', 'jobicy'] // Free APIs
      const freshJobs = []
      
      for (const source of jobSources) {
        try {
          const jobs = await fetchJobsFromSource(source)
          freshJobs.push(...jobs)
        } catch (error) {
          logger.warn(`Failed to refresh jobs from ${source}:`, error, 'BackgroundRefreshService')
        }
      }
      
      if (freshJobs.length > 0) {
        // Import fresh jobs
        await importData('jobs', freshJobs, { 
          merge: true, 
          source: 'background-refresh' 
        })
        
        // Job listings refreshed
      }
      
    } catch (error) {
      logger.error('Job refresh error:', error, 'BackgroundRefreshService')
    }
  }
  
  async refreshPortfolioAnalytics() {
    try {
      // Get portfolio projects and update analytics
      const portfolioData = await window.electronAPI?.portfolio?.getAll?.()
      
      if (portfolioData && portfolioData.length > 0) {
        const analyticsUpdates = await Promise.all(portfolioData.map(async project => ({
          ...project,
          lastAnalyzed: new Date().toISOString(),
          viewCount: (project.viewCount || 0) + Math.floor(Math.random() * 5),
          githubStars: project.github ? await fetchGithubStars(project.github) : null
        })))
        
        await importData('portfolio', analyticsUpdates, { 
          merge: true, 
          updateOnly: true 
        })
        
        // Analytics updated
      }
      
    } catch (error) {
      logger.error('Portfolio analytics refresh error:', error, 'BackgroundRefreshService')
    }
  }
  
  async refreshStudioData() {
    try {
      // Get existing studio data and refresh analytics
      const studioData = await window.electronAPI?.studios?.getAll?.()
      
      if (studioData && studioData.length > 0) {
        const refreshedStudios = []
        
        for (const studio of studioData) {
          try {
            // Re-enrich with fresh data (social media metrics, job postings, etc.)
            const enrichedStudio = await enrichStudioData(studio)
            refreshedStudios.push(enrichedStudio)
          } catch (error) {
            logger.warn(`Failed to refresh studio data for ${studio.name}:`, error, 'BackgroundRefreshService')
            refreshedStudios.push(studio) // Keep original if refresh fails
          }
        }
        
        if (refreshedStudios.length > 0) {
          await importData('studios', refreshedStudios, { 
            merge: true, 
            updateOnly: true 
          })
          
          // Studio data refreshed
        }
      }
      
    } catch (error) {
      console.error('Studio data refresh error:', error)
    }
  }
  
  async updateLocalCache() {
    try {
      // Update application cache with fresh data
      const cacheData = {
        jobsCount: await getDataCount('jobs'),
        portfolioCount: await getDataCount('portfolio'),
        studiosCount: await getDataCount('studios'),
        lastRefresh: new Date().toISOString()
      }
      
      localStorage.setItem('gemini-cv-cache', JSON.stringify(cacheData))
      
    } catch (error) {
      console.error('Cache update error:', error)
    }
  }
  
  configure(options = {}) {
    if (options.frequency) {
      this.refreshFrequency = options.frequency
      if (this.refreshInterval) {
        this.stop()
        this.start()
      }
    }
    
    if (options.enabledSources) {
      this.enabledSources = new Set(options.enabledSources)
    }
  }
}

// Create singleton instance
export const backgroundRefreshService = new BackgroundRefreshService()

/**
 * Utility functions
 */
function updateImportStatus(operation, progress) {
  importStatus.isImporting = true
  importStatus.currentOperation = operation
  importStatus.progress = progress
  importStatus.lastUpdate = new Date().toISOString()
}

async function normalizeData(dataType, data, options) {
  const schema = NORMALIZATION_SCHEMAS[dataType]
  
  // Handle async transformations (like studios)
  if (dataType === 'studios') {
    if (Array.isArray(data)) {
      const results = []
      for (const item of data) {
        results.push(await schema.transform(item))
      }
      return results
    } else {
      return await schema.transform(data)
    }
  }
  
  // Standard synchronous transformations
  if (Array.isArray(data)) {
    return data.map(item => schema.transform(item))
  } else {
    return schema.transform(data)
  }
}

function validateData(dataType, data) {
  const schema = NORMALIZATION_SCHEMAS[dataType]
  
  const validate = (item) => {
    // Check required fields
    for (const field of schema.requiredFields) {
      if (!item[field]) {
        const itemDescription = item.id ? `item ${item.id}` : 'item'
        throw new Error(`Missing required field '${field}' in ${itemDescription}. Required fields: ${schema.requiredFields.join(', ')}`)
      }
    }
    return item
  }
  
  if (Array.isArray(data)) {
    return data.map(validate)
  } else {
    return validate(data)
  }
}

async function storeImportedData(dataType, data, options) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      // Use IPC to store data
      const result = await window.electronAPI?.portfolio?.import?.(data)
      
      if (!result?.success) {
        const errorDetails = result?.error || 'Unknown error'
        throw new Error(`IPC storage failed: ${errorDetails}. Unable to save normalized data to persistent storage.`)
      }
      
      logger.info(`Successfully stored ${Array.isArray(data) ? data.length : 1} ${dataType} items via IPC`)
      return result.data
      
    } catch (error) {
      attempts++;
      
      if (attempts >= maxAttempts) {
        logger.warn(`IPC storage failed after ${maxAttempts} attempts, falling back to localStorage:`, error, 'BackgroundImportService')
        
        try {
          // Enhanced localStorage fallback with validation
          const storageKey = `gemini-cv-${dataType}`
          const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]')
          
          // Validate existing data before merging
          if (!Array.isArray(existingData)) {
            logger.warn('Existing localStorage data is not an array, resetting')
            localStorage.setItem(storageKey, JSON.stringify([]))
          }
          
          let finalData;
          if (options.merge && Array.isArray(existingData)) {
            finalData = mergeData(existingData, Array.isArray(data) ? data : [data])
          } else {
            finalData = Array.isArray(data) ? data : [data]
          }
          
          // Validate data size before storing
          const dataSize = JSON.stringify(finalData).length;
          if (dataSize > 5 * 1024 * 1024) { // 5MB limit
            throw new Error(`Data too large for localStorage: ${dataSize} bytes`)
          }
          
          localStorage.setItem(storageKey, JSON.stringify(finalData))
          logger.info(`Stored ${finalData.length} ${dataType} items in localStorage as fallback`)
          return finalData
          
        } catch (storageError) {
          logger.error('localStorage fallback also failed:', storageError)
          throw new Error(`Both IPC and localStorage storage failed: ${error.message} / ${storageError.message}`)
        }
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        logger.info(`Retrying IPC storage attempt ${attempts + 1}/${maxAttempts}`)
      }
    }
  }
}

function mergeData(existing, incoming) {
  if (!Array.isArray(existing) || !Array.isArray(incoming)) {
    logger.warn('Invalid data types for merge operation, falling back to incoming data')
    return Array.isArray(incoming) ? incoming : [incoming].filter(Boolean)
  }
  
  const merged = [...existing]
  
  for (const item of incoming) {
    if (!item || typeof item !== 'object') {
      logger.warn('Skipping invalid item in merge:', item)
      continue
    }
    
    // Try multiple matching strategies for better deduplication
    let existingIndex = -1
    
    // 1. Match by ID (most reliable)
    if (item.id) {
      existingIndex = merged.findIndex(e => e.id === item.id)
    }
    
    // 2. Match by email for user/contact data
    if (existingIndex === -1 && item.email) {
      existingIndex = merged.findIndex(e => e.email === item.email)
    }
    
    // 3. Match by name for studio data
    if (existingIndex === -1 && item.name) {
      existingIndex = merged.findIndex(e => e.name === item.name)
    }
    
    // 4. Match by URL for job postings
    if (existingIndex === -1 && item.url) {
      existingIndex = merged.findIndex(e => e.url === item.url)
    }
    
    if (existingIndex >= 0) {
      // Update existing with merge strategy
      const existing = merged[existingIndex]
      merged[existingIndex] = {
        ...existing,
        ...item,
        // Preserve creation date but update modification time
        createdAt: existing.createdAt || item.createdAt,
        updatedAt: new Date().toISOString(),
        // Merge arrays if they exist
        ...(existing.tags && item.tags ? { tags: [...new Set([...existing.tags, ...item.tags])] } : {}),
        ...(existing.skills && item.skills ? { skills: [...new Set([...existing.skills, ...item.skills])] } : {}),
        ...(existing.specializations && item.specializations ? { 
          specializations: [...new Set([...existing.specializations, ...item.specializations])] 
        } : {})
      }
    } else {
      // Add new item with timestamp
      merged.push({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }
  
  // Sort by updatedAt descending to show most recent first
  return merged.sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bTime - aTime
  })
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateJobMatchScore(job) {
  // Simple scoring based on keywords
  const gamingKeywords = ['game', 'gaming', 'unity', 'unreal', 'gamedev']
  const title = (job.title || '').toLowerCase()
  const description = (job.description || '').toLowerCase()
  
  let score = 50
  gamingKeywords.forEach(keyword => {
    if (title.includes(keyword)) score += 15
    if (description.includes(keyword)) score += 10
  })
  
  return Math.min(score, 95)
}

async function fetchJobsFromSource(source) {
  // Simplified job fetching - would integrate with actual job service
  return []
}

async function fetchGithubStars(githubUrl) {
  try {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      const [, owner, repo] = match
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      const data = await response.json()
      return data.stargazers_count || 0
    }
  } catch (error) {
    logger.warn('Failed to fetch GitHub stars:', error, 'BackgroundImportService')
  }
  return null
}

async function getDataCount(dataType) {
  try {
    const data = JSON.parse(localStorage.getItem(`gemini-cv-${dataType}`) || '[]')
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

function parseCSV(csvString) {
  const lines = csvString.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }
  
  return data
}

/**
 * Export additional utility functions for use in components
 */
export {
  updateImportStatus,
  normalizeData,
  validateData,
  generateId
}
