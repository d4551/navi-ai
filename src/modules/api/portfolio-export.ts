/**
 * Portfolio Export API - Centralized portfolio generation and export
 * Single source of truth for portfolio export functionality
 */

import { logger } from '@/shared/utils/logger'
import type { PortfolioProject } from '@/shared/types/portfolio'

export interface PortfolioExportRequest {
  projects: PortfolioProject[]
  format: 'pdf' | 'zip' | 'html' | 'json' | 'website'
  options?: PortfolioExportOptions
}

export interface PortfolioExportOptions {
  template?: 'modern' | 'gaming' | 'minimal' | 'showcase'
  theme?: 'light' | 'dark' | 'gaming' | 'neon'
  includeImages?: boolean
  includeSource?: boolean
  includeReadme?: boolean
  customCSS?: string
  metadata?: {
    author?: string
    title?: string
    description?: string
    website?: string
    social?: Record<string, string>
  }
}

export interface PortfolioExportResponse {
  success: boolean
  url?: string
  blob?: Blob
  filename?: string
  error?: string
  metadata?: {
    format: string
    size: number
    projectCount: number
    generatedAt: string
    template?: string
  }
}

/**
 * Portfolio Export Service - Single source of truth for portfolio generation
 */
export class PortfolioExportService {
  private static instance: PortfolioExportService

  static getInstance(): PortfolioExportService {
    if (!PortfolioExportService.instance) {
      PortfolioExportService.instance = new PortfolioExportService()
    }
    return PortfolioExportService.instance
  }

