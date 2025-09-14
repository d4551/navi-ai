/**
 * GeminiCVCL - Resume and Cover Letter Creation Tool
 * Powered by Navi AI
 */

/******************************************************************************
 * GLOBAL CONSTANTS AND CONFIGURATION
 ******************************************************************************/
const APP_TITLE = "Resume & Cover Letter Assistant";
const FOLDER_NAME = "GeminiCVCL Documents";
const USER_PROPS_KEYS = {
  API_KEY: "geminiApiKey",
  MODEL: "geminiModel",
  SETTINGS: "userSettings"
};

/******************************************************************************
 * UI INITIALIZATION AND MENU SETUP
 ******************************************************************************/

/**
 * Adds a custom menu item to create resumes and cover letters
 */
function onOpen() {
  const ui = DocumentApp.getUi();
  ui.createMenu('Resume & Cover Letter')
      .addItem('Open Assistant Sidebar', 'showSidebar')
      .addSeparator()
      .addSubMenu(ui.createMenu('Create Document')
          .addItem('New Resume/CV', 'createNewResume')
          .addItem('New Cover Letter', 'createNewCoverLetter')
          .addSeparator()
          .addItem('Job-Specific Application', 'createFromJobUrl'))
      .addSeparator()
      .addSubMenu(ui.createMenu('Edit with AI')
          .addItem('Format & Style', 'formatCurrentDocument')
          .addItem('Analyze Content', 'analyzeDocument'))
      .addSeparator()
      .addItem('Settings', 'showSettings')
      .addItem('About', 'showAbout')
      .addToUi();
}

/******************************************************************************
 * SIDEBAR AND DIALOG UI FUNCTIONS
 ******************************************************************************/

/**
 * Shows the sidebar with document awareness
 * @return {void}
 */
function showSidebar() {
  try {
    // First check for active document
    const doc = DocumentApp.getActiveDocument();
    const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
    
    if (doc) {
      // Use the existing analyzeCurrentDocument function for consistency
      const analysis = analyzeCurrentDocument();
      
      if (!analysis.error) {
        // Add document context to sidebar
        html.append(`<script>
          window.documentContext = ${JSON.stringify(analysis)};
          window.hasExistingDocument = true;
        </script>`);
        
        // Initialize or update chat session with document context
        const session = getChatSession({
          documentId: doc.getId(),
          documentName: doc.getName(),
          documentType: analysis.type || 'document',
          hasAnalysis: true
        });
      }
    } else {
      // No active document
      html.append(`<script>
        window.hasExistingDocument = false;
      </script>`);
    }
    
    DocumentApp.getUi().showSidebar(html);
  } catch (error) {
    console.error("Error showing sidebar:", error);
    
    // Fallback to simple sidebar without document context
    const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
    
    DocumentApp.getUi().showSidebar(html);
  }
}

/**
 * Shows the sidebar with a specific document type pre-selected
 * @param {string} docType - Type of document ('resume' or 'cover')
 * @return {void}
 */
