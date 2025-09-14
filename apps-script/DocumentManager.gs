import { applyTemplateToDocument, getAllTemplates as sharedGetAllTemplates } from "./src/shared/docTemplates";

/**
 * @description Analyzes the current document and extracts its structure.
 * @returns {Object} An object containing the document structure, or an error object if the document cannot be accessed.
 */
function analyzeCurrentDocument() {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }

    const body = doc.getBody();
    const text = body.getText();

    // Extract structure by analyzing headings
    const structure = {
      title: doc.getName(),
      headings: [],
      content: text,
      sections: {}
    };

    let currentHeading = null;
    let currentContent = [];

    // Parse each paragraph to build document structure
    for (let i = 0; i < body.getNumChildren(); i++) {
      const element = body.getChild(i);

      if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
        const paragraph = element.asParagraph();
        const heading = paragraph.getHeading();
        const paragraphText = paragraph.getText();

        if (heading !== DocumentApp.ParagraphHeading.NORMAL) {
          // If we had a previous heading, save its content
          if (currentHeading !== null) {
            structure.sections[currentHeading] = currentContent.join('\n\n');
            currentContent = [];
          }

          // Set new current heading
          currentHeading = paragraphText;
          structure.headings.push(paragraphText);
        } else if (currentHeading !== null) {
          // Add to current section
          if (paragraphText.trim()) {
            currentContent.push(paragraphText);
          }
        }
      }
    }

    // Save final section
    if (currentHeading !== null) {
      structure.sections[currentHeading] = currentContent.join('\n\n');
    }

    return structure;
  } catch (error) {
    console.error(error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Creates a resume document in the GeminiCVCL folder.
 * @param {string} content - The content of the resume.
 * @param {string} [title="New Resume"] - The title of the document.
 * @returns {GoogleAppsScript.Document.Document | {error: boolean, message: string}} The created document object, or an error object if creation fails.
 */
function createResumeDocument(content, title = "New Resume") {
  try {
    const folder = getOrCreateAppFolder();
    const doc = DocumentApp.create(title);
    const body = doc.getBody();

    // Clear any default content
    body.clear();

    // Check if content is plain text or has markdown formatting
    if (content.includes('#') || content.includes('*') || content.includes('-')) {
      // Format content with proper headings and structure
      insertMarkdownContent(body, content);
    } else {
      // If plain text, attempt to structure it with AI
      const structuredContent = structureResumeContent(content);
      insertMarkdownContent(body, structuredContent);
    }

    // Apply default resume styling
    TemplateService.applyTemplateToDocument(doc.getId(), "modern-professional");

    // Move to application folder
    folder.addFile(DriveApp.getFileById(doc.getId()));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(doc.getId()));

    // Add metadata
    doc.setDescription("Resume created with GeminiCVCL on " + new Date().toLocaleString());

    return doc;
  } catch (error) {
    console.error("Error creating resume document:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Structures plain resume content using AI (Gemini).
 * @param {string} plainContent - The plain text content of the resume.
 * @returns {string} The structured resume content in markdown format.
 */
function structureResumeContent(plainContent) {
  // Use Gemini to structure plain text into a properly formatted resume
  const systemPrompt = "You are an expert at formatting resumes. Convert plain text into a well-structured resume with markdown formatting.";

  const prompt = `Convert this plain text resume content into a well-structured markdown resume with:
- Use # for main sections (like "Experience", "Education", "Skills")
- Use bullet points (*) for listing skills and achievements
- Format job titles and companies in bold
- Keep all the original information but organize it properly
- Identify and properly format dates, skills, and achievements

Here is the content to structure:

${plainContent}`;

  const result = generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.1,
    maxOutputTokens: 4096
  });

  if (result.error) {
    console.error("Error structuring resume content:", result.message);
    return plainContent; // Return original content if structuring fails
  }

  return result.text;
}

/**
 * @description Retrieves template settings based on the template name.
 * @param {string} [templateName='modern-professional'] - The name of the template.
 * @returns {Object} An object containing the template settings, or a default object if the template is not found.
 */
function getTemplateSettings(templateName = 'modern-professional') {
  try {
    // Built-in templates
    const templates = {
      'modern-professional': {
        bodyFont: 'Arial',
        fontSize: 11,
        lineSpacing: 1.15,
        heading1Size: 16,
        heading2Size: 14,
        headingColor: '#202124',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72
        }
      },
      'creative': {
        bodyFont: 'Roboto',
        fontSize: 11,
        lineSpacing: 1.2,
        heading1Size: 18,
        heading2Size: 15,
        headingColor: '#3F51B5',
        accentColor: '#9c27b0',
        margins: {
          top: 60,
          bottom: 60,
          left: 72,
          right: 60
        }
      },
      'traditional': {
        bodyFont: 'Times New Roman',
        fontSize: 12,
        lineSpacing: 1.0,
        heading1Size: 16,
        heading2Size: 14,
        headingColor: '#000000',
        accentColor: '#000000',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72
        }
      },
      'minimalist': {
        bodyFont: 'Arial',
        fontSize: 10,
        lineSpacing: 1.1,
        heading1Size: 14,
        heading2Size: 12,
        headingColor: '#424242',
        accentColor: '#616161',
        margins: {
          top: 54,
          bottom: 54,
          left: 54,
          right: 54
        }
      }
    };

    // Check for custom templates
    try {
      const userProps = PropertiesService.getUserProperties();
      const customTemplates = JSON.parse(userProps.getProperty('documentTemplates') || '{}');

      // Merge with built-in templates (custom templates override built-in ones)
      Object.assign(templates, customTemplates);
    } catch (e) {
      console.error("Error loading custom templates:", e);
    }

    // Return the requested template or default to modern-professional
    return templates[templateName] || templates['modern-professional'];
  } catch (error) {
    console.error("Error loading template settings:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Creates a cover letter document in the GeminiCVCL folder.
 * @param {string} content - The content of the cover letter.
 * @param {string} [title="Cover Letter"] - The title of the document.
 * @returns {GoogleAppsScript.Document.Document | {error: boolean, message: string}} The created document object, or an error object if creation fails.
 */
function createCoverLetterDocument(content, title = "Cover Letter") {
  try {
    const folder = getOrCreateAppFolder();
    const doc = DocumentApp.create(title);
    const body = doc.getBody();

    // Clear any default content
    body.clear();

    // Check if the content has proper business letter formatting
    if (!isCoverLetterFormatted(content)) {
      // Structure the content as a proper business letter using AI
      const formattedContent = formatCoverLetter(content);
      if (!formattedContent.error) {
        content = formattedContent.text;
      }
    }

    // Insert content with business letter formatting
    insertCoverLetterContent(body, content);

    // Apply cover letter styling
    applyCoverLetterStyling(doc);

    // Move to application folder
    folder.addFile(DriveApp.getFileById(doc.getId()));
    DriveApp.getRootFolder().removeFile(DriveApp.getFileById(doc.getId()));

    // Add metadata
    doc.setDescription("Cover letter created with GeminiCVCL on " + new Date().toLocaleString());

    return doc;
  } catch (error) {
    console.error("Error creating cover letter document:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Checks if the provided content has basic cover letter formatting.
 * @param {string} content - The content to check.
 * @returns {boolean} True if the content appears to be formatted as a cover letter, false otherwise.
 */
function isCoverLetterFormatted(content) {
  const lowerContent = content.toLowerCase();
  // Check for typical cover letter elements
  return (
    lowerContent.includes("dear") &&
    (lowerContent.includes("sincerely") ||
     lowerContent.includes("regards") ||
     lowerContent.includes("truly") ||
     lowerContent.includes("thank you"))
  );
}

/**
 * @description Formats plain text content into a properly structured cover letter using AI (Gemini).
 * @param {string} content - The plain text content.
 * @returns {string} The formatted cover letter content.
 */
function formatCoverLetter(content) {
  const systemPrompt = "You are an expert at writing professional cover letters with proper formatting and structure.";

  const prompt = `Format this content as a professional business cover letter with:
- Today's date: ${new Date().toLocaleDateString()}
- Recipient address block (use "Hiring Manager" if no specific name)
- Formal greeting
- Body paragraphs
- Professional closing
- Space for signature
- Include all information from the original content but properly formatted

Original content:
${content}`;

  return generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.1,
    maxOutputTokens: 2048
  });
}

/**
 * @description Applies basic styling to a cover letter document.
 * @param {GoogleAppsScript.Document.Document} doc - The cover letter document object.
 */
function applyCoverLetterStyling(doc) {
  const body = doc.getBody();

  // Business letter formatting
    body.setLineSpacing(1.15);
}

/**
 * @description Inserts markdown-formatted content into a Google Docs body, handling headings and paragraphs.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The markdown content to insert.
 */
function insertMarkdownContent(body, content) {
  // Split the content by sections (defined by headings)
  const sections = content.split(/(?=#{1,3} )/);

  for (let section of sections) {
    if (!section.trim()) continue;

    // Check if section starts with heading
    if (section.startsWith('#')) {
      // Determine heading level and extract title
      const headingMatch = section.match(/^(#{1,3}) (.*?)(?:\n|$)/);
      if (headingMatch) {
        const level = headingMatch[1].length; // Number of # symbols
        const title = headingMatch[2].trim();

        // Add heading with appropriate level
        const heading = body.appendParagraph(title);
        if (level === 1) {
          heading.setHeading(DocumentApp.ParagraphHeading.HEADING1);
          heading.setAttributes({
            [DocumentApp.Attribute.FONT_SIZE]: 16,
            [DocumentApp.Attribute.BOLD]: true
          });
        } else if (level === 2) {
          heading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
          heading.setAttributes({
            [DocumentApp.Attribute.FONT_SIZE]: 14,
            [DocumentApp.Attribute.BOLD]: true
          });
        } else {
          heading.setHeading(DocumentApp.ParagraphHeading.HEADING3);
          heading.setAttributes({
            [DocumentApp.Attribute.FONT_SIZE]: 12,
            [DocumentApp.Attribute.BOLD]: true
          });
        }

        // Process content following the heading
        const contentAfterHeading = section.substring(headingMatch[0].length).trim();
        if (contentAfterHeading) {
          insertFormattedParagraphs(body, contentAfterHeading);
        }
      }
    } else {
      // No heading, just regular content
      insertFormattedParagraphs(body, section);
    }
  }
}

/**
 * @description Inserts formatted paragraphs into a document body, handling lists, blockquotes, and bold/italic text.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The content to insert.
 */
function insertFormattedParagraphs(body, content) {
  // Split into paragraphs
  const paragraphs = content.split(/\n+/);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check for list items with better pattern matching
    if (trimmed.match(/^[\*\-\+]\s+/)) {
      // Bullet list - strip the marker and create a proper list item
      const listItem = body.appendListItem(trimmed.replace(/^[\*\-\+]\s+/, ''));
      listItem.setGlyphType(DocumentApp.GlyphType.BULLET);

      // Add professional formatting:
      listItem.setIndentStart(18);
      listItem.setIndentFirstLine(18);

      // Apply special formatting for skills or achievements
      if (trimmed.toLowerCase().includes('skill') ||
          trimmed.includes('%') ||
          trimmed.match(/\d+(\+|\s+years?)/i)) {
        listItem.setBold(false);
      }
    } else if (trimmed.match(/^\d+[\.\)]\s+/)) {
      // Numbered list
      const listItem = body.appendListItem(trimmed.replace(/^\d+[\.\)]\s+/, ''));
      listItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
      listItem.setIndentStart(18);
      listItem.setIndentFirstLine(18);
    } else if (trimmed.match(/^>.+/)) {
      // Blockquote
      const quote = body.appendParagraph(trimmed.replace(/^>\s*/, ''));
      quote.setIndentStart(36);
      quote.setIndentFirstLine(36);
      quote.setItalic(true);
    } else if (trimmed.match(/^\*\*.+\*\*$/)) {
      // Bold paragraph
      const boldPara = body.appendParagraph(trimmed.replace(/^\*\*|\*\*$/g, ''));
      boldPara.setBold(true);
    } else if (trimmed.match(/^_.+_$/)) {
      // Italic paragraph
      const italicPara = body.appendParagraph(trimmed.replace(/^_|_$/g, ''));
      italicPara.setItalic(true);
    } else {
      // Regular paragraph with special formatting for job titles and dates
      let paragraph = body.appendParagraph(trimmed);

      // Auto-detect and format job titles, companies, and dates
      // Example: "Software Engineer | Google | 2018-2020"
      const jobTitleMatch = trimmed.match(/^([A-Za-z\s]+)\s*[\|,]\s*([A-Za-z\s]+)\s*[\|,]\s*(\d{4}.*\d{4}|\d{4}.*present)/i);
      if (jobTitleMatch) {
        paragraph.setBold(true);
      }

      // Check for date ranges and format them consistently
      const dateMatch = trimmed.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*(-|–|to)\s*(Present|Current|\d{4})\b/i);

      if (dateMatch) {
        paragraph.setItalic(true);
      }
    }
  }
}

/**
 * @description Retrieves the text content of the currently active document.
 * @returns {string | {error: boolean, message: string}} The document content as a string, or an error object if no document is active.
 */
function getCurrentDocumentContent() {
  const doc = DocumentApp.getActiveDocument();
  if (!doc) {
    return { error: true, message: "No active document found" };
  }

  return doc.getBody().getText();
}

/**
 * @description Extracts the document ID from a Google Docs URL.
 * @param {string} url - The URL of the Google Doc.
 * @returns {string | null} The document ID, or null if the URL is invalid.
 */
function extractDocumentIdFromUrl(url) {
  // Handle standard Google Docs URLs
  let match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];

  // Handle direct document IDs
  match = url.match(/^([a-zA-Z0-9-_]+)$/);
  if (match) return match[1];

  return null;
}

/**
 * @description Retrieves the text content of a document given its ID.
 * @param {string} docId - The ID of the document.
 * @returns {string | {error: boolean, message: string}} The document content as a string, or an error object if the document cannot be accessed.
 */
function getDocumentContentById(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    return doc.getBody().getText();
  } catch (error) {
    return { error: true, message: `Could not open document: ${error.toString()}` };
  }
}

/**
 * @description Updates sections of the current document with AI-generated content.
 * @param {string} aiContent - The AI-generated content, expected to be in a specific section-based format.
 * @returns {{success: boolean, message: string} | {error: boolean, message: string}} A success or error object.
 */
function updateCurrentDocumentSections(aiContent) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) return { error: true, message: "No active document found" };

    const body = doc.getBody();

    // Parse the AI content for section updates
    // Format should be: ##SECTION_NAME## content ##END_SECTION##
    const sectionPattern = /##([A-Z_]+)##\s*([\s\S]*?)##END_SECTION##/g;
    let match;
    let updates = [];

    while ((match = sectionPattern.exec(aiContent)) !== null) {
      updates.push({
        sectionName: match[1],
        content: match[2].trim()
      });
    }

    // If no structured updates found, just append the content
    if (updates.length === 0) {
      body.appendParagraph("--- AI Suggestions ---");
      body.appendParagraph(aiContent);
      doc.saveAndClose();
      return { success: true, message: "Added AI suggestions at the end of document" };
    }

    // Process each structured update
    for (const update of updates) {
      // Try to find an existing section with heading text that includes the section name
      let sectionFound = false;

      // Convert section name to title case for matching
      const sectionTitle = update.sectionName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      // Search for headings that match
      for (let i = 0; i < body.getNumChildren(); i++) {
        const element = body.getChild(i);

        if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const paragraph = element.asParagraph();
          if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
            const text = paragraph.getText();

            if (text.includes(sectionTitle)) {
              // Found the section, insert after this heading
              let nextIndex = i + 1;

              // Remove existing content until next heading or end of document
              while (nextIndex < body.getNumChildren()) {
                const nextElement = body.getChild(nextIndex);

                if (nextElement.getType() === DocumentApp.ElementType.PARAGRAPH) {
                  const nextPara = nextElement.asParagraph();

                  if (nextPara.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
                    // Found next heading, stop here
                    break;
                  }
                }

                // Remove this element and continue (don't increment nextIndex)
                body.removeChild(nextElement);
              }

              // Now insert the new content
              insertContentAtPosition(body, update.content, nextIndex);
              sectionFound = true;
              break;
            }
          }
        }
      }

      // If section not found, add it as new
      if (!sectionFound) {
        body.appendParagraph(sectionTitle)
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);

        insertContentToDocument(doc, update.content);
      }
    }

    doc.saveAndClose();
    return {
      success: true,
      message: `Updated ${updates.length} document sections`
    };
  } catch (error) {
    console.error(error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Inserts content at a specific position within a Google Docs body, handling various element types.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The content to insert.
 * @param {number} position - The index at which to insert the content.
 */
function insertContentAtPosition(body, content, position) {
  // Split the content into paragraphs
  const paragraphs = content.split('\n');

  // Insert paragraphs in reverse to maintain proper order
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const paragraph = paragraphs[i].trim();

    if (!paragraph) continue;

    if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
      // This is a bullet point
      const bulletItem = body.insertListItem(position, paragraph.substring(2));
      bulletItem.setGlyphType(DocumentApp.GlyphType.BULLET);
    } else if (paragraph.match(/^\d+\./)) {
      // This is a numbered list item
      const numberItem = body.insertListItem(position, paragraph.replace(/^\d+\./, '').trim());
      numberItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
    } else if (paragraph.startsWith('> ')) {
      // This is a blockquote
      const quote = body.insertParagraph(position, paragraph.substring(2));
      quote.setIndentStart(36);
      quote.setIndentFirstLine(36);
    } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      // Bold paragraph
      const p = body.insertParagraph(position, paragraph.replace(/^\*\*|\*\*$/g, ''));
      p.setBold(true);
    } else {
      // Regular paragraph
      body.insertParagraph(position, paragraph);
    }
  }
}

