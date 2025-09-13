/**
 * GeminiCVCL - Utility Functions
 * Helper functions for the resume and cover letter tool
 */

/******************************************************************************
 * PREVIEW URL GENERATION
 ******************************************************************************/

/**
 * Generates the preview image URL for a template.
 * Uses script properties to determine the base URL or Drive folder.
 *
 * @param {string} id - Template identifier
 * @return {string} Preview URL or empty string if unavailable
 */
function generatePreviewUrl(id) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const baseUrl = scriptProps.getProperty('PREVIEW_BASE_URL');
    if (baseUrl) {
      const url = `${baseUrl.replace(/\/$/, '')}/${id}.png`;
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (response.getResponseCode() === 200) {
        return url;
      }
    }

    const folderId = scriptProps.getProperty('PREVIEW_FOLDER_ID');
    if (folderId) {
      const folder = DriveApp.getFolderById(folderId);
      const files = folder.getFilesByName(`${id}.png`);
      if (files.hasNext()) {
        return files.next().getDownloadUrl().replace(/\?e=download&gd=true$/, '');
      }
    }
  } catch (e) {
    console.error(`Error generating preview URL for ${id}:`, e);
  }
  return '';
}

/******************************************************************************
 * JOB POSTING & URL PROCESSING
 ******************************************************************************/

/**
 * Extracts job details from a job posting URL
 * @param {string} jobUrl - URL of the job posting
 * @return {Object} Job details or error information
 */