function showSidebarWithDocType(docType) {
  const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
  
  // Add script to set the document type after the sidebar loads
  html.append(`<script>
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelector('input[name="docType"][value="${docType}"]').checked = true;
      if (typeof updateButtonLabel === 'function') updateButtonLabel();
    });
  </script>`);
  
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Show sidebar with document context
 * @param {Object} session - Current chat session
 * @return {Object} Result object with success/error info
 */
function showSidebarWithContext(session) {
  try {
    const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
    
    // Add session data as context to the sidebar
    html.append(`<script>
      window.documentContext = ${JSON.stringify(session.context || {})};
      window.hasExistingDocument = ${Boolean(session.context?.documentId)};
      window.sessionActive = true;
    </script>`);
    
    DocumentApp.getUi().showSidebar(html);
    
    return { success: true, sessionId: session.context?.documentId || null };
  } catch (error) {
    console.error("Error showing sidebar with context:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Creates a new resume from scratch with guided questions
 */
function createNewResume() {
  // Check if API key exists
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    showApiKeyPrompt();
    return;
  }
  
  showSidebarWithDocType('resume');
}

/**
 * Creates a new CV from scratch with guided questions
 */
function createNewCV() {
  // Call helper to generate text and insert into the current document
  const docId = DocumentApp.getActiveDocument().getId();
  const userInfo = {
    // Provide any relevant user data needed by the AI
    jobTitle: "Software Developer",
    experience: "3 years at XYZ Corp",
    education: "B.Sc. in Computer Science",
    skills: "JavaScript, Python, GCP"
  };
  insertGeneratedCV(docId, userInfo);
}

/**
 * Generates a CV with AI and inserts it into the document
 */
function insertGeneratedCV(docId, userInfo) {
  const prompt = `Please create a well-structured CV for a ${userInfo.jobTitle}.
Experience: ${userInfo.experience}
Education: ${userInfo.education}
Skills: ${userInfo.skills}`;

  const result = generateWithGemini(prompt, {
    temperature: 0.3
    // ...other options if needed...
  });

  if (result.error) {
    SpreadsheetApp.getUi().alert("Error generating CV: " + result.message);
    return;
  }

  // Insert text content into the active document
  const doc = DocumentApp.openById(docId);
  doc.getBody().appendParagraph(result.text);
  SpreadsheetApp.getUi().alert("CV successfully inserted into the document!");
}

/**
 * Creates a new cover letter from scratch with guided questions
 */
function createNewCoverLetter() {
  // Check if API key exists
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    showApiKeyPrompt();
    return;
  }
  
  showSidebarWithDocType('cover');
}

/**
 * Creates customized resume and cover letter from a job URL
 */
function createFromJobUrl() {
  // Check if API key exists
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    showApiKeyPrompt();
    return;
  }

  // Open the sidebar with the job tab active
  const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
  
  html.append(`<script>
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelector('.tab[data-tab="job"]').click();
    });
  </script>`);
  
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Shows a prompt to enter Gemini API key
 */
function showApiKeyPrompt() {
  const ui = DocumentApp.getUi();
  const result = ui.prompt(
      'Gemini API Key Required',
      'Please enter your Gemini API key from https://aistudio.google.com/',
      ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    const apiKey = result.getResponseText().trim();
    if (apiKey) {
      PropertiesService.getUserProperties().setProperty(USER_PROPS_KEYS.API_KEY, apiKey);
      showSidebar();
    }
  }
}

/**
 * Shows the settings dialog
 */
function showSettings() {
  const html = HtmlService.createHtmlOutputFromFile('index')
      .setWidth(450)
      .setHeight(500)
      .setTitle('Settings');
  DocumentApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Shows information about the add-on
 */
function showAbout() {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #1a73e8;">${APP_TITLE}</h2>
      <p>Version 1.0</p>
      <p>A Google Docs add-on for creating professional resumes and cover letters with Navi AI.</p>
      <p>Powered by Navi AI API</p>
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="google.script.host.close()" 
                style="background-color: #1a73e8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Close
        </button>
      </div>
    </div>
  `)
      .setWidth(400)
      .setHeight(250)
      .setTitle('About');
  DocumentApp.getUi().showModalDialog(html, 'About');
}

/**
 * Format the current document with AI
 */
async function formatCurrentDocument() {
  // Check if API key exists
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    showApiKeyPrompt();
    return;
  }

  const doc = DocumentApp.getActiveDocument();
  if (!doc) {
    DocumentApp.getUi().alert('No document is currently open.');
    return;
  }

  // Get user's preferred style template
  const userProps = PropertiesService.getUserProperties();
  const settings = JSON.parse(userProps.getProperty(USER_PROPS_KEYS.SETTINGS) || '{}');
  const styleTemplate = settings.defaultTemplate || 'modern-professional';

  // Show loading message
  DocumentApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(
      '<div style="padding: 20px; text-align: center;">' +
      '<p>Formatting document with AI...</p>' +
      '<div class="loader"></div>' +
      '</div>'
    ).setWidth(300).setHeight(100),
    'Processing'
  );

  await DocumentManager.formatCurrentDocumentWithAI(styleTemplate)
    .then(result => {
      if (result.error) {
        DocumentApp.getUi().alert('Error: ' + result.message);
        return;
      }
      DocumentApp.getUi().alert('Document formatted successfully!');
    })
    .catch(error => {
      DocumentApp.getUi().alert('Error: ' + error.toString());
    });
}

/**
 * Improve document with AI suggestions
 * @deprecated Use DocumentManager.improveDocumentWithAI instead
 */
function improveDocumentWithAI(prompt) {
  // Delegate to the consolidated implementation in DocumentManager
  return DocumentManager.improveDocumentWithAI(prompt);
}

/**
 * Analyze the current document
 */
function analyzeDocument() {
  // Check if API key exists and a document is open
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    showApiKeyPrompt();
    return;
  }
  
  const doc = DocumentApp.getActiveDocument();
  if (!doc) {
    DocumentApp.getUi().alert('No document is currently open.');
    return;
  }

  // Get document structure - FIX: Use consistent function name
  const structure = analyzeCurrentDocument();
  if (structure.error) {
    DocumentApp.getUi().alert('Error analyzing document: ' + structure.message);
    return;
  }
  
  // Open the sidebar with Create New tab
  const html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle(APP_TITLE)
      .setWidth(350);
  
  // Add script to trigger document analysis after the sidebar loads
  html.append(`<script>
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        document.getElementById('startGuidedBtn').click();
        setTimeout(function() {
          if (document.getElementById('analyze-doc-btn')) {
            document.getElementById('analyze-doc-btn').click();
          }
        }, 2000);
      }, 500);
    });
  </script>`);
  
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Gets or creates the application folder in Google Drive
 */
function getOrCreateAppFolder() {
  const folderIterator = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folderIterator.hasNext()) {
    return folderIterator.next();
  } else {
    return DriveApp.createFolder(FOLDER_NAME);
  }
}

/**
 * Saves user properties
 */
function saveUserProperties(properties) {
  const props = PropertiesService.getUserProperties();
  if (properties.apiKey) props.setProperty(USER_PROPS_KEYS.API_KEY, properties.apiKey);
  if (properties.model) props.setProperty(USER_PROPS_KEYS.MODEL, properties.model);
  if (properties.settings) props.setProperty(USER_PROPS_KEYS.SETTINGS, JSON.stringify(properties.settings));
  return true;
}

/**
 * Save chat history when enabled
 */
function saveChatHistory(conversation, docType) {
  const props = PropertiesService.getUserProperties();
  const settings = JSON.parse(props.getProperty(USER_PROPS_KEYS.SETTINGS) || '{}');
  
  // Only save if the setting is enabled
  if (settings.saveHistory) {
    try {
      const folder = getOrCreateAppFolder();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${docType || 'Document'} Conversation - ${timestamp}.txt`;
      
      // Format conversation history
      const content = conversation.map(msg => {
        if (msg.role && msg.parts && msg.parts[0]) {
          return `--- ${msg.role.toUpperCase()} ---\n${msg.parts[0].text}\n\n`;
        }
        return '';
      }).join('');
      
      folder.createFile(fileName, content);
      return true;
    } catch (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
  }
  
  return false;
}