/**
 * @description Creates a new cover letter document, using AI to format content if needed.
 * @param {string} content - The content for the cover letter.
 * @param {string} [title="Cover Letter"] - The title for the new document.
 * @returns {GoogleAppsScript.Document.Document} The created document.
 */

/**
 * @description Creates job-specific documents (resume and cover letter) in a new folder.
 * @param {string} resumeContent - The content of the resume.
 * @param {string} coverLetterContent - The content of the cover letter.
 * @param {{company: string, position: string, url: string}} jobInfo - Information about the job.
 * @returns {{folderId: string, folderUrl: string, resumeId: string, resumeUrl: string, coverId: string, coverUrl: string}} An object containing the IDs and URLs of the created folder and documents.
 */
function createJobSpecificDocuments(resumeContent, coverLetterContent, jobInfo) {
  // Create a new folder for this job application
  const companyName = jobInfo.company || "Company";
  const position = jobInfo.position || "Position";
  const folderName = `${companyName} - ${position}`;
  const parentFolder = getOrCreateAppFolder();
  const jobFolder = parentFolder.createFolder(folderName);
  {
    // Create resume document
    const resumeTitle = `Resume - ${companyName} - ${position}`;
    const resumeDoc = DocumentApp.create(resumeTitle);
    const resumeFile = DriveApp.getFileById(resumeDoc.getId());
    resumeFile.moveTo(jobFolder);

    // Apply resume content
    const resumeBody = resumeDoc.getBody();
    resumeBody.clear();
    insertContentToDocument(resumeDoc, resumeContent);

    // Create cover letter document
    const letterTitle = `Cover Letter - ${companyName} - ${position}`;
    const letterDoc = DocumentApp.create(letterTitle);
    const letterFile = DriveApp.getFileById(letterDoc.getId());
    letterFile.moveTo(jobFolder);

    // Apply cover letter content
    const letterBody = letterDoc.getBody();
    letterBody.clear();
    insertContentToDocument(letterDoc, coverLetterContent);

    // Save job posting URL in a text file if provided
    if (jobInfo.url) {
      const textFile = DriveApp.createFile(`Job Posting Info.txt`,
        `Job URL: ${jobInfo.url}\nApplication Date: ${new Date().toLocaleDateString()}`);
      textFile.moveTo(jobFolder);
    }

    return {
      folderId: jobFolder.getId(),
      folderUrl: `https://drive.google.com/drive/folders/${jobFolder.getId()}`,
      resumeId: resumeDoc.getId(),
      resumeUrl: resumeDoc.getUrl(),
      coverId: letterDoc.getId(),
      coverUrl: letterDoc.getUrl()
    };
  }
}

