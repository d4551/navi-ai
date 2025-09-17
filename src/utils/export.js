import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import QRCode from 'qrcode'
import { format } from 'date-fns'
import { marked } from 'marked'
// Removed jsPDF (CSP unsafe); using pdf-lib helpers instead
import { pdfFromTallImage } from '@/utils/pdfExport'
import html2canvas from 'html2canvas'
import { logger } from '@/shared/utils/logger'
import { validateResumeData } from '@/shared/schemas/exportSchema'

// Enhanced export utilities
export class ExportService {
  // Export resume to multiple formats
  static async exportResume(
    resumeData,
    formats = ['pdf', 'json'],
    options = {}
  ) {
    // Validate/normalize against canonical schema
    resumeData = validateResumeData(resumeData)
    const results = {}

    try {
      for (const format of formats) {
        switch (format.toLowerCase()) {
          case 'pdf':
            results.pdf = await this.exportToPDF(resumeData, options.pdf)
            break
          case 'json':
            results.json = this.exportToJSON(resumeData)
            break
          case 'markdown':
            results.markdown = this.exportToMarkdown(resumeData)
            break
          case 'html':
            results.html = this.exportToHTML(resumeData, options.html)
            break
          case 'docx':
            results.docx = await this.exportToDocx(resumeData)
            break
        }
      }

      return results
    } catch (_error) {
      logger.error('Export failed:', error)
      throw error
    }
  }

