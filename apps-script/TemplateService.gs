/**
 * TemplateService - Shared utility for applying style templates to documents.
 */
var TemplateService = {
  /**
   * Applies a style template to a specific document.
   *
   * @param {string} documentId The ID of the document to apply the template to.
   * @param {string} templateId The ID of the template to apply.
   * @returns {object} A result object indicating success or failure.
   */
  applyTemplateToDocument: function (documentId, templateId) {
    try {
      const doc = DocumentApp.openById(documentId)
      const template = RESUME_TEMPLATES[templateId]

      if (!template) {
        return { error: true, message: 'Template not found' }
      }

      const body = doc.getBody()

      // Apply document margins
      body.setMarginBottom(template.margins.bottom)
      body.setMarginTop(template.margins.top)
      body.setMarginLeft(template.margins.left)
      body.setMarginRight(template.margins.right)

      // Apply styles to headers and text
      const childElements = body.getNumChildren()
      for (let i = 0; i < childElements; i++) {
        const child = body.getChild(i)
        if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const paragraph = child.asParagraph()
          const heading = paragraph.getHeading()

          if (heading === DocumentApp.ParagraphHeading.HEADING1) {
            paragraph.setFontFamily(template.fonts.heading)
            paragraph.setFontSize(template.fonts.size.heading1)
          } else if (heading === DocumentApp.ParagraphHeading.HEADING2) {
            paragraph.setFontFamily(template.fonts.heading)
            paragraph.setFontSize(template.fonts.size.heading2)
          } else {
            paragraph.setFontFamily(template.fonts.body)
            paragraph.setFontSize(template.fonts.size.body)
          }
        }
      }

      doc.saveAndClose()
      return { success: true }
    } catch (error) {
      return {
        error: true,
        message: `Could not apply template: ${error.toString()}`,
      }
    }
  },

  /**
   * Retrieves all available templates with preview links.
   * Combines built-in templates and user-defined custom templates.
   *
   * @returns {Object} Map of template identifiers to metadata
   */
  getAvailableTemplates: function () {
    try {
      const templates = {}

      for (const [id, template] of Object.entries(RESUME_TEMPLATES)) {
        templates[id] = {
          name: template.name,
          description: template.description,
          preview:
            template.preview ||
            `https://picsum.photos/seed/${encodeURIComponent(id)}/400/300`,
        }
      }

      try {
        const userProps = PropertiesService.getUserProperties()
        const customTemplates = JSON.parse(
          userProps.getProperty('documentTemplates') || '{}'
        )

        for (const [name, settings] of Object.entries(customTemplates)) {
          templates[name] = {
            name: name,
            description: settings.description || 'Custom template',
            preview:
              settings.preview ||
              `https://picsum.photos/seed/${encodeURIComponent(name)}/400/300`,
            isCustom: true,
          }
        }
      } catch (e) {
        console.error('Error loading custom templates:', e)
      }

      return templates
    } catch (error) {
      console.error('Error getting available templates:', error)
      return {}
    }
  },
}