/**
 * Opens the active document in a new tab
 */
function openActiveDocument() {
  const doc = DocumentApp.getActiveDocument();
  if (!doc) return;
  
  return doc.getUrl();
}

/**
 * Update a specific section in the current document
 */
function updateDocumentSection(sectionData) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }
    
    const body = doc.getBody();
    const originalTitle = sectionData.originalTitle;
    const newTitle = sectionData.newTitle;
    const content = sectionData.content;
    
    // If this is a new section
    if (!originalTitle) {
      // Create new section at the end of document
      const headingPara = body.appendParagraph(newTitle);
      headingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      // Add the content
      if (content) {
        const contentLines = content.split('\n');
        contentLines.forEach(line => {
          if (line.trim()) {
            body.appendParagraph(line);
          }
        });
      }
      
      return { success: true };
    }
    
    // Find the original section heading
    const searchResult = body.findText(originalTitle);
    if (!searchResult) {
      return { error: true, message: "Section not found" };
    }
    
    const headingElement = searchResult.getElement().getParent();
    
    // Update section title if changed
    if (originalTitle !== newTitle) {
      headingElement.clear().appendText(newTitle);
    }
    
    // Find all content between this heading and the next heading
    let nextElement = headingElement.getNextSibling();
    let foundElements = [];
    
    while (nextElement) {
      if (nextElement.getType() === DocumentApp.ElementType.PARAGRAPH) {
        const paragraph = nextElement.asParagraph();
        if (paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
          // Found next heading, stop here
          break;
        }
        foundElements.push(nextElement);
      }
      nextElement = nextElement.getNextSibling();
    }
    
    // Remove all content from this section
    foundElements.forEach(element => {
      body.removeChild(element);
    });
    
    // Insert new content
    const contentLines = content.split('\n');
    let insertPosition = body.getChildIndex(headingElement) + 1;
    
    for (let i = contentLines.length - 1; i >= 0; i--) {
      const line = contentLines[i].trim();
      if (line) {
        body.insertParagraph(insertPosition, line);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Improve content with AI suggestions
 */
function improveContentWithAI(title, content) {
  const systemPrompt = "You are an expert writer helping to improve document sections. Maintain the same information but enhance the writing style, clarity, and professionalism.";
  
  const userPrompt = `Please improve the following "${title}" section content while maintaining all key information. Make it clear, professional, and well-structured:

${content}

Your improved version:`;

  return generateWithGemini(userPrompt, {
    systemInstructions: systemPrompt,
    temperature: 0.3
  });
}

/**
 * Update document based on AI prompt
 */
function updateDocumentWithAI(prompt) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }
    
    // FIX: Use consistent function name
    const structure = analyzeCurrentDocument();
    if (structure.error) {
      return { error: true, message: "Error analyzing document: " + structure.message };
    }
    
    const systemPrompt = "You are an expert document editor. Generate content that will improve the document based on the user's request.";
    
    const contextPrompt = `Based on the following document structure and content:
Title: ${structure.title}
Sections:
${structure.headings.join('\n')}

Current document content:
${structure.content.substring(0, 5000)}

And the user's request:
${prompt}

Please generate appropriate content updates formatted as follows:
##SECTION_NAME## 
The updated content for this section.
##END_SECTION##

You can create new sections or modify existing ones. Format section names in all caps with underscores.`;

    const result = generateWithGemini(contextPrompt, {
      systemInstructions: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 2048
    });
    
    if (result.error) {
      return { error: true, message: result.message };
    }
    
    // Update the document with the AI generated content
    return updateCurrentDocumentSections(result.text);
  } catch (error) {
    console.error(error);
    return { error: true, message: error.toString() };
  }
}



