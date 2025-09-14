
import { aiService } from "@/shared/services/AIService";
import { logger } from "@/shared/utils/logger";

class AIInterviewService {
  constructor() {
    this.activeSession = null;
    this.questionHistory = [];
    this.responseHistory = [];
  }

  async startInterviewSession(_config) {
    try {
      // Initialize AI service if not already initialized
      try {
        await aiService.initialize({
          primaryProvider: "google",
          enableContextPersistence: true,
          enableRealTime: false,
        });
      } catch (_error) {
        throw new Error(
          "AI service not initialized. Please configure your API key in settings.",
        );
      }

      const sessionData = {
        id: `ai_interview_${Date.now()}`,
        config: {
          ...config,
          // Normalize persona structure
          persona: config.persona
            ? {
                id: config.persona.id || config.persona.name || "custom",
                name: config.persona.name || "Gaming Interviewer",
                archetype:
                  config.persona.archetype ||
                  config.persona.name ||
                  "AAA Interviewer",
                tone: config.persona.tone || "professional",
                focusAreas: Array.isArray(config.persona.focusAreas)
                  ? config.persona.focusAreas
                  : [],
              }
            : null,
        },
        startTime: Date.now(),
        questions: [],
        responses: [],
        status: "active",
      };

      // Generate initial question set with AI
      const initialQuestions = await this.generateQuestionSet(_config);
      sessionData.questions = initialQuestions;

      this.activeSession = sessionData;
      logger.info("AI interview session started:", sessionData.id);

      return {
        success: true,
        session: sessionData,
      };
    } catch (_error) {
      logger.error("Failed to start AI interview session:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateQuestionSet(_config) {
    const systemInstructions = `You are an expert gaming industry interviewer conducting interviews for ${config.roleType} positions. Generate a comprehensive interview question set that follows industry best practices.

CONTEXT:
- Studio: ${config.studioName || config.studioId || "General Practice"}
- Role: ${config.roleType}
- Experience Level: ${config.experienceLevel}
- Duration: ${config.duration} minutes
- Question Count: ${config.questionCount}
- Include Behavioral: ${config.includeBehavioral}
- Include Technical: ${config.includeTechnical}
- Include Studio-Specific: ${config.includeStudioSpecific}

PERSONA:
- Interviewer Archetype: ${config.persona?.archetype || "AAA Interviewer"}
- Tone/Style: ${config.persona?.tone || "professional"}
- Focus Areas: ${(config.persona?.focusAreas || []).join(", ") || "gaming passion, collaboration, technical excellence"}

Generate questions that:

Return JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "behavioral|technical|studio-specific|intro|closing",
      "difficulty": "easy|medium|hard",
    }
  ]
}`;

    const prompt = `Generate ${config.questionCount} interview questions for this configuration. Make them progressively challenging and relevant to ${config.studioName || "gaming industry"} hiring practices. ${config.studioContext ? "Incorporate the studio's specific technologies, games, and culture into the questions where appropriate." : ""} Include a mix of question types as specified in the configuration. The questions should sound like they would realistically be asked by a ${config.persona?.archetype || "gaming industry interviewer"} with a ${config.persona?.tone || "professional"} communication style.`;

    try {
      // Use enhanced chat method for better studio-specific generation
      const contextInfo = `Studio: ${config.studioName}\nRole: ${config.roleType}\nExperience: ${config.experienceLevel}\nPersona: ${config.persona?.archetype}\nTech Stack: ${config.studioContext?.technologies?.join(", ") || "General"}\nGame Genres: ${config.studioContext?.gameGenres?.join(", ") || "General"}`;

      const response = await aiService.chat({
        message: prompt,
        context: contextInfo,
        type: "analysis",
        metadata: {
          feature: "interview-question-generation",
          studio: config.studioName,
          role: config.roleType,
          persona: config.persona?.archetype,
        },
      });

      // Try to parse as JSON first, fallback to text parsing
      let questions = [];
      try {
        const parsed = JSON.parse(response.content);
        questions = parsed.questions || [];
      } catch {
        // If not JSON, parse from text response
        const lines = response.content
          .split("\n")
          .filter((line) => line.trim());
          type:
              ? "intro"
                ? "closing"
                : "behavioral",
          difficulty:
              ? "easy"
                ? "medium"
                : "hard",
        }));
      }

        ? questions
        : this.getFallbackQuestions(_config);
    } catch (_error) {
      logger.error("Failed to generate question set:", error);
      return this.getFallbackQuestions(_config);
    }
  }

  async generateFollowUpQuestion(
    previousResponse,
    questionContext,
    sessionConfig,
  ) {
    const systemInstructions = `You are an expert gaming industry interviewer. Based on the candidate's previous response, generate an intelligent follow-up question that:


CONTEXT:
- Role: ${sessionConfig.roleType}
- Experience: ${sessionConfig.experienceLevel}
- Studio: ${sessionConfig.studioName || sessionConfig.studioId || "General Practice"}
- Interviewer Persona: ${sessionConfig.persona?.archetype || "AAA Interviewer"} (${sessionConfig.persona?.tone || "professional"})
- Focus Areas: ${(sessionConfig.persona?.focusAreas || []).join(", ")}
- Interview Style: ${sessionConfig.persona?.interviewStyle || "Professional assessment"}
- Previous Question: ${questionContext.question}
- Candidate's Response: ${previousResponse}

Return JSON:
{
  "question": "Follow-up question text",
  "type": "follow-up",
  "difficulty": "easy|medium|hard", 
  "reasoning": "Why this follow-up is relevant"
}`;

    try {
      const contextInfo = `Previous Question: ${questionContext.question}\nCandidate Response: ${previousResponse}\nRole: ${sessionConfig.roleType}\nExperience: ${sessionConfig.experienceLevel}\nStudio: ${sessionConfig.studioName || sessionConfig.studioId}\nPersona: ${sessionConfig.persona?.archetype || ""} (${sessionConfig.persona?.tone || ""})\nFocus: ${(sessionConfig.persona?.focusAreas || []).join(", ")}`;

      const response = await aiService.chat({
        message: `Generate a follow-up interview question based on the candidate's response: "${previousResponse}"`,
        context: contextInfo,
        type: "analysis",
      });

      // Try to parse as JSON, fallback to text
      let questionData;
      try {
        questionData = JSON.parse(response.content);
      } catch {
        questionData = {
          question: response.content,
          type: "follow-up",
          difficulty: "medium",
          reasoning: "Generated based on previous response",
        };
      }

      return {
        success: true,
        question: {
          id: `followup_${Date.now()}`,
          ...questionData,
          isFollowUp: true,
        },
      };
    } catch (_error) {
      logger.error("Failed to generate follow-up question:", error);
      return { success: false, error: error.message };
    }
  }

  async analyzeResponse(responseData, questionContext, sessionConfig) {
    const systemInstructions = `You are an expert gaming industry interview coach. Analyze this candidate's response and provide detailed, constructive feedback.

EVALUATION CRITERIA:

CONTEXT:
- Role: ${sessionConfig.roleType}
- Experience Level: ${sessionConfig.experienceLevel}
- Studio: ${sessionConfig.studioName || sessionConfig.studioId || "General Practice"}
- Interviewer Persona: ${sessionConfig.persona?.archetype || "AAA Interviewer"} (${sessionConfig.persona?.tone || "professional"})
- Focus Areas: ${(sessionConfig.persona?.focusAreas || []).join(", ")}
- Interview Style: ${sessionConfig.persona?.interviewStyle || "Professional assessment"}
- Question: ${questionContext.question}
- Question Type: ${questionContext.type}
- Expected Duration: ${questionContext.expectedDuration}s
- Actual Duration: ${responseData.duration}s


Return JSON:
{
  "categoryScores": {
  },
  "feedback": "Overall assessment paragraph",
  "gamingInsights": "How their gaming background applies to this role",
}`;

    try {
      const contextInfo = `Role: ${sessionConfig.roleType}
Experience Level: ${sessionConfig.experienceLevel}
Question: ${questionContext.question}
Question Type: ${questionContext.type}
Expected Duration: ${questionContext.expectedDuration}s
Actual Duration: ${responseData.duration}s


      const response = await aiService.chat({
        message: `Analyze this interview response: "${responseData.transcript}"`,
        context: contextInfo,
        type: "analysis",
      });

      // Try to parse as JSON, fallback to structured analysis
      let analysis;
      try {
        analysis = JSON.parse(response.content);
      } catch {
        analysis = this.parseAnalysisFromText(response.content, responseData);
      }

      // Store analysis for session tracking
      if (this.activeSession) {
        this.activeSession.responses.push({
          ...responseData,
          analysis,
          timestamp: Date.now(),
        });
      }

      return {
        success: true,
        analysis,
      };
    } catch (_error) {
      logger.error("Failed to analyze response:", error);
      return {
        success: false,
        error: error.message,
        analysis: this.getFallbackAnalysis(responseData),
      };
    }
  }

  parseAnalysisFromText(textContent, responseData) {
    return {
      categoryScores: {
      },
      strengths: ["Clear communication", "Gaming passion evident"],
      improvements: ["More specific examples", "Better structure"],
      followUpSuggestions: ["Practice with concrete examples"],
      gamingInsights: "Gaming skills show good problem-solving abilities",
    };
  }

  async getNextQuestion(sessionId, lastResponseData = null) {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      return { success: false, error: "Invalid session" };
    }

    const session = this.activeSession;

    // Check if we should generate a follow-up based on last response
    if (
      lastResponseData &&
      this.shouldGenerateFollowUp(lastResponseData, session)
    ) {
      const followUpResult = await this.generateFollowUpQuestion(
        lastResponseData.transcript,
        session.questions[session.currentQuestionIndex],
        session.config,
      );

      if (followUpResult.success) {
        return {
          success: true,
          question: followUpResult.question,
          isFollowUp: true,
        };
      }
    }

    // Move to next prepared question
    session.currentQuestionIndex++;

    if (session.currentQuestionIndex >= session.questions.length) {
      // Interview complete
      return {
        success: true,
        completed: true,
        summary: await this.generateInterviewSummary(session),
      };
    }

    const nextQuestion = session.questions[session.currentQuestionIndex];
    session.currentQuestion = nextQuestion;

    return {
      success: true,
      question: nextQuestion,
    };
  }

  shouldGenerateFollowUp(responseData, session) {
    // Generate follow-ups for:

    const wordCount = responseData.transcript.split(" ").length;
    const mentionsGaming = /game|gaming|play|guild|team|competition/i.test(
      responseData.transcript,
    );
    const isTechnical = session.currentQuestion?.type === "technical";

    return isShort || (mentionsGaming && isTechnical) || randomChance;
  }

  async generateInterviewSummary(session) {
    const systemInstructions = `You are an expert gaming industry interview coach. Generate a comprehensive interview summary with actionable insights.

Analyze the complete interview performance including:
- Overall performance trends
- Strengths and growth areas  
- Gaming background utilization
- Role-specific readiness
- Recommendations for improvement

Return JSON:
{
  "gameSpecificInsights": "How gaming background was leveraged",
  "roleReadiness": "Assessment of fit for target role",
}`;

    try {
      const response = await aiService.chat({
        message: "Generate comprehensive interview summary",
        type: "analysis",
        metadata: { session: this.sanitizeSessionForAI(session) },
      });

      return JSON.parse(response.content || response);
    } catch (_error) {
      logger.error("Failed to generate interview summary:", error);
      return this.getFallbackSummary(session);
    }
  }

  async getRealTimeCoaching(
    currentQuestion,
    responseInProgress,
    sessionConfig,
  ) {
      return null; // Wait for more content
    }

    const systemInstructions = `You are a real-time interview coach. Provide quick, actionable tips based on the response in progress. Keep tips short and encouraging.

Return JSON:
{
  "type": "encouragement|structure|content|time",
  "urgency": "low|medium|high"
}`;

    try {
      const response = await aiService.chat({
        message: `Provide coaching for this response in progress: "${responseInProgress}"`,
        type: "analysis",
        metadata: { currentQuestion, sessionConfig },
      });

      return JSON.parse(response.content || response);
    } catch (_error) {
      logger.debug("Real-time coaching failed:", error);
      return null;
    }
  }

  endSession(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      this.activeSession.status = "completed";
      this.activeSession.endTime = Date.now();

      const sessionData = { ...this.activeSession };
      this.activeSession = null;

      return {
        success: true,
        session: sessionData,
      };
    }

    return { success: false, error: "Session not found" };
  }

  getFallbackQuestions(_config) {
    const gamingQuestionSets = {
      intro: [
        {
          question:
            "Tell me about yourself and what draws you to the gaming industry.",
          type: "intro",
          difficulty: "easy",
          keywords: ["gaming passion", "industry interest", "background"],
          scoringCriteria: [
            "Personal connection to gaming",
            "Career motivation",
            "Industry awareness",
          ],
        },
        {
          question:
            "What gaming experiences have shaped your approach to problem-solving and teamwork?",
          type: "intro",
          difficulty: "easy",
          keywords: ["gaming experience", "problem solving", "teamwork"],
          scoringCriteria: [
            "Specific gaming examples",
            "Transferable skills",
            "Team collaboration",
          ],
        },
      ],

      behavioral: [
        {
          question:
            "Describe a time when you had to adapt quickly to changes in a gaming environment. How did you handle it?",
          type: "behavioral",
          difficulty: "medium",
          keywords: ["adaptation", "change management", "gaming"],
          scoringCriteria: [
            "Specific situation",
            "Actions taken",
            "Results achieved",
            "Learning outcomes",
          ],
        },
        {
          question:
            "Tell me about a challenging raid, competition, or gaming project you led. What was your approach?",
          type: "behavioral",
          difficulty: "medium",
          keywords: ["leadership", "challenge", "gaming project"],
          scoringCriteria: [
            "Leadership style",
            "Problem-solving approach",
            "Team dynamics",
            "Results",
          ],
        },
        {
          question:
            "How have you used gaming communities or forums to learn new skills or solve problems?",
          type: "behavioral",
          difficulty: "medium",
          keywords: ["community", "learning", "problem solving"],
          scoringCriteria: [
            "Initiative",
            "Learning agility",
            "Communication skills",
          ],
        },
      ],

      technical: [
        {
          question:
            "If you were designing a matchmaking system for a multiplayer game, what factors would you consider?",
          type: "technical",
          difficulty: "hard",
          keywords: ["system design", "matchmaking", "algorithms"],
          scoringCriteria: [
            "System thinking",
            "Scalability considerations",
            "User experience",
            "Technical depth",
          ],
        },
        {
          question:
            "Explain how you would optimize game performance for different hardware configurations.",
          type: "technical",
          difficulty: "hard",
          keywords: ["performance", "optimization", "hardware"],
          scoringCriteria: [
            "Technical knowledge",
            "Performance concepts",
            "Practical solutions",
          ],
        },
        {
          question:
            "How would you implement a real-time leaderboard system that handles millions of players?",
          type: "technical",
          difficulty: "hard",
          keywords: ["real-time", "scalability", "leaderboard"],
          scoringCriteria: [
            "Architecture design",
            "Database considerations",
            "Scalability",
            "Real-time processing",
          ],
        },
      ],

      studioSpecific: [
        {
          question: `What do you know about ${config.studioName || "our studio"}'s game portfolio and company culture?`,
          type: "studio-specific",
          difficulty: "medium",
          keywords: ["company research", "games", "culture"],
          scoringCriteria: [
            "Research depth",
            "Game knowledge",
            "Culture alignment",
          ],
        },
        {
          question:
            "How would you contribute to maintaining our studio's creative and collaborative environment?",
          type: "studio-specific",
          difficulty: "medium",
          keywords: ["collaboration", "creativity", "culture fit"],
          scoringCriteria: [
            "Cultural understanding",
            "Collaboration style",
            "Creative thinking",
          ],
        },
      ],

      closing: [
        {
          question:
            "What questions do you have about working in the gaming industry or at our studio?",
          type: "closing",
          difficulty: "easy",
          keywords: ["questions", "curiosity", "engagement"],
          scoringCriteria: [
            "Thoughtful questions",
            "Industry interest",
            "Engagement level",
          ],
        },
        {
          question:
          type: "closing",
          difficulty: "medium",
          keywords: ["industry trends", "future vision", "career goals"],
          scoringCriteria: ["Industry awareness", "Vision", "Career alignment"],
        },
      ],
    };

    // Select questions based on config
    let selectedQuestions = [];

    // Always include intro question

    // Add behavioral questions
    if (config.includeBehavioral !== false) {
      selectedQuestions.push(
        ...gamingQuestionSets.behavioral.slice(
        ),
      );
    }

    // Add technical questions if requested
    if (config.includeTechnical) {
      selectedQuestions.push(
        ...gamingQuestionSets.technical.slice(
        ),
      );
    }

    // Add studio-specific questions
    if (config.includeStudioSpecific) {
    }

    // Add closing question

    // Trim to requested count
  }

  getFallbackAnalysis(responseData) {
    const wordCount = responseData.transcript.split(" ").length;


    return {
      overallScore: score,
      feedback:
        "Your response shows good effort. Consider providing more specific examples and details.",
      strengths: ["Clear communication"],
      improvements: ["Add more specific examples", "Elaborate on key points"],
    };
  }

  getFallbackSummary(session) {
    const avgScore =
      session.responses.reduce(
      ) / session.responses.length;

    return {
      overallScore: Math.round(avgScore),
      strengths: [
        "Completed the interview",
        "Shows interest in gaming industry",
      ],
      improvementAreas: [
        "Provide more detailed responses",
        "Use specific examples",
      ],
      recommendations: [
        "Practice behavioral interview techniques",
        "Research the gaming industry more deeply",
      ],
    };
  }

  sanitizeSessionForAI(session) {
    return {
      config: session.config,
      questionCount: session.questions.length,
      responseCount: session.responses.length,
      averageScore:
        session.responses.reduce(
        ) / session.responses.length,
    };
  }

  getSession(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      return {
        ...this.activeSession,
        elapsedTime: Math.floor(
        ),
      };
    }
    return null;
  }

  async submitResponse(sessionId, response) {
    if (!this.activeSession || this.activeSession.id !== sessionId) {
      return { success: false, error: "Invalid session" };
    }
    const result = await this.analyzeResponse(
      _response,
      this.activeSession.currentQuestion,
      this.activeSession.config,
    );
    if (result.success) {
      return { success: true, feedback: result.analysis };
    }
    return result;
  }

  async nextQuestion(sessionId) {
    const result = await this.getNextQuestion(sessionId);
    if (result?.success && !result.completed) {
      return {
        success: true,
        question: result.question,
      };
    }
    return result;
  }

  getSessionStatus(sessionId) {
    if (this.activeSession && this.activeSession.id === sessionId) {
      return {
        success: true,
        session: this.activeSession,
        isActive: this.activeSession.status === "active",
      };
    }

    return { success: false, error: "Session not found" };
  }

  async getInterviewStats() {
    try {
      if (
        typeof window !== "undefined" &&
        window.electronAPI?.interview?.getStats
      ) {
        const res = await window.electronAPI.interview.getStats();
        if (res?.success && res.data) {
          // Map to UI-friendly shape; preserve extra fields
          return {
            lastInterviewDate: res.data.lastInterviewDate || null,
            // Optional additions with safe defaults
            skillAreas: res.data.skillAreas || [],
            topPerformingAreas: res.data.strengths || [],
            improvementAreas: res.data.improvementAreas || [],
          };
        }
      }
    } catch (_e) {
      console.warn(
        "[Interview] getInterviewStats failed, using fallback:",
        e?.message || e,
      );
    }

    // Fallback minimal stats
    return {
      lastInterviewDate: null,
      skillAreas: [],
      topPerformingAreas: [],
      improvementAreas: [],
    };
  }

    try {
      if (
        typeof window !== "undefined" &&
        window.electronAPI?.interview?.getHistory
      ) {
        const res = await window.electronAPI.interview.getHistory({
          limit,
        });
        if (res?.success && Array.isArray(res.data)) {
          return res.data.map((item) => ({
            id: item.id,
            type: "studio",
            typeName: this.getSessionTypeName("studio"),
            title:
              `${item.company || "Interview"} - ${item.roleType || item.role || ""}`.trim(),
            description: "Interview session",
            score: item.score ?? null,
            date: item.date,
            improvements: item.feedback?.improvements || [],
            studioName: item.company || "Unknown",
            roleType: item.roleType || "Interview",
            status: item.status || "completed",
          }));
        }
      }
    } catch (_e) {
      console.warn(
        "[Interview] getInterviewHistory failed, using fallback:",
        e?.message || e,
      );
    }

    return [];
  }

  getSessionTypeName(type) {
    const names = {
      quick: "Quick Practice",
      studio: "Studio Interview",
      behavioral: "Behavioral",
      technical: "Technical",
      panel: "Panel Interview",
      negotiation: "Negotiation",
      practice: "Practice Session",
    };
    return names[type] || "Interview Session";
  }
}

// Export singleton instance
export const aiInterviewService = new AIInterviewService();
export default aiInterviewService;