/**
 * @description Creates job-specific documents from provided data, utilizing AI for content generation.
 * @param {string} resumeContent - The content of the existing resume.
 * @param {string} jobContent - The content of the job posting.
 * @param {{company: string, position: string, url: string}} jobInfo - Information about the job.
 * @returns {{folderId: string, folderUrl: string, resumeId: string, resumeUrl: string, coverId: string, coverUrl: string} | {error: boolean, message: string}} An object containing document information, or an error object.
 */
function createJobSpecificDocumentsFromData(resumeContent, jobContent, jobInfo) {
  try {
    // Use Gemini to generate tailored content
    const result = generateTargetedDocuments(resumeContent, jobContent);
    if (result.error) {
      return { error: true, message: result.message };
    }

    // Parse the AI response
    const response = result.text;

    // Extract resume content
    let resumeSection = response.match(/TAILORED RESUME\s*\n([\s\S]*?)(?=\n*COVER LETTER|\n*$)/i);
    const tailoredResumeContent = resumeSection ? resumeSection[1].trim() : '';

    // Extract cover letter content
    let coverSection = response.match(/COVER LETTER\s*\n([\s\S]*?)(?=\n*KEYWORDS|\n*$)/i);
    const coverLetterContent = coverSection ? coverSection[1].trim() : '';

    // If we couldn't extract the content properly, use some defaults
    const resumeToUse = tailoredResumeContent ||
      `# Resume for ${jobInfo.position} at ${jobInfo.company}\n\n${resumeContent}`;

    const coverToUse = coverLetterContent ||
      `# Cover Letter for ${jobInfo.position} at ${jobInfo.company}\n\nDear Hiring Manager,\n\nI am writing to express my interest in the ${jobInfo.position} position at ${jobInfo.company}.\n\nSincerely,\n[Your Name]`;

    // Create the documents
    return createJobSpecificDocuments(resumeToUse, coverToUse, jobInfo);
  } catch (error) {
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Inserts content into a Google Doc, handling basic formatting like sections and lists.
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {string} content - The content to insert.
 */
function insertContentToDocument(doc, content) {
  const body = doc.getBody();

  // Split the content by sections (assuming sections are separated by headers)
  const sections = content.split(/(?=#{1,3} )/);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();

    if (!section) continue;

    // Check if this section starts with a header
    const isHeader = section.startsWith('#');

    if (isHeader) {
      // Determine header level (H1, H2, or H3)
      const level = section.match(/^(#{1,3})/)[0].length;
      const headerText = section.replace(/^#{1,3} /, '').split('\n')[0];

      // Add the header
      const headerParagraph = body.appendParagraph(headerText);
      headerParagraph.setHeading(DocumentApp.ParagraphHeading['HEADING' + level]);

      // Add the content following the header
      const content = section.substring(section.indexOf('\n')).trim();
      if (content) {
        formatAndInsertParagraphs(body, content);
      }
    } else {
      // No header, just add the content
      formatAndInsertParagraphs(body, section);
    }

    // Add some space between sections
    if (i < sections.length - 1) {
      body.appendParagraph('').setLineSpacing(1);
    }
  }
  doc.saveAndClose();
}

/**
 * @description Formats and inserts paragraphs into a document body, handling lists, blockquotes, and bold text.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The content to insert, split into paragraphs.
 */
function formatAndInsertParagraphs(body, content) {
  // Split the content into paragraphs
  const paragraphs = content.split('\n');

  for (let i = 0; i < paragraphs.length; i++) {
    let paragraph = paragraphs[i].trim();

    if (!paragraph) continue;

    if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
      // This is a bullet point
      const bulletItem = body.appendListItem(paragraph.substring(2));
      bulletItem.setGlyphType(DocumentApp.GlyphType.BULLET);
    } else if (paragraph.match(/^\d+\./)) {
      // This is a numbered list item
      const numberItem = body.appendListItem(paragraph.replace(/^\d+\./, '').trim());
      numberItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
    } else if (paragraph.startsWith('> ')) {
      // This is a blockquote
      const quote = body.appendParagraph(paragraph.substring(2));
      quote.setIndentStart(36);
      quote.setIndentFirstLine(36);
    } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      // Bold paragraph
      const p = body.appendParagraph(paragraph.replace(/^\*\*|\*\*$/g, ''));
      p.setBold(true);
    } else {
      // Regular paragraph
      body.appendParagraph(paragraph);
    }
  }
}

/**
 * @description Inserts cover letter content, attempting to format it according to business letter conventions.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The cover letter content.
 */
function insertCoverLetterContent(body, content) {
  // Split into paragraphs
  const paragraphs = content.split(/\n+/);

  // Keep track of sections for formatting
  let inHeaderSection = true;
  let inBodySection = false;
  let inClosingSection = false;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    // Check for transitions between document sections
    if (para.toLowerCase().includes('dear ')) {
      inHeaderSection = false;
      inBodySection = true;
    } else if (inBodySection &&
              (para.toLowerCase().includes('sincerely') ||
               para.toLowerCase().includes('regards') ||
               para.toLowerCase().includes('yours truly'))) {       inBodySection = false;
      inClosingSection = true;
    }

    // Format based on section
    if (inHeaderSection) {
      // Date and address blocks aligned left
      body.appendParagraph(para);
    } else if (inBodySection) {
      if (para.toLowerCase().startsWith('dear ')) {
        // Greeting
        const greeting = body.appendParagraph(para);
        body.appendParagraph(''); // Add space after greeting
      } else {
        // Body paragraphs with indentation
        const bodyPara = body.appendParagraph(para);
      }
    } else if (inClosingSection) {
      // Add extra space before closing
      if (paragraphs[i-1] && paragraphs[i-1].trim()) {
        body.appendParagraph('');
      }

      // Closing and signature aligned left
      const closingPara = body.appendParagraph(para);

      // Add space for signature if not already in the content
      if (!paragraphs[i+1] || !paragraphs[i+1].trim()) {
        body.appendParagraph('');
        body.appendParagraph('');
      }
    }
  }
}

/**
 * @description Inserts paragraphs into a document, handling basic formatting like bullet points and numbered lists.
 * @param {GoogleAppsScript.Document.Body} body - The body of the document.
 * @param {string} content - The content to insert.
 */
function insertBasicContent(body, content) {
  const paragraphs = content.split(/\n+/);

  for (const para of paragraphs) {
    if (para.trim()) {
      body.appendParagraph(para);
    }
  }
}

/**
 * @description Creates a new Google Doc from HTML content, converting it to a simplified markdown-like format first.
 * @param {string} htmlContent - The HTML content.
 * @param {string} title - The title for the new document.
 * @returns {GoogleAppsScript.Document.Document} The created document.
 */
function createDocFromHtml(htmlContent, title) {
  // First convert HTML to simplified markdown-like format
  const markdownContent = convertHtmlToSimpleFormat(htmlContent);

  // Create the document and insert content
  const doc = DocumentApp.create(title);
  insertContentWithIntelligentFormatting(doc, markdownContent);

  // Move to app folder
  const file = DriveApp.getFileById(doc.getId());
  const folder = getOrCreateAppFolder();
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return doc;
}

/**
 * @description Converts HTML content to a simplified format (similar to Markdown) for better compatibility with Google Docs.
 * @param {string} html - The HTML content to convert.
 * @returns {string} The simplified content.
 */
function convertHtmlToSimpleFormat(html) {
  // Replace common HTML elements with markdown-like syntax
  let content = html;

  // Replace headings
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

  // Replace paragraphs
  content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Replace lists
  content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(match, listContent) {
    return listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n');
  });

  content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function(match, listContent) {
    let index = 1;
    return listContent.replace(/<li[^>]*>(.*?)<\/li>/gi, function(m, item) {
      return (index++) + '. ' + item + '\n';
    });
  });

  // Replace basic formatting
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  content = content.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  content = content.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Replace breaks
  content = content.replace(/<br\s*\/?>/gi, '\n');

  // Strip any remaining HTML tags
  content = content.replace(/<[^>]*>/g, '');

  // Fix double spacing
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Decode HTML entities
  content = content.replace(/ /g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");

  return content;
}

/**
 * @description Creates a timestamped name for documents or folders.
 * @param {string} baseName - The base name.
 * @returns {string} The timestamped name.
 */
function createTimestampedName(baseName) {
  const now = new Date();
  const datePart = now.toLocaleDateString().replace(/\//g, '-');
  const timePart = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '');
  return `${baseName} - ${datePart} ${timePart}`;
}

/**
 * @description Creates a job application folder with the company name, position, and date.
 * @param {string} company - The company name.
 * @param {string} position - The position title.
 * @returns {GoogleAppsScript.Drive.Folder} The created folder object.
 */
function createJobApplicationFolder(company, position) {
  const mainFolder = getOrCreateAppFolder();
  const date = new Date().toLocaleDateString().replace(/\//g, '-');
  const folderName = `${company} - ${position} - ${date}`;
  return mainFolder.createFolder(folderName);
}

/**
 * @description Saves job posting information to a text file within a specified job application folder.
 * @param {{company: string, position: string, url: string, content: string}} jobInfo - Information about the job posting.
 * @param {GoogleAppsScript.Drive.Folder} folder - The folder to save the information in.
 */
function saveJobPostingInfo(jobInfo, folder) {
  const date = new Date().toLocaleDateString();
  let content = `Job Information\n`;
  content += `----------------\n`;
  content += `Company: ${jobInfo.company}\n`;
  content += `Position: ${jobInfo.position}\n`;
  content += `URL: ${jobInfo.url}\n`;
  content += `Saved on: ${date}\n\n`;
  content += `Job Content:\n`;
  content += `----------------\n`;
  content += jobInfo.content;

  const file = DriveApp.createFile(`Job Info - ${jobInfo.company} - ${jobInfo.position}.txt`, content);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

/**
 * @description Generates a tailored resume using AI, based on the original resume content, job information, and keywords.
 * @param {string} resumeContent - The original resume content.
 * @param {{company: string, position: string, url: string, content: string}} jobInfo - Information about the job posting.
 * @param {{keywords: string[], analysis: string}} keywordInfo - Keywords and analysis extracted from the job posting.
 * @returns {{text: string} | {error: boolean, message: string}} The AI-generated tailored resume, or an error object.
 */
function generateTailoredResume(resumeContent, jobInfo, keywordInfo) {
  const systemPrompt = "You are an expert resume tailor who specializes in customizing resumes to match specific job requirements while maintaining professionalism and accuracy.";

  let prompt = `Customize this resume for a ${jobInfo.position} position at ${jobInfo.company}.

Original Resume:
${resumeContent.substring(0, 4000)}

Job Position: ${jobInfo.position}
Company: ${jobInfo.company}`;

  // Add keywords if available
  if (keywordInfo && keywordInfo.keywords && keywordInfo.keywords.length > 0) {
    prompt += `\n\nKey skills and requirements from job posting:
${keywordInfo.keywords.map(k => `- ${k}`).join('\n')}`;
  }

  prompt += `

Please create a tailored version of the resume that:
1. Highlights relevant skills and experience that match the job requirements
2. Prioritizes accomplishments that would be most impressive for this role
3. Uses relevant keywords from the job posting
4. Maintains the same format but adjusts content to emphasize relevance
5. Keeps a professional tone and remains truthful (don't add fabricated experience)

Format with clear section headings (using # for main sections), bullet points for achievements, and professional language.`;

  return generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.2,
    maxOutputTokens: 4096
  });
}

/**
 * @description Generates a job-specific cover letter using AI, based on resume content, job information, and keywords.
 * @param {string} resumeContent - The original resume content.
 * @param {{company: string, position: string, url: string, content: string}} jobInfo - Information about the job posting.
 * @param {{keywords: string[], analysis: string}} keywordInfo - Keywords and analysis extracted from the job posting.
 * @returns {{text: string} | {error: boolean, message: string}} The AI-generated cover letter, or an error object.
 */
function generateJobCoverLetter(resumeContent, jobInfo, keywordInfo) {
  const systemPrompt = "You are an expert cover letter writer who creates highly targeted, personalized cover letters that effectively connect a candidate's experience to job requirements.";

  let prompt = `Create a compelling cover letter for a ${jobInfo.position} position at ${jobInfo.company}.

Resume Content (for reference):
${resumeContent.substring(0, 3000)}

Job Position: ${jobInfo.position}
Company: ${jobInfo.company}`;

  // Add keywords if available
  if (keywordInfo && keywordInfo.keywords && keywordInfo.keywords.length > 0) {
    prompt += `\n\nKey skills and requirements from job posting:
${keywordInfo.keywords.map(k => `- ${k}`).join('\n')}`;
  }

  prompt += `

Format the cover letter as a professional business letter with:
1. Today's date: ${new Date().toLocaleDateString()}
2. Employer's address block (use Hiring Manager if no name available)
3. Professional greeting
4. 3-4 well-crafted paragraphs that:
   - Express interest in the specific position
   - Highlight relevant skills and accomplishments from the resume that match the job requirements
   - Explain value you would bring to the company
   - Request an interview
5. Professional closing with space for signature

The cover letter should be personalized, demonstrate knowledge of ${jobInfo.company}, and clearly connect your experience to the ${jobInfo.position} role.`;

  return generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.3,
    maxOutputTokens: 2048
  });
}