  // Export to PDF using offscreen render + html2canvas
  static async exportToPDF(resumeData, options = {}) {
    resumeData = validateResumeData(resumeData)
    try {
      const css =
        typeof document !== 'undefined'
          ? getComputedStyle(document.documentElement)
          : null
      const defaultBg = css
        ? (css.getPropertyValue('--bg-primary') || '#ffffff').trim()
        : '#ffffff'
      const {
        theme = 'professional',
        scale = 2,
        backgroundColor = defaultBg,
      } = options

      // Server-side fallback: return simple text blob (no pdf-lib in SSR)
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        const lines = []
        const name =
          `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim() ||
          'Resume'
        lines.push(name)
        if (resumeData.personalInfo?.email) {
          lines.push(`Email: ${resumeData.personalInfo.email}`)
        }
        if (resumeData.personalInfo?.phone) {
          lines.push(`Phone: ${resumeData.personalInfo.phone}`)
        }
        return new Blob([lines.join('\n')], { type: 'text/plain' })
      }

      // Build a detached container with HTML content
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-10000px'
      container.style.top = '0'
      container.style.width = '794px' // ~A4 width @ 96 DPI
      container.style.background = backgroundColor

      const markdown = this.exportToMarkdown(resumeData)
      const htmlContent = marked(markdown)
      const resumeCSS = this.getResumeCSS(theme)
      container.innerHTML = `<style>${resumeCSS}</style><div class="resume-container">${htmlContent}</div>`

      document.body.appendChild(container)

      // Render to canvas
      const canvas = await html2canvas(container, { scale, backgroundColor })
      const imgData = canvas.toDataURL('image/png')

      // Cleanup container will happen after capture; convert tall image to paginated PDF
      document.body.removeChild(container)
      const pdfBlob = await pdfFromTallImage(imgData)
      return pdfBlob
    } catch (error) {
      logger.error('PDF export failed:', error)
      throw new Error('Failed to export to PDF')
    }
  }

  /**
   * Generic DOM element to PDF exporter (used by Resume & Cover Letter previews)
   * Keeps logic centralized so individual views don't reimplement html2canvas/jsPDF flows.
   * @param {HTMLElement} element - root element to capture
   * @param {string} filename - filename (without path)
   * @param {object} options - { scale, backgroundColor }
   * @returns {Promise<boolean>} success flag
   */
  static async exportElementToPDF(element, filename, options = {}) {
    if (!element) {
      logger.warn('exportElementToPDF called with null element')
      return false
    }
    const css = getComputedStyle(document.documentElement)
    const defaultBg = (css.getPropertyValue('--bg-primary') || '#ffffff').trim()
    const {
      scale = 3,
      backgroundColor = defaultBg,
      marginMm = 0,
      orientation = 'p',
    } = options
    try {
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdfBlob = await pdfFromTallImage(imgData)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      return true
    } catch (err) {
      logger.error('exportElementToPDF failed', err)
      return false
    }
  }

  // Export to DOCX by generating minimal WordprocessingML package
  static async exportToDocx(resumeData) {
    resumeData = validateResumeData(resumeData)
    try {
      // Basic helpers to escape XML
      const xmlEscape = s =>
        String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')

      const p = text => `<w:p><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`
      const pHeading = (text, lvl = 1) => `
        <w:p>
          <w:pPr><w:pStyle w:val="Heading${lvl}"/></w:pPr>
          <w:r><w:t>${xmlEscape(text)}</w:t></w:r>
        </w:p>`

      const name =
        `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim()
      const lines = []
      if (name) {
        lines.push(pHeading(name, 1))
      }
      if (resumeData.personalInfo?.summary) {
        lines.push(pHeading('Professional Summary', 2))
        lines.push(p(resumeData.personalInfo.summary))
      }

      if (
        Array.isArray(resumeData.experience) &&
        resumeData.experience.length
      ) {
        lines.push(pHeading('Professional Experience', 2))
        resumeData.experience.forEach(exp => {
          lines.push(
            pHeading(`${exp.jobTitle || ''} — ${exp.company || ''}`, 3)
          )
          if (Array.isArray(exp.description)) {
            exp.description.forEach(d => lines.push(p(`• ${d}`)))
          }
        })
      }

      if (Array.isArray(resumeData.education) && resumeData.education.length) {
        lines.push(pHeading('Education', 2))
        resumeData.education.forEach(edu => {
          lines.push(pHeading(`${edu.degree || ''} — ${edu.school || ''}`, 3))
          if (edu.graduationDate) {
            lines.push(p(`Graduated: ${edu.graduationDate}`))
          }
          if (edu.gpa) {
            lines.push(p(`GPA: ${edu.gpa}`))
          }
        })
      }

      if (Array.isArray(resumeData.skills) && resumeData.skills.length) {
        lines.push(pHeading('Skills', 2))
        const skillNames = resumeData.skills
          .map(s => s.name || s)
          .filter(Boolean)
        if (skillNames.length) {
          lines.push(p(skillNames.join(', ')))
        }
      }

      if (Array.isArray(resumeData.projects) && resumeData.projects.length) {
        lines.push(pHeading('Projects', 2))
        resumeData.projects.forEach(prj => {
          lines.push(pHeading(prj.name || '', 3))
          if (prj.description) {
            lines.push(p(prj.description))
          }
        })
      }

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
                    xmlns:v="urn:schemas-microsoft-com:vml"
                    xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
                    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                    xmlns:w10="urn:schemas-microsoft-com:office:word"
                    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
                    xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
                    xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
                    xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
                    xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
                    mc:Ignorable="w14 wp14">
          <w:body>
            ${lines.join('\n')}
            <w:sectPr>
              <w:pgSz w:w="12240" w:h="15840"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
              <w:cols w:space="720"/>
              <w:docGrid w:linePitch="360"/>
            </w:sectPr>
          </w:body>
        </w:document>`

      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
          <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
          <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
          <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
          <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
        </Types>`

      const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>`

      const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`

      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
          <Application>NAVI Career Assistant</Application>
        </Properties>`

      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <dc:title>${xmlEscape(name || 'Resume')}</dc:title>
          <dc:creator>NAVI Career Assistant</dc:creator>
          <cp:lastModifiedBy>NAVI</cp:lastModifiedBy>
          <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
          <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
        </cp:coreProperties>`

      const zip = new JSZip()
      zip.file('[Content_Types].xml', contentTypes)
      zip.folder('_rels').file('.rels', rels)
      zip.folder('word').file('document.xml', documentXml)
      zip.folder('word').folder('_rels').file('document.xml.rels', docRels)
      zip.folder('docProps').file('app.xml', appXml)
      zip.folder('docProps').file('core.xml', coreXml)

      const blob = await zip.generateAsync({ type: 'blob' })
      return blob
    } catch (_error) {
      logger.error('DOCX export failed:', error)
      throw new Error('Failed to export to DOCX')
    }
  }