  /**
   * Export portfolio to specified format
   */
  async exportPortfolio(
    request: PortfolioExportRequest
  ): Promise<PortfolioExportResponse> {
    try {
      logger.info(
        `Exporting portfolio to ${request.format} with ${request.projects.length} projects`
      )

      switch (request.format) {
        case 'pdf':
          return await this.exportToPDF(request.projects, request.options)

        case 'html':
          return await this.exportToHTML(request.projects, request.options)

        case 'website':
          return await this.exportToWebsite(request.projects, request.options)

        case 'json':
          return await this.exportToJSON(request.projects, request.options)

        case 'zip':
          return await this.exportToZip(request.projects, request.options)

        default:
          throw new Error(`Unsupported export format: ${request.format}`)
      }
    } catch (error) {
      logger.error('Portfolio export failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      }
    }
  }

  /**
   * Export portfolio as PDF showcase
   */
  private async exportToPDF(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    try {
      const htmlTemplate = this.generatePortfolioHTML(projects, options)

      // Use Electron PDF generation if available
      if (
        typeof window !== 'undefined' &&
        (window as any).electronAPI?.portfolio?.exportPDF
      ) {
        const result = await (window as any).electronAPI.portfolio.exportPDF({
          html: htmlTemplate,
          options: {
            format: 'A4',
            landscape: true,
            margin: {
              top: '20px',
              right: '20px',
              bottom: '20px',
              left: '20px',
            },
            displayHeaderFooter: true,
            headerTemplate: this.generatePDFHeader(options),
            footerTemplate: this.generatePDFFooter(options),
            printBackground: true,
          },
        })

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], { type: 'application/pdf' }),
            filename: this.generateFilename('portfolio', 'pdf', options),
            metadata: {
              format: 'pdf',
              size: result.buffer.length,
              projectCount: projects.length,
              generatedAt: new Date().toISOString(),
              template: options?.template,
            },
          }
        }
        throw new Error(result.error)
      }

      // Fallback to browser PDF generation
      return await this.generatePDFInBrowser(htmlTemplate, projects, options)
    } catch (error) {
      throw new Error(
        `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export portfolio as standalone HTML
   */
  private async exportToHTML(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    try {
      const htmlContent = this.generatePortfolioHTML(projects, options, true)
      const blob = new Blob([htmlContent], { type: 'text/html' })

      return {
        success: true,
        blob,
        filename: this.generateFilename('portfolio', 'html', options),
        metadata: {
          format: 'html',
          size: blob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      }
    } catch (error) {
      throw new Error(
        `HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export portfolio as complete website
   */
  private async exportToWebsite(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    try {
      // Create a complete website structure
      const files = await this.generateWebsiteFiles(projects, options)

      // Create ZIP with website structure
      const zipBlob = await this.createZipFromFiles(files)

      return {
        success: true,
        blob: zipBlob,
        filename: this.generateFilename('portfolio-website', 'zip', options),
        metadata: {
          format: 'website',
          size: zipBlob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      }
    } catch (error) {
      throw new Error(
        `Website export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export portfolio as JSON
   */
  private async exportToJSON(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    try {
      const portfolioData = {
        metadata: {
          title: options?.metadata?.title || 'Gaming Portfolio',
          author: options?.metadata?.author,
          description: options?.metadata?.description,
          generatedAt: new Date().toISOString(),
          exportedBy: 'NAVI Gaming Jobseeker Platform',
          version: '1.0',
        },
        projects: projects.map(project => ({
          ...project,
          // Add gaming-specific metadata
          gamingMetadata: {
            platforms: this.extractPlatforms(project.description),
            gameEngines: this.extractGameEngines(project.description),
            genres: this.extractGenres(project.description),
          },
        })),
        settings: {
          template: options?.template,
          theme: options?.theme,
          includeImages: options?.includeImages,
          includeSource: options?.includeSource,
        },
      }

      const jsonContent = JSON.stringify(portfolioData, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })

      return {
        success: true,
        blob,
        filename: this.generateFilename('portfolio-data', 'json', options),
        metadata: {
          format: 'json',
          size: blob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(
        `JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export portfolio as ZIP archive
   */
  private async exportToZip(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    try {
      const files: Record<string, Blob | string> = {}

      // Add HTML portfolio
      files['index.html'] = this.generatePortfolioHTML(projects, options, true)

      // Add project pages
      projects.forEach(project => {
        files[`projects/${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`] =
          this.generateProjectHTML(project, options)
      })

      // Add CSS files
      files['assets/styles.css'] = this.generatePortfolioCSS(
        options?.template,
        options?.theme
      )

      // Add JavaScript if needed
      files['assets/portfolio.js'] = this.generatePortfolioJS(options)

      // Add README
      if (options?.includeReadme !== false) {
        files['README.md'] = this.generateReadme(projects, options)
      }

      // Add project assets if requested
      if (options?.includeImages !== false) {
        await this.addProjectAssets(files, projects)
      }

      const zipBlob = await this.createZipFromFiles(files)

      return {
        success: true,
        blob: zipBlob,
        filename: this.generateFilename('portfolio-archive', 'zip', options),
        metadata: {
          format: 'zip',
          size: zipBlob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      }
    } catch (error) {
      throw new Error(
        `ZIP export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate portfolio HTML template
   */
  private generatePortfolioHTML(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
    standalone = false
  ): string {
    const template = options?.template || 'modern'
    const theme = options?.theme || 'light'
    const metadata = options?.metadata || {}

    const mdiLink = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">`
    const cssContent = standalone
      ? `${mdiLink}<style>${this.generatePortfolioCSS(template, theme)}</style>`
      : `${mdiLink}<link rel="stylesheet" href="assets/styles.css">`

    const jsContent = standalone
      ? `<script>${this.generatePortfolioJS(options)}</script>`
      : `<script src="assets/portfolio.js"></script>`

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.title || 'Gaming Portfolio'}</title>
    <meta name="description" content="${metadata.description || 'Professional gaming industry portfolio'}">
    <meta name="author" content="${metadata.author || ''}">
    ${cssContent}
</head>
<body class="portfolio-template-${template} theme-${theme}">
    <div class="portfolio-container">
        ${this.generatePortfolioHeader(metadata)}
        ${this.generateProjectGrid(projects, options)}
        ${this.generatePortfolioFooter(metadata)}
    </div>
    ${jsContent}
</body>
</html>`
  }

  /**
   * Generate individual project HTML
   */
  private generateProjectHTML(
    project: PortfolioProject,
    options?: PortfolioExportOptions
  ): string {
    const template = options?.template || 'modern'
    const theme = options?.theme || 'light'

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Gaming Portfolio</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body class="portfolio-template-${template} theme-${theme}">
    <div class="project-detail-container">
        <nav class="project-nav">
            <a href="../index.html" class="back-link">← Back to Portfolio</a>
        </nav>
        
        <header class="project-header">
            <h1>${project.title}</h1>
            ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-hero">` : ''}
        </header>
        
        <main class="project-content">
            <section class="project-description">
                <h2>Description</h2>
                <p>${project.description}</p>
            </section>
            
            ${
              project.technologies?.length
                ? `
            <section class="project-technologies">
                <h2>Technologies Used</h2>
                <div class="tech-tags">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </section>
            `
                : ''
            }
            
            <section class="project-links">
                <h2>Project Links</h2>
                <div class="project-buttons">
                    ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">View Live</a>` : ''}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">View Source</a>` : ''}
                </div>
            </section>
            
            <section class="project-gaming-info">
                <h2>Gaming Details</h2>
                <div class="gaming-metadata">
                    <div class="gaming-detail">
                        <strong>Platforms:</strong> ${this.extractPlatforms(project.description).join(', ') || 'Not specified'}
                    </div>
                    <div class="gaming-detail">
                        <strong>Game Engines:</strong> ${this.extractGameEngines(project.description).join(', ') || 'Not specified'}
                    </div>
                    <div class="gaming-detail">
                        <strong>Genres:</strong> ${this.extractGenres(project.description).join(', ') || 'Not specified'}
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`
  }

  /**
   * Generate portfolio header
   */
  private generatePortfolioHeader(metadata: any): string {
    return `
      <header class="portfolio-header">
        <div class="hero-section">
          <h1>${metadata.title || 'Gaming Portfolio'}</h1>
          ${metadata.author ? `<h2 class="author-name">${metadata.author}</h2>` : ''}
          ${metadata.description ? `<p class="portfolio-description">${metadata.description}</p>` : ''}
        </div>
        
        ${
          metadata.social
            ? `
        <div class=\"social-links\">
          ${Object.entries(metadata.social)
            .map(
              ([platform, url]) =>
                `<a href=\"${url}\" class=\"social-link ${platform}\" target=\"_blank\">${platform}</a>`
            )
            .join('')}
        </div>
        `
            : ''
        }
      </header>
    `
  }

  /**
   * Generate project grid
   */
  private generateProjectGrid(
    projects: PortfolioProject[],
    _options?: PortfolioExportOptions
  ): string {
    const projectCards = projects
      .map(
        project => `
      <div class="project-card" data-category="${this.getProjectCategory(project)}">
        ${
          project.image
            ? `
          <div class="project-image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
          </div>
        `
            : ''
        }
        
        <div class="project-info">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          
          ${
            project.technologies?.length
              ? `
            <div class="project-tech">
              ${project.technologies
                .slice(0, 5)
                .map(tech => `<span class="tech-tag">${tech}</span>`)
                .join('')}
              ${project.technologies.length > 5 ? `<span class="tech-more">+${project.technologies.length - 5} more</span>` : ''}
            </div>
          `
              : ''
          }
          
          <div class="project-actions">
            ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">View Live</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">Source</a>` : ''}
          </div>
          
          <div class="project-metadata">
            <div class="gaming-badges">
              ${this.extractPlatforms(project.description)
                .map(
                  platform =>
                    `<span class="badge platform-badge">${platform}</span>`
                )
                .join('')}
              ${this.extractGameEngines(project.description)
                .map(
                  engine => `<span class="badge engine-badge">${engine}</span>`
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join('')

    return `
      <main class="portfolio-main">
        <div class="projects-filter">
          <button class="filter-btn active" data-filter="all">All Projects</button>
          <button class="filter-btn" data-filter="games">Games</button>
          <button class="filter-btn" data-filter="tools">Tools</button>
          <button class="filter-btn" data-filter="web">Web</button>
        </div>
        
        <div class="projects-grid">
          ${projectCards}
        </div>
      </main>
    `
  }

  /**
   * Generate portfolio footer
   */
  private generatePortfolioFooter(metadata: any): string {
    const currentYear = new Date().getFullYear()
    return `
      <footer class="portfolio-footer">
        <div class="footer-content">
          <p>&copy; ${currentYear} ${metadata.author || 'Gaming Portfolio'}. Created with NAVI Gaming Jobseeker Platform.</p>
          ${metadata.website ? `<p><a href="${metadata.website}" target="_blank">Visit Website</a></p>` : ''}
        </div>
      </footer>
    `
  }

  /**
   * Generate portfolio CSS
   */
  private generatePortfolioCSS(template?: string, theme?: string): string {
    const baseCSS = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
      .portfolio-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
      .portfolio-header { text-align: center; margin-bottom: 4rem; }
      .hero-section h1 { font-size: 3rem; margin-bottom: 1rem; }
      .author-name { font-size: 1.5rem; color: #666; margin-bottom: 1rem; }
      .portfolio-description { font-size: 1.1rem; color: #777; max-width: 600px; margin: 0 auto; }
      .social-links { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; }
      .social-link { padding: 0.5rem 1rem; background: #f0f0f0; border-radius: 25px; text-decoration: none; color: #333; }
      .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
      .project-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); transition: transform 0.3s; }
      .project-card:hover { transform: translateY(-8px); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
      .project-image img { width: 100%; height: 200px; object-fit: cover; }
      .project-info { padding: 1.5rem; }
      .project-title { font-size: 1.3rem; margin-bottom: 1rem; color: #333; }
      .project-description { color: #666; margin-bottom: 1rem; }
      .tech-tag { background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.85rem; margin-right: 0.5rem; }
      .project-actions { display: flex; gap: 0.5rem; margin: 1rem 0; }
      /* Glasmorphic buttons for exported HTML */
      .btn { 
        padding: 0.5rem 1rem; 
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 10px; 
        text-decoration: none; 
        font-weight: 600; 
        cursor: pointer; 
        background: rgba(255,255,255,0.72);
        color: #111827;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35);
        backdrop-filter: blur(12px) saturate(1.1);
        -webkit-backdrop-filter: blur(12px) saturate(1.1);
        transition: all .18s ease-out;
      }
      .btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
      .btn:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.10); }
      .btn-primary { 
        background: linear-gradient(135deg, rgba(25,118,210,0.18), rgba(25,118,210,0.08));
        border-color: rgba(25,118,210,0.45);
        color: #0b1e3a;
      }
      .btn-secondary {
        background: linear-gradient(135deg, rgba(107,114,128,0.18), rgba(107,114,128,0.08));
        border-color: rgba(107,114,128,0.35);
        color: #1f2937;
      }
      .gaming-badges { margin-top: 1rem; }
      .badge { padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-right: 0.25rem; }
      .platform-badge { background: #4caf50; color: white; }
      .engine-badge { background: #ff9800; color: white; }
      .projects-filter { text-align: center; margin-bottom: 2rem; }
      .filter-btn { 
        padding: 0.5rem 1rem; margin: 0 0.25rem; 
        border: 1px solid rgba(0,0,0,0.08); 
        background: rgba(255,255,255,0.7); 
        border-radius: 999px; 
        cursor: pointer; 
        backdrop-filter: blur(10px) saturate(1.1); 
        -webkit-backdrop-filter: blur(10px) saturate(1.1); 
        transition: all .18s ease-out;
      }
      .filter-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }
      .filter-btn.active { background: rgba(25,118,210,0.18); color: #0b1e3a; border-color: rgba(25,118,210,0.45); }
      .portfolio-footer { text-align: center; margin-top: 4rem; padding: 2rem; border-top: 1px solid #eee; color: #666; }
    `

    const templateCSS = {
      gaming: `
        body { background: #0a0a0a; color: #00ff00; }
        .portfolio-header h1 { color: #00ffff; text-shadow: 0 0 20px #00ffff; }
        .project-card { background: #1a1a1a; border: 1px solid #333; color: #fff; }
        .tech-tag { background: #ff6b6b; color: #000; }
      `,
      minimal: `
        body { background: #fafafa; }
        .project-card { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .portfolio-header h1 { font-weight: 300; }
      `,
      showcase: `
        .projects-grid { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
        .project-card { min-height: 400px; }
        .project-image img { height: 250px; }
      `,
    }

    const themeCSS = {
      dark: `
        body { background: #121212; color: #fff; }
        .project-card { background: #1e1e1e; color: #fff; }
        .social-link { background: #333; color: #fff; }
      `,
    }

    return (
      baseCSS +
      (templateCSS[template as keyof typeof templateCSS] || '') +
      (themeCSS[theme as keyof typeof themeCSS] || '')
    )
  }

  /**
   * Generate portfolio JavaScript
   */
  private generatePortfolioJS(_options?: PortfolioExportOptions): string {
    return `
      document.addEventListener('DOMContentLoaded', function() {
        // Project filtering
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
              if (filter === 'all') {
                card.style.display = 'block';
              } else {
                const category = card.dataset.category;
                card.style.display = category === filter ? 'block' : 'none';
              }
            });
          });
        });
        
        // Smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
            });
          });
        });
        
        // Add loading states for external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
          link.addEventListener('click', function() {
            this.style.opacity = '0.7';
            this.textContent = 'Opening...';
            setTimeout(() => {
              this.style.opacity = '1';
              this.textContent = this.dataset.originalText || this.textContent;
            }, 1000);
          });
        });
      });
    `
  }

  /**
   * Utility methods for extracting gaming-specific information
   */
  private extractPlatforms(description: string): string[] {
    const platforms = [
      'PC',
      'Console',
      'Mobile',
      'VR',
      'AR',
      'Web',
      'Switch',
      'PlayStation',
      'Xbox',
      'Steam',
    ]
    return platforms.filter(platform =>
      description.toLowerCase().includes(platform.toLowerCase())
    )
  }

  private extractGameEngines(description: string): string[] {
    const engines = [
      'Unity',
      'Unreal Engine',
      'Godot',
      'GameMaker',
      'Construct',
      'RPG Maker',
      'Custom Engine',
    ]
    return engines.filter(engine =>
      description.toLowerCase().includes(engine.toLowerCase())
    )
  }

  private extractGenres(description: string): string[] {
    const genres = [
      'RPG',
      'FPS',
      'Strategy',
      'Puzzle',
      'Platformer',
      'Racing',
      'Sports',
      'Horror',
      'Adventure',
    ]
    return genres.filter(genre =>
      description.toLowerCase().includes(genre.toLowerCase())
    )
  }

  private getProjectCategory(project: PortfolioProject): string {
    const description = project.description.toLowerCase()
    const tech = project.technologies?.join(' ').toLowerCase() || ''

    if (
      description.includes('game') ||
      description.includes('unity') ||
      description.includes('unreal')
    ) {
      return 'games'
    }
    if (
      description.includes('tool') ||
      description.includes('editor') ||
      description.includes('utility')
    ) {
      return 'tools'
    }
    if (
      tech.includes('react') ||
      tech.includes('vue') ||
      tech.includes('web') ||
      description.includes('website')
    ) {
      return 'web'
    }
    return 'games' // Default to games for gaming portfolio
  }

  private getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      github: 'github',
      linkedin: 'linkedin',
      twitter: 'twitter',
      instagram: 'instagram',
      website: 'web',
      portfolio: 'briefcase',
      email: 'email',
    }
    return icons[platform.toLowerCase()] || 'link'
  }

  /**
   * Generate website files structure
   */
  private async generateWebsiteFiles(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<Record<string, string | Blob>> {
    const files: Record<string, string | Blob> = {}

    // Main index.html
    files['index.html'] = this.generatePortfolioHTML(projects, options, false)

    // Individual project pages
    projects.forEach(project => {
      const filename = `projects/${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`
      files[filename] = this.generateProjectHTML(project, options)
    })

    // Assets
    files['assets/styles.css'] = this.generatePortfolioCSS(
      options?.template,
      options?.theme
    )
    files['assets/portfolio.js'] = this.generatePortfolioJS(options)

    // Config files
    files['package.json'] = JSON.stringify(
      {
        name: 'gaming-portfolio',
        version: '1.0.0',
        description: 'Gaming industry portfolio website',
        scripts: {
          serve: 'python -m http.server 8000',
          'serve-node': 'npx http-server',
        },
      },
      null,
      2
    )

    // README
    files['README.md'] = this.generateReadme(projects, options)

    return files
  }

  /**
   * Create ZIP from files
   */
  private async createZipFromFiles(
    files: Record<string, string | Blob>
  ): Promise<Blob> {
    // Simple ZIP implementation - in production, use JSZip library
    // For now, return a single file archive
    const content = Object.entries(files)
      .map(
        ([filename, content]) =>
          `=== ${filename} ===\n${typeof content === 'string' ? content : '[BINARY FILE]'}\n\n`
      )
      .join('')

    return new Blob([content], { type: 'application/zip' })
  }

  /**
   * Generate README for portfolio
   */
  private generateReadme(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): string {
    const metadata = options?.metadata || {}

    return `# ${metadata.title || 'Gaming Portfolio'}

${metadata.description ? `${metadata.description}\n\n` : ''}

## Projects

This portfolio contains ${projects.length} projects showcasing gaming industry expertise:

${projects
  .map(
    (project, index) => `
${index + 1}. **${project.title}**
   - ${project.description}
   ${project.technologies?.length ? `   - Technologies: ${project.technologies.join(', ')}` : ''}
   ${project.liveUrl ? `   - [View Live](${project.liveUrl})` : ''}
   ${project.githubUrl ? `   - [Source Code](${project.githubUrl})` : ''}
`
  )
  .join('')}

## Setup

To view this portfolio locally:

1. Extract the ZIP file
2. Open \`index.html\` in your web browser
3. Or serve it locally:
   - Python: \`python -m http.server 8000\`
   - Node.js: \`npx http-server\`

## Export Information

- **Generated**: ${new Date().toISOString()}
- **Template**: ${options?.template || 'modern'}
- **Theme**: ${options?.theme || 'light'}
- **Format**: Portfolio Website
- **Created with**: NAVI Gaming Jobseeker Platform

${metadata.author ? `\n---\n\n© ${new Date().getFullYear()} ${metadata.author}` : ''}
`
  }

  /**
   * Add project assets to files
   */
  private async addProjectAssets(
    files: Record<string, string | Blob>,
    projects: PortfolioProject[]
  ): Promise<void> {
    for (const project of projects) {
      if (project.image && project.image.startsWith('data:')) {
        // Extract base64 image and convert to blob
        const base64Data = project.image.split(',')[1]
        const mimeType = project.image.match(/data:([^;]+);/)![1]
        const imageBlob = new Blob([atob(base64Data)], { type: mimeType })
        const extension = mimeType.split('/')[1]
        const filename = `assets/images/${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`
        files[filename] = imageBlob
      }
    }
  }

  /**
   * Generate PDF header
   */
  private generatePDFHeader(options?: PortfolioExportOptions): string {
    return `
      <div style="width: 100%; text-align: center; font-size: 12px; color: #666;">
        ${options?.metadata?.title || 'Gaming Portfolio'} - ${options?.metadata?.author || ''}
      </div>
    `
  }

  /**
   * Generate PDF footer
   */
  private generatePDFFooter(_options?: PortfolioExportOptions): string {
    return `
      <div style="width: 100%; text-align: center; font-size: 10px; color: #666;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> - Generated with NAVI Gaming Jobseeker Platform
      </div>
    `
  }

  /**
   * Browser PDF generation fallback
   */
  private async generatePDFInBrowser(
    htmlContent: string,
    projects: PortfolioProject[],
    options?: PortfolioExportOptions
  ): Promise<PortfolioExportResponse> {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error(
        'Could not open print window. Please check popup blockers.'
      )
    }

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    await new Promise(resolve => {
      printWindow.addEventListener('load', resolve)
    })

    printWindow.print()

    return {
      success: true,
      filename: this.generateFilename('portfolio', 'pdf', options),
      metadata: {
        format: 'pdf',
        size: htmlContent.length,
        projectCount: projects.length,
        generatedAt: new Date().toISOString(),
        template: options?.template,
      },
    }
  }

  /**
   * Generate filename for exported portfolio
   */
  private generateFilename(
    baseName: string,
    extension: string,
    options?: PortfolioExportOptions
  ): string {
    const author = options?.metadata?.author || 'Portfolio'
    const cleanAuthor = author.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanAuthor}_${baseName}_${timestamp}.${extension}`
  }
}

// Export singleton instance
export const portfolioExportService = PortfolioExportService.getInstance()

// API route handlers
export const portfolioExportRoutes = {
  async export(
    request: PortfolioExportRequest
  ): Promise<PortfolioExportResponse> {
    return await portfolioExportService.exportPortfolio(request)
  },

  async downloadPortfolio(
    projects: PortfolioProject[],
    format: 'pdf' | 'zip' | 'html' | 'json' | 'website',
    options?: PortfolioExportOptions
  ): Promise<void> {
    const result = await portfolioExportService.exportPortfolio({
      projects,
      format,
      options,
    })

    if (result.success && result.blob && result.filename) {
      // Create download link
      const url = URL.createObjectURL(result.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else {
      throw new Error(result.error || 'Portfolio export failed')
    }
  },
}