/**
 * @description Compares two versions of a document and generates a summary of the changes using AI.
 * @param {string} originalId - The ID of the original document.
 * @param {string} revisedId - The ID of the revised document.
 * @returns {{text: string} | {error: boolean, message: string}} A summary of the changes, or an error object.
 */
function compareDocumentVersions(originalId, revisedId) {
    try {
      // Get content from both documents
      const original = getDocumentContentById(originalId);
      const revised = getDocumentContentById(revisedId);
      
      if (typeof original === 'object' && original.error) return original;
      if (typeof revised === 'object' && revised.error) return revised;

      const systemPrompt = "You are an expert document analyst who can identify differences between document versions and summarize changes in a clear, concise manner.";

      const prompt = `Compare these two document versions and create a summary of changes:

  ORIGINAL DOCUMENT:
  ${original.substring(0, 5000)}

  REVISED DOCUMENT:
  ${revised.substring(0, 5000)}

  Provide:
  1. A bullet point list of significant changes
  2. An assessment of whether the revisions improve the document
  3. Any recommendations for further improvements

  Format your response in clear sections with helpful headings.`;

      return generateWithGemini(prompt, {
        systemInstructions: systemPrompt,
        temperature: 0.2,
        maxOutputTokens: 2048
      });
    } catch (error) {
      console.error("Error generating document analysis:", error);
      return this.generateResponse({ error: true, message: error.toString() });
    }
}

/**
 * @description Creates a new version of a document, storing the previous version in a "Document Versions" subfolder.
 * @param {string} documentId - The ID of the document to version.
 * @param {string} [reason="Auto-saved version"] - The reason for creating the new version.
 * @returns {{success: boolean, versionId: string, versionUrl: string, versionTitle: string} | {error: boolean, message: string}} Version information, or an error object.
 */
