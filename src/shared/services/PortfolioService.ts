import type {
  PortfolioItem,
  PortfolioFilters,
  PortfolioStats,
  PortfolioExportData,
  PortfolioExportOptions,
  PortfolioItemType
} from '../types/portfolio';
import { aiService } from './AIService';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { logger } from '@/shared/utils/logger';

/**
 * Centralized portfolio service for all portfolio-related business logic
 */
export class PortfolioService {
  /**
   * Parse a date string in various formats to a Date object
   */
  static parseItemDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Handle "Month YYYY" format
    const monthYearMatch = /^(\w+)\s+(\d{4})$/.exec(dateStr.trim());
    if (monthYearMatch) {
      const dateTime = Date.parse(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
      return isNaN(dateTime) ? null : new Date(dateTime);
    }
    
    // Fallback to standard Date.parse
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  /**
   * Build a simple PDF bundle with one-pager text per item
   */
  static async exportOnePagersPDF(
    user: { name?: string; email?: string },
    items: PortfolioItem[]
  ): Promise<Uint8Array> {
    const pdf = await PDFDocument.create()
    const font = await pdf.embedFont(StandardFonts.Helvetica)

    const margin = 50
    const lineHeight = 14

    const drawWrappedText = (page: any, text: string, x: number, yStart: number, maxWidth: number) => {
      const words = text.split(/\s+/)
      let line = ''
      let y = yStart
      for (const w of words) {
        const test = line ? line + ' ' + w : w
        const width = font.widthOfTextAtSize(test, 11)
        if (width > maxWidth) {
          page.drawText(line, { x, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) })
          line = w
          y -= lineHeight
        } else {
          line = test
        }
      }
      if (line) {
        page.drawText(line, { x, y, size: 11, font, color: rgb(0.2, 0.2, 0.2) })
        y -= lineHeight
      }
      return y
    }

    for (const item of items) {
      const page = pdf.addPage()
      const { width, height } = page.getSize()
      const contentWidth = width - margin * 2

      // Header
      const title = `${item.title || 'Project'}${item.date ? ' — ' + item.date : ''}`
      page.drawText(title, { x: margin, y: height - margin, size: 18, font, color: rgb(0, 0, 0) })
      let cursor = height - margin - 24
      if (user?.name || user?.email) {
        page.drawText(`${user?.name || ''} ${user?.email ? '<' + user.email + '>' : ''}`.trim(), { x: margin, y: cursor, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
        cursor -= 18
      }

      // Sections
      const addSection = (heading: string) => {
        page.drawText(heading, { x: margin, y: cursor, size: 12, font, color: rgb(0.1, 0.1, 0.1) })
        cursor -= 16
      }

      if (item.description) {
        addSection('Summary')
        cursor = drawWrappedText(page, String(item.description), margin, cursor, contentWidth)
        cursor -= 6
      }

      const listSection = (heading: string, arr?: string[]) => {
        if (!arr || !arr.length) return
        addSection(heading)
        for (const entry of arr) {
          const bullet = '• ' + String(entry)
          cursor = drawWrappedText(page, bullet, margin, cursor, contentWidth)
        }
        cursor -= 6
      }

      listSection('Responsibilities', (item as any).responsibilities)
      listSection('Outcomes / Impact', (item as any).outcomes)
      if ((item as any).skills?.length) {
        addSection('Skills')
        cursor = drawWrappedText(page, (item as any).skills.join(', '), margin, cursor, contentWidth)
        cursor -= 6
      }

      // Footer (links)
      if ((item as any).links?.length) {
        addSection('Links')
        for (const l of (item as any).links.slice(0, 5)) {
          cursor = drawWrappedText(page, `${l.label || l.type || 'Link'}: ${l.url}`, margin, cursor, contentWidth)
        }
      }
    }
    return await pdf.save()
  }

  /**
   * Detect known platform from URL
   */
  static detectPlatform(url: string): 'steam' | 'itch' | 'youtube' | 'github' | 'other' {
    const u = (url || '').toLowerCase()
    if (u.includes('store.steampowered.com/app/')) return 'steam'
    if (u.includes('itch.io')) return 'itch'
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
    if (u.includes('github.com')) return 'github'
    return 'other'
  }

  /** Extract YouTube video ID from URL */
  static parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/')[1] || null
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v')
        if (id) return id
        // Handle /embed/ID
        const m = u.pathname.match(/\/embed\/([\w-]+)/)
        return m ? m[1] : null
      }
    } catch {}
    return null
  }

  static getYouTubeThumb(id: string): string {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }

  /** Extract Steam app id from a store URL */
  static parseSteamAppId(url: string): string | null {
    try {
      const u = new URL(url)
      const m = u.pathname.match(/\/app\/(\d+)/)
      return m ? m[1] : null
    } catch {
      return null
    }
  }

  /** Fetch minimal Steam app details (public endpoint) */
  static async fetchSteamAppDetails(appId: string): Promise<{ title?: string; description?: string; image?: string; site?: string }> {
    try {
      const resp = await fetch(`https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}`)
      const json = await resp.json()
      const entry = json?.[appId]
      const data = entry?.data
      if (!entry?.success || !data) return {}
      const title = data.name
      const description = (data.short_description || '').toString()
      const image = data.header_image
      return { title, description, image, site: 'Steam' }
    } catch {
      return {}
    }
  }

  /**
   * Fetch basic OpenGraph metadata for a URL (best-effort)
   */
  static async fetchLinkMetadata(url: string): Promise<{ title?: string; description?: string; image?: string; site?: string }> {
    try {
      const resp = await fetch(url, { method: 'GET' })
      const html = await resp.text()
      const og = (prop: string) => {
        const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
        const m = html.match(re)
        return m ? m[1] : undefined
      }
      const title = og('og:title') || (html.match(/<title>([^<]+)<\/title>/i)?.[1])
      const description = og('og:description')
      const image = og('og:image')
      const site = og('og:site_name')
      // Fallback for YouTube thumbnails when OG blocked
      if (!image && this.detectPlatform(url) === 'youtube') {
        const id = this.parseYouTubeId(url)
        if (id) {
          return { title, description, image: this.getYouTubeThumb(id), site: site || 'YouTube' }
        }
      }
      return { title, description, image, site }
    } catch {
      return {}
    }
  }

  /**
   * Role templates for responsibilities/outcomes by common game roles
   */
  static roleTemplates: Record<string, { responsibilities: string[]; outcomes: string[]; skills: string[] }> = {
    Programmer: {
      responsibilities: [
        'Implemented gameplay systems and mechanics',
        'Optimized performance and memory usage',
        'Built tooling and pipelines for designers and artists',
        'Integrated platform services (Steamworks, PSN, Xbox Live)'
      ],
      outcomes: [
        'Improved average FPS by 20% across target platforms',
        'Reduced load times by 30% via asset streaming',
        'Shipped two content updates with zero regressions'
      ],
      skills: ['C#', 'C++', 'Unity', 'Unreal Engine', 'Profiling', 'Optimization']
    },
    Designer: {
      responsibilities: [
        'Designed levels, systems, and progression loops',
        'Authored gameplay specs and balanced economies',
        'Iterated using telemetry and playtest feedback'
      ],
      outcomes: [
        'Increased session length by 15% through progression tuning',
        'Raised L7 retention by 8% via onboarding improvements'
      ],
      skills: ['Systems Design', 'Level Design', 'Scripting', 'Balancing']
    },
    Artist: {
      responsibilities: ['Created production-ready art assets', 'Established style guides and pipelines', 'Optimized textures and materials'],
      outcomes: ['Achieved target memory budgets', 'Delivered asset packs on schedule'],
      skills: ['Photoshop', 'Blender/Maya', 'Substance', 'PBR']
    },
    Audio: {
      responsibilities: ['Composed adaptive music', 'Designed SFX', 'Integrated audio middleware (Wwise/FMOD)'],
      outcomes: ['Reduced audio latency by 40ms', 'Shipped reactive music system'],
      skills: ['Wwise', 'FMOD', 'Mixing', 'Implementation']
    },
    Producer: {
      responsibilities: ['Coordinated cross-discipline schedules', 'Managed sprint planning and risk tracking', 'Facilitated playtests and triage'],
      outcomes: ['Delivered milestones on time', 'Reduced open bugs by 35% before alpha'],
      skills: ['Agile', 'Scheduling', 'Communication']
    }
  }

  /** Engine templates (augmentations) */
  static engineTemplates: Record<string, { responsibilities?: string[]; outcomes?: string[]; skills?: string[] }> = {
    'Unity': {
      responsibilities: ['Authored C# gameplay scripts', 'Implemented ScriptableObject-driven content', 'Optimized GC allocations and draw calls'],
      outcomes: ['Reduced allocations by 40%', 'Stabilized frame pacing on mid-tier devices'],
      skills: ['C#', 'Burst/Jobs', 'ScriptableObjects', 'URP']
    },
    'Unreal Engine': {
      responsibilities: ['Developed gameplay in C++ and Blueprints', 'Created tooling/editor utilities', 'Optimized replication/netcode'],
      outcomes: ['Cut replication bandwidth by 25%', 'Shipped networked feature with deterministic behavior'],
      skills: ['C++', 'Blueprints', 'Replication', 'Niagara']
    }
  }

  /** Build a static HTML page for a portfolio */
  static prepareStaticSite(user: { name?: string; email?: string }, items: PortfolioItem[]): string {
    const escape = (s: string = '') => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]!))
    const cards = items.map(i => `
      <article class="card">
        <h3>${escape(i.title || 'Untitled')}</h3>
        <p class="meta">${escape(i.type || '')}${i.date ? ' • ' + escape(i.date) : ''}</p>
        ${i.image ? `<img src="${escape(i.image)}" alt="${escape(i.title)}"/>` : ''}
        ${i.description ? `<p>${escape(i.description)}</p>` : ''}
        ${i.skills?.length ? `<div class="tags">${i.skills.slice(0,8).map(s=>`<span>${escape(s)}</span>`).join('')}</div>` : ''}
      </article>
    `).join('\n')
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escape(user.name || 'Portfolio')}</title>
  <style>
    body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto;color:#e5e7eb;background:#0b0f1a;margin:0}
    header{padding:32px 24px;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-bottom:1px solid rgba(255,255,255,.08)}
    h1{margin:0 0 8px;font-size:28px;color:#fff}
    .subtitle{color:#a3a3a3}
    main{max-width:1100px;margin:0 auto;padding:24px;display:grid;gap:24px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
    .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px}
    .card h3{margin:0 0 6px;color:#fff}
    .card .meta{color:#9ca3af;font-size:12px;margin-bottom:8px}
    .card img{width:100%;height:auto;border-radius:8px;margin:8px 0}
    .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    .tags span{background:rgba(124,58,237,.25);border:1px solid rgba(124,58,237,.35);color:#ddd;padding:2px 8px;border-radius:999px;font-size:12px}
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  </head>
<body>
  <header>
    <h1>${escape(user.name || 'Portfolio')}</h1>
    ${user.email ? `<div class="subtitle">${escape(user.email)}</div>` : ''}
  </header>
  <main>${cards}</main>
</body>
</html>`
  }

  /**
   * Prepare a one-pager export (Markdown) for a portfolio project
   */
  static prepareOnePager(item: PortfolioItem, user: { name: string; email?: string }): string {
    const lines: string[] = []
    lines.push(`# ${item.title || 'Project'} — One-Pager`)
    lines.push('')
    lines.push(`Author: ${user.name}${user.email ? ` <${user.email}>` : ''}`)
    if (item.role) lines.push(`Role: ${item.role}`)
    if (item.engines?.length) lines.push(`Engines: ${item.engines.join(', ')}`)
    if (item.platforms?.length) lines.push(`Platforms: ${item.platforms.join(', ')}`)
    lines.push('')
    if (item.description) {
      lines.push('## Summary')
      lines.push(item.description)
      lines.push('')
    }
    if (item.responsibilities?.length) {
      lines.push('## Responsibilities')
      item.responsibilities.forEach(r => lines.push(`- ${r}`))
      lines.push('')
    }
    if (item.outcomes?.length) {
      lines.push('## Outcomes / Impact')
      item.outcomes.forEach(o => lines.push(`- ${o}`))
      lines.push('')
    }
    if (item.skills?.length) {
      lines.push('## Skills')
      lines.push(item.skills.join(', '))
      lines.push('')
    }
    if (item.links?.length) {
      lines.push('## Links')
      item.links.forEach(l => lines.push(`- [${l.label || l.type || 'Link'}](${l.url})`))
      lines.push('')
    }
    return lines.join('\n')
  }

  /**
   * Filter portfolio items based on provided criteria
   */
  static filterItems(items: PortfolioItem[], filters: Partial<PortfolioFilters>): PortfolioItem[] {
    let filtered = [...items];

    // Featured filter
    if (filters.showFeaturedOnly) {
      filtered = filtered.filter(item => item.featured);
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Skill filters
    if (filters.skillFilters?.length) {
      filtered = filtered.filter(item => 
        filters.skillFilters!.every(skill => 
          (item.skills || []).includes(skill)
        )
      );
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
      
      filtered = filtered.filter(item => {
        const itemDate = this.parseItemDate(item.date);
        if (!itemDate) return true;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate) {
          const endOfMonth = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
          if (itemDate > endOfMonth) return false;
        }
        return true;
      });
    }

    // Search query filter
    if (filters.searchQuery?.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.game?.toLowerCase().includes(query) ||
        (item.skills || []).some(skill => skill.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  /**
   * Sort portfolio items by specified mode
   */
  static sortItems(items: PortfolioItem[], sortMode: string = 'recent'): PortfolioItem[] {
    const sorted = [...items];

    switch (sortMode) {
      case 'alphabetical':
        return sorted.sort((a, b) => 
          (a.title || '').localeCompare(b.title || '')
        );
      
      case 'type':
        return sorted.sort((a, b) => {
          const typeCompare = (a.type || '').localeCompare(b.type || '');
          return typeCompare !== 0 ? typeCompare : 
            (a.title || '').localeCompare(b.title || '');
        });
      
      case 'featured':
        return sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (this.parseItemDate(b.date)?.getTime() || 0) -
                 (this.parseItemDate(a.date)?.getTime() || 0);
        });
      
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const dateA = this.parseItemDate(a.date)?.getTime() || 0;
          const dateB = this.parseItemDate(b.date)?.getTime() || 0;
          return dateB - dateA;
        });
    }
  }

  /**
   * Generate portfolio statistics
   */
  static generateStats(items: PortfolioItem[]): PortfolioStats {
    const skillCounts = new Map<string, number>();
    const typeCounts: Record<string, number> = {};
    const games = new Set<string>();

    items.forEach(item => {
      // Count skills
      (item.skills || []).forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });

      // Count types
      if (item.type) {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      }

      // Track games
      if (item.game) {
        games.add(item.game);
      }
    });

    const topSkills = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    const recentActivity = this.sortItems(items, 'recent').slice(0, 5);

    const featuredCount = items.filter(item => item.featured).length;
    const totalProjects = items.filter(item => item.type === 'project').length;
    const totalClips = items.filter(item => item.type === 'clip').length;
    const totalAchievements = items.filter(item => item.type === 'achievement').length;

    return {
      totalItems: items.length,
      featuredItems: featuredCount,
      skillsCount: skillCounts.size,
      gamesCount: games.size,
      typeBreakdown: typeCounts as Record<PortfolioItemType, number>,
      topSkills,
      recentActivity,
      // Template compatibility properties
      totalProjects,
      totalClips,
      totalAchievements,
      featuredCount,
      recentItemsCount: recentActivity.length,
      completionRate: items.length > 0 ? Math.round((featuredCount / items.length) * 100) : 0,
      itemsByType: typeCounts
    };
  }

  /**
   * Validate portfolio item data
   */
  static validateItem(item: Partial<PortfolioItem>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.title?.trim()) {
      errors.push('Title is required');
    }

    if (!item.description?.trim()) {
      errors.push('Description is required');
    }

    if (!item.type) {
      errors.push('Type is required');
    }

    if (!item.date?.trim()) {
      errors.push('Date is required');
    } else if (!this.parseItemDate(item.date)) {
      errors.push('Invalid date format');
    }

    if (item.url && !this.isValidUrl(item.url)) {
      errors.push('Invalid URL format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare export data
   */
  static prepareExportData(
    items: PortfolioItem[],
    user: { name: string; email?: string },
    options: PortfolioExportOptions
  ): PortfolioExportData {
    let portfolioItems = [...items];
    
    if (options.includeFeaturedOnly) {
      portfolioItems = portfolioItems.filter(item => item.featured);
    }

    return {
      user,
      portfolio: portfolioItems,
      stats: this.generateStats(portfolioItems),
      exportedAt: new Date().toISOString(),
      settings: {
        layout: 'grid',
        showAnalytics: options.includeAnalytics ?? true,
        autoSave: true
      }
    };
  }

  /**
   * Generate unique ID for portfolio items
   */
  static generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Create new portfolio item with defaults
   */
  static createItem(data: Partial<PortfolioItem>): PortfolioItem {
    const now = new Date().toISOString();
    
    return {
      id: this.generateId(),
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'achievement',
      game: data.game || '',
      skills: data.skills || [],
      date: data.date || new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      featured: data.featured || false,
      url: data.url,
      thumbnail: data.thumbnail,
      metrics: data.metrics,
      createdAt: now,
      updatedAt: now,
      ...data
    };
  }

  /**
   * Reorder items using drag and drop indices
   */
  static reorderItems(items: PortfolioItem[], fromIndex: number, toIndex: number): PortfolioItem[] {
    const reordered = [...items];
    const [movedItem] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movedItem);
    return reordered;
  }

  /**
   * Extract common skills across portfolio items
   */
  static extractCommonSkills(items: PortfolioItem[]): string[] {
    const skillCounts = new Map<string, number>();
    
    items.forEach(item => {
      (item.skills || []).forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });

    return Array.from(skillCounts.entries())
      .filter(([_, count]) => count >= Math.max(2, items.length * 0.3))
      .map(([skill]) => skill)
      .slice(0, 20);
  }

  /**
   * Simple URL validation
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate AI-powered portfolio recommendations
   */
  static async generateAIRecommendations(
    userProfile: any,
    currentPortfolio: PortfolioItem[],
    targetRole?: string
  ): Promise<{
    suggestions: Array<{
      type: PortfolioItemType;
      title: string;
      description: string;
      skills: string[];
      reasoning: string;
    }>;
    improvements: Array<{
      itemId?: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    missingElements: string[];
  }> {
    try {
      // Initialize AI service if needed
      await aiService.initialize({
        primaryProvider: 'google',
        enableContextPersistence: true,
        enableRealTime: false
      });

      const contextInfo = `USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

CURRENT PORTFOLIO:
${JSON.stringify(currentPortfolio, null, 2)}

TARGET ROLE: ${targetRole || 'Gaming Industry Professional'}

Analyze the user's gaming background and current portfolio to suggest improvements and new portfolio items that would strengthen their application for gaming industry roles.`;

      const response = await aiService.chat({
        message: `Analyze this gaming professional's portfolio and suggest improvements and new items that would showcase their gaming skills for ${targetRole || 'industry'} roles.`,
        context: contextInfo,
        type: 'analysis'
      });

      // Parse AI response into structured recommendations
      return this.parseAIRecommendations(response.content);

    } catch (error) {
      logger.error('Failed to generate AI portfolio recommendations:', error);
      return this.getFallbackRecommendations(currentPortfolio, targetRole);
    }
  }

  /**
   * Parse AI response into structured recommendations
   */
  private static parseAIRecommendations(aiResponse: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(aiResponse);
    } catch {
      // Fallback: extract recommendations from text
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      const suggestions = [];
      const improvements = [];
      const missingElements = [];

      let currentSection = '';
      
      for (const line of lines) {
        if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('add')) {
          currentSection = 'suggestions';
        } else if (line.toLowerCase().includes('improve') || line.toLowerCase().includes('enhance')) {
          currentSection = 'improvements';
        } else if (line.toLowerCase().includes('missing') || line.toLowerCase().includes('lack')) {
          currentSection = 'missing';
        }

        const trimmed = line.replace(/^[\d\-*+•]\s*/, '').trim();
        
        if (trimmed.length > 10) {
          switch (currentSection) {
            case 'suggestions':
              suggestions.push({
                type: 'project',
                title: trimmed.substring(0, 50),
                description: trimmed,
                skills: ['Gaming', 'Leadership'],
                reasoning: 'AI suggested based on profile analysis'
              });
              break;
            case 'improvements':
              improvements.push({
                suggestion: trimmed,
                priority: 'medium'
              });
              break;
            case 'missing':
              missingElements.push(trimmed);
              break;
          }
        }
      }

      return { suggestions, improvements, missingElements };
    }
  }

  /**
   * Get fallback recommendations when AI fails
   */
  private static getFallbackRecommendations(currentPortfolio: PortfolioItem[], targetRole?: string): any {
    const hasProjects = currentPortfolio.some(item => item.type === 'project');
    const hasAchievements = currentPortfolio.some(item => item.type === 'achievement');
    const hasLeadership = currentPortfolio.some(item => 
      item.description?.toLowerCase().includes('lead') || 
      item.description?.toLowerCase().includes('manage')
    );

    const suggestions = [];
    const improvements = [];
    const missingElements = [];

    if (!hasProjects) {
      suggestions.push({
        type: 'project',
        title: 'Gaming Community Project',
        description: 'Document a community building or moderation project that showcases leadership skills',
        skills: ['Community Management', 'Leadership', 'Communication'],
        reasoning: 'Projects demonstrate practical application of skills'
      });
    }

    if (!hasAchievements) {
      suggestions.push({
        type: 'achievement',
        title: 'Competitive Gaming Achievement',
        description: 'Highlight your highest rank or tournament placement in competitive gaming',
        skills: ['Competitive Gaming', 'Performance Under Pressure', 'Strategic Thinking'],
        reasoning: 'Achievements show concrete results and dedication'
      });
    }

    if (!hasLeadership) {
      improvements.push({
        suggestion: 'Add examples of leadership or team coordination from gaming experiences',
        priority: 'high'
      });
    }

    if (currentPortfolio.length < 3) {
      missingElements.push('Portfolio needs more items to demonstrate range of experience');
    }

    return { suggestions, improvements, missingElements };
  }

  /**
   * Generate AI-powered portfolio item descriptions
   */
  static async enhanceItemDescription(
    item: Partial<PortfolioItem>,
    userProfile: any,
    targetRole?: string
  ): Promise<string> {
    try {
      await aiService.initialize({
        primaryProvider: 'google',
        enableContextPersistence: true,
        enableRealTime: false
      });

      const contextInfo = `PORTFOLIO ITEM:
Title: ${item.title}
Current Description: ${item.description}
Type: ${item.type}
Game: ${item.game}
Skills: ${item.skills?.join(', ')}

USER PROFILE: ${JSON.stringify(userProfile)}
TARGET ROLE: ${targetRole || 'Gaming Professional'}

Enhance this portfolio item description to better showcase transferable skills and gaming industry relevance.`;

      const response = await aiService.chat({
        message: `Rewrite this portfolio item description to be more compelling and highlight transferable skills for ${targetRole || 'gaming industry'} roles. Focus on impact, skills, and professional growth.`,
        context: contextInfo,
        type: 'generation'
      });

      return response.content || item.description || '';
    } catch (error) {
      logger.error('Failed to enhance item description:', error);
      return item.description || '';
    }
  }
}
