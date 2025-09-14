/**
 * Main Process Interview Service
 * Handles AI integration, question generation, and response analysis securely
 * All sensitive operations isolated from renderer process
 */

const { ipcMain } = require('electron');
const { logger } = require('../src/shared/utils/logger.cjs');

class InterviewService {
  constructor(aiService) {
    this.aiService = aiService;
    this.activeSessions = new Map();
    this.questionDatabase = null;
    this._handlersRegistered = false;
    this._historyFile = null;
    this._ensureStoragePaths();
    this.setupIpcHandlers();
    this.initializeQuestionDatabase();
  }

  _ensureStoragePaths() {
    try {
      const { app } = require('electron');
      const path = require('path');
      const fs = require('fs');
      const userData = app?.getPath ? app.getPath('userData') : process.cwd();
      this._historyFile = path.join(userData, 'interview-history.json');
      // Ensure file exists
      if (!fs.existsSync(this._historyFile)) {
        fs.writeFileSync(this._historyFile, JSON.stringify({ items: [], version: 1 }, null, 2), 'utf8');
      }
    } catch (e) {
      // Fallback: current working directory
      try {
        const path = require('path');
        const fs = require('fs');
        this._historyFile = path.join(process.cwd(), 'interview-history.json');
        if (!fs.existsSync(this._historyFile)) {
          fs.writeFileSync(this._historyFile, JSON.stringify({ items: [], version: 1 }, null, 2), 'utf8');
        }
      } catch {/* ignore */}
    }
  }

  _loadHistory() {
    const fs = require('fs');
    try {
      if (this._historyFile && fs.existsSync(this._historyFile)) {
        const raw = fs.readFileSync(this._historyFile, 'utf8');
        const json = JSON.parse(raw || '{}');
        if (json && Array.isArray(json.items)) return json.items;
      }
    } catch {/* ignore parse errors */}
    return [];
  }