/**
 * Format model name for display
 */
function formatModelName(modelName) {
  const name = modelName.split('/').pop();
  
  if (name.includes('gemini-1.5-flash')) {
    return 'Gemini 1.5 Flash (Fast)';
  } else if (name.includes('gemini-1.5-pro')) {
    return 'Gemini 1.5 Pro (Powerful)';
  } else if (name.includes('gemini-pro')) {
    return 'Gemini Pro';
  }
  
  return name;
}

/**
 * Get available Gemini models for UI dropdowns
 */
function getAvailableGeminiModels() {
  const props = PropertiesService.getUserProperties();
  const apiKey = props.getProperty(USER_PROPS_KEYS.API_KEY);
  
  if (!apiKey) {
    return [{
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash (Fast)',
      description: 'Default fast model'
    }];
  }
  
  // Try to get cached models first
  const cachedModels = props.getProperty('availableModels');
  if (cachedModels) {
    try {
      return JSON.parse(cachedModels);
    } catch (e) {
      console.error('Error parsing cached models:', e);
    }
  }
  
  // If no cache or parse error, fetch fresh
  const result = validateAndInitializeModels(apiKey);
  if (result.valid && result.models) {
    props.setProperty('availableModels', JSON.stringify(result.models));
    return result.models;
  }
  
  // Fallback to default
  return [{
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Fast)',
    description: 'Default fast model'
  }];
}

/**
 * Refresh available models (called after API key changes)
 */
function refreshAvailableModels() {
  const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
  if (!apiKey) return false;
  
  // Delete any cached models before fetching
  PropertiesService.getUserProperties().deleteProperty('availableModels');
  const result = validateAndInitializeModels(apiKey);
  if (result.valid && result.models && result.models.length > 0) {
    // Cache new models list
    PropertiesService.getUserProperties().setProperty('availableModels', JSON.stringify(result.models));
    return true;
  }
  return false;
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
    "Courier New",
    "Lato"
  ];
}

/**
 * Creates a new document with AI assistance
 * @param {string} type - Document type ('resume', 'cv', 'cover')
 * @param {string} style - Document style template
 * @return {Object} Result with success/error information
 */