function createDocumentVersion(documentId, reason = "Auto-saved version") {
    try {
      const doc = DocumentApp.openById(documentId);
      if (!doc) {
        return { error: true, message: "Document not found" };
      }

      // Get current content and metadata
      const content = doc.getBody().getText();
      const title = doc.getName();
      const timestamp = new Date().toISOString();
      const versionTitle = `${title} - Version ${timestamp}`;

      // Create a new document with this version
      const folder = getOrCreateAppFolder();
      const versionsFolder = getOrCreateSubfolder(folder, "Document Versions");

      // Create a simple versioning document
      const versionDoc = DocumentApp.create(versionTitle);
      const versionBody = versionDoc.getBody();

      // Add metadata to the version
      versionBody.appendParagraph("VERSION METADATA")
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      versionBody.appendParagraph(`Original Document: ${title}`);
      versionBody.appendParagraph(`Version Date: ${new Date().toLocaleString()}`);
      versionBody.appendParagraph(`Reason for Version: ${reason}`);
      versionBody.appendParagraph(`Document ID: ${documentId}`);

      // Add the content
      versionBody.appendParagraph("DOCUMENT CONTENT")
        .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      versionBody.appendParagraph(content);

      // Save and move to versions folder
      versionDoc.saveAndClose();
      const file = DriveApp.getFileById(versionDoc.getId());
      versionsFolder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      // Store version metadata in original document properties
      const props = doc.getProperties();
      const versionHistory = props.versionHistory ? JSON.parse(props.versionHistory) : [];
      versionHistory.push({
        id: versionDoc.getId(),
        timestamp: timestamp,
        reason: reason
      });
      doc.setProperty('versionHistory', JSON.stringify(versionHistory));

      return {
        success: true,
        versionId: versionDoc.getId(),
        versionUrl: versionDoc.getUrl(),
        versionTitle: versionTitle
      };
    } catch (error) {
      console.error("Error creating document version:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Retrieves or creates a subfolder within a given parent folder.
 * @param {GoogleAppsScript.Drive.Folder} parentFolder - The parent folder.
 * @param {string} folderName - The name of the subfolder to get or create.
 * @returns {GoogleAppsScript.Drive.Folder} The subfolder object.
 */
function getOrCreateSubfolder(parentFolder, folderName) {
    const subFolders = parentFolder.getFoldersByName(folderName);

    if (subFolders.hasNext()) {
      return subFolders.next();
    } else {
      return parentFolder.createFolder(folderName);
    }
}

/**
 * @description Extracts the structure of a document (title, sections, headings, paragraph count, etc.) for AI processing.
 * @param {string} documentId - The ID of the document to analyze.
 * @returns {{title: string, sections: Array, paragraphCount: number, textLength: number, lastUpdated: string} | {error: boolean, message: string}} The document structure, or an error object.
 */
function extractDocumentStructure(documentId) {
    try {
      const doc = DocumentApp.openById(documentId);
      if (!doc) {
        return { error: true, message: "Document not found" };
      }

      const body = doc.getBody();
      const structure = {
        title: doc.getName(),
        sections: [],
        paragraphCount: body.getNumChildren(),
        textLength: body.getText().length,
        lastUpdated: new Date().toISOString()
      };

      let currentSection = null;

      // Process each paragraph
      for (let i = 0; i < body.getNumChildren(); i++) {
        const element = body.getChild(i);

        if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const paragraph = element.asParagraph();
          const heading = paragraph.getHeading();
          const text = paragraph.getText().trim();

          if (!text) continue;

          if (heading !== DocumentApp.ParagraphHeading.NORMAL) {
            // This is a heading, start new section
            currentSection = {
              title: text,
              level: heading,
              content: [],
              formattedContent: []
            };
            structure.sections.push(currentSection);
          } else if (currentSection) {
            // Add to current section content
            currentSection.content.push(text);

            // Check for formatting hints
            if (text.startsWith("• ") || text.startsWith("* ")) {
              currentSection.formattedContent.push({ type: "bullet", text: text.substring(2) });
            } else if (text.match(/^\d+\.\s/)) {
              currentSection.formattedContent.push({ type: "numbered", text: text.substring(text.indexOf('.')+1).trim() });
            } else {
              currentSection.formattedContent.push({ type: "paragraph", text: text });
            }
          }
        }
    }
    return structure;
  } catch (error) {
    console.error("Error extracting document structure:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * @description Clones a Google Doc, optionally changing the title.
 * @param {string} sourceDocId - The ID of the document to clone.
 * @param {string} [newTitle=null] - The title for the new document (optional).
 * @returns {{id: string, url: string, title: string} | {error: boolean, message: string}} Information about the cloned document, or an error object.
 */
function cloneDocument(sourceDocId, newTitle = null) {
    try {
      const sourceDoc = DocumentApp.openById(sourceDocId);
      if (!sourceDoc) {
        return { error: true, message: "Source document not found" };
      }

      // Create new document with same or modified title
      const title = newTitle || `Copy of ${sourceDoc.getName()}`;
      const newDoc = DocumentApp.create(title);

      // Copy content
      const sourceBody = sourceDoc.getBody().copy();
      const newBody = newDoc.getBody();
      newBody.clear();

      // We can't directly copy the entire body, so we copy element by element
      for (let i = 0; i < sourceBody.getNumChildren(); i++) {
        const element = sourceBody.getChild(i);
        if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
          const para = element.asParagraph();
          const text = para.getText();
          const newPara = newBody.appendParagraph(text);

          // Copy formatting
          newPara.setAttributes(para.getAttributes());
          newPara.setHeading(para.getHeading());
        } else if (element.getType() === DocumentApp.ElementType.LIST_ITEM) {
          const listItem = element.asListItem();
          const text = listItem.getText();
          const newListItem = newBody.appendListItem(text);

          // Copy formatting
          newListItem.setAttributes(listItem.getAttributes());
          newListItem.setGlyphType(listItem.getGlyphType());
          newListItem.setNestingLevel(listItem.getNestingLevel());
        }
        // Could add handling for tables, images, etc.
      }

      // Copy document properties (except version history)
      const properties = sourceDoc.getProperties();
      for (const key in properties) {
        if (key !== 'versionHistory') {
          newDoc.setProperty(key, properties[key]);
        }
      }

      // Set clone metadata
      newDoc.setProperty('clonedFrom', sourceDocId);
      newDoc.setProperty('cloneDate', new Date().toString());

      // Move to the same folder as the original (if possible)
      try {
        const sourceFile = DriveApp.getFileById(sourceDocId);
        const sourceParents = sourceFile.getParents();

        if (sourceParents.hasNext()) {
          const parentFolder = sourceParents.next();
          const newFile = DriveApp.getFileById(newDoc.getId());

          // Move from root to source's folder
          parentFolder.addFile(newFile);
          DriveApp.getRootFolder().removeFile(newFile);
        }
      } catch (e) {
        console.error("Error moving clone to source folder:", e);
        // Continue anyway, as this is non-critical
      }

      return {
        id: newDoc.getId(),
        url: newDoc.getUrl(),
        title: newDoc.getName()
      };
    } catch (error) {
      console.error("Error cloning document:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Applies metadata (key-value pairs) to a Google Doc as document properties.
 * @param {string} documentId - The ID of the document.
 * @param {Object} metadata - An object containing the metadata to apply.
 * @returns {{success: boolean} | {error: boolean, message: string}} A success or error object.
 */
function applyDocumentMetadata(documentId, metadata) {
    try {
      const doc = DocumentApp.openById(documentId);
      if (!doc) {
        return { error: true, message: "Document not found" };
      }

      // Apply each metadata property
      for (const [key, value] of Object.entries(metadata)) {
        doc.setProperty(key, value.toString());
      }

      return { success: true };
    } catch (error) {
      console.error("Error applying document metadata:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Retrieves a list of the user's recent documents created by this add-on.
 * @param {number} [limit=10] - The maximum number of documents to retrieve.
 * @returns {Array<{id: string, name: string, url: string, dateCreated: Date, lastUpdated: Date}>} An array of document information objects.
 */
function getRecentDocuments(limit = 10) {
    try {
      const folder = getOrCreateAppFolder();
      const files = folder.getFiles();
      const documents = [];

      while (files.hasNext() && documents.length < limit) {
        const file = files.next();
        if (file.getMimeType() === 'application/vnd.google-apps.document') {
          documents.push({
            id: file.getId(),
            name: file.getName(),
            url: file.getUrl(),
            dateCreated: file.getDateCreated(),
            lastUpdated: file.getLastUpdated()
          });
        }
      }

      // Sort by last updated time (newest first)
      documents.sort((a, b) => b.lastUpdated - a.lastUpdated);

      return documents;
    } catch (error) {
      console.error("Error getting recent documents:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Formats the current document using AI, applying a specified style template.
 * @param {string} [styleTemplate='modern-professional'] - The name of the style template to apply.
 * @returns {{success: boolean} | {error: boolean, message: string}} A success or error object.
 */
function formatCurrentDocumentWithAI(styleTemplate = 'modern-professional') {
    try {
      const doc = DocumentApp.getActiveDocument();
      if (!doc) {
        return { error: true, message: "No active document found" };
      }

      // Get current document content and structure
      const structure = analyzeCurrentDocument();
      if (structure.error) {
        return structure;
      }

      // Create AI formatting prompt
      const formattingPrompt = `Please format this document professionally:

  Original Content:
  ${structure.content}

  Requirements:
  1. Maintain all information but improve organization and clarity
  2. Use clear section headings (marked with #)
  3. Use bullet points (*) for achievements and skills
  4. Format job titles and dates consistently
  5. Ensure proper spacing and structure

  Return the formatted content using markdown-style formatting:`;

      // Generate formatted content
      const result = generateWithGemini(formattingPrompt, {
        temperature: 0.2,
        maxOutputTokens: 4096
      });

      if (result.error) {
        return result;
      }

      // Apply the formatted content
      return applyFormattedContent(doc, result.text, styleTemplate);
    } catch (error) {
      console.error("Error formatting document:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Applies formatted content to a document, clearing existing content and applying a style template.
 * @param {GoogleAppsScript.Document.Document} doc - The document object.
 * @param {string} content - The formatted content to apply.
 * @param {string} styleTemplate - The name of the style template to apply.
 * @returns {{success: boolean}} A success object.
 */
function applyFormattedContent(doc, content, styleTemplate) {
    const body = doc.getBody();
    body.clear();

    // Insert content with markdown formatting
    insertMarkdownContent(body, content);

    // Apply template styling
    applyTemplateStyles(doc, styleTemplate);

    return { success: true };
}

/**
 * @description Processes a job posting URL, fetching the content and extracting relevant information (company, position, keywords) using AI.
 * @param {string} url - The URL of the job posting.
 * @returns {{success: boolean, company: string, position: string, keywords: string[], analysis: string} | {error: boolean, message: string}} Job information, or an error object.
 */
function processJobPosting(url) {
    try {
      // Validate URL format
      if (!url.match(/^https?:\/\/.+/i)) {
        return { error: true, message: "Please enter a valid URL" };
      }

      // Fetch job posting content
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (response.getResponseCode() !== 200) {
        return { error: true, message: "Could not access job posting" };
      }

      const content = response.getContentText();
        
      // Extract job information using AI
      const result = analyzeJobContent(content); // Assuming analyzeJobContent exists elsewhere.
      if (result.error) {
        return result;
      }

      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error("Error processing job posting:", error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Inserts text content into a document, attempting to detect and apply basic formatting.
 * @param {GoogleAppsScript.Document.Document} doc - The Google Doc to insert into
 * @param {string} content - The text content.
*/
function insertContentWithIntelligentFormatting(doc, content) {
    const body = doc.getBody();
    body.clear();

    // Check for document type to apply appropriate formatting.
    const isResume = content.toLowerCase().includes('experience') &&
                    content.toLowerCase().includes('education');
    const isCoverLetter = content.toLowerCase().includes('dear') &&
                        (content.toLowerCase().includes('sincerely') ||
                         content.toLowerCase().includes('regards'));

    // Split content and process by sections
    if (content.includes('#')) {
        // Contains markdown headings.
        insertMarkdownContent(body, content);
    } else if (isCoverLetter) {
        insertCoverLetterContent(body, content);
    } else {
        // Regular content - parse paragraphs and simple formatting
        insertBasicContent(body, content);
    }

    // Apply basic styling
    if (isResume) {
      // For resumes, tighten line spacing
      body.setLineSpacing(1.15);
    } else if (isCoverLetter) {
      // For cover letters, use standard business letter spacing
      body.setLineSpacing(1.5);
    }
    else {
      // Default spacing.
      body.setLineSpacing(1.2);
    }

    doc.saveAndClose();
}

/**
 * @description Creates a Curriculum Vitae (CV) document, re-using the resume creation logic.
 * @param {string} content - The content for the CV.
 * @param {string} [title="Curriculum Vitae"] - The document title.
 * @returns {GoogleAppsScript.Document.Document | {error: boolean, message: string}} The created document object or an error.
*/
function createCVDocument(content, title = "Curriculum Vitae") {
  return createResumeDocument(content, title); // CV is treated similarly to a resume.
}

/**
 * @description Creates both a resume and a CV document in a new folder.
 * @param {string} resumeContent - The content for the resume.
 * @param {string} cvContent - The content for the CV.
 * @param {string} [baseTitle="Application Documents"] - The base title used for naming.
 * @returns {{folderUrl: string, resumeId: string, resumeUrl: string, cvId: string, cvUrl: string} | {error: boolean, message: string}} An object containing URLs and IDs or an error.
*/
function createBothDocuments(resumeContent, cvContent, baseTitle = "Application Documents") {
    try {
      const appFolder = getOrCreateAppFolder();
      const folderName = createTimestampedName(baseTitle);
      const folder = appFolder.createFolder(folderName);

      // Create resume
      const resumeDoc = DocumentApp.create("Resume - " + baseTitle);
      const resumeFile = DriveApp.getFileById(resumeDoc.getId());
      resumeFile.moveTo(folder);
      const resumeBody = resumeDoc.getBody();
      resumeBody.clear();
      insertContentToDocument(resumeDoc, resumeContent);

      // Create CV
      const cvDoc = DocumentApp.create("CV - " + baseTitle);
      const cvFile = DriveApp.getFileById(cvDoc.getId());
      cvFile.moveTo(folder);

      const cvBody = cvDoc.getBody();
      cvBody.clear();
      insertContentToDocument(cvDoc, cvContent);

      return {
        folderUrl: `https://drive.google.com/drive/folders/${folder.getId()}`,
        resumeId: resumeDoc.getId(),
        resumeUrl: resumeDoc.getUrl(),
        cvId: cvDoc.getId(),
        cvUrl: cvDoc.getUrl()
      };
    } catch (error) {
      console.error(error);
      return { error: true, message: error.toString() };
    }
}

/**
 * @description Creates a new document in a specific folder, inserting content with intelligent formatting.
 * @param {string} content - The content for the new document.
 * @param {string} title - The title for the new document.
 * @param {GoogleAppsScript.Drive.Folder} folder - The Drive folder to create the document in.
 * @returns {GoogleAppsScript.Document.Document} The created document object.
*/
function createDocument(content, title, folder) {
    // Create the document.
    const doc = DocumentApp.create(title);

    // Move to specified folder.
    const file = DriveApp.getFileById(doc.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    // Format and insert content.
    insertContentWithIntelligentFormatting(doc, content);

    return doc;
}

/**
 * Class representing the Document Manager, responsible for document creation, formatting, and AI integration.
 */
class DocumentManager {
    /**
     * @description Formats the current document using AI, applying a specified style template.
     * @param {string} [styleTemplate='modern-professional'] - The name of the style template.
     * @returns {Promise<{success: boolean, message: string} | {error: boolean, message: string}>} Success or error.
     */
    static async formatCurrentDocumentWithAI(styleTemplate = 'modern-professional') {
        try {
            const doc = DocumentApp.getActiveDocument();
            if (!doc) {
                return { error: true, message: "No active document found" };
            }

            // Get current document structure
            const structure = await this.analyzeCurrentDocument();
            if (structure.error) return structure;

            // Generate improved version using AI
            const prompt = `Improve and format this document professionally while  maintaining its type and purpose:

Current Content:
${structure.content}

Requirements:
1. Keep all important information but improve clarity and impact
2. Use clear section headings (marked with #)
3. Use bullet points (*) for achievements and lists
4. Format dates and titles consistently
5. Maintain document type (${structure.type})
6. Improve language and professionalism

Return the formatted content using markdown-style formatting.`;

            const result = await generateWithGemini(prompt, {
                temperature: 0.3,
                maxOutputTokens: 4096
            });

            if (result.error) return result;

            // Apply the formatted content
            const body = doc.getBody();
            body.clear();
            insertMarkdownContent(body, result.text);

            // Apply style template
            await DocumentManager.applyTemplateStyles(doc, styleTemplate);

            return { success: true, message: "Document formatted successfully" };
        } catch (error) {
            console.error('Error formatting document:', error);
            return { error: true, message: error.toString() };
        }
    }

    /**
     * @description Applies AI-powered improvements to the current document based on a user-provided prompt.
     * @param {string} prompt - The user's instructions for improving the document.
     * @returns {Promise<{success: boolean, message: string} | {error: boolean, message: string}>} Success or error object.
     */
    static async improveDocumentWithAI(prompt) {
        try {
            const doc = DocumentApp.getActiveDocument();
            if (!doc) {
                return { error: true, message: "No active document found" };
            }

            const structure = await this.analyzeCurrentDocument();
            if (structure.error) return structure;

            // Generate improvements using AI
            const improvementPrompt = `Review and improve this ${structure.type || 'document'} based on the following request:
      "${prompt}"

Current Content:
${structure.content}

Requirements:
1. Address the specific improvement request
2. Maintain document type and purpose
3. Keep all essential information
4. Return the improved version with markdown formatting
`;

            const result = await generateWithGemini(improvementPrompt, {
                temperature: 0.3,
                maxOutputTokens: 4096
            });

            if (result.error) return result;

            // Apply improvements
            const body = doc.getBody();
            body.clear();
            insertMarkdownContent(body, result.text);

            return {
                success: true,
                message: "Document improved successfully with AI suggestions"
            };
        } catch (error) {
            console.error('Error improving document:', error);
            return { error: true, message: error.toString() };
        }
    }

     /**
      * @description Applies a specified style template to a given document.
      * @param {GoogleAppsScript.Document.Document} doc - The document to apply styles to.
      * @param {string} templateName - The name of the style template.
      * @returns {Promise<{success: boolean} | {error: boolean, message: string}>} Success/error.
      */
    static async applyTemplateStyles(doc, templateName) {
        try {
            // Use the StyleManager from StyleManager.gs to apply the template
            return StyleManager.applyTemplate(doc, templateName);
        } catch (error) {
            console.error('Error applying template styles:', error);
            return { error: true, message: error.toString() };
        }
    }

    /**
     * @description Analyzes the current document (static wrapper).
     * @returns {Promise<Object>} The document structure.
     *  This ensures backward compatibility with other code
     */
    static analyzeCurrentDocument() {
        return analyzeCurrentDocument();
    }
}

/**
 * @description Applies AI-powered analysis to the current document based on a user prompt and saves it in a new document.
 * @param {string} prompt - The user's instructions for the analysis.
 * @returns {{success: boolean, message: string, url: string, id: string} | {error: boolean, message: string}} Result information or error.
*/
function updateDocumentWithAIAnalysis(prompt) {
    try {
      const doc = DocumentApp.getActiveDocument();
      if (!doc) {
        return { error: true, message: "No active document found" };
      }
      // Analyze document structure
      const structure = analyzeCurrentDocument();
      if (structure.error) {
        return structure;
      }

      // Generate AI analysis using the document context
      const systemPrompt = "You are an expert document reviewer and editor. Analyze this document and provide specific improvements based on the user's request.";

      const analysisPrompt = `Document Title: ${structure.title}

  Document Sections:
  ${structure.headings.join('\n')}

  Document Content Sample:
  ${structure.content.substring(0, 3000)}

  User Request: ${prompt}

  Please provide a detailed analysis with these sections:
  1. OVERALL_ASSESSMENT - General evaluation of the document
  2. SECTION_FEEDBACK - Specific feedback for each section
  3. IMPROVEMENT_SUGGESTIONS - Concrete recommendation
  4. LANGUAGE_AND_TONE - Comments on writing style

  Format each section with ## headers and provide actionable advice.`;

      const result = generateWithGemini(analysisPrompt, {
        systemInstructions: systemPrompt,
        temperature: 0.2,
        maxOutputTokens: 2048
      });

      if (result.error) {
        return result;
      }
      // Create a new document with the analysis
      const analysisDoc = DocumentApp.create(`Analysis of ${structure.title}`);
      const body = analysisDoc.getBody();

      // Add header
      const header = body.appendParagraph(`Document Analysis: ${structure.title}`);
      header.setHeading(DocumentApp.ParagraphHeading.HEADING1);

      // Add date
      body.appendParagraph(`Generated on: ${new Date().toLocaleString()}`);
      body.appendParagraph('\n');

      // Add analysis content with formatting
      insertMarkdownContent(body, result.text);

      // Move to app folder
      const folder = getOrCreateAppFolder();
      folder.addFile(DriveApp.getFileById(analysisDoc.getId()));
      DriveApp.getRootFolder().removeFile(DriveApp.getFileById(analysisDoc.getId()));

      return {
        success: true,
        message: "Analysis document created",
        url: analysisDoc.getUrl(),
        id: analysisDoc.getId()
      };

    } catch (error) {
      console.error("Error generating document analysis:", error);
      return { error: true, message: error.toString() };
    }
  }

  /**
   * @description Calculates analytics for a document (word count, section count, estimated read time, etc.).
   * @param {string} docId - The ID of the document to analyze.
   * @returns {{wordCount: number, charCount: number, sectionCount: number, docType: string, estimatedReadTime: number, metrics: Object} | {error: boolean, message: string}} Document analytics or an error object.
  */
  function getDocumentAnalytics(docId) {
    try {
      const doc = DocumentApp.openById(docId);
      if (!doc) {
        return { error: true, message: "Document not found" };
      }

      const body = doc.getBody();
      const text = body.getText();

      // Extract document structure
      const structure = analyzeDocumentStructure(docId);
      if (structure.error) {
        return structure;
      }
      // Check document type
      const docType = detectDocumentType(structure);

      // Generate analytics based on document type
      let analytics = {
        wordCount: text.split(/\s+/).length,
        charCount: text.length,
        sectionCount: structure.headings.length,
        docType: docType,
        estimatedReadTime: Math.ceil(text.split(/\s+/).length / 200), // In minutes
        metrics: {}
      };

      // Add document-specific analytics
      if (docType === "resume") {
        analytics.metrics = analyzeResumeMetrics(structure);
      } else if (docType === "coverLetter") {
        analytics.metrics = analyzeCoverLetterMetrics(structure);
      }

      return analytics;

    } catch (error) {
      console.error("Error analyzing document:", error);
      return { error: true, message: error.toString() };
    }
  }

/**
 * @description Detects the type of document (resume, cover letter, or unknown) based on its structure and content.
 * @param {{headings: string[], content: string}} structure - The document structure.
 * @returns {string} The detected document type ("resume", "coverLetter", or "unknown").
*/
function detectDocumentType(structure) {
    const headingsStr = structure.headings.join(' ').toLowerCase();
    const contentStr = structure.content.toLowerCase();

    // Resume indicators
    if ((headingsStr.includes('experience') &&
        (headingsStr.includes('education') || headingsStr.includes('skills'))) ||
        (contentStr.includes('resume') && !contentStr.includes('cover letter'))) {
      return "resume";
    }
    // Cover letter indicators
    else if (contentStr.includes('dear') &&
            (contentStr.includes('sincerely') ||
            contentStr.includes('regards') ||
            contentStr.includes('thank you for your consideration'))) {
      return "coverLetter";
    }
    // Other cases
    else {
      return "unknown";
    }
}

  /**
   * @description Calculates metrics specific to resumes, such as the number of bullet points, action verbs, and quantified achievements.
   * @param {{content: string}} structure - The document structure.
   * @returns {{bulletPoints: number, actionVerbs: number, quantifiedAchievements: number, keywordDensity: Object, improvement: {suggestions: string[], score: number}}} Resume-specific metrics.
  */
  function analyzeResumeMetrics(structure) {
    const metrics = {
      bulletPoints: 0,
      actionVerbs: 0,
      quantifiedAchievements: 0,
      keywordDensity: {},
      improvement: {
        suggestions: [],
        score: 0
      }
    };

    // Count bullet points
    const bulletMatches = structure.content.match(/^[\*\-•]\s+/gm);
    metrics.bulletPoints = bulletMatches ? bulletMatches.length : 0;

    // Count common action verbs
    const actionVerbs = ['achieved', 'improved', 'created', 'developed', 'managed', 'led', 'implemented',
                        'increased', 'reduced', 'negotiated', 'coordinated', 'designed', 'launched'];

    let actionVerbCount = 0;
    actionVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'gi');
      const matches = structure.content.match(regex);
      if (matches) {
        actionVerbCount += matches.length;
      }
    });
    metrics.actionVerbs = actionVerbCount;

    // Count quantified achievements (containing % or numbers),
    const quantMatches = structure.content.match(/\d+%|\$\d+|\d+\s+percent|\d+\s+times/gi);
    metrics.quantifiedAchievements = quantMatches ? quantMatches.length : 0;

    // Calculate improvement score (0-100)
    let score = 0;

    // Score based on bullet points (ideally 10+ bullet points)
    score += Math.min(metrics.bulletPoints * 5, 30);

    // Score based on action verbs (ideally 5+ action verbs)
    score += Math.min(metrics.actionVerbs * 10, 30);

    // Score based on quantified achievements (ideally 3+ quantified achievements)
    score += Math.min(metrics.quantifiedAchievements * 10, 30);

    // Add improvement suggestions
    if (metrics.bulletPoints < 10) {
      metrics.improvement.suggestions.push("Add more bullet points to highlight achievements");
    }

    if (metrics.actionVerbs < 5) {
      metrics.improvement.suggestions.push("Use more action verbs to describe your accomplishments");
    }

    if (metrics.quantifiedAchievements < 3) {
      metrics.improvement.suggestions.push("Add more quantifiable achievements (numbers, percentages, etc.)");
    }

    metrics.improvement.score = Math.min(score + 10, 100); // Base score of 10 just for having a resume

    return metrics;
  }

/**
 * @description Analyzes cover letter-specific metrics, including paragraph count, word count, and personalized mentions.
 * @param {{content: string}} structure - The document structure.
 * @returns {{paragraphCount: number, wordCount: number, personalizedMentions: number, improvement: {suggestions: string[], score: number}}} Cover letter specific metrics.
*/
function analyzeCoverLetterMetrics(structure) {
    const metrics = {
      paragraphCount: 0,
      wordCount: 0,
      personalizedMentions: 0,
      improvement: {
        suggestions: [],
        score: 0
      }
    };

    // Count paragraphs
    const paragraphs = structure.content.split(/\n\s*\n/);
    metrics.paragraphCount = paragraphs.length;

    // Count words
    metrics.wordCount = structure.content.split(/\s+/).length;

    // Calculate improvement score (0-100)
    let score = 0;

    // Score based on paragraph count (3-5 paragraphs is ideal)
    if (metrics.paragraphCount >= 3 && metrics.paragraphCount <= 5) {
      score += 30;
    } else {
      score += 15;
    }

    // Score based on word count (250-400 words is ideal)
    if (metrics.wordCount >= 250 && metrics.wordCount <= 400) {
      score += 30;
    } else if (metrics.wordCount >= 200 && metrics.wordCount <= 500) {
      score += 20;
    } else {
      score += 10;
    }

    // Add improvement suggestions
    if (metrics.paragraphCount < 3) {
      metrics.improvement.suggestions.push("Add more paragraphs to fully develop your letter");
    } else if (metrics.paragraphCount > 5) {
      metrics.improvement.suggestions.push("Consider condensing your letter to be more concise");
    }

    if (metrics.wordCount < 250) {
      metrics.improvement.suggestions.push("Your letter is quite short. Consider adding more relevant details");
    } else if (metrics.wordCount > 400) {
      metrics.improvement.suggestions.push("Your letter is lengthy. Consider making it more concise");
    }

    // Check if it mentions the company name
    if (structure.content.match(/\bcompany\b|\borganization\b|\bposition\b/gi)) {
      metrics.improvement.suggestions.push("Replace generic terms like 'company' or 'position' with specific names");
    }

    metrics.improvement.score = Math.min(score + 40, 100); // Base score of 40 just for having a cover letter

    return metrics;
}

/**
 * @description Generates a tailored resume and cover letter based on job information, using the provided content and keywords.
 * @param {string} resumeContent - The original resume content.
 * @param {string} jobContent - The job posting content
 * @returns {{text: string} | {error: boolean, message: string}} The AI-generated tailored resume and cover letter in a combined response or error
*/
function generateTargetedDocuments(resumeContent, jobContent) {
    const systemPrompt = "You are an expert at tailoring resumes and cover letters to match specific job descriptions. Analyze the provided resume and job posting to create a tailored resume and a compelling cover letter. Maintain a professional tone and format, and address the requirements and keywords from the job posting.";

    let prompt = `TAILOR RESUME AND COVER LETTER

    Original Resume Content:
    ${resumeContent}

    Job Posting Content:
    ${jobContent}

    Instructions:
    1. Create a tailored version of the resume that highlights the skills and experience most relevant to the job posting. Use clear section headings (#), bullet points (*), and concise language. Prioritize accomplishments.

    2. Generate a professional cover letter that directly addresses the job requirements. Format it as a business letter, including:
        - Today's date
        - Hiring Manager (or similar) address block
        - Formal greeting
        - Well-structured paragraphs explaining interest, relevant skills, and value
        - Professional closing
        - Space for signature

    3.  Return the response with clear sections:
    -  ##TAILORED RESUME##  (followed by the tailored resume content)
    -  ##COVER LETTER## (followed by the cover letter content)
    `;

    return generateWithGemini(prompt, {
        systemInstructions: systemPrompt,
        temperature: 0.2,
        maxOutputTokens: 4096,
    });
}

/**
 * @description Extracts key information (company, position, keywords) from job posting content using AI.
 * @param {string} jobContent - The job posting content.
 * @returns {{company: string, position: string, keywords: string[], analysis: string} | {error: boolean, message: string}} Job information and keywords, or an error object.
*/
function analyzeJobContent(jobContent) {
    const systemPrompt = "You are an expert job market analyst. Extract key information from job postings.";

    let prompt = `Analyze this job posting and extract:

    1.  **Company Name:** (If not clearly stated, indicate 'Not specified')
    2.  **Job Position:** (The exact title)
    3.  **Key Skills and Requirements:** (List as bullet points)
    4.  **Overall Analysis:** (Briefly summarize the job and the type of candidate sought)

    Job Posting Content:
    ${jobContent}

    Return the information in this format:

    COMPANY: [Company Name]
    POSITION: [Job Position]
    KEYWORDS:
    * [keyword 1]
    * [keyword 2]
    ...
    ANALYSIS: [Brief summary]
    `;

    const result = generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 2048,
    });

    if (result.error) return result;

    // Parse the AI response
    const response = result.text;

    let companyMatch = response.match(/COMPANY:\s*(.*)/i);
    const company = companyMatch ? companyMatch[1].trim() : "Not specified";

    let positionMatch = response.match(/POSITION:\s*(.*)/i);
    const position = positionMatch ? positionMatch[1].trim() : "Unknown";

    let keywordMatch = response.match(/KEYWORDS:\s*([\s\S]*?)(?=\nANALYSIS:)/i);

    let keywords = [];
    if (keywordMatch) {
        const keywordList = keywordMatch[1];
        const keywordLines = keywordList.split('\n').map(line => line.trim()).filter(line => line.startsWith('*'));
        keywords = keywordLines.map(line => line.substring(1).trim()); // Remove the '*' and trim
    }


    let analysisMatch = response.match(/ANALYSIS:\s*(.*)/i);
    const analysis = analysisMatch ? analysisMatch[1].trim() : "";

    return {
        company: company,
        position: position,
        keywords: keywords,
        analysis: analysis
    };
}

/**
 * @description Extracts keywords and requirements from a job posting.
 * @param {string} jobContent - The content of the job posting
 * @returns { {keywords: string[], analysis: string} | {error: boolean, message:string} }
*/
function extractJobKeywords(jobContent) {
  const systemPrompt = "You are an expert job description analyzer. Your task is to extract the key skills, qualifications, and requirements from a job posting and provide a brief analysis.";

  const prompt = `Analyze the following job posting and identify the KEYWORDS (skills, technologies, qualifications, and requirements).  Also, provide a short ANALYSIS summarizing the overall requirements.

  Job Posting:
  ${jobContent}

  Return in the following format:

  KEYWORDS:
  * [keyword 1]
  * [keyword 2]
  * [keyword 3]
  ...

  ANALYSIS:
  [brief summary of the job requirements]
  `;

  const result = generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 1024
  });

  if(result.error) return result;

  // Parse the response
  const response = result.text;

  // Extract keywords
  const keywordsMatch = response.match(/KEYWORDS:\s*([\s\S]*?)(?=\nANALYSIS:|$)/i);
  let keywords = [];
  if (keywordsMatch) {
      const keywordsList = keywordsMatch[1];
      const keywordLines = keywordsList.split('\n').map(line => line.trim()).filter(line => line.startsWith('*'));
      keywords = keywordLines.map(line => line.substring(2).trim());
  }


  // Extract analysis
  const analysisMatch = response.match(/ANALYSIS:\s*(.*)/i);
  const analysis = analysisMatch ? analysisMatch[1].trim() : "";

  return {
      keywords: keywords,
      analysis: analysis
  }
}

/**
 * @description Calculates a match score between a resume and a set of job keywords.
 * @param {string} resumeId - The ID of the resume document, or "current" for the active document.
 * @param {string[]} keywords - An array of keywords to match against.
 * @returns {{percentage: number, matchedKeywords: number, totalKeywords: number} | null} The match score and details, or null on error.
*/
function calculateResumeMatchScore(resumeId, keywords) {
    try {
      let resumeContent;

      // Get resume content
      if (resumeId === "current") {
        resumeContent = getCurrentDocumentContent();
        if (resumeContent.error) {
          return null;
        }
      } else {
        const result = getDocumentContentById(resumeId);
        if (typeof result === 'object' && result.error) {
          return null;
        }
        resumeContent = result;
      }
      // Count keyword matches
      let matchCount = 0;
      const resumeLower = resumeContent.toLowerCase();
      for (const keyword of keywords) {
        if (resumeLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }
      // Calculate percentage match
      const matchPercentage = Math.round((matchCount / keywords.length) * 100);

      return {
        percentage: matchPercentage,
        matchedKeywords: matchCount,
        totalKeywords: keywords.length
      };
    } catch (error) {
      console.error("Error calculating match score:", error);
      return null;
    }
}

/**
 * @description Retrieves analysis of a job, including company, position, keywords, a match score if resumeId is given
 * @param {string} jobInfo - Job information, either a URL or content
 * @param {string} [resumeId] - Optional resume ID to calculate match score.
*/
function analyzeJob(jobInfo, resumeId){
    try {
        let jobData;
        if (jobInfo.startsWith("http")) {
          const jobResult = processJobPosting(jobInfo);
          if (jobResult.error) return jobResult;
          jobData = jobResult;
        }
        else
        {
          const jobResult = analyzeJobContent(jobInfo);
          if (jobResult.error) return jobResult;
          jobData = jobResult;
        }

        // Extract keywords and requirements
        const keywordInfo = extractJobKeywords(jobData.content);
        if (keywordInfo.error) {
          return keywordInfo;
        }

        // Get resume match score if resumeId is provided
        let matchScore = null;
        if (resumeId) {
          matchScore = calculateResumeMatchScore(resumeId, keywordInfo.keywords);
        }

        return {
            company: jobData.company,
            position: jobData.position,
            url: jobData.url,
            keywords: keywordInfo.keywords,
            analysis: keywordInfo.analysis,
            matchScore: matchScore
        };
    }
    catch (error){
        console.error("Error analysing job posting: ", error);
        return { error: true, message: error.toString()};
    }
}

/**
 * Applies a style template to the current document.
 *
 * @param {string} templateId The ID of the template to apply.
 * @returns {object} A result object indicating success or failure.
 */
function applyTemplateToCurrentDocument(templateId) {
  const docId = getCurrentDocumentId();
  if (!docId) {
    return { error: true, message: "No active document found" };
  }
  return TemplateService.applyTemplateToDocument(docId, templateId);
}

/**
 * Retrieves the ID of the currently active document.
 * @returns {string | null} The document ID, or null if no document is active.
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
 * Retrieves all available resume templates, including built-in and custom styles.
 * @returns {Object} An object containing all available templates.
*/
function getAllTemplates() {
    return sharedGetAllTemplates();
}

/**
 * @description Creates a custom style based on user-provided options and saves it in User Properties.
 * @param {object} options - Style options provided
 * @param {number} [options.marginTop]
 * @param {number} [options.marginBottom]
 * @param {number} [options.marginLeft]
 * @param {number} [options.marginRight]
 * @param {string} [options.headingFont]
 * @param {string} [options.bodyFont]
 * @param {number} [options.heading1Size]
 * @param {number} [options.heading2Size]
 * @param {number} [options.bodySize]
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
 * Applies specific formatting to a section within a document.
 * @param {string} docId The ID of the document.
 * @param {string} sectionName The name of the section to format.
 * @param {object} formattingOptions The formatting options to apply.
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
        if (formattingOptions.contentItalic ) element.setItalic(formattingOptions.contentItalic);
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
 * Returns an array of available fonts for document styling.
 * @returns {string[]} An array of font names.
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
 * Estimates the number of pages in a document based on character count.
 * This is a rough estimate, as precise page count depends on many formatting factors.
 *
 * @param {string} docId The ID of the document.
 * @returns {{success: boolean, pageCount: number, charCount: number} | {error: boolean, message: string}} Result.
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
 * Optimizes a document to attempt to fit it onto a single page.
 * It reduces font size and margins slightly if the document is estimated to be longer than one page.
 * @param {string} documentId - The ID of the document
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
 * Applies the "google-xyz" template to a specified document.
 *
 * @param {string} documentId The ID of the document to apply the template to.
 * @returns {object} A result object indicating success or failure.
*/
function applyGoogleXYZFormat(documentId) {
    return TemplateService.applyTemplateToDocument(documentId, "google-xyz");
}