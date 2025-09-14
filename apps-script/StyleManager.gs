/**
 * GeminiCVCL - Style Manager
 * Handles resume styling and formatting templates
 */

import {
  RESUME_TEMPLATES,
  applyTemplateToDocument,
  getAllTemplates as sharedGetAllTemplates,
} from "./src/shared/docTemplates";

/**
 * Get all available resume templates
 */
function getAllTemplates() {
  return sharedGetAllTemplates();
}


/**
 * Apply Google XYZ Format to a document
 */
function applyGoogleXYZFormat(documentId) {
  return TemplateService.applyTemplateToDocument(documentId, "google-xyz");
}

/**
 * Format document to ensure it fits on one page
 */
function optimizeForOnePage(documentId) {
  try {
    const doc = DocumentApp.openById(documentId);
    const body = doc.getBody();

    // Get current font size and reduce if needed
    const currentFontSize = body.getFontSize() || 11;

    // Check if document is longer than one page
    // This is an approximation since we can't directly check page numbers
    const text = body.getText();
    const approxCharsPerPage = 3000; // Rough estimate

    if (text.length > approxCharsPerPage && currentFontSize > 10) {
      // Reduce font size to fit on one page
      const newSize = currentFontSize - 1;
      body.setFontSize(newSize);

      // Also reduce margins slightly
      const currentMargins = {
        top: body.getMarginTop() || 72,
        bottom: body.getMarginBottom() || 72,
        left: body.getMarginLeft() || 72,
        right: body.getMarginRight() || 72
      };

      // Reduce margins by about 10%
      body.setMarginTop(currentMargins.top * 0.9);
      body.setMarginBottom(currentMargins.bottom * 0.9);
      body.setMarginLeft(currentMargins.left * 0.9);
      body.setMarginRight(currentMargins.right * 0.9);
    }

    doc.saveAndClose();
    return { success: true };
  } catch (error) {
    return { error: true, message: `Could not optimize document: ${error.toString()}` };
  }
}

/**
 * Get the current document ID
 */
function getCurrentDocumentId() {
  try {
    const doc = DocumentApp.getActiveDocument();
    return doc ? doc.getId() : null;
  } catch (error) {
    console.error("Error getting current document:", error);
    return null;
  }
}

/**
 * Apply template to current document
 */
function applyTemplateToCurrentDocument(templateId) {
  const docId = getCurrentDocumentId();
  if (!docId) {
    return { error: true, message: "No active document found" };
  }

  return TemplateService.applyTemplateToDocument(docId, templateId);
}

/**
 * Create a custom style based on user preferences
 */