function createNewDocument(type, style) {
  try {
    // Show progress indicator
    showProgressIndicator('Setting up your document...');
    
    // Check for API key
    const apiKey = PropertiesService.getUserProperties().getProperty(USER_PROPS_KEYS.API_KEY);
    if (!apiKey) {
      return createErrorResponse("API key not found. Please set up your Gemini API key.");
    }
    
    // Initialize a session with the ChatManager
    const session = getChatSession({
      docType: type,
      style: style,
      creationStage: 'initial'
    });
    
    // Start a guided session for the specified document type
    const response = startGuidedChatSession(type);
    
    if (response.error) {
      return response;
    }
    
    // Show sidebar with the chat context
    return showSidebarWithContext(session);
  } catch (error) {
    return createErrorResponse("Error creating new document", error);
  }
}

/**
 * Get the current chat session
 */
function getChatSession(options = {}) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const sessionData = userProperties.getProperty('currentChatSession');
    
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Validate session structure
    if (!session.history || !Array.isArray(session.history)) {
      session.history = [];
    }
    
    if (!session.id) {
      session.id = Utilities.getUuid();
    }
    
    if (!session.startTime) {
      session.startTime = new Date().toISOString();
    }
    
    return session;
  } catch (error) {
    console.error('Error retrieving chat session:', error);
    return null;
  }
}

/**
 * Handle AI suggestion insertion
 */