function extractJobDetails(jobUrl) {
  try {
    // Validate URL format first
    const urlValidation = validateInput(jobUrl, 'url');
    if (!urlValidation.valid) {
      return { 
        error: true, 
        message: urlValidation.message,
        url: jobUrl
      };
    }
    
    const response = safeFetch(jobUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (!response || response.getResponseCode() !== 200) {
      return { error: true, message: "Could not access the job posting URL" };
    }
    
    const content = response.getContentText();
    
    // Extract potential company name from the URL or content
    let companyName = "";
    let position = "";
    let location = "";
    
    // Extended support for more job sites
    if (jobUrl.includes('linkedin.com')) {
      const urlParts = jobUrl.split('/');
      const companyIndex = urlParts.indexOf('company');
      if (companyIndex !== -1 && companyIndex + 1 < urlParts.length) {
        companyName = urlParts[companyIndex + 1].split('?')[0].replace(/-/g, ' ');
      }
      
      // Try to extract more data from LinkedIn page content
      const jobTitleMatch = content.match(/<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/h1>/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        position = jobTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      
      const locationMatch = content.match(/location[^>]*>(.*?)<\/span>/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    } 
    else if (jobUrl.includes('indeed.com')) {
      const match = jobUrl.match(/company\/(.*?)\//);
      if (match && match[1]) {
        companyName = match[1].replace(/-/g, ' ');
      }
      
      // Try to extract more data from Indeed page content
      const jobTitleMatch = content.match(/<h1[^>]*class="[^"]*jobsearch-JobInfoHeader-title[^"]*"[^>]*>(.*?)<\/h1>/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        position = jobTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    else if (jobUrl.includes('glassdoor.com')) {
      // Extract from Glassdoor URLs
      const match = jobUrl.match(/employer\/([^\/]+)/i);
      if (match && match[1]) {
        companyName = match[1].replace(/-/g, ' ');
      }
    }
    else if (jobUrl.includes('monster.com')) {
      // Extract from Monster URLs
      const companyMatch = content.match(/company-name"[^>]*>(.*?)<\/div>/i);
      if (companyMatch && companyMatch[1]) {
        companyName = companyMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    
    // Try to extract position from title tag if not found yet
    if (!position) {
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1];
        
        // Different patterns to extract job title
        if (title.includes('|')) {
          const parts = title.split('|');
          position = parts[0].trim();
          // If company wasn't found in URL, try to get it from title
          if (!companyName && parts.length > 1) {
            companyName = parts[1].trim();
          }
        } else if (title.includes('-')) {
          const parts = title.split('-');
          position = parts[0].trim();
          // If company wasn't found in URL, try to get it from title
          if (!companyName && parts.length > 1) {
            companyName = parts[parts.length - 1].trim();
          }
        } else {
          position = title;
        }
      }
    }
    
    // Use smart extraction with AI for more accurate details if basic extraction failed
    if (!companyName || !position) {
      try {
        return extractJobDetailsWithAI(jobUrl, content);
      } catch (aiError) {
        // AI extraction failed, using basic extraction fallback
      }
    }
    
    return {
      company: companyName || "Unknown Company",
      position: position || "Position",
      location: location || "",
      url: jobUrl,
      content: content,
      error: false,
      extractionMethod: "pattern-matching"
    };
  } catch (error) {
    return { 
      error: true, 
      message: `Error processing job URL: ${formatError(error)}`,
      url: jobUrl,
      company: "Unknown Company",
      position: "Position"
    };
  }
}

/**
 * Fetches the content of a job posting URL
 */
function fetchJobPostingContent(jobUrl) {
  try {
    const response = safeFetch(jobUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (!response || response.getResponseCode() !== 200) {
      return { error: true, message: "Could not access the job posting URL" };
    }
    
    return response.getContentText();
  } catch (error) {
    return { error: true, message: `Error fetching job posting: ${formatError(error)}` };
  }
}

/******************************************************************************
 * MARKDOWN, TEXT PROCESSING & FORMAT CONVERSION
 ******************************************************************************/

/**
 * Format a markdown document into HTML for displaying in the sidebar
 * @param {string} markdown - Markdown formatted text
 * @return {string} HTML formatted text
 */
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Basic Markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // Code blocks with syntax highlighting
    .replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/gm, function(match, language, code) {
      return `<pre class="code-block ${language}"><code>${sanitizeText(code)}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/gm, '<code>$1</code>')
    // Horizontal rule
    .replace(/^\s*---+\s*$/gm, '<hr>')
    // Line breaks (preserve double line breaks as paragraphs)
    .replace(/\n\s*\n/gim, '</p><p>')
    // Single line breaks
    .replace(/\n/gim, '<br>')
    // Blockquotes
    .replace(/^\s*> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\s*\d\. (.*$)/gim, '<ol><li>$1</li></ol>');
  
  // Fix list tags (remove duplicate ul/ol tags)
  html = html
    .replace(/<\/ul><ul>/g, '')
    .replace(/<\/ol><ol>/g, '')
    .replace(/<\/blockquote><blockquote>/g, '<br>');
  
  // Wrap with paragraph tags if not already wrapped
  if (!html.startsWith('<p>')) {
    html = '<p>' + html + '</p>';
  }
  
  return html;
}

/**
 * Convert plain text to markdown format
 * @param {string} text - Plain text content
 * @param {Object} options - Formatting options
 * @return {string} Markdown formatted text
 */
function textToMarkdown(text, options = {}) {
  if (!text) return '';
  
  const lines = text.split('\n');
  let markdown = [];
  let inList = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      markdown.push('');
      continue;
    }
    
    // Detect headings (UPPERCASE LINES or lines ending with colon)
    if (line === line.toUpperCase() && line.length > 4) {
      // This is likely a heading
      markdown.push(`## ${line}`);
    }
    // Lines ending with colon might be section headers
    else if (line.endsWith(':') && line.length < 40) {
      markdown.push(`### ${line}`);
    }
    // Detect list items
    else if (line.match(/^[•\-\*\d+\.\)]\s+/) || 
            (i > 0 && lines[i-1].match(/^[•\-\*\d+\.\)]\s+/) && line.startsWith('  '))) {
      if (!inList) inList = true;
      
      // Format as list item if not already
      if (!line.startsWith('* ') && !line.startsWith('- ') && !line.match(/^\d\. /)) {
        line = `* ${line.replace(/^[•\-\*\d+\.\)]\s+/, '')}`;
      }
      markdown.push(line);
    }
    // End of list detection
    else if (inList) {
      inList = false;
      markdown.push('');
      markdown.push(line);
    }
    // Regular line
    else {
      markdown.push(line);
    }
  }
  
  return markdown.join('\n');
}

/**
 * Sanitize text for safe display
 * @param {string} text - Text to sanitize
 * @return {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Modified validateApiKey function to work with the model fetching functionality
 */
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, message: "API key is empty" };
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = safeFetch(url, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200) {
      return { valid: true };
    } else {
      const errorText = response.getContentText();
      return { valid: false, message: `API Error: ${responseCode} - ${errorText}` };
    }
  } catch (error) {
    return { valid: false, message: `Exception: ${formatError(error)}` };
  }
}

/**
 * Creates a document name with date and time
 */
function createTimestampedName(baseName) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  return `${baseName} ${timestamp}`;
}

/**
 * Processes a job URL to extract job posting content and metadata
 */
function processJobUrl(jobUrl) {
  // First, normalize the URL if it's just a document ID
  const docId = extractDocumentIdFromUrl(jobUrl);
  
  if (docId) {
    // It's a Google Doc URL, get the content
    const docContent = getDocumentContentById(docId);
    if (docContent.error) {
      return docContent;
    }
    
    return {
      content: docContent,
      url: jobUrl,
      company: "From Document",
      position: "From Document"
    };
  } else {
    // It's a regular job URL, fetch the job posting
    return extractJobDetails(jobUrl);
  }
}

/**
 * Extract key requirements and keywords from a job posting
 */