function createCustomStyle(options) {
  try {
    const customStyle = {
      name: "Custom Style",
      description: "User-defined custom style",
      margins: {
        top: options.marginTop || 36,
        bottom: options.marginBottom || 36,
        left: options.marginLeft || 54,
        right: options.marginRight || 54
      },
      fonts: {
        heading: options.headingFont || "Arial",
        body: options.bodyFont || "Arial",
        size: {
          heading1: options.heading1Size || 16,
          heading2: options.heading2Size || 14,
          body: options.bodySize || 11
        }
      }
    };

    // Store the custom style in user properties
    const props = PropertiesService.getUserProperties();
    const userSettings = JSON.parse(props.getProperty(USER_PROPS_KEYS.SETTINGS) || '{}');

    if (!userSettings.customStyles) {
      userSettings.customStyles = {};
    }

    userSettings.customStyles["custom-style"] = customStyle;
    props.setProperty(USER_PROPS_KEYS.SETTINGS, JSON.stringify(userSettings));

    return { success: true, style: customStyle };
  } catch (error) {
    console.error("Error creating custom style:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Apply specific section formatting
 */
function applyFormattingToSection(docId, sectionName, formattingOptions) {
  try {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    // Try to find the section by name
    const searchResult = body.findText(sectionName);
    if (!searchResult) {
      return { error: true, message: `Section "${sectionName}" not found` };
    }

    let paragraph = searchResult.getElement().getParent();

    // Apply formatting to this paragraph (the header)
    if (formattingOptions.bold) paragraph.setBold(true);
    if (formattingOptions.italic) paragraph.setItalic(true);
    if (formattingOptions.underline) paragraph.setUnderline(true);
    if (formattingOptions.fontSize) paragraph.setFontSize(formattingOptions.fontSize);
    if (formattingOptions.font) paragraph.setFontFamily(formattingOptions.font);
    if (formattingOptions.color) paragraph.setForegroundColor(formattingOptions.color);

    // Find the end of this section (next heading or end of document)
    let nextElement = paragraph;
    let foundElements = [];

    // Find next heading or end of document
    while (nextElement = nextElement.getNextSibling()) {
      if (nextElement.getType() === DocumentApp.ElementType.PARAGRAPH) {
        const nextPara = nextElement.asParagraph();

        if (nextPara.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
          // Found next heading, stop here
          break;
        }

        foundElements.push(nextPara);
      }
    }

    // Apply content formatting to all paragraphs in this section
    for (const element of foundElements) {
      if (formattingOptions.contentBold) element.setBold(formattingOptions.contentBold);
      if (formattingOptions.contentItalic) element.setItalic(formattingOptions.contentItalic);
      if (formattingOptions.contentFontSize) element.setFontSize(formattingOptions.contentFontSize);
      if (formattingOptions.contentFont) element.setFontFamily(formattingOptions.contentFont);
    }

    doc.saveAndClose();
    return { success: true };
  } catch (error) {
    console.error("Error formatting section:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Get available fonts for document styling
 */
function getAvailableFonts() {
  return [
    "Arial",
    "Roboto",
    "Times New Roman",
    "Calibri",
    "Georgia",
    "Verdana",
    "Open Sans",
    "Montserrat",
    "Helvetica",
    "Garamond",
    "Tahoma",
    "Trebuchet MS",
    "Comic Sans MS",
    "Courier New",
    "Lato",
    "Playfair Display"
  ];
}

/**
 * Get document page count estimation
 */
function estimateDocumentPageCount(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    const text = body.getText();

    // Rough estimate: ~3000 chars per page, depends on formatting
    const charCount = text.length;
    const estimatedPages = Math.ceil(charCount / 3000);

    return {
      success: true,
      pageCount: estimatedPages,
      charCount: charCount
    };
  } catch (error) {
    console.error("Error estimating page count:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * StyleManager class to handle document styling and templates
 */
class StyleManager {
  /**
   * Apply a style template to a document
   *
   * @param {Document} doc - Google Document object
   * @param {string} templateName - Name of the template to apply
   * @return {Object} Result of operation
   */
  static applyTemplate(doc, templateName = 'modern-professional') {
    try {
      const template = this.getTemplateSettings(templateName);
      if (template.error) return template;

      const body = doc.getBody();

      // Apply document margins
      if (template.margins) {
        body.setMarginTop(template.margins.top);
        body.setMarginBottom(template.margins.bottom);
        body.setMarginLeft(template.margins.left);
        body.setMarginRight(template.margins.right);
      }

      // Apply base font and line spacing to the entire document
      body.setAttributes({
        [DocumentApp.Attribute.FONT_FAMILY]: template.bodyFont || 'Arial',
        [DocumentApp.Attribute.FONT_SIZE]: template.fontSize || 11,
        [DocumentApp.Attribute.LINE_SPACING]: template.lineSpacing || 1.15
      });

      // Find all headings in the document
      const headingParagraphs = [];
      for (let i = 0; i < body.getNumChildren(); i++) {
        const element = body.getChild(i);
        if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const paragraph = element.asParagraph();
          if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
            headingParagraphs.push(paragraph);
          }
        }
      }

      // Apply styles to headings
      for (let i = 0; i < headingParagraphs.length; i++) {
        const paragraph = headingParagraphs[i];
        const level = paragraph.getHeading();

        // Apply the appropriate styling based on heading level
        if (level === DocumentApp.ParagraphHeading.HEADING1) {
          paragraph.setAttributes({
            [DocumentApp.Attribute.FONT_FAMILY]: template.headingFont || template.bodyFont || 'Arial',
            [DocumentApp.Attribute.FONT_SIZE]: template.heading1Size || 16,
            [DocumentApp.Attribute.FOREGROUND_COLOR]: template.headingColor || '#202124',
            [DocumentApp.Attribute.BOLD]: true
          });

          // Add bottom border to H1 for some templates
          if (templateName === 'modern-professional' || templateName === 'minimalist') {
            paragraph.setBold(true);
            // Set bottom border if the API supports it
            try {
              // This might not work in all environments
              paragraph.setBorder(null, null, {width: 1, color: template.accentColor || '#1a73e8'}, null);
            } catch (e) {
              // Fallback - add a horizontal line instead if setBorder fails
              // Border setting not supported, using fallback
            }
          }
        } else if (level === DocumentApp.ParagraphHeading.HEADING2) {
          paragraph.setAttributes({
            [DocumentApp.Attribute.FONT_FAMILY]: template.headingFont || template.bodyFont || 'Arial',
            [DocumentApp.Attribute.FONT_SIZE]: template.heading2Size || 14,
            [DocumentApp.Attribute.FOREGROUND_COLOR]: template.headingColor || '#202124',
            [DocumentApp.Attribute.BOLD]: true
          });
        } else if (level === DocumentApp.ParagraphHeading.HEADING3) {
          paragraph.setAttributes({
            [DocumentApp.Attribute.FONT_FAMILY]: template.headingFont || template.bodyFont || 'Arial',
            [DocumentApp.Attribute.FONT_SIZE]: template.heading3Size || 12,
            [DocumentApp.Attribute.FOREGROUND_COLOR]: template.headingColor || '#202124',
            [DocumentApp.Attribute.BOLD]: true
          });
        }
      }

      // Apply styles to list items
      const listItems = [];
      for (let i = 0; i < body.getNumChildren(); i++) {
        const child = body.getChild(i);
        if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
          listItems.push(child.asListItem());
        }
      }

      // Format list items
      if (listItems.length > 0) {
        listItems.forEach(item => {
          item.setAttributes({
            [DocumentApp.Attribute.FONT_FAMILY]: template.bodyFont || 'Arial',
            [DocumentApp.Attribute.FONT_SIZE]: template.fontSize || 11
          });

          // Apply proper indentation based on nesting level
          const nestingLevel = item.getNestingLevel();
          if (nestingLevel > 0) {
            item.setIndentStart(36 * nestingLevel);
            item.setIndentFirstLine(36 * nestingLevel);
          }
        });
      }

      return { success: true, message: 'Template applied successfully' };
    } catch (error) {
      console.error("Error applying template:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * Save a custom template
   *
   * @param {string} templateName - Name of the template
   * @param {Object} settings - Template settings
   * @return {Object} Result of operation
   */
  static saveCustomTemplate(templateName, settings) {
    try {
      const userProps = PropertiesService.getUserProperties();
      const customTemplates = JSON.parse(userProps.getProperty('documentTemplates') || '{}');

      // Add or update the template
      customTemplates[templateName] = settings;

      // Save back to user properties
      userProps.setProperty('documentTemplates', JSON.stringify(customTemplates));

      return { success: true, message: 'Template saved successfully' };
    } catch (error) {
      console.error("Error saving template:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * Get template settings by name
   *
   * @param {string} templateName - Name of the template to retrieve
   * @return {Object} Template settings or error
   */
  static getTemplateSettings(templateName) {
    try {
      // Check built-in templates first
      if (RESUME_TEMPLATES[templateName]) {
        return RESUME_TEMPLATES[templateName];
      }

      // Check custom templates
      const userProps = PropertiesService.getUserProperties();
      const customTemplates = JSON.parse(userProps.getProperty('documentTemplates') || '{}');

      if (customTemplates[templateName]) {
        return customTemplates[templateName];
      }

      return { error: true, message: `Template "${templateName}" not found` };
    } catch (error) {
      console.error("Error getting template settings:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * Get all available templates (built-in and custom)
   *
   * @return {Object} Map of template names to settings
   */
  static getAvailableTemplates() {
    return TemplateService.getAvailableTemplates();
  }

  /**
   * Format a resume document with the specific style
   *
   * @param {Document} doc - Google Document object
   * @param {string} templateName - Template to apply
   * @return {Object} Result of operation
   */
  static formatResume(doc, templateName = 'google-xyz') {
    try {
      // Apply base template first
      const baseResult = this.applyTemplate(doc, templateName);
      if (baseResult.error) return baseResult;

      // Clean any markdown artifacts
      this.cleanMarkdownArtifacts(doc);

      const body = doc.getBody();

      // Resume-specific formatting

      // Format bullet points for job descriptions
      const bulletPoints = [];
      for (let i = 0; i < body.getNumChildren(); i++) {
        const child = body.getChild(i);
        if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
          bulletPoints.push(child.asListItem());
        }
      }

      // Format all job/experience paragraphs under Experience section
      let inExperienceSection = false;
      const paragraphs = body.getParagraphs();

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const text = paragraph.getText().trim().toLowerCase();

        // Check if we're entering the experience section
        if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL &&
            (text.includes('experience') || text.includes('work history'))) {
          inExperienceSection = true;
          continue;
        }

        // Check if we're leaving the experience section
        if (inExperienceSection && paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL &&
            text !== '' && !text.includes('experience')) {
          inExperienceSection = false;
        }

        // Format job titles and companies in the experience section
        if (inExperienceSection && paragraph.getHeading() === DocumentApp.ParagraphHeading.NORMAL) {
          // Job title + company line is often formatted as "Position | Company | Date"
          const jobTitleMatch = text.match(/^([^|]+)\|([^|]+)\|(.+)$/);

          if (jobTitleMatch) {
            paragraph.setBold(true);
          }

          // Date ranges are often on their own line
          if (text.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*(-|–|to)\s*(present|current|\d{4})$/i)) {
            paragraph.setItalic(true);
          }
        }
      }

      return { success: true, message: 'Resume formatted successfully' };
    } catch (error) {
      console.error("Error formatting resume:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * Format a cover letter with the specific style
   *
   * @param {Document} doc - Google Document object
   * @param {string} templateName - Template to apply
   * @return {Object} Result of operation
   */
  static formatCoverLetter(doc, templateName = 'modern-professional') {
    try {
      // Apply base template first
      const baseResult = this.applyTemplate(doc, templateName);
      if (baseResult.error) return baseResult;

      // Clean any markdown artifacts
      this.cleanMarkdownArtifacts(doc);

      const body = doc.getBody();

      // Cover letter specific formatting
      const paragraphs = body.getParagraphs();

      // Set default line spacing
      body.setLineSpacing(1.15);

      let dateFound = false;
      let addressBlock = false;
      let greeting = false;
      let signature = false;

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const text = paragraph.getText().trim();

        // Date formatting (typically at the top)
        if (!dateFound && text.match(/^\w+\s+\d+,\s+\d{4}$/)) {
          paragraph.setAttributes({
            [DocumentApp.Attribute.SPACING_AFTER]: 12
          });
          dateFound = true;
          continue;
        }

        // Address block formatting
        if (!addressBlock && text.length > 0 && text.split('\n').length <= 1 &&
            !text.startsWith('Dear') && !text.endsWith(':')) {
          paragraph.setLineSpacing(1.0);

          if (i > 0 && paragraphs[i-1].getText().trim() === '') {
            // This might be the start of the recipient's address
            addressBlock = true;
          }
          continue;
        }

        // Greeting formatting
        if (!greeting && text.startsWith('Dear') || text.endsWith(':')) {
          paragraph.setAttributes({
            [DocumentApp.Attribute.SPACING_BEFORE]: 12,
            [DocumentApp.Attribute.SPACING_AFTER]: 12
          });
          greeting = true;
          continue;
        }

        // Body paragraphs
        if (greeting && !signature) {
          paragraph.setLineSpacing(1.15);
          paragraph.setSpacingAfter(0);

          // Check if this might be the signature block
          if (text.match(/^(sincerely|regards|truly|thank you|best|respectfully)/i)) {
            paragraph.setAttributes({
              [DocumentApp.Attribute.SPACING_BEFORE]: 12
            });
            signature = true;
          }
        }

        // Signature name block
        if (signature) {
          if (text === '' && i < paragraphs.length - 1) {
            // Empty line for signature space
            paragraph.setSpacingAfter(24); // Space for signature
          }
        }
      }

      return { success: true, message: 'Cover letter formatted successfully' };
    } catch (error) {
      console.error("Error formatting cover letter:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * Fix markdown parsing artifacts in document with improved handling
   *
   * @param {Document} doc - Google Document object
   * @return {Object} Result of operation
   */
  static cleanMarkdownArtifacts(doc) {
    try {
      const body = doc.getBody();

      // Find and fix markdown code artifacts
      const paragraphs = body.getParagraphs();

      for (const paragraph of paragraphs) {
        let text = paragraph.getText();

        // Handle list indicators with more formats (-, *, +, numbers)
        if (text.match(/^\s*[\-\*\+]\s/) || text.match(/^\s*\d+\.\s/)) {
          // Convert markdown list items to actual list items
          const listId = body.getListId() || body.insertListItem(0, '').getListId();
          paragraph.setListId(listId);

          // Handle numbered lists differently from bullet points
          if (text.match(/^\s*\d+\.\s/)) {
            // Set numbered list properties
            paragraph.setGlyphType(DocumentApp.GlyphType.NUMBER);
            paragraph.setText(text.replace(/^\s*\d+\.\s/, ''));
          } else {
            // Set bullet list properties
            paragraph.setGlyphType(DocumentApp.GlyphType.BULLET);
            paragraph.setText(text.replace(/^\s*[\-\*\+]\s/, ''));
          }

          text = paragraph.getText(); // Update text after modification
        }

        // Handle indentation levels (> for blockquotes)
        let indentLevel = 0;
        let originalText = text;
        while (text.startsWith('>')) {
          indentLevel++;
          text = text.substring(1).trim();
        }

        if (indentLevel > 0) {
          paragraph.setText(text);
          paragraph.setIndentStart(36 * indentLevel);
          paragraph.setIndentFirstLine(0);
          paragraph.setLeftIndent(36 * indentLevel);

          // Add quote styling (light gray background, left border)
          try {
            paragraph.setBorderLeft(2, '#CCCCCC', DocumentApp.BorderWidth.MEDIUM);
            paragraph.setBackgroundColor('#F9F9F9');
          } catch (e) {
            // Fallback if border setting fails
            // Border setting not supported for quotes, using fallback
          }
        }

        // Handle code blocks with proper formatting
        if (text.includes('```') || text.includes('`')) {
          // Check for triple backtick code blocks first
          if (text.includes('```')) {
            // Handle code blocks with language specification
            const codeBlockMatch = text.match(/```([a-z]*)\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
              const language = codeBlockMatch[1];
              const code = codeBlockMatch[2].trim();

              // Remove code block markers and apply code formatting
              paragraph.setText(code);
              paragraph.setFontFamily("Courier New");
              paragraph.setBackgroundColor("#f0f0f0");

              // Add language indicator as small text at the top if specified
              if (language && language.length > 0) {
                try {
                  const langIndicator = body.insertParagraphBefore(paragraph);
                  langIndicator.setText(language);
                  langIndicator.setFontSize(8);
                  langIndicator.setForegroundColor("#666666");
                  langIndicator.setItalic(true);
                } catch (e) {
                  console.error("Could not add language indicator:", e);
                }
              }
            } else {
              // Simple removal of code block markers
              text = text.replace(/```[a-z]*\n?|\n?```/g, '');
              paragraph.setText(text);
              paragraph.setFontFamily("Courier New");
              paragraph.setBackgroundColor("#f0f0f0");
            }
          } else if (text.includes('`')) {
            // Handle inline code with improved detection
            const textObj = paragraph.editAsText();
            const rawText = textObj.getText();

            // Process all inline code segments (`code`)
            let startIndex = -1;
            for (let i = 0; i < rawText.length; i++) {
              if (rawText[i] === '`') {
                if (startIndex === -1) {
                  startIndex = i;
                } else {
                  // Found a pair of backticks, format the content between them
                  textObj.deleteText(i, i);  // Delete ending backtick
                  textObj.deleteText(startIndex, startIndex); // Delete starting backtick

                  // Adjust indices for the deletions
                  const formatStart = startIndex;
                  const formatEnd = i - 2; // -2 for the two removed backticks

                  if (formatEnd >= formatStart) {
                    textObj.setFontFamily(formatStart, formatEnd, "Courier New");
                    textObj.setBackgroundColor(formatStart, formatEnd, "#f0f0f0");
                  }

                  i -= 2; // Adjust index for the removed backticks
                  startIndex = -1;
                }
              }
            }
          }
        }

        // Process text formatting (bold, italic, underline, strikethrough)
        let textObj = paragraph.editAsText();
        let rawText = textObj.getText();

        // Handle **bold** text with improved pattern matching
        let boldPattern = /\*\*(.*?)\*\*/g;
        let match;
        while ((match = boldPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set bold formatting
            textObj.setBold(start + 2, end - 2, true);

            // Remove the ** markers
            textObj.deleteText(end - 1, end);
            textObj.deleteText(start, start + 1);

            // Update the text and indices for next search
            rawText = textObj.getText();
            boldPattern = /\*\*(.*?)\*\*/g;
          }
        }

        // Handle *italic* text with improved pattern matching
        textObj = paragraph.editAsText();
        rawText = textObj.getText();

        // More robust pattern that avoids confusion with bold markers
        let italicPattern = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
        while ((match = italicPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set italic formatting
            textObj.setItalic(start + 1, end - 1, true);

            // Remove the * markers
            textObj.deleteText(end, end);
            textObj.deleteText(start, start);

            // Update the text and indices
            rawText = textObj.getText();
            italicPattern = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
          }
        }

        // Handle _italic_ text (alternative markdown syntax)
        textObj = paragraph.editAsText();
        rawText = textObj.getText();
        let underscoreItalicPattern = /(?<!_)_(.*?)(?<!_)_(?!_)/g;
        while ((match = underscoreItalicPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set italic formatting
            textObj.setItalic(start + 1, end - 1, true);

            // Remove the _ markers
            textObj.deleteText(end, end);
            textObj.deleteText(start, start);

            // Update the text and indices
            rawText = textObj.getText();
            underscoreItalicPattern = /(?<!_)_(.*?)(?<!_)_(?!_)/g;
          }
        }

        // Handle __bold__ text (alternative markdown syntax)
        textObj = paragraph.editAsText();
        rawText = textObj.getText();
        let underscoreBoldPattern = /__(.*?)__/g;
        while ((match = underscoreBoldPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set bold formatting
            textObj.setBold(start + 2, end - 2, true);

            // Remove the __ markers
            textObj.deleteText(end - 1, end);
            textObj.deleteText(start, start + 1);

            // Update the text and indices
            rawText = textObj.getText();
            underscoreBoldPattern = /__(.*?)__/g;
          }
        }

        // Handle ~~strikethrough~~ markdown
        textObj = paragraph.editAsText();
        rawText = textObj.getText();
        let strikethroughPattern = /~~(.*?)~~/g;
        while ((match = strikethroughPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set strikethrough formatting
            textObj.setStrikethrough(start + 2, end - 2, true);

            // Remove the ~~ markers
            textObj.deleteText(end - 1, end);
            textObj.deleteText(start, start + 1);

            // Update the text and indices
            rawText = textObj.getText();
            strikethroughPattern = /~~(.*?)~~/g;
          }
        }

        // Handle ==highlight== markdown (less common but useful)
        textObj = paragraph.editAsText();
        rawText = textObj.getText();
        let highlightPattern = /==(.*?)==/g;
        while ((match = highlightPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const content = match[1];

          if (content && content.length > 0) {
            // Set highlight formatting
            textObj.setBackgroundColor(start + 2, end - 2, "#FFFF00");

            // Remove the == markers
            textObj.deleteText(end - 1, end);
            textObj.deleteText(start, start + 1);

            // Update the text and indices
            rawText = textObj.getText();
            highlightPattern = /==(.*?)==/g;
          }
        }

        // Handle [link](url) markdown syntax
        textObj = paragraph.editAsText();
        rawText = textObj.getText();
        let linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        while ((match = linkPattern.exec(rawText)) !== null) {
          const start = match.index;
          const end = start + match[0].length - 1;
          const linkText = match[1];
          const url = match[2];

          if (linkText && linkText.length > 0 && url && url.length > 0) {
            // Preset the link text (replace the entire [text](url) with just the text)
            const linkStart = start;
            const linkEnd = end;

            // Replace the markdown link with just the text
            textObj.deleteText(linkStart, linkEnd);
            textObj.insertText(linkStart, linkText);

            // Now set the link on the inserted text
            textObj.setLinkUrl(linkStart, linkStart + linkText.length - 1, url);
            textObj.setForegroundColor(linkStart, linkStart + linkText.length - 1, "#1155CC");
            textObj.setUnderline(linkStart, linkStart + linkText.length - 1, true);

            // Update the text and indices for next search
            rawText = textObj.getText();
            linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
          }
        }
      }

      // Handle header formatting (# Headers)
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const text = paragraph.getText();

        // Check for header indicators
        const headerMatch = text.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerText = headerMatch[2];

          // Map Markdown header levels to Google Docs heading styles
          let headingStyle;
          switch (level) {
            case 1: headingStyle = DocumentApp.ParagraphHeading.HEADING1; break;
            case 2: headingStyle = DocumentApp.ParagraphHeading.HEADING2; break;
            case 3: headingStyle = DocumentApp.ParagraphHeading.HEADING3; break;
            case 4: headingStyle = DocumentApp.ParagraphHeading.HEADING4; break;
            case 5: headingStyle = DocumentApp.ParagraphHeading.HEADING5; break;
            case 6: headingStyle = DocumentApp.ParagraphHeading.HEADING6; break;
          }

          paragraph.setText(headerText);
          paragraph.setHeading(headingStyle);
        }
      }

      // Handle horizontal rules (---, ***, ___)
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const text = paragraph.getText().trim();

        if (text === '---' || text === '***' || text === '___' || text.match(/^-{3,}$/) || text.match(/^\*{3,}$/) || text.match(/^_{3,}$/)) {
          try {
            // Create horizontal line by setting bottom border
            paragraph.setText(''); // Remove the markdown
            paragraph.setAttributes({
              [DocumentApp.Attribute.BORDER_WIDTH]: 1,
              [DocumentApp.Attribute.BORDER_COLOR]: '#CCCCCC'
            });
            // Set paragraph border - only bottom border
            paragraph.setBorder(null, null, true, null);
            paragraph.setHeight(8); // Small height for the line
          } catch (e) {
            console.error("Could not create horizontal rule:", e);
          }
        }
      }

      return { success: true, message: 'Markdown artifacts cleaned successfully' };
    } catch (error) {
      console.error("Error cleaning markdown artifacts:", error);
      return { error: true, message: error.toString() };
    }
  }
}