  _saveHistory(items) {
    const fs = require('fs');
    try {
      if (!this._historyFile) return;
      const payload = { version: 1, items: Array.isArray(items) ? items : [] };
      fs.writeFileSync(this._historyFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch {/* ignore */}
  }

  setupIpcHandlers() {
    if (this._handlersRegistered) return; // Prevent duplicate registration
    
    // Interview session management
    ipcMain.handle('interview-start', this.handleStartInterview.bind(this));
    ipcMain.handle('interview-pause', this.handlePauseInterview.bind(this));
    ipcMain.handle('interview-resume', this.handleResumeInterview.bind(this));
    ipcMain.handle('interview-complete', this.handleCompleteInterview.bind(this));
    ipcMain.handle('interview-cancel', this.handleCancelInterview.bind(this));
    
    // Question management
    ipcMain.handle('question-next', this.handleNextQuestion.bind(this));
    ipcMain.handle('response-submit', this.handleSubmitResponse.bind(this));
    
    // AI analysis
    ipcMain.handle('ai-analyze-response', this.handleAnalyzeResponse.bind(this));
    
    // Stats and history
    ipcMain.handle('interview-stats', this.handleGetStats.bind(this));
    ipcMain.handle('interview-history', this.handleGetHistory.bind(this));
    
    // Question generation
    ipcMain.handle('generate-questions', this.handleGenerateQuestions.bind(this));
    
    this._handlersRegistered = true; // Mark as registered
  }

  async handleStartInterview(_event, { config, studioId, userContext }) {
    try {
      const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get studio context and create interviewer persona
      const studioContext = this.getStudioData(studioId);
      const interviewerPersona = this.createInterviewerPersona(studioContext, config);
      
      // Generate personalized questions based on config, studio, and user context
      const questions = await this.generateQuestions(config, studioId, userContext);
      
      const session = {
        id: sessionId,
        studioId,
        config,
        questions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
        status: 'active',
        responses: [],
        userContext, // Store user context for ongoing analysis
        interviewerPersona, // Store persona for consistent responses
        studioContext // Store studio context for analysis
      };

      this.activeSessions.set(sessionId, session);
      
      logger.info(`Interview session started: ${sessionId} for studio ${studioId} with persona: ${interviewerPersona.name}`);
      
      return {
        success: true,
        session: this.sanitizeSessionForRenderer(session)
      };
      
    } catch (error) {
      logger.error('Failed to start interview:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handlePauseInterview(_event, { sessionId }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'paused';
      session.pausedAt = Date.now();
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to pause interview:', error);
      return { success: false, error: error.message };
    }
  }

  async handleResumeInterview(_event, { sessionId }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'active';
      if (session.pausedAt) {
        const pauseDuration = Date.now() - session.pausedAt;
        session.totalPausedTime = (session.totalPausedTime || 0) + pauseDuration;
        delete session.pausedAt;
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to resume interview:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCompleteInterview(_event, { sessionId }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'completed';
      session.endTime = Date.now();
      
      // Generate final analysis
      const analysis = await this.generateFinalAnalysis(session);
      session.finalAnalysis = analysis;
      
      // Save to history (in production, this would be a database)
      await this.saveSessionToHistory(session);
      
      // Clean up active sessions
      this.activeSessions.delete(sessionId);
      
      return {
        success: true,
        analysis: analysis
      };
      
    } catch (error) {
      logger.error('Failed to complete interview:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCancelInterview(_event, { sessionId }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Mark as cancelled
      session.status = 'cancelled';
      session.endTime = Date.now();
      
      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to cancel interview:', error);
      return { success: false, error: error.message };
    }
  }

  async handleNextQuestion(_event, { sessionId }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.currentQuestionIndex >= session.questions.length - 1) {
        return {
          success: false,
          error: 'No more questions available',
          isComplete: true
        };
      }

      session.currentQuestionIndex++;
      
      const currentQuestion = session.questions[session.currentQuestionIndex];
      
      return {
        success: true,
        question: currentQuestion,
        questionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length
      };
      
    } catch (error) {
      logger.error('Failed to get next question:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSubmitResponse(_event, { sessionId, response }) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Add response to session
      session.responses.push({
        ...response,
        timestamp: Date.now(),
        questionIndex: session.currentQuestionIndex
      });

      return { success: true };
      
    } catch (error) {
      logger.error('Failed to submit response:', error);
      return { success: false, error: error.message };
    }
  }

  async handleAnalyzeResponse(_event, { sessionId, questionId: _questionId, response, roleType, studioContext }) {
    try {
      if (!this.aiService) {
        throw new Error('AI service not initialized');
      }

      const session = this.activeSessions.get(sessionId);
      const interviewerPersona = session?.interviewerPersona;
      const userContext = session?.userContext;
      
      const analysisPrompt = this.createPersonalizedAnalysisPrompt(
        response, 
        roleType, 
        studioContext, 
        interviewerPersona,
        userContext
      );
      
      const systemInstructions = interviewerPersona ? 
        `You are ${interviewerPersona.name}, a ${interviewerPersona.role} at ${interviewerPersona.studioName}. 
        
        Analyze this candidate's response from your perspective. 
        Your background: ${interviewerPersona.background}
        Your interview style: ${interviewerPersona.style}
        What you value: ${interviewerPersona.values.join(', ')}
        What you're looking for: ${interviewerPersona.lookingFor.join(', ')}
        
        Provide feedback that reflects your persona's perspective and priorities.` :
        'You are an expert interviewer for gaming companies. Provide constructive feedback focused on gaming industry expectations.';

      const aiResponse = await this.aiService.generateContent(analysisPrompt, {
        systemInstructions,
        temperature: 0.7,
        maxTokens: 600
      });

      const analysis = this.parseAIAnalysis(aiResponse.text || aiResponse);
      
      // Add persona context to analysis
      if (interviewerPersona) {
        analysis.interviewer = {
          name: interviewerPersona.name,
          role: interviewerPersona.role,
          perspective: `Analyzed from the perspective of ${interviewerPersona.name}, focusing on ${interviewerPersona.values.join(', ')}`
        };
      }
      
      return {
        success: true,
        analysis: analysis
      };
      
    } catch (error) {
      logger.error('Failed to analyze response:', error);
      return {
        success: false,
        analysis: {
          score: 65,
          feedback: 'Unable to generate AI feedback at this time.',
          strengths: ['Response provided'],
          improvements: ['Try to be more specific in your answers']
        }
      };
    }
  }

  async generateQuestions(config, studioId, userContext = {}) {
    try {
      // Use AI to generate personalized, studio-specific questions if available
      if (this.aiService) {
        return await this.generateQuestionsWithAI(config, studioId, userContext);
      } else {
        return this.generateQuestionsFromDatabase(config, studioId, userContext);
      }
    } catch (error) {
      logger.error('Failed to generate questions:', error);
      return this.getFallbackQuestions(config);
    }
  }

  async generateQuestionsWithAI(config, studioId, userContext = {}) {
    const studio = this.getStudioData(studioId);
    const interviewerPersona = this.createInterviewerPersona(studio, config);
    
    // Extract user context for personalization
    const userProfile = this.extractUserProfileSummary(userContext);
    
    const systemInstructions = `You are ${interviewerPersona.name}, a ${interviewerPersona.role} at ${studio.name}. 

    YOUR PERSONA:
    - Background: ${interviewerPersona.background}
    - Interview Style: ${interviewerPersona.style}
    - Key Values: ${interviewerPersona.values.join(', ')}
    - What You Look For: ${interviewerPersona.lookingFor.join(', ')}
    
    STUDIO CONTEXT:
    - Company: ${studio.name} (${studio.culture.workStyle})
    - Core Values: ${studio.culture.values.join(', ')}
    - Popular Games: ${studio.games.join(', ')}
    - Technologies: ${studio.technologies.join(', ')}
    - Interview Philosophy: ${studio.interviewStyle}`;

    const prompt = `Generate ${config.questionCount} personalized interview questions for this candidate applying for a ${config.roleType} position.

    CANDIDATE PROFILE:
    - Name: ${userProfile.name || 'Candidate'}
    - Experience Level: ${config.experienceLevel}
    - Gaming Background: ${userProfile.gamingExperience}
    - Technical Skills: ${userProfile.technicalSkills}
    - Soft Skills: ${userProfile.softSkills}
    - Portfolio Highlights: ${userProfile.portfolioHighlights}
    - Previous Experience: ${userProfile.previousExperience}
    
    INTERVIEW REQUIREMENTS:
    - Question Types: ${this.getQuestionTypesList(config)}
    - Focus Areas: ${config.focusAreas.join(', ')}
    - Duration: ${config.duration} minutes total
    - Difficulty: Appropriate for ${config.experienceLevel} level
    
    PERSONALIZATION INSTRUCTIONS:
    1. Reference specific items from the candidate's gaming experience when relevant
    2. Connect their portfolio projects to potential work at ${studio.name}
    3. Ask follow-up questions that build on their stated skills
    4. Include questions that relate to ${studio.name}'s specific games/projects when appropriate
    5. Maintain your persona's interview style throughout
    
    Return ONLY a JSON array with this exact structure:
    [
      {
        "id": "unique_id",
        "type": "behavioral|technical|studio-specific|gaming-experience",
        "question": "The main interview question",
        "followUps": ["follow up question 1", "follow up question 2"],
        "expectedDuration": 120,
        "difficulty": "easy|medium|hard",
        "tags": ["relevant", "tags"],
        "personalizationReason": "Why this question was chosen for this candidate",
        "studioContext": "How this relates to ${studio.name} specifically"
      }
    ]`;

    try {
      const response = await this.aiService.generateContent(prompt, {
        systemInstructions,
        temperature: 0.8, // Higher creativity for personalized questions
        maxTokens: 2000
      });
      
      const questions = this.parseAIQuestions(response.text);
      
      // Enhance questions with persona context
      return questions.map(q => ({
        ...q,
        interviewerPersona: interviewerPersona.name,
        studioSpecific: true,
        personalized: true
      }));
      
    } catch (error) {
      logger.error('AI question generation failed:', error);
      // Fallback to database-based generation with user context
      return this.generateQuestionsFromDatabase(config, studioId, userContext);
    }
  }

  generateQuestionsFromDatabase(config, studioId) {
    if (!this.questionDatabase) {
      return this.getFallbackQuestions(config);
    }

    const questions = [];
    const studio = this.getStudioData(studioId);
    
    // Behavioral questions
    if (config.includeBehavioral) {
      const behavioralQuestions = this.questionDatabase.behavioral
        .filter(q => q.roleSpecific?.includes(config.roleType) || !q.roleSpecific)
        .slice(0, Math.floor(config.questionCount * 0.4));
      questions.push(...behavioralQuestions);
    }
    
    // Technical questions
    if (config.includeTechnical) {
      const technicalQuestions = this.questionDatabase.technical
        .filter(q => q.roleSpecific?.includes(config.roleType) || !q.roleSpecific)
        .slice(0, Math.floor(config.questionCount * 0.4));
      questions.push(...technicalQuestions);
    }
    
    // Studio-specific questions
    if (config.includeStudioSpecific && studio) {
      const studioQuestions = this.questionDatabase.studioSpecific
        .filter(q => q.studioId === studioId || q.applicableStudios?.includes(studioId))
        .slice(0, Math.floor(config.questionCount * 0.2));
      questions.push(...studioQuestions);
    }

    return questions.slice(0, config.questionCount);
  }

  createPersonalizedAnalysisPrompt(response, roleType, studioContext, interviewerPersona, userContext) {
    const userProfile = this.extractUserProfileSummary(userContext || {});
    
    return `Analyze this interview response for a ${roleType} position at ${studioContext.name}:

CANDIDATE BACKGROUND:
- Name: ${userProfile.name || 'Candidate'}
- Gaming Experience: ${userProfile.gamingExperience}
- Technical Skills: ${userProfile.technicalSkills}
- Portfolio: ${userProfile.portfolioHighlights}

RESPONSE TO ANALYZE:
"${response}"

STUDIO CONTEXT:
- Company: ${studioContext.name}
- Values: ${studioContext.culture.values.join(', ')}
- Work Style: ${studioContext.culture.workStyle}
- Technologies: ${studioContext.technologies.join(', ')}
- Interview Philosophy: ${studioContext.interviewStyle}

ANALYSIS REQUIREMENTS:
1. Score (0-100) - Consider both the response quality and fit for ${studioContext.name}
2. Personalized feedback (2-3 sentences) - Reference their specific background when relevant
3. Top 2-3 strengths - What stood out positively
4. Top 2-3 areas for improvement - Specific, actionable suggestions
5. Gaming industry context - How this response fits gaming industry expectations
6. Connection to their profile - How this builds on or contradicts their stated experience

Focus on:
- Gaming industry expectations and ${studioContext.name}'s specific culture
- How their response aligns with their stated gaming/technical background
- Practical advice for improving their interview performance
- Encouraging growth while being honest about areas needing work`;
  }

  // Keep the original method for backward compatibility
  createAnalysisPrompt(response, roleType, studioContext) {
    return this.createPersonalizedAnalysisPrompt(response, roleType, studioContext, null, null);
  }

  parseAIAnalysis(aiResponse) {
    try {
      // Try to parse structured response
      const parsed = JSON.parse(aiResponse);
      return {
        score: parsed.score || 70,
        feedback: parsed.feedback || aiResponse.substring(0, 200),
        strengths: parsed.strengths || ['Clear communication'],
        improvements: parsed.improvements || ['More specific examples']
      };
    } catch {
      // Fallback: parse unstructured response
      const lines = aiResponse.split('\n').filter(line => line.trim());
      return {
        score: this.extractScoreFromText(aiResponse),
        feedback: lines.slice(0, 3).join(' '),
        strengths: this.extractListFromText(aiResponse, 'strength'),
        improvements: this.extractListFromText(aiResponse, 'improv')
      };
    }
  }

  extractScoreFromText(text) {
    const scoreMatch = text.match(/score[:\s]*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 70;
  }

  extractListFromText(text, keyword) {
    const lines = text.toLowerCase().split('\n');
    const relevantLines = lines.filter(line => line.includes(keyword));
    return relevantLines.slice(0, 2).map(line => 
      line.replace(/[^\w\s]/g, '').trim()
    ).filter(item => item.length > 10);
  }

  sanitizeSessionForRenderer(session) {
    // Remove sensitive data before sending to renderer
    return {
      id: session.id,
      studioId: session.studioId,
      config: session.config,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.questions.length,
      currentQuestion: session.questions[session.currentQuestionIndex],
      status: session.status,
      startTime: session.startTime,
      responses: session.responses.map(r => ({
        questionId: r.questionId,
        duration: r.duration,
        timestamp: r.timestamp
      }))
    };
  }

  initializeQuestionDatabase() {
    // In production, this would load from a database
    this.questionDatabase = {
      behavioral: [
        {
          id: 'bhv_1',
          type: 'behavioral',
          question: 'Tell me about a time when you had to solve a complex problem under tight deadline pressure.',
          followUps: ['What was the outcome?', 'What would you do differently?'],
          expectedDuration: 90,
          difficulty: 'medium',
          tags: ['problem-solving', 'time-management']
        },
        {
          id: 'bhv_2', 
          type: 'behavioral',
          question: 'Describe a situation where you had to collaborate with a difficult team member.',
          followUps: ['How did you handle the conflict?', 'What was learned?'],
          expectedDuration: 120,
          difficulty: 'medium',
          tags: ['teamwork', 'communication']
        }
      ],
      technical: [
        {
          id: 'tech_1',
          type: 'technical',
          question: 'How would you optimize the performance of a game running at 30 FPS to achieve 60 FPS?',
          followUps: ['What tools would you use?', 'How would you measure success?'],
          expectedDuration: 180,
          difficulty: 'hard',
          tags: ['performance', 'optimization'],
          roleSpecific: ['Software Engineer', 'Engine Programmer']
        }
      ],
      studioSpecific: [
        {
          id: 'studio_riot_1',
          type: 'studio-specific',
          studioId: 'riot-games',
          question: 'How do you think Riot\'s "Player Focus" value should influence feature development decisions?',
          followUps: ['Give an example', 'How would you measure player impact?'],
          expectedDuration: 120,
          difficulty: 'medium',
          tags: ['company-values', 'player-focus']
        }
      ]
    };
  }

  getStudioData(studioId) {
    // This would typically come from the shared constants
    const studios = {
      'riot-games': {
        id: 'riot-games',
        name: 'Riot Games',
        culture: {
          values: ['Player Focus', 'Respect', 'Honesty', 'Growth', 'Excellence'],
          workStyle: 'Collaborative, data-driven, player-first mentality'
        },
        games: ['League of Legends', 'VALORANT', 'TFT'],
        technologies: ['C++', 'Python', 'Go', 'React', 'TypeScript'],
        interviewStyle: 'behavioral + technical, gaming passion emphasis'
      },
      'blizzard': {
        id: 'blizzard',
        name: 'Blizzard Entertainment',
        culture: {
          values: ['Gameplay First', 'Commit to Quality', 'Play Nice; Play Fair', 'Embrace Your Inner Geek'],
          workStyle: 'Quality-focused, collaborative, creative excellence'
        },
        games: ['World of Warcraft', 'Overwatch', 'Diablo', 'StarCraft'],
        technologies: ['C++', 'Python', 'Lua', 'JavaScript', 'React'],
        interviewStyle: 'deep technical knowledge + creative passion'
      },
      'epic-games': {
        id: 'epic-games',
        name: 'Epic Games',
        culture: {
          values: ['Honest', 'Respectful', 'Creative', 'Inclusive', 'Generous'],
          workStyle: 'Innovation-driven, collaborative, empowering'
        },
        games: ['Fortnite', 'Rocket League', 'Fall Guys'],
        technologies: ['Unreal Engine', 'C++', 'Python', 'React', 'TypeScript'],
        interviewStyle: 'innovation focus + technical depth'
      },
      'valve': {
        id: 'valve',
        name: 'Valve Corporation',
        culture: {
          values: ['No Hierarchy', 'Self-Direction', 'Innovation', 'Long-term Thinking'],
          workStyle: 'Flat organization, choose your own projects, creative freedom'
        },
        games: ['Half-Life', 'Portal', 'Counter-Strike', 'Dota 2'],
        technologies: ['C++', 'Python', 'Go', 'JavaScript'],
        interviewStyle: 'self-direction assessment + problem-solving focus'
      }
    };
    
    return studios[studioId] || studios['riot-games'];
  }

  createInterviewerPersona(studio, config) {
    const personas = {
      'riot-games': {
        'Software Engineer': {
          name: 'Alex Chen',
          role: 'Senior Engineering Manager',
          background: 'Former competitive gamer turned engineering leader. Led development of VALORANT\'s anti-cheat system.',
          style: 'Direct but encouraging, focuses on problem-solving mindset and player empathy',
          values: ['Player-first thinking', 'Technical excellence', 'Team collaboration'],
          lookingFor: ['Gaming passion', 'Technical depth', 'Player empathy', 'Growth mindset']
        },
        'Game Designer': {
          name: 'Morgan Rivera',
          role: 'Lead Game Designer',
          background: 'Designer on League of Legends champions and TFT systems. Avid gamer across multiple genres.',
          style: 'Curious and analytical, loves diving deep into game mechanics and player psychology',
          values: ['Player experience', 'Data-driven design', 'Creative innovation'],
          lookingFor: ['Game sense', 'Player empathy', 'Analytical thinking', 'Creative problem solving']
        }
      },
      'blizzard': {
        'Software Engineer': {
          name: 'Sarah Mitchell',
          role: 'Principal Software Engineer',
          background: 'Veteran engineer who worked on WoW\'s server architecture. Deep MMO gaming experience.',
          style: 'Methodical and thorough, values craftsmanship and attention to detail',
          values: ['Code quality', 'System reliability', 'Player experience'],
          lookingFor: ['Technical excellence', 'Attention to detail', 'Gaming passion', 'Quality mindset']
        }
      }
    };

    const studioPersonas = personas[studio.id] || personas['riot-games'];
    const persona = studioPersonas[config.roleType] || studioPersonas['Software Engineer'] || {
      name: 'Sam Wilson',
      role: 'Senior Interviewer',
      background: 'Experienced gaming industry professional with passion for finding great talent.',
      style: 'Professional and thorough, focuses on both technical skills and cultural fit',
      values: ['Technical competence', 'Team collaboration', 'Gaming passion'],
      lookingFor: ['Technical skills', 'Communication', 'Problem solving', 'Team fit']
    };

    return {
      ...persona,
      studioId: studio.id,
      studioName: studio.name
    };
  }

  extractUserProfileSummary(userContext) {
    const profile = userContext.user || {};
    const resume = userContext.resumeData || {};
    
    return {
      name: profile.name || '',
      gamingExperience: this.summarizeGamingExperience(profile.gamingExperience || []),
      technicalSkills: this.extractTechnicalSkills(profile.skills || [], resume.skills || {}),
      softSkills: this.extractSoftSkills(profile.skills || [], resume.skills || {}),
      portfolioHighlights: this.summarizePortfolio(profile.portfolio || []),
      previousExperience: this.summarizeExperience(resume.experience || [])
    };
  }

  summarizeGamingExperience(gamingExp) {
    if (!gamingExp || gamingExp.length === 0) {
      return 'No specific gaming experience provided';
    }
    
    return gamingExp.slice(0, 3).map(exp => 
      `${exp.game || exp.title}: ${exp.role || exp.description || 'Player'} (${exp.duration || 'Unspecified duration'})`
    ).join('; ');
  }

  extractTechnicalSkills(userSkills, resumeSkills) {
    const technical = [];
    
    // From user skills
    userSkills.forEach(skill => {
      if (skill.type === 'technical' || skill.category === 'technical') {
        technical.push(skill.name || skill);
      }
    });
    
    // From resume technical skills
    if (resumeSkills.technical) {
      technical.push(...resumeSkills.technical);
    }
    
    return technical.slice(0, 8).join(', ') || 'Not specified';
  }

  extractSoftSkills(userSkills, resumeSkills) {
    const soft = [];
    
    // From user skills
    userSkills.forEach(skill => {
      if (skill.type === 'soft' || skill.category === 'soft' || skill.realWorldMapping) {
        soft.push(skill.realWorldMapping || skill.name || skill);
      }
    });
    
    // From resume soft skills
    if (resumeSkills.soft) {
      soft.push(...resumeSkills.soft);
    }
    
    return soft.slice(0, 6).join(', ') || 'Leadership, Communication, Problem-solving';
  }

  summarizePortfolio(portfolio) {
    if (!portfolio || portfolio.length === 0) {
      return 'No portfolio items provided';
    }
    
    return portfolio.slice(0, 3).map(item => 
      `${item.title}: ${item.description?.substring(0, 80) || 'No description'}...`
    ).join('; ');
  }

  summarizeExperience(experience) {
    if (!experience || experience.length === 0) {
      return 'No professional experience provided';
    }
    
    return experience.slice(0, 2).map(exp => 
      `${exp.title} at ${exp.company} (${exp.duration || 'Unspecified duration'})`
    ).join('; ');
  }

  getQuestionTypesList(config) {
    const types = [];
    if (config.includeBehavioral) types.push('Behavioral');
    if (config.includeTechnical) types.push('Technical');
    if (config.includeStudioSpecific) types.push('Studio-specific');
    return types.join(', ') || 'General interview questions';
  }

  getFallbackQuestions(_config) {
    return [
      {
        id: 'fallback_1',
        type: 'intro',
        question: 'Tell me about yourself and your interest in the gaming industry.',
        followUps: ['What draws you to our studio specifically?'],
        expectedDuration: 120,
        difficulty: 'easy',
        tags: ['introduction']
      },
      {
        id: 'fallback_2',
        type: 'behavioral',
        question: 'Describe a challenging project you worked on and how you overcame obstacles.',
        followUps: ['What did you learn?', 'How would you approach it differently?'],
        expectedDuration: 180,
        difficulty: 'medium',
        tags: ['problem-solving']
      }
    ];
  }

  async saveSessionToHistory(session) {
    try {
      const items = this._loadHistory();
      const durationSec = Math.max(0, Math.floor(((session.endTime || Date.now()) - (session.startTime || Date.now())) / 1000));
      const summary = {
        id: session.id,
        date: new Date().toISOString(),
        company: this.getStudioData(session.studioId)?.name || 'Unknown',
        studioId: session.studioId,
        role: session.config?.roleType || 'Interview',
        roleType: session.config?.roleType || 'Interview',
        score: session.finalAnalysis?.overallScore || session.responses?.reduce((a, r) => a + (r.analysis?.overallScore || 0), 0) / (session.responses?.length || 1) || 0,
        duration: durationSec,
        questionsAnswered: session.responses?.length || 0,
        totalQuestions: session.questions?.length || 0,
        status: session.status || 'completed',
        feedback: session.finalAnalysis ? {
          strengths: session.finalAnalysis.strengths || [],
          improvements: session.finalAnalysis.improvements || []
        } : undefined
      };
      // Keep at most 200 items
      const next = [summary, ...items].slice(0, 200);
      this._saveHistory(next);
      logger.info(`Interview session persisted: ${session.id}`);
    } catch (e) {
      logger.warn('Failed to persist interview session:', e);
    }
  }

  async generateFinalAnalysis(session) {
    try {
      if (!this.aiService) {
        return this.getFallbackAnalysis(session);
      }

      const analysisPrompt = `Analyze this complete interview session:
      
Session Summary:
- Role: ${session.config.roleType}
- Studio: ${session.studioId}
- Duration: ${(session.endTime - session.startTime) / 1000}s
- Questions Answered: ${session.responses.length}/${session.questions.length}

Responses: ${session.responses.map(r => r.transcript).join(' | ')}

Provide overall performance analysis with:
1. Overall score (0-100)
2. Key strengths (3-4 points)
3. Areas for improvement (3-4 points)  
4. Specific recommendations for gaming industry interviews`;

      const response = await this.aiService.generateContent(analysisPrompt);
      return this.parseFinalAnalysis(response);
      
    } catch (error) {
      logger.error('Failed to generate final analysis:', error);
      return this.getFallbackAnalysis(session);
    }
  }

  getFallbackAnalysis(_session) {
    return {
      overallScore: 75,
      strengths: [
        'Completed interview session',
        'Provided responses to questions',
        'Showed interest in gaming industry'
      ],
      improvements: [
        'Practice articulating technical concepts',
        'Prepare specific examples from gaming projects',
        'Research company values more deeply'
      ],
      recommendations: [
        'Play the company\'s games before interviewing',
        'Prepare STAR format examples',
        'Practice with mock technical interviews'
      ]
    };
  }

  async handleGetStats(_event) {
    try {
      const items = this._loadHistory();
      const total = items.length;
      const completed = items.filter(i => i.status === 'completed').length;
      const avg = total ? (items.reduce((a, i) => a + (Number(i.score) || 0), 0) / total) : 0;
      const last = items[0]?.date || null;
      return {
        success: true,
        data: {
          totalInterviews: total,
          completedInterviews: completed,
          averageScore: Math.round(avg * 10) / 10,
          totalQuestions: items.reduce((a, i) => a + (i.totalQuestions || 0), 0),
          correctAnswers: undefined,
          improvementAreas: items[0]?.feedback?.improvements || [],
          strengths: items[0]?.feedback?.strengths || [],
          lastInterviewDate: last || new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting interview stats:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetHistory(_event, params = {}) {
    try {
      const { limit = 10, offset = 0, studioId, roleType } = params;
      let data = this._loadHistory();
      if (studioId) data = data.filter(i => i.studioId === studioId);
      if (roleType) data = data.filter(i => i.roleType === roleType);
      const total = data.length;
      const paginated = data.slice(offset, offset + limit);
      return {
        success: true,
        data: paginated,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
        filters: { studioId, roleType }
      };
    } catch (error) {
      console.error('Error getting interview history:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGenerateQuestions(_event, config) {
    try {
      console.log('[Interview] Generating questions with config:', config);
      
      const {
        roleType = 'Software Engineer',
        studioId = 'riot-games',
        _difficulty = 'medium',
        questionCount = 5,
        includeBehavioral = true,
        includeTechnical = true,
        includeStudioSpecific = true,
        focusAreas = ['problem-solving', 'teamwork'],
        experienceLevel = 'mid-level'
      } = config;

      const questions = await this.generateQuestions({
        roleType,
        questionCount,
        includeBehavioral,
        includeTechnical, 
        includeStudioSpecific,
        focusAreas,
        experienceLevel
      }, studioId);

      return {
        success: true,
        data: {
          questions,
          metadata: {
            generatedAt: new Date().toISOString(),
            studioId,
            roleType,
            count: questions.length,
            estimatedDuration: questions.reduce((sum, q) => sum + (q.expectedDuration || 120), 0)
          }
        }
      };
      
    } catch (error) {
      logger.error('Failed to generate questions:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackQuestions(config)
      };
    }
  }
}

module.exports = { InterviewService };