function extractJobKeywords(jobContent) {
  try {
    const systemPrompt = "You are an expert at analyzing job descriptions and identifying key requirements, skills, and keywords that should be emphasized in a resume and cover letter.";
    
    const prompt = `Analyze the following job posting and extract:
1. Key requirements (technical skills, education, experience)
2. Soft skills mentioned or implied
3. Important keywords that should be included in a resume and cover letter
4. The most important qualifications (top 3-5)

Format your answer in clear sections with bullet points.

Job posting:
${jobContent.substring(0, 5000)}`;

    const result = generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 1024
    });
    
    if (result.error) {
      return { error: true, message: result.message };
    }
    
    // Extract the keywords from the response
    const keywordPattern = /key(?:words|requirements|qualifications):(.*?)(?:\n\n|\n(?:[A-Z]|$)|$)/is;
    const match = result.text.match(keywordPattern);
    const keywords = match ? match[1].trim().split(/\n-|\n\*/).map(k => k.trim()).filter(k => k) : [];
    
    return {
      analysis: result.text,
      keywords: keywords
    };
  } catch (error) {
    logError("Error extracting job keywords: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Extract contact information from a resume
 */
function extractResumeContactInfo(resumeContent) {
  try {
    const systemPrompt = "You are an expert at parsing resumes and extracting contact information without making assumptions.";
    
    const prompt = `Extract only the contact information from this resume. 
Return the data in this exact format:
{
  "name": "Full Name",
  "email": "email@address.com",
  "phone": "phone number",
  "location": "city, state",
  "linkedin": "LinkedIn URL or username (if available)",
  "website": "personal website (if available)"
}

Only include information that is explicitly stated in the resume. Use null for missing fields.

Resume:
${resumeContent.substring(0, 3000)}`;

    const result = generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.1,
      maxOutputTokens: 512
    });
    
    if (result.error) {
      return { error: true, message: result.message };
    }
    
    // Try to parse the JSON response
    try {
      // Find JSON object in response (in case there's extra text)
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return safeJsonParse(jsonMatch[0]);
      }
      return { error: true, message: "Could not extract contact information" };
    } catch (e) {
      logError("Error parsing contact info: " + formatError(e));
      return { error: true, message: "Could not parse contact information" };
    }
  } catch (error) {
    logError("Error extracting contact info: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Create a job application folder with the date
 */
function createJobApplicationFolder(company, position) {
  const folderName = createTimestampedName(`${company} - ${position}`);
  const parentFolder = DriveApp.getFolderById('<PARENT_FOLDER_ID>');
  return parentFolder.createFolder(folderName);
}

/**
 * Save job posting information to a text file in the job folder
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
 * Generate a tailored resume based on job posting and keywords
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
 * Generate a job-specific cover letter
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
 * Enhanced document comparison for revision tracking
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
    logError("Error comparing documents: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/******************************************************************************
 * DOCUMENT ENHANCEMENT & ANALYSIS
 ******************************************************************************/

/**
 * Analyze a resume to identify strengths and improvement opportunities
 * @param {string} resumeContent - The resume content to analyze
 * @param {Object} options - Optional parameters for analysis customization
 * @return {Object} Analysis results or error information
 */
function analyzeResumeQuality(resumeContent, options = {}) {
  try {
    const systemPrompt = "You are an expert resume reviewer with experience in HR and recruitment. Provide honest, constructive feedback to improve resume quality and effectiveness.";
    
    const prompt = `Analyze this resume for quality, effectiveness, and areas for improvement:

${resumeContent.substring(0, 4500)}

Provide a detailed analysis including:
1. Overall impression (strengths and weaknesses)
2. Content assessment (experience descriptions, skills presentation, achievements)
3. Structure and organization
4. Language and tone
5. ATS compatibility score (out of 10) with explanation
6. Specific recommendations for improvement (prioritized by importance)

Format your response with clear sections and specific, actionable advice.`;

    const result = generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 2048
    });
    
    if (result.error) {
      return { error: true, message: result.message };
    }
    
    // Extract ATS score from the response if possible
    let atsScore = null;
    const atsMatch = result.text.match(/ATS.*?compatibility.*?score.*?(\d+)/i);
    if (atsMatch && atsMatch[1]) {
      atsScore = parseInt(atsMatch[1], 10);
    }
    
    return {
      analysis: result.text,
      atsScore: atsScore,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logError("Error analyzing resume quality: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Generate industry-specific resume suggestions
 * @param {string} industry - The target industry
 * @param {string} position - The target position
 * @param {number} experienceYears - Years of experience
 * @return {Object} Industry-specific suggestions or error information
 */
function getIndustrySpecificSuggestions(industry, position, experienceYears = 0) {
  try {
    const systemPrompt = "You are an expert career advisor with deep knowledge of industry-specific resume and cover letter standards.";
    
    const prompt = `Provide specific resume and cover letter recommendations for a ${position} position
in the ${industry} industry${experienceYears > 0 ? ` with ${experienceYears} years of experience` : ''}.

Include:
1. Key skills and qualifications that should be emphasized
2. Industry-specific terminology and keywords to include
3. Content structure recommendations
4. Common mistakes to avoid in this industry
5. Examples of effective achievement statements for this role (with metrics)
6. Cover letter tone and approach suggestions for this industry

Format your response with clear sections and practical, specific advice.`;

    return generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.3,
      maxOutputTokens: 2048
    });
  } catch (error) {
    logError("Error getting industry suggestions: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Enhance a draft cover letter by improving language and structure
 * @param {string} coverLetterContent - The draft cover letter
 * @param {Object} jobInfo - Information about the job posting
 * @return {Object} Enhanced cover letter or error information
 */
function enhanceCoverLetter(coverLetterContent, jobInfo = {}) {
  try {
    const systemPrompt = "You are an expert editor specializing in cover letters. Enhance the language, structure, and impact while maintaining the original writer's voice and intention.";
    
    const prompt = `Enhance this cover letter draft for a ${jobInfo.position || 'professional'} position
${jobInfo.company ? `at ${jobInfo.company}` : ''}:

${coverLetterContent}

Improve the letter by:
1. Strengthening the opening to grab attention
2. Enhancing clarity and conciseness throughout
3. Making accomplishments more impactful and quantified
4. Creating stronger connections between the candidate's background and job requirements
5. Making the closing more compelling with a clear call to action
6. Correcting any grammatical or structural issues

Return the complete revised version while maintaining the original message and facts.`;

    return generateWithGemini(prompt, {
      systemInstructions: systemPrompt,
      temperature: 0.3,
      maxOutputTokens: 2048
    });
  } catch (error) {
    logError("Error enhancing cover letter: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/******************************************************************************
 * DOCUMENT FORMATTING & EXPORT
 ******************************************************************************/

/**
 * Convert HTML formatting to Google Docs compatible formatting
 * @param {string} html - HTML formatted content
 * @param {DocumentBody} body - Google Docs body to append formatted content
 * @return {Object} Result with success status and information
 */
function applyHtmlFormatting(html, body) {
  try {
    if (!body) {
      return { error: true, message: "No document body provided" };
    }
    
    // Remove any existing content
    body.clear();
    
    // Parse HTML content
    let currentHeading = null;
    let inList = false;
    let listItems = [];
    let listType = null;
    
    // Simple HTML parsing - split by elements
    const lines = html.split(/<\/?([^>]+)>/g);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for heading tags
      if (line === 'h1') {
        currentHeading = DocumentApp.ParagraphHeading.HEADING1;
        continue;
      } else if (line === 'h2') {
        currentHeading = DocumentApp.ParagraphHeading.HEADING2;
        continue;
      } else if (line === 'h3') {
        currentHeading = DocumentApp.ParagraphHeading.HEADING3;
        continue;
      } else if (line === '/h1' || line === '/h2' || line === '/h3') {
        currentHeading = null;
        continue;
      }
      
      // Check for list items
      if (line === 'ul') {
        inList = true;
        listType = 'bullet';
        listItems = [];
        continue;
      } else if (line === 'ol') {
        inList = true;
        listType = 'numbered';
        listItems = [];
        continue;
      } else if (line === '/ul' || line === '/ol') {
        // Process the complete list
        if (listItems.length > 0) {
          const list = body.appendListItem(listItems[0]);
          list.setGlyphType(listType === 'bullet' ? 
                DocumentApp.GlyphType.BULLET : 
                DocumentApp.GlyphType.NUMBER);
          
          for (let j = 1; j < listItems.length; j++) {
            const item = body.appendListItem(listItems[j]);
            item.setGlyphType(listType === 'bullet' ? 
                  DocumentApp.GlyphType.BULLET : 
                  DocumentApp.GlyphType.NUMBER);
            item.setNestingLevel(0);
          }
        }
        
        inList = false;
        listItems = [];
        continue;
      } else if (line === 'li') {
        // Start of list item, capture the text in next line
        continue;
      } else if (line === '/li') {
        // End of list item
        continue;
      }
      
      // Process regular text content
      if (inList) {
        if (line && !['ul', 'ol', 'li', '/li'].includes(line)) {
          listItems.push(line);
        }
      } else {
        const para = body.appendParagraph(line);
        if (currentHeading) {
          para.setHeading(currentHeading);
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    logError("Error applying HTML formatting: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Create a PDF export of the current document
 * @param {string} docId - The document ID to export
 * @param {string} filename - Optional filename for the PDF
 * @return {Object} Information about the exported file or error
 */
function exportDocumentAsPdf(docId, filename = null) {
  try {
    const doc = DriveApp.getFileById(docId);
    if (!doc) {
      return { error: true, message: "Document not found" };
    }
    
    // Use the document name if no filename provided
    const outputName = filename || doc.getName() + " (PDF)";
    
    // Get the application folder
    const folder = getOrCreateAppFolder();
    
    // Export as PDF
    const blob = doc.getAs(MimeType.PDF);
    const pdfFile = folder.createFile(blob);
    pdfFile.setName(outputName);
    
    return { success: true, fileId: pdfFile.getId(), fileName: outputName };
  } catch (error) {
    logError("Error exporting document as PDF: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/******************************************************************************
 * GeminiCVCL - Utilities
 * Provides helper functions for safe operations and common tasks.
 */

/**
 * Safely fetch a URL with the given options.
 * Returns the response if successful; otherwise, logs and returns null.
 */
function safeFetch(url, options) {
  try {
    return UrlFetchApp.fetch(url, options);
  } catch (error) {
    logError("safeFetch error: " + error);
    return null;
  }
}

/**
 * Safely parse a JSON string.
 * Returns the parsed object or null if parsing fails.
 */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    logError("safeJsonParse error: " + error);
    return null;
  }
}

/**
 * Delay execution for a given number of milliseconds.
 */
function delay(ms) {
  Utilities.sleep(ms);
}

/**
 * Log an error message to the console.
 */
function logError(error) {
  console.error(error);
}

/**
 * Format an error object into a readable string.
 */
function formatError(error) {
  return (error && error.toString()) || "Unknown error";
}

/**
 * Generate a unique ID based on the current timestamp.
 */
function generateUniqueId() {
  return 'id-' + new Date().getTime();
}

/******************************************************************************
 * DOCUMENT CONTENT EXTRACTION & PROCESSING
 ******************************************************************************/

/**
 * Extract document ID from various URL formats
 * @param {string} url - URL that might contain a document ID
 * @return {string|null} Document ID if found, null otherwise
 */
function extractDocumentIdFromUrl(url) {
  if (!url) return null;
  
  try {
    // Handle different URL patterns
    let docId = null;
    
    // Pattern for Google Docs URLs
    if (url.includes('docs.google.com/document/d/')) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    }
    // Pattern for Google Drive URLs
    else if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        docId = match[1];
      }
    }
    // Handle direct document ID
    else if (/^[a-zA-Z0-9_-]{25,45}$/.test(url.trim())) {
      docId = url.trim();
    }
    
    return docId;
  } catch (error) {
    logError("Error extracting document ID: " + formatError(error));
    return null;
  }
}

/**
 * Get content from a Google Doc by ID
 * @param {string} docId - The document ID
 * @return {string|Object} Document content or error information
 */
function getDocumentContentById(docId) {
  try {
    if (!docId) {
      return { error: true, message: "No document ID provided" };
    }
    
    // Try to open the document
    let doc;
    try {
      doc = DocumentApp.openById(docId);
    } catch (e) {
      // If that fails, try accessing it through Drive API
      try {
        const file = DriveApp.getFileById(docId);
        const blob = file.getBlob();
        return blob.getDataAsString();
      } catch (driveError) {
        return { error: true, message: "Could not access document: " + formatError(driveError) };
      }
    }
    
    if (!doc) {
      return { error: true, message: "Document not found" };
    }
    
    const body = doc.getBody();
    return body.getText();
  } catch (error) {
    logError("Error getting document content: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/**
 * Extract sections from a document's content
 * @param {string} content - Document content text
 * @return {Object} Extracted sections or error information
 */
function extractDocumentSections(content) {
  try {
    if (!content) {
      return { error: true, message: "No content provided" };
    }
    
    // Regular expressions for common section headers in resumes/CVs
    const sectionRegexes = [
      { name: 'contact', regex: /^\s*(contact|personal)\s+(information|info|details)/im },
      { name: 'summary', regex: /^\s*(summary|profile|objective|professional summary)/im },
      { name: 'experience', regex: /^\s*(experience|work experience|employment|work history)/im },
      { name: 'education', regex: /^\s*(education|academic|qualifications|educational background)/im },
      { name: 'skills', regex: /^\s*(skills|technical skills|core competencies|expertise)/im },
      { name: 'projects', regex: /^\s*(projects|key projects|professional projects)/im },
      { name: 'certifications', regex: /^\s*(certifications|certificates|professional certifications)/im },
      { name: 'languages', regex: /^\s*(languages|language proficiency)/im },
      { name: 'references', regex: /^\s*(references|professional references)/im }
    ];
    
    // Split content into lines for processing
    const lines = content.split('\n');
    
    const sections = {};
    let currentSection = 'header'; // Default section for content before any heading
    let currentContent = [];
    
    // Process each line to identify sections
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this line is a section header
      let isSectionHeader = false;
      for (const section of sectionRegexes) {
        if (section.regex.test(trimmedLine)) {
          // If we've been collecting content, save the current section
          if (currentContent.length > 0) {
            sections[currentSection] = currentContent.join('\n');
          }
          
          // Start new section
          currentSection = section.name;
          currentContent = [];
          isSectionHeader = true;
          break;
        }
      }
      
      // If not a section header, add to current section content
      if (!isSectionHeader && trimmedLine) {
        currentContent.push(line);
      }
    });
    
    // Save the last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }
    
    return { sections, error: false };
  } catch (error) {
    logError("Error extracting document sections: " + formatError(error));
    return { error: true, message: formatError(error) };
  }
}

/******************************************************************************
 * SECURITY, VALIDATION & ERROR HANDLING
 ******************************************************************************/

/**
 * Safely fetch a URL with the given options.
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @return {HTTPResponse|null} Response if successful or null
 */
function safeFetch(url, options) {
  try {
    return UrlFetchApp.fetch(url, options);
  } catch (error) {
    logError("safeFetch error: " + error);
    return null;
  }
}

/**
 * Safely parse a JSON string.
 * @param {string} text - JSON string to parse
 * @return {Object|null} Parsed object or null if parsing fails
 */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    logError("safeJsonParse error: " + error);
    return null;
  }
}

/**
 * Validate a value against common security threats
 * @param {string} value - Value to validate
 * @param {string} type - Type of validation ('url', 'email', 'text')
 * @return {Object} Validation result with status and message
 */
function validateInput(value, type = 'text') {
  // Empty check
  if (!value || value.trim() === '') {
    return { valid: false, message: "Value cannot be empty" };
  }
  
  // Type-specific validation
  switch (type) {
    case 'url':
      // Simple URL validation
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
      if (!urlPattern.test(value)) {
        return { valid: false, message: "Invalid URL format" };
      }
      
      // Check for potentially dangerous URLs
      const dangerousUrlPatterns = /(javascript|data):/i;
      if (dangerousUrlPatterns.test(value)) {
        return { valid: false, message: "Potentially unsafe URL detected" };
      }
      break;
      
    case 'email':
      // Email validation
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        return { valid: false, message: "Invalid email format" };
      }
      break;
      
    case 'text':
      // Check for potentially harmful scripts
      const scriptPattern = /<script|<\/script>|javascript:|onerror=|onclick=/i;
      if (scriptPattern.test(value)) {
        return { valid: false, message: "Potentially unsafe content detected" };
      }
      break;
  }
  
  return { valid: true };
}

/**
 * Modified validateApiKey function to work with the model fetching functionality
 * @param {string} apiKey - API key to validate
 * @return {Object} Validation result with status and message
 */
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, message: "API key is empty" };
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = safeFetch(url, {
      method: 'get',
      muteHttpExceptions: true
    });
    
    if (!response) {
      return { valid: false, message: "Network error while validating API key" };
    }
    
    const responseCode = response.getResponseCode();
    if (responseCode === 200) {
      return { valid: true };
    } else {
      const errorText = response.getContentText();
      return { valid: false, message: `API Error: ${responseCode} - ${errorText}` };
    }
  } catch (error) {
    return { valid: false, message: `Exception: ${formatError(error)}` };
  }
}

/******************************************************************************
 * CACHE MANAGEMENT & PERFORMANCE
 ******************************************************************************/

/**
 * Get item from cache or compute if not available
 * @param {string} key - Cache key
 * @param {Function} computeFunc - Function to compute value if not cached
 * @param {number} expirationSeconds - Cache expiration in seconds
 * @return {*} Cached or computed value
 */
function getCachedOrCompute(key, computeFunc, expirationSeconds = 3600) {
  // Check cache first
  const cache = CacheService.getUserCache();
  const cached = cache.get(key);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // If parsing fails, return the raw cached value
      return cached;
    }
  }
  
  // Compute the value if not cached
  const value = computeFunc();
  
  // Cache the result
  try {
    cache.put(key, JSON.stringify(value), expirationSeconds);
  } catch (e) {
    // If serializing fails, store as string if possible
    try {
      cache.put(key, String(value), expirationSeconds);
    } catch (error) {
      logError("Error caching value: " + formatError(error));
    }
  }
  
  return value;
}

/**
 * Batches operations to avoid quota limits
 * @param {Array} items - Items to process
 * @param {Function} processFunc - Function to process each item
 * @param {number} batchSize - Size of each batch
 * @param {number} delayMs - Delay between batches in milliseconds
 * @return {Array} Results from all batches
 */
function batchProcess(items, processFunc, batchSize = 10, delayMs = 1000) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process this batch
    const batchResults = batch.map(processFunc);
    results.push(...batchResults);
    
    // Delay before next batch if not the last one
    if (i + batchSize < items.length) {
      Utilities.sleep(delayMs);
    }
  }
  
  return results;
}

/**
 * Measures execution time of a function
 * @param {Function} func - Function to measure
 * @param {Array} args - Arguments to pass to the function
 * @return {Object} Result with execution time and function result
 */
function measureExecutionTime(func, ...args) {
  const start = new Date().getTime();
  
  try {
    const result = func(...args);
    const end = new Date().getTime();
    
    return {
      executionTimeMs: end - start,
      result: result
    };
  } catch (error) {
    const end = new Date().getTime();
    return {
      executionTimeMs: end - start,
      error: true,
      message: formatError(error)
    };
  }
}

/******************************************************************************
 * IMPROVED UTILITY FUNCTIONS
 ******************************************************************************/

/**
 * Enhanced job details extraction with support for more job sites
 * @param {string} jobUrl - URL of the job posting
 * @return {Object} Enhanced job details or error information
 */
function extractJobDetails(jobUrl) {
  try {
    // Validate URL format first
    const urlValidation = validateInput(jobUrl, 'url');
    if (!urlValidation.valid) {
      return { 
        error: true, 
        message: urlValidation.message,
        url: jobUrl
      };
    }
    
    const response = safeFetch(jobUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (!response || response.getResponseCode() !== 200) {
      return { error: true, message: "Could not access the job posting URL" };
    }
    
    const content = response.getContentText();
    
    // Extract potential company name from the URL or content
    let companyName = "";
    let position = "";
    let location = "";
    
    // Extended support for more job sites
    if (jobUrl.includes('linkedin.com')) {
      const urlParts = jobUrl.split('/');
      const companyIndex = urlParts.indexOf('company');
      if (companyIndex !== -1 && companyIndex + 1 < urlParts.length) {
        companyName = urlParts[companyIndex + 1].split('?')[0].replace(/-/g, ' ');
      }
      
      // Try to extract more data from LinkedIn page content
      const jobTitleMatch = content.match(/<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>(.*?)<\/h1>/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        position = jobTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      
      const locationMatch = content.match(/location[^>]*>(.*?)<\/span>/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    } 
    else if (jobUrl.includes('indeed.com')) {
      const match = jobUrl.match(/company\/(.*?)\//);
      if (match && match[1]) {
        companyName = match[1].replace(/-/g, ' ');
      }
      
      // Try to extract more data from Indeed page content
      const jobTitleMatch = content.match(/<h1[^>]*class="[^"]*jobsearch-JobInfoHeader-title[^"]*"[^>]*>(.*?)<\/h1>/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        position = jobTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    else if (jobUrl.includes('glassdoor.com')) {
      // Extract from Glassdoor URLs
      const match = jobUrl.match(/employer\/([^\/]+)/i);
      if (match && match[1]) {
        companyName = match[1].replace(/-/g, ' ');
      }
    }
    else if (jobUrl.includes('monster.com')) {
      // Extract from Monster URLs
      const companyMatch = content.match(/company-name"[^>]*>(.*?)<\/div>/i);
      if (companyMatch && companyMatch[1]) {
        companyName = companyMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }
    
    // Try to extract position from title tag if not found yet
    if (!position) {
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const title = titleMatch[1];
        
        // Different patterns to extract job title
        if (title.includes('|')) {
          const parts = title.split('|');
          position = parts[0].trim();
          // If company wasn't found in URL, try to get it from title
          if (!companyName && parts.length > 1) {
            companyName = parts[1].trim();
          }
        } else if (title.includes('-')) {
          const parts = title.split('-');
          position = parts[0].trim();
          // If company wasn't found in URL, try to get it from title
          if (!companyName && parts.length > 1) {
            companyName = parts[parts.length - 1].trim();
          }
        } else {
          position = title;
        }
      }
    }
    
    // Use smart extraction with AI for more accurate details if basic extraction failed
    if (!companyName || !position) {
      try {
        return extractJobDetailsWithAI(jobUrl, content);
      } catch (aiError) {
        // AI extraction failed, using basic extraction fallback
      }
    }
    
    return {
      company: companyName || "Unknown Company",
      position: position || "Position",
      location: location || "",
      url: jobUrl,
      content: content,
      error: false,
      extractionMethod: "pattern-matching"
    };
  } catch (error) {
    return { 
      error: true, 
      message: `Error processing job URL: ${formatError(error)}`,
      url: jobUrl,
      company: "Unknown Company",
      position: "Position"
    };
  }
}

/**
 * Enhanced markdown to HTML converter with better formatting support
 * @param {string} markdown - Markdown formatted text
 * @return {string} HTML formatted text
 */
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Basic Markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // Code blocks with syntax highlighting
    .replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/gm, function(match, language, code) {
      return `<pre class="code-block ${language}"><code>${sanitizeText(code)}</code></pre>`;
    })
    // Inline code
    .replace(/`([^`]+)`/gm, '<code>$1</code>')
    // Horizontal rule
    .replace(/^\s*---+\s*$/gm, '<hr>')
    // Line breaks (preserve double line breaks as paragraphs)
    .replace(/\n\s*\n/gim, '</p><p>')
    // Single line breaks
    .replace(/\n/gim, '<br>')
    // Blockquotes
    .replace(/^\s*> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\s*\* (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\s*- (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/^\s*\d\. (.*$)/gim, '<ol><li>$1</li></ol>');
  
  // Fix list tags (remove duplicate ul/ol tags)
  html = html
    .replace(/<\/ul><ul>/g, '')
    .replace(/<\/ol><ol>/g, '')
    .replace(/<\/blockquote><blockquote>/g, '<br>');
  
  // Wrap with paragraph tags if not already wrapped
  if (!html.startsWith('<p>')) {
    html = '<p>' + html + '</p>';
  }
  
  return html;
}

/**
 * Enhanced cache management with compression for larger objects
 * @param {string} key - Cache key
 * @param {Function} computeFunc - Function to compute value if not cached
 * @param {Object} options - Cache options including expiration
 * @return {*} Cached or computed value
 */
function getCachedOrCompute(key, computeFunc, options = {}) {
  // Default options
  const defaults = {
    expirationSeconds: 3600,
    compress: false,
    namespace: 'default',
    retryOnFailure: true
  };
  
  const config = {...defaults, ...options};
  const cacheKey = `${config.namespace}_${key}`;
  
  // Check cache first
  const cache = CacheService.getUserCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    try {
      // Handle compressed data
      if (cached.startsWith('COMPRESSED:')) {
        const compressedData = cached.substring(11); // Remove 'COMPRESSED:' prefix
        const decompressed = Utilities.unzip(Utilities.newBlob(Utilities.base64Decode(compressedData), 'application/zip'));
        if (decompressed && decompressed.length > 0) {
          const jsonData = decompressed[0].getDataAsString();
          return JSON.parse(jsonData);
        }
      } else {
        // Normal JSON parsing
        return JSON.parse(cached);
      }
    } catch (e) {
      // Cache parse error - using fallback
      // If parsing fails, return the raw cached value
      return cached;
    }
  }
  
  // Compute the value if not cached
  try {
    const value = computeFunc();
    
    // Cache the result
    try {
      const valueToCache = JSON.stringify(value);
      
      // Check if compression is needed (for large values)
      if (config.compress || valueToCache.length > 50000) {
        const blob = Utilities.newBlob(valueToCache);
        const zippedBlob = Utilities.zip([blob]);
        const base64Encoded = Utilities.base64Encode(zippedBlob.getBytes());
        cache.put(cacheKey, 'COMPRESSED:' + base64Encoded, config.expirationSeconds);
      } else {
        cache.put(cacheKey, valueToCache, config.expirationSeconds);
      }
    } catch (cacheError) {
      // Error caching value - continuing without cache
    }
    
    return value;
  } catch (computeError) {
    console.error("Error computing value:", computeError);
    
    // If computation fails and retry is enabled, try once more
    if (config.retryOnFailure) {
      try {
        return computeFunc();
      } catch (retryError) {
        throw new Error(`Failed to compute value after retry: ${formatError(retryError)}`);
      }
    }
    
    throw computeError;
  }
}

/**
 * Basic job details extraction without AI (fallback method)
 * @param {string} jobUrl - URL of the job posting
 * @param {string} content - HTML content of the job posting
 * @return {Object} Basic job details extraction
 */
function extractJobDetailsBasic(jobUrl, content) {
  try {
    let companyName = "Unknown Company";
    let position = "Position";
    let location = "";
    let jobType = "";
    let experienceLevel = "";
    
    // Basic extraction patterns for common job sites
    if (jobUrl.includes('linkedin.com')) {
      const urlParts = jobUrl.split('/');
      const companyIndex = urlParts.indexOf('company');
      if (companyIndex !== -1 && companyIndex + 1 < urlParts.length) {
        companyName = urlParts[companyIndex + 1].split('?')[0].replace(/-/g, ' ');
      }
      
      // Basic title extraction
      const jobTitleMatch = content.match(/<h1[^>]*job-title[^>]*>(.*?)<\/h1>/i) || 
                           content.match(/<title[^>]*>(.*?) - (.*?) \| LinkedIn<\/title>/i);
      if (jobTitleMatch && jobTitleMatch[1]) {
        position = jobTitleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      
      const locationMatch = content.match(/location[^>]*>(.*?)<\/span>/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    } else {
      // Generic extraction for other sites
      const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        position = titleMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 100);
      }
    }
    
    return {
      company: companyName,
      position: position,
      location: location,
      jobType: jobType,
      experienceLevel: experienceLevel,
      url: jobUrl,
      content: content,
      error: false,
      extractionMethod: "basic-fallback"
    };
  } catch (error) {
    return {
      company: "Unknown Company",
      position: "Position",
      location: "",
      jobType: "",
      experienceLevel: "",
      url: jobUrl,
      content: content,
      error: true,
      message: "Basic extraction failed: " + error.toString(),
      extractionMethod: "basic-fallback"
    };
  }
}

/**
 * Extract job details using AI for more accurate parsing
 * @param {string} jobUrl - URL of the job posting
 * @param {string} content - HTML content of the job posting
 * @return {Object} Job details from AI extraction
 */
function extractJobDetailsWithAI(jobUrl, content) {
  const systemPrompt = "You are an expert at parsing job postings and extracting key information accurately.";
  
  const prompt = `Extract the following information from this job posting:
1. Job title/position
2. Company name
3. Location
4. Job type (full-time, part-time, contract, etc.)
5. Required experience level

Return ONLY a JSON object with these fields without ANY additional text:
{
  "position": "extracted job title",
  "company": "extracted company name",
  "location": "extracted location",
  "jobType": "extracted job type",
  "experienceLevel": "extracted experience level"
}

Job posting content:
${content.substring(0, 5000)}`;

  const result = generateWithGemini(prompt, {
    systemInstructions: systemPrompt,
    temperature: 0.1,
    maxOutputTokens: 512
  });
  
  if (result.error) {
    console.warn("AI extraction failed, falling back to basic extraction:", result.message);
    return extractJobDetailsBasic(jobUrl, content);
  }
  
  try {
    // Find the JSON object in the response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("Invalid JSON format in AI response, falling back to basic extraction");
      return extractJobDetailsBasic(jobUrl, content);
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    return {
      company: parsedResult.company || "Unknown Company",
      position: parsedResult.position || "Position",
      location: parsedResult.location || "",
      jobType: parsedResult.jobType || "",
      experienceLevel: parsedResult.experienceLevel || "",
      url: jobUrl,
      content: content,
      error: false,
      extractionMethod: "ai-assisted"
    };
  } catch (parseError) {
    console.warn("Error parsing AI extraction result, falling back to basic extraction:", formatError(parseError));
    return extractJobDetailsBasic(jobUrl, content);
  }
}