function insertAISuggestion(suggestionIndex, options = {}) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }
    
    // Get the current session and its history
    const session = getChatSession();
    if (!session || !session.history || session.history.length === 0) {
      return { error: true, message: "No active chat session found" };
    }
    
    // Get AI responses from the session history
    const aiResponses = session.history
      .filter(msg => msg.role === 'model')
      .map(msg => msg.parts[0].text);
      
    // Check if the suggestion index is valid
    if (!aiResponses[suggestionIndex]) {
      return { error: true, message: "Invalid suggestion index" };
    }
    
    // Get the selected suggestion
    const suggestion = aiResponses[suggestionIndex];
    
    // Get cursor position or selection
    const selection = doc.getSelection();
    let insertPosition;
    
    if (selection) {
      // Insert at selection
      const elements = selection.getSelectedElements();
      if (elements.length > 0 && elements[0].getElement()) {
        const element = elements[0].getElement();
        
        // Handle different element types
        if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
          insertPosition = element.asParagraph();
        } else if (element.getType() === DocumentApp.ElementType.TEXT) {
          insertPosition = element.getParent();
        }
      }
    }
    
    if (!insertPosition) {
      // No valid selection, insert at cursor position
      const cursor = doc.getCursor();
      if (cursor) {
        insertPosition = cursor.getElement();
      } else {
        // Default to end of document
        insertPosition = doc.getBody();
      }
    }
    
    // Process and clean the text (handle markdown, etc.)
    const processedContent = processAISuggestionContent(suggestion, options);
    
    // Insert the cleaned content at the position
    if (insertPosition.getType() === DocumentApp.ElementType.BODY_SECTION) {
      // If inserting into body, append paragraphs
      const paragraphs = processedContent.split('\n');
      paragraphs.forEach(p => {
        if (p.trim()) {
          insertPosition.appendParagraph(p);
        }
      });
    } else {
      // Insert at specific position and handle formatting
      insertPosition.setText(processedContent);
      
      // Apply formatting if needed
      if (options.format) {
        StyleManager.cleanMarkdownArtifacts(doc);
      }
    }
    
    return { success: true, message: "Content inserted successfully" };
  } catch (error) {
    console.error("Error inserting suggestion:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Process AI suggestion content
 */
function processAISuggestionContent(content, options = {}) {
  // Clean up content
  let processedContent = content;
  
  // Remove markdown code blocks
  processedContent = processedContent.replace(/```[\s\S]*?```/g, '');
  
  // Remove formatting instructions
  processedContent = processedContent.replace(/^I'll help you.*?Here's/mi, "Here's");
  processedContent = processedContent.replace(/^Here are some suggestions.*?:/mi, "");
  
  // Remove leading/trailing whitespace
  processedContent = processedContent.trim();
  
  // If preserveMarkdown option is false, strip markdown completely
  if (options.preserveMarkdown === false) {
    // Remove bold/italic markers
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '$1');
    processedContent = processedContent.replace(/\*(.*?)\*/g, '$1');
    processedContent = processedContent.replace(/__(.*?)__/g, '$1');
    processedContent = processedContent.replace(/_(.*?)_/g, '$1');
    
    // Remove headings
    processedContent = processedContent.replace(/^#+\s+/gm, '');
  }
  
  return processedContent;
}

/**
 * Create a document based on chat history
 */
function createDocumentFromChatHistory() {
  // Delegate to the ChatManager's functionality
  return generateDocumentFromChat();
}

/**
 * Analyze current document to extract structure for the AI
 * This is the unified document analysis function that should be used consistently
 */
function analyzeCurrentDocument() {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }
    
    const body = doc.getBody();
    const text = body.getText();
    
    // Extract document structure
    const structure = {
      title: doc.getName(),
      headings: [],
      content: text,
      sections: {}
    };
    
    // Extract headings and sections
    let currentHeading = null;
    let currentContent = [];
    
    for (let i = 0; i < body.getNumChildren(); i++) {
      const element = body.getChild(i);
      
      if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
        const paragraph = element.asParagraph();
        const heading = paragraph.getHeading();
        const paragraphText = paragraph.getText().trim();
        
        if (heading !== DocumentApp.ParagraphHeading.NORMAL && paragraphText) {
          // If we had a previous heading, save its content
          if (currentHeading !== null) {
            structure.sections[currentHeading] = currentContent.join('\n\n');
            currentContent = [];
          }
          
          // Set new current heading
          currentHeading = paragraphText;
          structure.headings.push(paragraphText);
        } else if (currentHeading !== null && paragraphText) {
          // Add to current section
          currentContent.push(paragraphText);
        }
      }
    }
    
    // Save the last section
    if (currentHeading !== null) {
      structure.sections[currentHeading] = currentContent.join('\n\n');
    }
    
    // Detect document type
    structure.type = detectDocumentType(text);
    
    return structure;
  } catch (error) {
    console.error("Error analyzing document:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Update current document sections with AI-generated content
 */
function updateCurrentDocumentSections(aiContent) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return { error: true, message: "No active document found" };
    }
    
    const body = doc.getBody();
    
    // Parse the AI content for sections
    const sectionRegex = /##([^#]+)##\s*([\s\S]*?)(?=##[^#]+##|$)/g;
    let match;
    let updateCount = 0;
    
    while ((match = sectionRegex.exec(aiContent)) !== null) {
      const sectionName = match[1].trim();
      const sectionContent = match[2].trim();
      
      // Try to find if this section already exists
      const searchResult = body.findText(sectionName);
      
      if (searchResult) {
        // Update existing section
        const headingElement = searchResult.getElement().getParent();
        const headingIndex = body.getChildIndex(headingElement);
        
        // Find where the next section begins
        let nextHeadingIndex = body.getNumChildren();
        for (let i = headingIndex + 1; i < body.getNumChildren(); i++) {
          const element = body.getChild(i);
          if (element.getType() === DocumentApp.ElementType.PARAGRAPH && 
              element.asParagraph().getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
            nextHeadingIndex = i;
            break;
          }
        }
        
        // Remove current content between headings
        for (let i = nextHeadingIndex - 1; i > headingIndex; i--) {
          body.removeChild(body.getChild(i));
        }
        
        // Add new content
        const contentLines = sectionContent.split('\n');
        for (let i = contentLines.length - 1; i >= 0; i--) {
          if (contentLines[i].trim()) {
            body.insertParagraph(headingIndex + 1, contentLines[i]);
          }
        }
      } else {
        // Create new section
        const headingPara = body.appendParagraph(sectionName);
        headingPara.setHeading(DocumentApp.ParagraphHeading.HEADING2);
        
        // Add content
        const contentLines = sectionContent.split('\n');
        contentLines.forEach(line => {
          if (line.trim()) {
            body.appendParagraph(line);
          }
        });
      }
      
      updateCount++;
    }
    
    return { success: true, updatedSections: updateCount };
  } catch (error) {
    console.error("Error updating document sections:", error);
    return { error: true, message: error.toString() };
  }
}

/**
 * Detect document type from content
 */
function detectDocumentType(content) {
  try {
    const docStructure = {
      content: content,
      headings: []
    };
    
    // Extract potential headings from content
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && line.length < 50 && 
          (line.toUpperCase() === line || line.endsWith(':') || line.startsWith('#'))) {
        docStructure.headings.push(line.replace(/^#+ /, '').replace(/:$/, ''));
      }
    }
    
    return DocumentManager.detectDocumentType(docStructure);
  } catch (error) {
    console.error("Error detecting document type:", error);
    return "document";
  }
}

