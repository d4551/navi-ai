/**
 * Resume Export API - Centralized resume generation and export
 * Replaces scattered export logic with unified API surface
 */

import { logger } from '@/shared/utils/logger'
// Reuse consolidated export utilities for browser fallbacks
// Keeps export behavior consistent across the app
import { ExportService } from '@/utils/export'
import type {
  ResumeData,
  ExportFormat,
  ExportOptions,
  ResumeExperienceItem,
} from '../../shared/types/resume'

export interface ResumeExportRequest {
  resumeData: ResumeData
  format: ExportFormat
  options?: ExportOptions
}

export interface ResumeExportResponse {
  success: boolean
  url?: string
  blob?: Blob
  filename?: string
  error?: string
  metadata?: {
    format: ExportFormat
    size: number
    pageCount?: number
    generatedAt: string
  }
}

/**
 * Resume Export Service - Single source of truth for resume generation
 */
export class ResumeExportService {
  private static instance: ResumeExportService

  static getInstance(): ResumeExportService {
    if (!ResumeExportService.instance) {
      ResumeExportService.instance = new ResumeExportService()
    }
    return ResumeExportService.instance
  }

  /**
   * Export resume to specified format
   */
  async exportResume(
    request: ResumeExportRequest
  ): Promise<ResumeExportResponse> {
    try {
      logger.info(`Exporting resume to ${request.format}`)

      switch (request.format) {
        case 'pdf':
          return await this.exportToPDF(request.resumeData, request.options)

        case 'docx':
          return await this.exportToDocx(request.resumeData, request.options)

        case 'html':
          return await this.exportToHTML(request.resumeData, request.options)

        case 'json':
          return await this.exportToJSON(request.resumeData, request.options)

        case 'markdown':
          return await this.exportToMarkdown(
            request.resumeData,
            request.options
          )

        default:
          throw new Error(`Unsupported export format: ${request.format}`)
      }
    } catch (error) {
      logger.error('Resume export failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      }
    }
  }

  /**
   * Export resume as PDF using modern web APIs
   */
  private async exportToPDF(
    resumeData: ResumeData,
    options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    try {
      // Generate HTML template
      const htmlTemplate = this.generateHTMLTemplate(resumeData, options)

      // Check if we're in Electron environment
      if (
        typeof window !== 'undefined' &&
        (window as any).electronAPI?.resume?.exportPDF
      ) {
        // Use Electron's PDF generation
        const result = await (window as any).electronAPI.resume.exportPDF({
          html: htmlTemplate,
          options: {
            format: options?.pageFormat || 'A4',
            margin: options?.margins,
            displayHeaderFooter: false,
            printBackground: true,
          },
        })

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], { type: 'application/pdf' }),
            filename: this.generateFilename(resumeData, 'pdf'),
            metadata: {
              format: 'pdf',
              size: result.buffer.length,
              pageCount: result.pageCount,
              generatedAt: new Date().toISOString(),
            },
          }
        }
        throw new Error(result.error)
      }

      // Fallback to browser PDF generation via shared ExportService
      const blob = await ExportService.exportToPDF(resumeData, {
        theme: options?.theme,
      })
      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, 'pdf'),
        metadata: {
          format: 'pdf',
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(
        `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export resume as DOCX
   */
  private async exportToDocx(
    resumeData: ResumeData,
    options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    try {
      // Check if we have docx generation capability
      if (
        typeof window !== 'undefined' &&
        (window as any).electronAPI?.resume?.exportDocx
      ) {
        const result = await (window as any).electronAPI.resume.exportDocx({
          resumeData,
          template: options?.template || 'modern',
          options,
        })

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            }),
            filename: this.generateFilename(resumeData, 'docx'),
            metadata: {
              format: 'docx',
              size: result.buffer.length,
              generatedAt: new Date().toISOString(),
            },
          }
        }
        throw new Error(result.error)
      }

      // Web-based DOCX generation fallback via shared ExportService
      const blob = await ExportService.exportToDocx(resumeData)
      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, 'docx'),
        metadata: {
          format: 'docx',
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(
        `DOCX export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export resume as HTML
   */
  private async exportToHTML(
    resumeData: ResumeData,
    options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    try {
      const htmlContent = this.generateHTMLTemplate(resumeData, options)
      const blob = new Blob([htmlContent], { type: 'text/html' })

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, 'html'),
        metadata: {
          format: 'html',
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(
        `HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export resume as JSON
   */
  private async exportToJSON(
    resumeData: ResumeData,
    _options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    try {
      const jsonContent = JSON.stringify(
        {
          ...resumeData,
          exportMetadata: {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            exportedBy: 'NAVI Gaming Jobseeker Platform',
          },
        },
        null,
        2
      )

      const blob = new Blob([jsonContent], { type: 'application/json' })

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, 'json'),
        metadata: {
          format: 'json',
          size: blob.size,
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
   * Export resume as Markdown
   */
  private async exportToMarkdown(
    resumeData: ResumeData,
    _options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    try {
      const markdownContent = this.generateMarkdownTemplate(resumeData)
      const blob = new Blob([markdownContent], { type: 'text/markdown' })

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, 'md'),
        metadata: {
          format: 'markdown',
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      }
    } catch (error) {
      throw new Error(
        `Markdown export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate HTML template for resume
   */
  private generateHTMLTemplate(
    resumeData: ResumeData,
    options?: ExportOptions
  ): string {
    const template = options?.template || 'modern'
    const theme = options?.theme || 'light'

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo?.name || 'Resume'} - Gaming Industry Resume</title>
    <style>
        ${this.getResumeCSS(template, theme)}
    </style>
</head>
<body class="resume-template-${template} theme-${theme}">
    <div class="resume-container">
        ${this.generatePersonalInfoSection(resumeData.personalInfo)}
        ${this.generateSummarySection(resumeData.summary)}
        ${this.generateExperienceSection(resumeData.experience)}
        ${this.generateSkillsSection(resumeData.skills)}
        ${this.generateEducationSection(resumeData.education)}
        ${this.generateGamingSection(resumeData.gamingExperience)}
        ${this.generateProjectsSection(resumeData.projects)}
    </div>
</body>
</html>`
  }

  /**
   * Generate Markdown template for resume
   */
  private generateMarkdownTemplate(resumeData: ResumeData): string {
    const sections = []

    // Header
    if (resumeData.personalInfo) {
      sections.push(`# ${resumeData.personalInfo.name}`)

      const contactInfo = []
      if (resumeData.personalInfo.email)
        contactInfo.push(`📧 ${resumeData.personalInfo.email}`)
      if (resumeData.personalInfo.phone)
        contactInfo.push(`📱 ${resumeData.personalInfo.phone}`)
      if (resumeData.personalInfo.location)
        contactInfo.push(`📍 ${resumeData.personalInfo.location}`)

      if (contactInfo.length) {
        sections.push(contactInfo.join(' | ') + '\n')
      }
    }

    // Summary
    if (resumeData.summary) {
      sections.push('## Professional Summary\n')
      sections.push(resumeData.summary + '\n')
    }

    // Experience
    if (resumeData.experience?.length) {
      sections.push('## Experience\n')
      resumeData.experience.forEach((exp: ResumeExperienceItem) => {
        sections.push(`### ${exp.title} at ${exp.company}`)
        sections.push(
          `*${exp.startDate} - ${exp.endDate || 'Present'}* | ${exp.location || ''}`
        )
        if (exp.description) sections.push(`\n${exp.description}\n`)
      })
    }

    // Skills
    if (
      resumeData.skills?.technical?.length ||
      resumeData.skills?.soft?.length
    ) {
      sections.push('## Skills\n')
      if (resumeData.skills.technical?.length) {
        sections.push(
          `**Technical Skills:** ${resumeData.skills.technical.join(', ')}\n`
        )
      }
      if (resumeData.skills.soft?.length) {
        sections.push(`**Soft Skills:** ${resumeData.skills.soft.join(', ')}\n`)
      }
    }

    // Gaming Experience
    if (resumeData.gamingExperience) {
      sections.push('## Gaming Industry Experience\n')
      const gaming = resumeData.gamingExperience
      if (gaming.gameEngines)
        sections.push(`**Game Engines:** ${gaming.gameEngines}\n`)
      if (gaming.platforms)
        sections.push(`**Platforms:** ${gaming.platforms}\n`)
      if (gaming.genres) sections.push(`**Genres:** ${gaming.genres}\n`)
      if (gaming.shippedTitles)
        sections.push(`**Shipped Titles:** ${gaming.shippedTitles}\n`)
    }

    return sections.join('\n')
  }

  /**
   * Get CSS for resume templates
   */
  private getResumeCSS(template: string, _theme: string): string {
    // Base CSS that works across all templates
    const baseCSS = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .resume-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
      h1, h2, h3 { margin-bottom: 1rem; color: #2c3e50; }
      h1 { font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; }
      h2 { font-size: 1.5rem; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; margin-top: 2rem; }
      h3 { font-size: 1.2rem; margin-top: 1.5rem; }
      .contact-info { text-align: center; margin-bottom: 2rem; color: #666; }
      .section { margin-bottom: 2rem; }
      .experience-item, .education-item { margin-bottom: 1.5rem; }
      .date-range { color: #666; font-style: italic; margin-bottom: 0.5rem; }
      .skills-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
      .skill-tag { background: #ecf0f1; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.9rem; }
      
      @media print {
        .resume-container { padding: 1rem; }
        body { font-size: 12pt; }
      }
    `

    // Template-specific CSS
    const templateCSS = {
      modern: `
        .theme-light { background: white; }
        .theme-dark { background: #2c3e50; color: white; }
        h1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
             -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .skill-tag { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      `,
      classic: `
        h1 { color: #2c3e50; border-bottom: 3px solid #2c3e50; }
        h2 { color: #34495e; }
        .skill-tag { background: #34495e; color: white; }
      `,
      gaming: `
        body { background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; }
        h1 { color: #00ffff; text-shadow: 0 0 10px #00ffff; }
        h2 { color: #ff6b6b; border-bottom-color: #ff6b6b; }
        .skill-tag { background: #ff6b6b; color: #0a0a0a; border: 1px solid #00ff00; }
      `,
    }

    return (
      baseCSS +
      (templateCSS[template as keyof typeof templateCSS] || templateCSS.modern)
    )
  }

  /**
   * Generate HTML sections
   */
  private generatePersonalInfoSection(personalInfo?: any): string {
    if (!personalInfo) return ''

    const contactItems = []
    if (personalInfo.email) contactItems.push(personalInfo.email)
    if (personalInfo.phone) contactItems.push(personalInfo.phone)
    if (personalInfo.location) contactItems.push(personalInfo.location)

    return `
      <div class="personal-info section">
        <h1>${personalInfo.name || 'Professional'}</h1>
        <div class="contact-info">${contactItems.join(' | ')}</div>
      </div>
    `
  }

  private generateSummarySection(summary?: string): string {
    if (!summary) return ''
    return `
      <div class="summary section">
        <h2>Professional Summary</h2>
        <p>${summary}</p>
      </div>
    `
  }

  private generateExperienceSection(experience?: any[]): string {
    if (!experience?.length) return ''

    const experienceItems = experience
      .map(
        exp => `
      <div class="experience-item">
        <h3>${exp.title} at ${exp.company}</h3>
        <div class="date-range">${exp.startDate} - ${exp.endDate || 'Present'} | ${exp.location || ''}</div>
        ${exp.description ? `<p>${exp.description}</p>` : ''}
      </div>
    `
      )
      .join('')

    return `
      <div class="experience section">
        <h2>Experience</h2>
        ${experienceItems}
      </div>
    `
  }

  private generateSkillsSection(skills?: any): string {
    if (!skills) return ''

    const sections = []
    if (skills.technical?.length) {
      const skillTags = skills.technical
        .map((skill: string) => `<span class="skill-tag">${skill}</span>`)
        .join('')
      sections.push(
        `<div><strong>Technical Skills:</strong><div class="skills-list">${skillTags}</div></div>`
      )
    }

    if (skills.soft?.length) {
      const skillTags = skills.soft
        .map((skill: string) => `<span class="skill-tag">${skill}</span>`)
        .join('')
      sections.push(
        `<div><strong>Soft Skills:</strong><div class="skills-list">${skillTags}</div></div>`
      )
    }

    return sections.length
      ? `
      <div class="skills section">
        <h2>Skills</h2>
        ${sections.join('')}
      </div>
    `
      : ''
  }

  private generateEducationSection(education?: any[]): string {
    if (!education?.length) return ''

    const educationItems = education
      .map(
        edu => `
      <div class="education-item">
        <h3>${edu.degree} in ${edu.field}</h3>
        <div class="date-range">${edu.school} | ${edu.year}</div>
      </div>
    `
      )
      .join('')

    return `
      <div class="education section">
        <h2>Education</h2>
        ${educationItems}
      </div>
    `
  }

  private generateGamingSection(gamingExperience?: any): string {
    if (!gamingExperience) return ''

    const items = []
    if (gamingExperience.gameEngines)
      items.push(
        `<p><strong>Game Engines:</strong> ${gamingExperience.gameEngines}</p>`
      )
    if (gamingExperience.platforms)
      items.push(
        `<p><strong>Platforms:</strong> ${gamingExperience.platforms}</p>`
      )
    if (gamingExperience.genres)
      items.push(`<p><strong>Genres:</strong> ${gamingExperience.genres}</p>`)
    if (gamingExperience.shippedTitles)
      items.push(
        `<p><strong>Shipped Titles:</strong> ${gamingExperience.shippedTitles}</p>`
      )

    return items.length
      ? `
      <div class="gaming section">
        <h2>Gaming Industry Experience</h2>
        ${items.join('')}
      </div>
    `
      : ''
  }

  private generateProjectsSection(projects?: any[]): string {
    if (!projects?.length) return ''

    const projectItems = projects
      .map(
        project => `
      <div class="project-item">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${project.technologies ? `<div class="skills-list">${project.technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('')}</div>` : ''}
      </div>
    `
      )
      .join('')

    return `
      <div class="projects section">
        <h2>Projects</h2>
        ${projectItems}
      </div>
    `
  }

  /**
   * Browser-based PDF generation fallback
   */
  private async generatePDFInBrowser(
    _htmlContent: string,
    resumeData: ResumeData,
    _options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    // Backward-compatible wrapper: delegate to shared ExportService for consistency
    const blob = await ExportService.exportToPDF(resumeData)
    return {
      success: true,
      blob,
      filename: this.generateFilename(resumeData, 'pdf'),
      metadata: {
        format: 'pdf',
        size: blob.size,
        generatedAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Browser-based DOCX generation fallback
   */
  private async generateDocxInBrowser(
    resumeData: ResumeData,
    _options?: ExportOptions
  ): Promise<ResumeExportResponse> {
    // Delegate to shared ExportService DOCX implementation
    const blob = await ExportService.exportToDocx(resumeData)
    return {
      success: true,
      blob,
      filename: this.generateFilename(resumeData, 'docx'),
      metadata: {
        format: 'docx',
        size: blob.size,
        generatedAt: new Date().toISOString(),
      },
    }
  }

  /**
   * Generate RTF content for Word compatibility
   */
  private generateRTFContent(resumeData: ResumeData): string {
    const rtfHeader =
      '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24'
    const rtfFooter = '}'

    let content = ''

    if (resumeData.personalInfo?.name) {
      content += `\\b\\fs32 ${resumeData.personalInfo.name}\\b0\\fs24\\par`
    }

    if (resumeData.summary) {
      content += `\\par\\b Professional Summary\\b0\\par${resumeData.summary}\\par`
    }

    return rtfHeader + content + rtfFooter
  }

  /**
   * Generate filename for exported resume
   */
  private generateFilename(resumeData: ResumeData, extension: string): string {
    const name = resumeData.personalInfo?.name || 'Resume'
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_')
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${cleanName}_Resume_${timestamp}.${extension}`
  }
}

// Export singleton instance
export const resumeExportService = ResumeExportService.getInstance()

// API route handlers
export const resumeExportRoutes = {
  async export(request: ResumeExportRequest): Promise<ResumeExportResponse> {
    return await resumeExportService.exportResume(request)
  },

  async downloadResume(
    resumeData: ResumeData,
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<void> {
    const result = await resumeExportService.exportResume({
      resumeData,
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
      throw new Error(result.error || 'Export failed')
    }
  },
}