  /**
   * Export plain text content to DOCX (used for Cover Letters)
   * @param {string} title - Document title
   * @param {Array<string>} paragraphs - Array of paragraph strings
   * @returns {Promise<Blob>} DOCX blob
   */
  static async exportPlainTextDocx(title = 'Cover Letter', paragraphs = []) {
    try {
      const xmlEscape = s =>
        String(s || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')

      const p = text => `<w:p><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`
      const pHeading = (text, lvl = 1) => `
        <w:p>
          <w:pPr><w:pStyle w:val="Heading${lvl}"/></w:pPr>
          <w:r><w:t>${xmlEscape(text)}</w:t></w:r>
        </w:p>`

      const lines = []
      if (title) {
        lines.push(pHeading(title, 1))
      }
      ;(paragraphs || []).forEach(para => {
        // Split on double line breaks to preserve paragraphing
        String(para || '')
          .split(/\n{2,}/)
          .forEach(chunk => lines.push(p(chunk)))
      })

      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
                    xmlns:v="urn:schemas-microsoft-com:vml"
                    xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
                    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                    xmlns:w10="urn:schemas-microsoft-com:office:word"
                    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
                    xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
                    xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
                    xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
                    xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
                    mc:Ignorable="w14 wp14">
          <w:body>
            ${lines.join('\n')}
            <w:sectPr>
              <w:pgSz w:w="12240" w:h="15840"/>
              <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
              <w:cols w:space="720"/>
              <w:docGrid w:linePitch="360"/>
            </w:sectPr>
          </w:body>
        </w:document>`

      const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
          <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
        </Types>`

      const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
        </Relationships>`

      const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`

      const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
          <Application>NAVI Career Assistant</Application>
        </Properties>`

      const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <dc:title>${(title || 'Cover Letter').replace(/</g, '&lt;')}</dc:title>
          <dc:creator>NAVI Career Assistant</dc:creator>
          <cp:lastModifiedBy>NAVI</cp:lastModifiedBy>
          <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
          <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
        </cp:coreProperties>`

      const zip = new JSZip()
      zip.file('[Content_Types].xml', contentTypes)
      zip.folder('_rels').file('.rels', rels)
      zip.folder('word').file('document.xml', documentXml)
      zip.folder('word').folder('_rels').file('document.xml.rels', docRels)
      zip.folder('docProps').file('app.xml', appXml)
      zip.folder('docProps').file('core.xml', coreXml)

      const blob = await zip.generateAsync({ type: 'blob' })
      return blob
    } catch (_error) {
      logger.error('Plain DOCX export failed:', error)
      throw new Error('Failed to export to DOCX')
    }
  }
  // Export to JSON with validation
  static exportToJSON(resumeData, formatted = true) {
    try {
      const exportData = {
        ...resumeData,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        generator: 'NAVI Career Assistant',
      }
      return formatted
        ? JSON.stringify(exportData, null, 2)
        : JSON.stringify(exportData)
    } catch (_error) {
      logger.error('JSON export failed:', error)
      throw new Error('Failed to export to JSON')
    }
  }

  // Export to Markdown format
  static exportToMarkdown(resumeData) {
    try {
      let markdown = `# ${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}\n\n`

      // Contact Information
      if (resumeData.personalInfo) {
        const { email, phone, location, linkedIn, portfolio } =
          resumeData.personalInfo

        markdown += '## Contact Information\n\n'
        if (email) {
          markdown += `**Email:** ${email}\n\n`
        }
        if (phone) {
          markdown += `**Phone:** ${phone}\n\n`
        }
        if (location) {
          markdown += `**Location:** ${location}\n\n`
        }
        if (linkedIn) {
          markdown += `**LinkedIn:** [${linkedIn}](${linkedIn})\n\n`
        }
        if (portfolio) {
          markdown += `**Portfolio:** [${portfolio}](${portfolio})\n\n`
        }
      }

      // Summary
      if (resumeData.personalInfo?.summary) {
        markdown += '## Professional Summary\n\n'
        markdown += `${resumeData.personalInfo.summary}\n\n`
      }

      // Experience
      if (resumeData.experience?.length) {
        markdown += '## Professional Experience\n\n'

        resumeData.experience.forEach(exp => {
          markdown += `### ${exp.jobTitle}\n`
          markdown += `**${exp.company}** | ${exp.location || ''}\n\n`
          markdown += `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}\n\n`

          if (exp.description?.length) {
            exp.description.forEach(desc => {
              markdown += `- ${desc}\n`
            })
            markdown += '\n'
          }

          if (exp.skills?.length) {
            markdown += `**Skills used:** ${exp.skills.join(', ')}\n\n`
          }

          markdown += '---\n\n'
        })
      }

      // Education
      if (resumeData.education?.length) {
        markdown += '## Education\n\n'

        resumeData.education.forEach(edu => {
          markdown += `### ${edu.degree}\n`
          markdown += `**${edu.school}** | ${edu.location || ''}\n\n`
          if (edu.graduationDate) {
            markdown += `${edu.graduationDate}\n\n`
          }
          if (edu.gpa) {
            markdown += `GPA: ${edu.gpa}\n\n`
          }

          if (edu.relevant?.length) {
            markdown += 'Relevant Coursework:\n'
            edu.relevant.forEach(course => {
              markdown += `- ${course}\n`
            })
            markdown += '\n'
          }

          markdown += '---\n\n'
        })
      }

      // Skills
      if (resumeData.skills?.length) {
        markdown += '## Skills\n\n'

        const skillsByCategory = resumeData.skills.reduce((acc, skill) => {
          const category = skill.category || 'Other'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(skill.name)
          return acc
        }, {})

        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`
          markdown += `${skills.join(' • ')}\n\n`
        })
      }

      // Projects
      if (resumeData.projects?.length) {
        markdown += '## Projects\n\n'

        resumeData.projects.forEach(project => {
          markdown += `### ${project.name}\n`
          if (project.url) {
            markdown += `[View Project](${project.url})\n\n`
          }
          markdown += `${project.description}\n\n`

          if (project.technologies?.length) {
            markdown += `**Technologies:** ${project.technologies.join(', ')}\n\n`
          }

          markdown += '---\n\n'
        })
      }

      return markdown
    } catch (_error) {
      logger.error('Markdown export failed:', error)
      throw new Error('Failed to export to Markdown')
    }
  }

  // Export to HTML format
  static exportToHTML(resumeData, options = {}) {
    try {
      const markdown = this.exportToMarkdown(resumeData)
      const htmlContent = marked(markdown)

      const css =
        options.includeCSS !== false ? this.getResumeCSS(options.theme) : ''

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''} - Resume</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="resume-container">
        ${htmlContent}
    </div>
    <footer>
        <p>Generated by NAVI Career Assistant on ${format(new Date(), 'PPP')}</p>
    </footer>
</body>
</html>`

      return html
    } catch (_error) {
      logger.error('HTML export failed:', error)
      throw new Error('Failed to export to HTML')
    }
  }

  // Get CSS for resume styling
  static getResumeCSS(theme = 'professional') {
    const themes = {
      professional: `
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #2980b9; }
        hr { border: none; border-top: 1px solid #bdc3c7; margin: 20px 0; }
        .resume-container { background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 40px; }
        footer { text-align: center; color: #7f8c8d; font-size: 0.9em; margin-top: 30px; }
      `,
      modern: `
        body { font-family: 'Helvetica', sans-serif; line-height: 1.6; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #e74c3c; font-weight: 300; font-size: 2.5em; }
        h2 { color: #3498db; text-transform: uppercase; letter-spacing: 1px; font-size: 1.2em; }
        h3 { color: #2c3e50; }
        hr { border: none; border-top: 2px solid #ecf0f1; margin: 25px 0; }
        .resume-container { background: #fdfdfd; }
        footer { text-align: center; color: #95a5a6; font-size: 0.85em; margin-top: 40px; }
      `,
      creative: `
        body { font-family: 'Arial', sans-serif; line-height: 1.7; color: #444; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
        h1 { color: #6f42c1; font-size: 2.8em; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #e83e8c; border-left: 4px solid #fd7e14; padding-left: 15px; }
        h3 { color: #20c997; }
        hr { border: none; height: 3px; background: linear-gradient(to right, #6f42c1, #e83e8c, #fd7e14); margin: 25px 0; }
        .resume-container { background: white; border-radius: 10px; padding: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        footer { text-align: center; color: #6c757d; font-size: 0.9em; margin-top: 30px; }
      `,
    }

    return themes[theme] || themes.professional
  }

  // Create ZIP file with multiple formats
  static async createResumePackage(
    resumeData,
    formats = ['pdf', 'json', 'markdown', 'html']
  ) {
    try {
      const zip = new JSZip()
      const folderName = `${resumeData.personalInfo?.firstName || 'resume'}_${resumeData.personalInfo?.lastName || 'package'}_${format(new Date(), 'yyyy-MM-dd')}`
      const folder = zip.folder(folderName)

      // Export in all requested formats
      const exports = await this.exportResume(resumeData, formats)

      // Add files to ZIP
      Object.entries(exports).forEach(([format, content]) => {
        const extension =
          format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'txt'
        let filename = `resume.${extension}`

        if (format === 'json') {
          filename = 'resume.json'
        } else if (format === 'markdown') {
          filename = 'resume.md'
        } else if (format === 'html') {
          filename = 'resume.html'
        }

        folder.file(filename, content)
      })

      // Add QR code for digital resume
      if (
        resumeData.personalInfo?.portfolio ||
        resumeData.personalInfo?.linkedIn
      ) {
        const qrUrl =
          resumeData.personalInfo.portfolio || resumeData.personalInfo.linkedIn
        const qrCode = await this.generateQRCode(qrUrl)
        folder.file('qr_code.png', qrCode.split(',')[1], { base64: true })
      }

      // Add metadata file
      const metadata = {
        generatedAt: new Date().toISOString(),
        generator: 'NAVI Career Assistant',
        version: '1.0',
        formats: formats,
        personalInfo: {
          name: `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim(),
          email: resumeData.personalInfo?.email,
        },
      }

      folder.file('metadata.json', JSON.stringify(metadata, null, 2))

      // Generate ZIP
      const zipContent = await zip.generateAsync({ type: 'blob' })

      return {
        blob: zipContent,
        filename: `${folderName}.zip`,
      }
    } catch (_error) {
      logger.error('Package creation failed:', error)
      throw new Error('Failed to create resume package')
    }
  }

  // Generate QR Code
  static async generateQRCode(url, options = {}) {
    try {
      const css = getComputedStyle(document.documentElement)
      const dark = (
        options.darkColor ||
        css.getPropertyValue('--text-primary') ||
        '#000000'
      ).trim()
      const light = (
        options.lightColor ||
        css.getPropertyValue('--bg-primary') ||
        '#ffffff'
      ).trim()
      const qrOptions = {
        width: options.width || 200,
        margin: options.margin || 2,
        color: {
          dark,
          light,
        },
      }

      return await QRCode.toDataURL(url, qrOptions)
    } catch (_error) {
      logger.error('QR code generation failed:', error)
      throw new Error('Failed to generate QR code')
    }
  }

  // Export user data for backup
  static async exportUserData(userData) {
    try {
      const exportData = {
        ...userData,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        generator: 'NAVI Career Assistant',
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })

      const filename = `navi_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`

      return { blob, filename }
    } catch (_error) {
      logger.error('User data export failed:', error)
      throw new Error('Failed to export user data')
    }
  }

  // Download file helper
  static downloadFile(content, filename, mimeType = 'text/plain') {
    try {
      let blob

      if (content instanceof Blob) {
        blob = content
      } else if (typeof content === 'string') {
        blob = new Blob([content], { type: mimeType })
      } else {
        blob = new Blob([JSON.stringify(content, null, 2)], {
          type: 'application/json',
        })
      }

      saveAs(blob, filename)
      return true
    } catch (_error) {
      logger.error('Download failed:', error)
      return false
    }
  }

  // Batch download helper
  static async downloadResumePackage(resumeData, formats) {
    try {
      const packageData = await this.createResumePackage(resumeData, formats)
      this.downloadFile(packageData.blob, packageData.filename)
      return true
    } catch (_error) {
      logger.error('Package download failed:', error)
      return false
    }
  }
}

// Quick export functions
export const exportToJSON = (data, filename = 'export.json') => {
  return ExportService.downloadFile(
    ExportService.exportToJSON(_data),
    filename,
    'application/json'
  )
}

export const exportToMarkdown = (resumeData, filename = 'resume.md') => {
  return ExportService.downloadFile(
    ExportService.exportToMarkdown(resumeData),
    filename,
    'text/markdown'
  )
}

export const exportToHTML = (
  resumeData,
  filename = 'resume.html',
  options = {}
) => {
  return ExportService.downloadFile(
    ExportService.exportToHTML(resumeData, options),
    filename,
    'text/html'
  )
}

export default ExportService
