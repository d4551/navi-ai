/**
 * Portfolio Sharing Service
 * Handles portfolio sharing, analytics, and public portfolio management
 */

import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Portfolio, PortfolioProject } from '@/modules/db/repositories/portfolio'
import { logger } from '@/shared/utils/logger'

export interface ShareSettings {
  isPublic: boolean
  allowDownload: boolean
  showContactInfo: boolean
  requirePassword: boolean
  password?: string
  expirationDate?: Date
  customDomain?: string
  seoSettings: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
  }
  branding: {
    showWatermark: boolean
    customLogo?: string
    customColors?: {
      primary: string
      secondary: string
    }
  }
  analytics: {
    enableTracking: boolean
    trackDownloads: boolean
    trackViewTime: boolean
  }
}

export interface PortfolioAnalytics {
  views: {
    total: number
    unique: number
    daily: Record<string, number>
    monthly: Record<string, number>
  }
  demographics: {
    countries: Record<string, number>
    devices: Record<string, number>
    browsers: Record<string, number>
    referrers: Record<string, number>
  }
  engagement: {
    averageViewTime: number
    bounceRate: number
    mostViewedProjects: Array<{ projectId: string; views: number }>
    downloadCount: number
    contactClicks: number
  }
  performance: {
    loadTime: number
    mobileScore: number
    seoScore: number
    accessibilityScore: number
  }
}

export interface SharedPortfolioLink {
  id: string
  url: string
  title: string
  description: string
  shareSettings: ShareSettings
  analytics: PortfolioAnalytics
  createdAt: Date
  lastViewed?: Date
  isActive: boolean
}