/******************************************************************************
 * ERROR HANDLING AND UTILITIES
 ******************************************************************************/

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {Error|null} originalError - Original error object if available
 * @return {Object} Standard error object
 */
function createErrorResponse(message, originalError = null) {
  if (originalError) {
    console.error(`${message}: `, originalError);
  }
  return { 
    error: true, 
    message: message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create standardized success response
 * @param {Object} data - Success data
 * @param {string} message - Optional success message
 * @return {Object} Standard success object
 */
function createSuccessResponse(data = {}, message = null) {
  return { 
    success: true,
    message: message,
    ...data,
    timestamp: new Date().toISOString()
  };
}

/******************************************************************************
 * UI/UX IMPROVEMENTS - PROGRESS INDICATORS
 ******************************************************************************/

/**
 * Show a progress indicator for long-running operations
 * @param {string} message - Message to display
 * @param {number} width - Dialog width
 * @param {number} height - Dialog height
 * @return {HtmlOutput} HTML dialog
 */
function showProgressIndicator(message = 'Processing request...', width = 300, height = 120) {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <p>${message}</p>
      <div style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; 
                border-top: 5px solid #1a73e8; border-radius: 50%; animation: spin 2s linear infinite;"></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `);
  
  return DocumentApp.getUi().showModalDialog(
    html.setWidth(width).setHeight(height),
    'Processing'
  );
}

/**
 * Update existing progress indicator with new message
 * @param {string} message - New message to display
 * @param {boolean} isComplete - Whether operation is complete
 * @return {HtmlOutput} HTML content
 */
function updateProgressIndicator(message, isComplete = false) {
  const html = HtmlService.createHtmlOutput(`
    <script>
      document.getElementById('status-message').textContent = "${message}";
      ${isComplete ? 'document.getElementById("spinner").style.display = "none";' : ''}
      ${isComplete ? 'document.getElementById("complete-icon").style.display = "block";' : ''}
      ${isComplete ? 'setTimeout(function() { google.script.host.close() }, 2000);' : ''}
    </script>
  `);
  
  return html;
}

/******************************************************************************
 * UI NOTIFICATION SYSTEM
 ******************************************************************************/

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {string} title - Optional title
 * @param {number} timeout - Time to show in seconds
 */
function showToast(message, title = APP_TITLE, timeout = 5) {
  try {
    DocumentApp.getActiveDocument().getUI().showToast(title, message, timeout);
  } catch (error) {
    console.error("Error showing toast:", error);
    // Fallback to alert for critical messages
    if (message.toLowerCase().includes("error")) {
      DocumentApp.getUi().alert(title, message, DocumentApp.getUi().ButtonSet.OK);
    }
  }
}

/******************************************************************************
 * SESSION AND STATE MANAGEMENT
 ******************************************************************************/

/**
 * Manages user session state
 * @param {string} action - 'get', 'set', 'clear'
 * @param {Object} data - Session data for 'set' action
 * @return {Object} Session state or result
 */
function manageSessionState(action = 'get', data = null) {
  const userProps = PropertiesService.getUserProperties();
  const SESSION_KEY = 'currentSession';
  
  switch (action) {
    case 'get':
      try {
        const sessionData = userProps.getProperty(SESSION_KEY);
        return sessionData ? JSON.parse(sessionData) : null;
      } catch (e) {
        console.error("Error retrieving session:", e);
        return null;
      }
      
    case 'set':
      try {
        if (!data) return { error: true, message: "No data provided" };
        
        // Store session with timestamp
        data.lastUpdated = new Date().toISOString();
        userProps.setProperty(SESSION_KEY, JSON.stringify(data));
        return { success: true };
      } catch (e) {
        console.error("Error setting session:", e);
        return { error: true, message: e.toString() };
      }
      
    case 'clear':
      try {
        userProps.deleteProperty(SESSION_KEY);
        return { success: true };
      } catch (e) {
        console.error("Error clearing session:", e);
        return { error: true, message: e.toString() };
      }
      
    default:
      return { error: true, message: "Invalid action" };
  }
}