export function usePortfolioSharing() {
  // State
  const sharedPortfolios = useStorage('shared-portfolios', [] as SharedPortfolioLink[])
  const shareSettings = ref<ShareSettings>({
    isPublic: false,
    allowDownload: true,
    showContactInfo: true,
    requirePassword: false,
    seoSettings: {
      title: '',
      description: '',
      keywords: []
    },
    branding: {
      showWatermark: true
    },
    analytics: {
      enableTracking: true,
      trackDownloads: true,
      trackViewTime: true
    }
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeShares = computed(() => 
    sharedPortfolios.value.filter(share => share.isActive)
  )

  const totalViews = computed(() => 
    sharedPortfolios.value.reduce((total, share) => total + share.analytics.views.total, 0)
  )

  const popularShares = computed(() => 
    sharedPortfolios.value
      .sort((a, b) => b.analytics.views.total - a.analytics.views.total)
      .slice(0, 5)
  )

  // Share Creation
  async function createShare(
    portfolio: Portfolio,
    settings: Partial<ShareSettings> = {},
    selectedProjectIds?: string[]
  ): Promise<SharedPortfolioLink> {
    try {
      loading.value = true
      error.value = null

      // Generate unique share ID and URL
      const shareId = crypto.randomUUID()
      const shareUrl = `${window.location.origin}/portfolio/shared/${shareId}`

      // Create filtered portfolio data
      const portfolioData = { ...portfolio }
      if (selectedProjectIds) {
        portfolioData.projects = portfolio.projects.filter(p => 
          selectedProjectIds.includes(p.id)
        )
      }

      // Merge settings with defaults
      const mergedSettings: ShareSettings = {
        ...shareSettings.value,
        ...settings,
        seoSettings: {
          ...shareSettings.value.seoSettings,
          ...settings.seoSettings
        },
        branding: {
          ...shareSettings.value.branding,
          ...settings.branding
        },
        analytics: {
          ...shareSettings.value.analytics,
          ...settings.analytics
        }
      }

      // Create share link
      const shareLink: SharedPortfolioLink = {
        id: shareId,
        url: shareUrl,
        title: mergedSettings.seoSettings.title || portfolio.personalInfo.title,
        description: mergedSettings.seoSettings.description || portfolio.personalInfo.bio,
        shareSettings: mergedSettings,
        analytics: initializeAnalytics(),
        createdAt: new Date(),
        isActive: true
      }

      // Save portfolio data to public storage
      await saveSharedPortfolioData(shareId, portfolioData, mergedSettings)

      // Add to shared portfolios list
      sharedPortfolios.value.push(shareLink)

      logger.info('Portfolio share created:', shareUrl)
      return shareLink

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create share'
      logger.error('Failed to create portfolio share:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Share Management
  async function updateShare(
    shareId: string, 
    updates: Partial<ShareSettings>
  ): Promise<void> {
    const shareIndex = sharedPortfolios.value.findIndex(s => s.id === shareId)
    if (shareIndex === -1) {
      throw new Error('Share not found')
    }

    const share = sharedPortfolios.value[shareIndex]
    share.shareSettings = { ...share.shareSettings, ...updates }
    
    // Update stored portfolio data if needed
    await updateSharedPortfolioData(shareId, updates)
    
    logger.info('Portfolio share updated:', shareId)
  }

  async function deactivateShare(shareId: string): Promise<void> {
    const share = sharedPortfolios.value.find(s => s.id === shareId)
    if (!share) {
      throw new Error('Share not found')
    }

    share.isActive = false
    await removeSharedPortfolioData(shareId)
    
    logger.info('Portfolio share deactivated:', shareId)
  }

  async function deleteShare(shareId: string): Promise<void> {
    const shareIndex = sharedPortfolios.value.findIndex(s => s.id === shareId)
    if (shareIndex === -1) {
      throw new Error('Share not found')
    }

    sharedPortfolios.value.splice(shareIndex, 1)
    await removeSharedPortfolioData(shareId)
    
    logger.info('Portfolio share deleted:', shareId)
  }

  // Analytics
  function trackView(shareId: string, viewerInfo: {
    country?: string
    device?: string
    browser?: string
    referrer?: string
  } = {}) {
    const share = sharedPortfolios.value.find(s => s.id === shareId)
    if (!share) return

    const today = new Date().toISOString().split('T')[0]
    const month = today.substring(0, 7)

    // Update view counts
    share.analytics.views.total++
    share.analytics.views.daily[today] = (share.analytics.views.daily[today] || 0) + 1
    share.analytics.views.monthly[month] = (share.analytics.views.monthly[month] || 0) + 1

    // Update demographics
    if (viewerInfo.country) {
      share.analytics.demographics.countries[viewerInfo.country] = 
        (share.analytics.demographics.countries[viewerInfo.country] || 0) + 1
    }
    
    if (viewerInfo.device) {
      share.analytics.demographics.devices[viewerInfo.device] = 
        (share.analytics.demographics.devices[viewerInfo.device] || 0) + 1
    }
    
    if (viewerInfo.browser) {
      share.analytics.demographics.browsers[viewerInfo.browser] = 
        (share.analytics.demographics.browsers[viewerInfo.browser] || 0) + 1
    }
    
    if (viewerInfo.referrer) {
      share.analytics.demographics.referrers[viewerInfo.referrer] = 
        (share.analytics.demographics.referrers[viewerInfo.referrer] || 0) + 1
    }

    share.lastViewed = new Date()
  }

  function trackProjectView(shareId: string, projectId: string) {
    const share = sharedPortfolios.value.find(s => s.id === shareId)
    if (!share) return

    const existingProject = share.analytics.engagement.mostViewedProjects
      .find(p => p.projectId === projectId)
    
    if (existingProject) {
      existingProject.views++
    } else {
      share.analytics.engagement.mostViewedProjects.push({
        projectId,
        views: 1
      })
    }

    // Sort by views
    share.analytics.engagement.mostViewedProjects.sort((a, b) => b.views - a.views)
  }

  function trackDownload(shareId: string) {
    const share = sharedPortfolios.value.find(s => s.id === shareId)
    if (!share) return

    share.analytics.engagement.downloadCount++
  }

  function trackContactClick(shareId: string) {
    const share = sharedPortfolios.value.find(s => s.id === shareId)
    if (!share) return

    share.analytics.engagement.contactClicks++
  }

  // Export Functions
  async function generateShareableHTML(
    portfolio: Portfolio,
    settings: ShareSettings,
    selectedProjectIds?: string[]
  ): Promise<string> {
    const filteredProjects = selectedProjectIds 
      ? portfolio.projects.filter(p => selectedProjectIds.includes(p.id))
      : portfolio.projects

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.seoSettings.title}</title>
    <meta name="description" content="${settings.seoSettings.description}">
    <meta name="keywords" content="${settings.seoSettings.keywords.join(', ')}">
    ${settings.seoSettings.ogImage ? `<meta property="og:image" content="${settings.seoSettings.ogImage}">` : ''}
    <meta property="og:title" content="${settings.seoSettings.title}">
    <meta property="og:description" content="${settings.seoSettings.description}">
    <meta property="og:type" content="website">
    ${generatePortfolioCSS(settings)}
</head>
<body>
    <div class="portfolio-container">
        ${generatePortfolioHeader(portfolio.personalInfo, settings)}
        ${generateProjectsSection(filteredProjects, settings)}
        ${generateSkillsSection(portfolio.skills, settings)}
        ${settings.showContactInfo ? generateContactSection(portfolio.personalInfo, settings) : ''}
        ${settings.branding.showWatermark ? generateWatermark() : ''}
    </div>
    ${generatePortfolioJS(settings)}
    ${settings.analytics.enableTracking ? generateAnalyticsScript() : ''}
</body>
</html>`
  }

  function generatePortfolioCSS(settings: ShareSettings): string {
    const primaryColor = settings.branding.customColors?.primary || '#6366f1'
    const secondaryColor = settings.branding.customColors?.secondary || '#8b5cf6'

    return `<style>
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
      }
      
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: var(--text-primary);
        background: #f8fafc;
      }
      
      .portfolio-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .portfolio-header {
        text-align: center;
        padding: 4rem 0;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: 1rem;
        margin-bottom: 3rem;
      }
      
      .portfolio-header h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      
      .portfolio-header p {
        font-size: 1.25rem;
        opacity: 0.9;
      }
      
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }
      
      .project-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .project-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      .project-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 1rem;
      }
      
      .project-description {
        color: #666;
        margin-bottom: 1.5rem;
      }
      
      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .tech-tag {
        background: #e0e7ff;
        color: var(--primary-color);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }
      
      .project-links {
        display: flex;
        gap: 1rem;
      }
      
      .project-link {
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .project-link:hover {
        background: var(--secondary-color);
      }
      
      .skills-section {
        background: white;
        padding: 3rem;
        border-radius: 1rem;
        margin-bottom: 3rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      
      .skills-title {
        font-size: 2rem;
        font-weight: 600;
        text-align: center;
        margin-bottom: 2rem;
        color: var(--primary-color);
      }
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 2rem;
      }
      
      .skill-category h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
      
      .skill-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .skill-item {
        background: #f1f5f9;
        color: #475569;
        padding: 0.375rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
      }
      
      .contact-section {
        background: var(--primary-color);
        color: white;
        padding: 3rem;
        border-radius: 1rem;
        text-align: center;
      }
      
      .contact-title {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      
      .contact-links {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .contact-link {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.2s;
      }
      
      .contact-link:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .watermark {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
        font-size: 0.875rem;
      }
      
      @media (max-width: 768px) {
        .portfolio-header h1 { font-size: 2rem; }
        .projects-grid { grid-template-columns: 1fr; }
        .contact-links { flex-direction: column; align-items: center; }
      }
    </style>`
  }

  function generatePortfolioHeader(personalInfo: Portfolio['personalInfo'], settings: ShareSettings): string {
    return `
    <header class="portfolio-header">
      ${settings.branding.customLogo ? `<img src="${settings.branding.customLogo}" alt="Logo" style="height: 60px; margin-bottom: 1rem;">` : ''}
      <h1>${personalInfo.name}</h1>
      <p>${personalInfo.title}</p>
      ${personalInfo.bio ? `<p style="margin-top: 1rem; font-size: 1rem;">${personalInfo.bio}</p>` : ''}
    </header>`
  }

  function generateProjectsSection(projects: PortfolioProject[], _settings: ShareSettings): string {
    const projectCards = projects.map(project => `
      <article class="project-card" data-project-id="${project.id}">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        ${project.technologies.length ? `
          <div class="project-tech">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
        ` : ''}
        <div class="project-links">
          ${project.links.live ? `<a href="${project.links.live}" class="project-link" target="_blank">View Live</a>` : ''}
          ${project.links.github ? `<a href="${project.links.github}" class="project-link" target="_blank">Source Code</a>` : ''}
        </div>
      </article>
    `).join('')

    return `
    <section class="projects-section">
      <div class="projects-grid">
        ${projectCards}
      </div>
    </section>`
  }

  function generateSkillsSection(skills: Portfolio['skills'], _settings: ShareSettings): string {
    return `
    <section class="skills-section">
      <h2 class="skills-title">Skills & Technologies</h2>
      <div class="skills-grid">
        ${skills.primary.length ? `
          <div class="skill-category">
            <h3>Primary Skills</h3>
            <div class="skill-list">
              ${skills.primary.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${skills.secondary.length ? `
          <div class="skill-category">
            <h3>Secondary Skills</h3>
            <div class="skill-list">
              ${skills.secondary.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${skills.tools.length ? `
          <div class="skill-category">
            <h3>Tools & Software</h3>
            <div class="skill-list">
              ${skills.tools.map(tool => `<span class="skill-item">${tool}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>`
  }

  function generateContactSection(personalInfo: Portfolio['personalInfo'], _settings: ShareSettings): string {
    const socialLinks = Object.entries(personalInfo.social)
      .filter(([_, url]) => url)
      .map(([platform, url]) => `
        <a href="${url}" class="contact-link" target="_blank" onclick="trackContactClick()">
          ${platform.charAt(0).toUpperCase() + platform.slice(1)}
        </a>
      `).join('')

    return `
    <section class="contact-section">
      <h2 class="contact-title">Get In Touch</h2>
      <div class="contact-links">
        ${personalInfo.email ? `<a href="mailto:${personalInfo.email}" class="contact-link" onclick="trackContactClick()">Email</a>` : ''}
        ${personalInfo.website ? `<a href="${personalInfo.website}" class="contact-link" target="_blank" onclick="trackContactClick()">Website</a>` : ''}
        ${socialLinks}
      </div>
    </section>`
  }

  function generateWatermark(): string {
    return `
    <footer class="watermark">
      <p>Created with NAVI Portfolio Generator</p>
    </footer>`
  }

  function generatePortfolioJS(_settings: ShareSettings): string {
    return `<script>
      // Track project views
      document.querySelectorAll('.project-card').forEach(card => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const projectId = entry.target.dataset.projectId;
              if (projectId) {
                trackProjectView(projectId);
              }
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(card);
      });
      
      // Track downloads
      function trackDownload() {
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/download', { method: 'POST' }).catch(() => {});
        }
      }
      
      // Track contact clicks
      function trackContactClick() {
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/contact', { method: 'POST' }).catch(() => {});
        }
      }
      
      // Track project views
      function trackProjectView(projectId) {
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/project-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId })
          }).catch(() => {});
        }
      }
    </script>`
  }

  function generateAnalyticsScript(): string {
    return `<script>
      // Basic analytics tracking
      (function() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', function() {
          const viewTime = Date.now() - startTime;
          if (typeof fetch !== 'undefined') {
            fetch('/api/track/view-time', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ viewTime })
            }).catch(() => {});
          }
        });
        
        // Track page view
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referrer: document.referrer,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            })
          }).catch(() => {});
        }
      })();
    </script>`
  }

  // Storage functions
  async function saveSharedPortfolioData(shareId: string, portfolio: Portfolio, settings: ShareSettings) {
    // In a real application, this would save to a backend service
    const shareData = {
      portfolio,
      settings,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem(`shared-portfolio-${shareId}`, JSON.stringify(shareData))
  }

  async function updateSharedPortfolioData(shareId: string, updates: Partial<ShareSettings>) {
    const existingData = localStorage.getItem(`shared-portfolio-${shareId}`)
    if (!existingData) return

    const shareData = JSON.parse(existingData)
    shareData.settings = { ...shareData.settings, ...updates }
    shareData.updatedAt = new Date().toISOString()
    
    localStorage.setItem(`shared-portfolio-${shareId}`, JSON.stringify(shareData))
  }

  async function removeSharedPortfolioData(shareId: string) {
    localStorage.removeItem(`shared-portfolio-${shareId}`)
  }

  function initializeAnalytics(): PortfolioAnalytics {
    return {
      views: {
        total: 0,
        unique: 0,
        daily: {},
        monthly: {}
      },
      demographics: {
        countries: {},
        devices: {},
        browsers: {},
        referrers: {}
      },
      engagement: {
        averageViewTime: 0,
        bounceRate: 0,
        mostViewedProjects: [],
        downloadCount: 0,
        contactClicks: 0
      },
      performance: {
        loadTime: 0,
        mobileScore: 0,
        seoScore: 0,
        accessibilityScore: 0
      }
    }
  }

  return {
    // State
    sharedPortfolios,
    shareSettings,
    loading,
    error,
    
    // Computed
    activeShares,
    totalViews,
    popularShares,
    
    // Functions
    createShare,
    updateShare,
    deactivateShare,
    deleteShare,
    
    // Analytics
    trackView,
    trackProjectView,
    trackDownload,
    trackContactClick,
    
    // Export
    generateShareableHTML
  }
}
