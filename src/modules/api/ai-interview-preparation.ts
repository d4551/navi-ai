

import { canonicalAIClient } from "@/shared/services/CanonicalAIClient";
import { jobApplicationTrackingService } from "./job-application-tracking";

export interface InterviewPreparationSession {
  id: string;
  applicationId?: string;
  jobTitle: string;
  company: string;
  interviewType: InterviewType;
  duration: number; // minutes
  questions: InterviewQuestion[];
  userResponses: UserResponse[];
  feedback: InterviewFeedback;
  score: number;
  createdAt: Date;
  completedAt?: Date;
  status: "draft" | "in_progress" | "completed" | "archived";
}

export type InterviewType =
  | "behavioral"
  | "technical"
  | "system_design"
  | "coding"
  | "leadership"
  | "cultural_fit"
  | "portfolio_review"
  | "case_study"
  | "mixed";

export interface InterviewQuestion {
  id: string;
  type: InterviewType;
  category: string;
  question: string;
  expectedDuration: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  gameDevSpecific: boolean;
  followUpQuestions?: string[];
  hints?: string[];
  sampleAnswer?: string;
  keyPoints: string[];
  evaluationCriteria: string[];
}

export interface UserResponse {
  questionId: string;
  response: string;
  duration: number; // seconds taken to respond
  timestamp: Date;
  notes?: string;
}

export interface InterviewFeedback {
  overall: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  byQuestion: QuestionFeedback[];
  communicationSkills: {
  };
  technicalCompetency?: {
  };
  gameDevSpecific?: {
  };
}

export interface QuestionFeedback {
  questionId: string;
  feedback: string;
  suggestions: string[];
  missedKeyPoints: string[];
  responseTime: "too_fast" | "appropriate" | "too_slow";
}

export interface InterviewPreparationRequest {
  jobTitle?: string;
  company?: string;
  applicationId?: string;
  interviewType: InterviewType;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  focusAreas?: string[];
  includeGameDevQuestions: boolean;
  customQuestions?: string[];
}

export interface InterviewAnalytics {
  totalSessions: number;
  averageScore: number;
  improvementTrend: Array<{ date: Date; score: number }>;
  strengthAreas: string[];
  weaknessAreas: string[];
  mostDifficultQuestions: InterviewQuestion[];
  preparationTime: number; // total minutes spent
  sessionsByType: Record<InterviewType, number>;
}

export class AIInterviewPreparationService {
  private static instance: AIInterviewPreparationService;
  private aiClient = canonicalAIClient;
  private dbName = "GameDev_InterviewPrep";
  private db: IDBDatabase | null = null;

  private readonly QUESTION_BANKS: Record<string, string[]> = {
    behavioral: [
      "Tell me about a challenging game development project you worked on",
      "Describe a time when you had to work with a difficult team member",
      "How do you handle crunch time and tight deadlines?",
      "Tell me about a time you had to learn a new technology quickly",
      "Describe a project where you had to balance creative vision with technical constraints",
    ],
    technical: [
      "Explain the game loop and rendering pipeline",
      "How would you optimize performance in a mobile game?",
      "Describe different AI pathfinding algorithms",
      "How do you handle memory management in game development?",
      "Explain the differences between immediate and retained mode rendering",
    ],
    system_design: [
      "Design a multiplayer game architecture",
      "How would you build a matchmaking system?",
      "Design a game analytics system",
      "Create a scalable leaderboard system",
      "Design an in-game economy system",
    ],
    coding: [
      "Implement a basic game state manager",
      "Create a simple inventory system",
      "Implement a basic AI behavior tree",
      "Write a shader for a water effect",
    ],
    leadership: [
      "How do you mentor junior developers?",
      "Describe your approach to code reviews",
      "How do you handle conflicting priorities from stakeholders?",
      "Tell me about a time you had to make a difficult technical decision",
      "How do you ensure code quality across a large team?",
    ],
    cultural_fit: [
      "What games have inspired you recently?",
      "How do you stay current with game development trends?",
      "What is your ideal game development team structure?",
      "How do you handle feedback on creative work?",
      "What motivates you in game development?",
    ],
    portfolio_review: [
      "Walk me through your favorite project",
      "What technical challenges did you overcome in this project?",
      "How did you approach the game design in this project?",
      "What would you do differently if you rebuilt this project?",
      "How does this project demonstrate your growth as a developer?",
    ],
  };

  static getInstance(): AIInterviewPreparationService {
    if (!AIInterviewPreparationService.instance) {
      AIInterviewPreparationService.instance =
        new AIInterviewPreparationService();
    }
    return AIInterviewPreparationService.instance;
  }

  private constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Sessions store
        if (!db.objectStoreNames.contains("sessions")) {
          const store = db.createObjectStore("sessions", { keyPath: "id" });
          store.createIndex("applicationId", "applicationId");
          store.createIndex("status", "status");
          store.createIndex("interviewType", "interviewType");
          store.createIndex("createdAt", "createdAt");
        }

        // Question bank store
        if (!db.objectStoreNames.contains("questions")) {
          const store = db.createObjectStore("questions", { keyPath: "id" });
          store.createIndex("type", "type");
          store.createIndex("difficulty", "difficulty");
          store.createIndex("category", "category");
        }

        // User analytics store
        if (!db.objectStoreNames.contains("analytics")) {
          db.createObjectStore("analytics", { keyPath: "date" });
        }
      };
    });
  }

  async createSession(
    request: InterviewPreparationRequest,
  ): Promise<InterviewPreparationSession> {
    if (!this.db) await this.initializeDatabase();

    const questions = await this.generateQuestions(request);

    const session: InterviewPreparationSession = {
      id: this.generateId(),
      applicationId: request.applicationId,
      jobTitle: request.jobTitle || "Game Developer",
      company: request.company || "",
      interviewType: request.interviewType,
      duration: request.duration,
      questions,
      userResponses: [],
      feedback: this.createEmptyFeedback(),
      createdAt: new Date(),
      status: "draft",
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.add(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(session);
    });
  }

  async generateQuestions(
    request: InterviewPreparationRequest,
  ): Promise<InterviewQuestion[]> {
    const questions: InterviewQuestion[] = [];

    // Get base questions from question bank
    const bankQuestions = this.QUESTION_BANKS[request.interviewType] || [];

    // Use AI to generate additional contextual questions
    const contextualQuestions = await this.generateContextualQuestions(request);

    // Combine and format questions
    const allQuestionTexts = [
      ...bankQuestions,
      ...contextualQuestions,
      ...(request.customQuestions || []),
    ];

    allQuestionTexts
      .forEach((questionText, index) => {
        questions.push({
          id: `q_${Date.now()}_${index}`,
          type: request.interviewType,
          category: this.determineQuestionCategory(
            questionText,
            request.interviewType,
          ),
          question: questionText,
          difficulty: request.difficulty,
          gameDevSpecific:
            request.includeGameDevQuestions &&
            this.isGameDevSpecific(questionText),
          keyPoints: this.generateKeyPoints(questionText),
          evaluationCriteria: this.generateEvaluationCriteria(
            questionText,
            request.interviewType,
          ),
        });
      });

    return questions;
  }

  private async generateContextualQuestions(
    request: InterviewPreparationRequest,
  ): Promise<string[]> {
    try {
      let context = `Generate ${request.interviewType} interview questions for a ${request.jobTitle} position`;

      if (request.company) {
        context += ` at ${request.company}`;
      }

      if (request.applicationId) {
        try {
          const application =
            await jobApplicationTrackingService.getApplication(
              request.applicationId,
            );
          if (application) {
            context += `. The role involves: ${application.requirements?.join(", ") || "game development"}`;
          }
        } catch (error) {
          console.warn("Could not load application context:", error);
        }
      }

        context += `. Focus on: ${request.focusAreas.join(", ")}`;
      }

      const prompt = `${context}

- Relevant to the ${request.interviewType} interview type
- Appropriate for ${request.difficulty} difficulty level
- ${request.includeGameDevQuestions ? "Specific to game development" : "General software development"}
- Realistic and commonly asked

Return only the questions, one per line.`;

      const response = await this.aiClient.generateText(prompt);
      return response
        .split("\n")
        .filter((line: string) => line.trim())
    } catch (error) {
      console.error("Failed to generate contextual questions:", error);
      return [];
    }
  }

  async submitResponse(
    sessionId: string,
    questionId: string,
    response: string,
    confidence: number,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const userResponse: UserResponse = {
      questionId,
      response,
      confidence,
      timestamp: new Date(),
    };

    session.userResponses.push(userResponse);
    session.status = "in_progress";

    await this.updateSession(sessionId, session);
  }

  async completeSession(
    sessionId: string,
  ): Promise<InterviewPreparationSession> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    // Generate AI feedback for each response
    const feedback = await this.generateFeedback(session);

    const completedSession: InterviewPreparationSession = {
      ...session,
      feedback,
      score: feedback.overall.score,
      completedAt: new Date(),
      status: "completed",
    };

    await this.updateSession(sessionId, completedSession);
    await this.updateAnalytics(completedSession);

    return completedSession;
  }

  private async generateFeedback(
    session: InterviewPreparationSession,
  ): Promise<InterviewFeedback> {
    const questionFeedbacks: QuestionFeedback[] = [];

    for (const response of session.userResponses) {
      const question = session.questions.find(
        (q) => q.id === response.questionId,
      );
      if (!question) continue;

      try {
        const prompt = `Evaluate this interview response:

Question: ${question.question}
Response: ${response.response}
Question Type: ${question.type}
Difficulty: ${question.difficulty}
Key Points to Cover: ${question.keyPoints.join(", ")}
Evaluation Criteria: ${question.evaluationCriteria.join(", ")}

Provide feedback in JSON format:
{
  "feedback": "detailed feedback",
  "responseTime": "appropriate"
}`;

        const aiResponse = await this.aiClient.generateText(prompt);

        try {
          const feedbackData = JSON.parse(aiResponse);
          questionFeedbacks.push({
            questionId: response.questionId,
            score: feedbackData.score,
            feedback: feedbackData.feedback,
            suggestions: feedbackData.suggestions || [],
            missedKeyPoints: feedbackData.missedKeyPoints || [],
            responseTime: feedbackData.responseTime || "appropriate",
          });
        } catch (parseError) {
          // Fallback to basic feedback if JSON parsing fails
          questionFeedbacks.push({
            questionId: response.questionId,
            feedback: "Good response with room for improvement",
            suggestions: ["Practice providing more specific examples"],
            missedKeyPoints: [],
            responseTime: "appropriate",
          });
        }
      } catch (error) {
        console.error("Failed to generate feedback for question:", error);
        questionFeedbacks.push({
          questionId: response.questionId,
          feedback: "Unable to analyze response automatically",
          suggestions: [
            "Review the question and consider more detailed examples",
          ],
          missedKeyPoints: [],
          responseTime: "appropriate",
        });
      }
    }

    // Calculate overall feedback
    const averageScore =
          questionFeedbacks.length

    const allSuggestions = questionFeedbacks.flatMap((f) => f.suggestions);

    return {
      overall: {
        score: Math.round(averageScore),
        strengths: this.extractStrengths(questionFeedbacks),
        weaknesses: this.extractWeaknesses(questionFeedbacks),
      },
      byQuestion: questionFeedbacks,
      communicationSkills: {
        clarity: this.calculateCommunicationScore(session, "clarity"),
        confidence: this.calculateCommunicationScore(session, "confidence"),
        structure: this.calculateCommunicationScore(session, "structure"),
        enthusiasm: this.calculateCommunicationScore(session, "enthusiasm"),
      },
      technicalCompetency:
        session.interviewType === "technical"
          ? {
              accuracy: this.calculateTechnicalScore(
                questionFeedbacks,
                "accuracy",
              ),
              depth: this.calculateTechnicalScore(questionFeedbacks, "depth"),
              problemSolving: this.calculateTechnicalScore(
                questionFeedbacks,
                "problemSolving",
              ),
              bestPractices: this.calculateTechnicalScore(
                questionFeedbacks,
                "bestPractices",
              ),
            }
          : undefined,
      gameDevSpecific: session.questions.some((q) => q.gameDevSpecific)
        ? {
            industryKnowledge: this.calculateGameDevScore(
              questionFeedbacks,
              "industryKnowledge",
            ),
            portfolioPresentation: this.calculateGameDevScore(
              questionFeedbacks,
              "portfolioPresentation",
            ),
            gameDesignThinking: this.calculateGameDevScore(
              questionFeedbacks,
              "gameDesignThinking",
            ),
            technicalSkills: this.calculateGameDevScore(
              questionFeedbacks,
              "technicalSkills",
            ),
          }
        : undefined,
    };
  }

  async getSession(id: string): Promise<InterviewPreparationSession | null> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const index = store.index("createdAt");
      const request = index.openCursor(null, "prev");

      const sessions: InterviewPreparationSession[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && sessions.length < limit) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
    });
  }

  async getAnalytics(): Promise<InterviewAnalytics> {
    const completedSessions = sessions.filter((s) => s.status === "completed");

      return {
        improvementTrend: [],
        strengthAreas: [],
        weaknessAreas: [],
        mostDifficultQuestions: [],
        sessionsByType: {} as Record<InterviewType, number>,
      };
    }

    const analytics: InterviewAnalytics = {
      totalSessions: completedSessions.length,
      averageScore:
        completedSessions.length,
      improvementTrend: this.calculateImprovementTrend(completedSessions),
      strengthAreas: this.identifyStrengthAreas(completedSessions),
      weaknessAreas: this.identifyWeaknessAreas(completedSessions),
      mostDifficultQuestions:
        this.identifyDifficultQuestions(completedSessions),
      preparationTime: completedSessions.reduce(
        (sum, s) => sum + s.duration,
      ),
      sessionsByType: this.groupSessionsByType(completedSessions),
    };

    return analytics;
  }

  private async updateSession(
    _id: string,
    session: InterviewPreparationSession,
  ): Promise<void> {
    if (!this.db) await this.initializeDatabase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.put(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async updateAnalytics(
    session: InterviewPreparationSession,
  ): Promise<void> {
    // Update daily analytics
    const dateKey =

    try {
      // Store analytics data for trend analysis
      const analyticsData = {
        date: dateKey,
        score: session.score,
        sessionType: session.interviewType,
        duration: session.duration,
      };

      const transaction = this.db!.transaction(["analytics"], "readwrite");
      const store = transaction.objectStore("analytics");
      store.put(analyticsData);
    } catch (error) {
      console.error("Failed to update analytics:", error);
    }
  }

  // Helper methods for feedback generation
  private createEmptyFeedback(): InterviewFeedback {
    return {
      overall: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
      byQuestion: [],
      communicationSkills: {
      },
    };
  }

  private extractStrengths(feedbacks: QuestionFeedback[]): string[] {
    const strengths: string[] = [];

    highScoringFeedbacks.forEach((f) => {
      if (f.feedback.toLowerCase().includes("clear"))
        strengths.push("Clear communication");
      if (f.feedback.toLowerCase().includes("detailed"))
        strengths.push("Detailed responses");
      if (f.feedback.toLowerCase().includes("example"))
        strengths.push("Good use of examples");
    });

  }

  private extractWeaknesses(feedbacks: QuestionFeedback[]): string[] {
    const weaknesses: string[] = [];

    lowScoringFeedbacks.forEach((f) => {
        weaknesses.push("Missing key technical points");
      if (f.feedback.toLowerCase().includes("vague"))
        weaknesses.push("Responses lack specificity");
      if (f.responseTime === "too_fast")
        weaknesses.push("Responses may be too brief");
    });

  }

  private calculateCommunicationScore(
    session: InterviewPreparationSession,
    _skill: string,
  ): number {
    // Simplified calculation - in a real implementation, this would use audio analysis
    const avgConfidence =
      session.userResponses.length;
  }

  private calculateTechnicalScore(
    feedbacks: QuestionFeedback[],
    _aspect: string,
  ): number {
    const avgScore =
  }

  private calculateGameDevScore(
    feedbacks: QuestionFeedback[],
    _aspect: string,
  ): number {
    const gameDevFeedbacks = feedbacks.filter(
    ); // Simulate game dev specific questions

    const avgScore =
      gameDevFeedbacks.length;
  }

  private calculateImprovementTrend(
    sessions: InterviewPreparationSession[],
  ): Array<{ date: Date; score: number }> {
    return sessions
      .filter((s) => s.completedAt)
      .sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime())
      .map((s) => ({ date: s.completedAt!, score: s.score }));
  }

  private identifyStrengthAreas(
    sessions: InterviewPreparationSession[],
  ): string[] {
    const typeScores: Record<string, number[]> = {};

    sessions.forEach((s) => {
      if (!typeScores[s.interviewType]) typeScores[s.interviewType] = [];
      typeScores[s.interviewType].push(s.score);
    });

    return Object.entries(typeScores)
      .map(([type, scores]) => ({
        type,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .map(({ type }) => type)
  }

  private identifyWeaknessAreas(
    sessions: InterviewPreparationSession[],
  ): string[] {
    const typeScores: Record<string, number[]> = {};

    sessions.forEach((s) => {
      if (!typeScores[s.interviewType]) typeScores[s.interviewType] = [];
      typeScores[s.interviewType].push(s.score);
    });

    return Object.entries(typeScores)
      .map(([type, scores]) => ({
        type,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .map(({ type }) => type)
  }

  private identifyDifficultQuestions(
    sessions: InterviewPreparationSession[],
  ): InterviewQuestion[] {
    const questionScores: Record<
      string,
      { question: InterviewQuestion; scores: number[] }
    > = {};

    sessions.forEach((session) => {
      session.feedback.byQuestion.forEach((feedback) => {
        const question = session.questions.find(
          (q) => q.id === feedback.questionId,
        );
        if (question) {
          if (!questionScores[question.question]) {
            questionScores[question.question] = { question, scores: [] };
          }
          questionScores[question.question].scores.push(feedback.score);
        }
      });
    });

    return Object.values(questionScores)
      .map(({ question, scores }) => ({
        question,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .map(({ question }) => question);
  }

  private groupSessionsByType(
    sessions: InterviewPreparationSession[],
  ): Record<InterviewType, number> {
    const groups: Record<InterviewType, number> = {} as Record<
      InterviewType,
      number
    >;

    sessions.forEach((session) => {
    });

    return groups;
  }

  private determineQuestionCategory(
    question: string,
    type: InterviewType,
  ): string {
    const questionLower = question.toLowerCase();

    if (type === "behavioral") {
      if (questionLower.includes("team") || questionLower.includes("conflict"))
        return "teamwork";
      if (
        questionLower.includes("challenge") ||
        questionLower.includes("difficult")
      )
        return "problem-solving";
      if (
        questionLower.includes("leadership") ||
        questionLower.includes("lead")
      )
        return "leadership";
      return "general-behavioral";
    }

    if (type === "technical") {
      if (
        questionLower.includes("algorithm") ||
        questionLower.includes("data structure")
      )
        return "algorithms";
      if (
        questionLower.includes("system") ||
        questionLower.includes("architecture")
      )
        return "system-design";
      if (
        questionLower.includes("performance") ||
        questionLower.includes("optimization")
      )
        return "optimization";
      return "general-technical";
    }

    return type;
  }

  private isGameDevSpecific(question: string): boolean {
    const gameDevKeywords = [
      "game",
      "unity",
      "unreal",
      "shader",
      "rendering",
      "physics",
      "ai",
      "gameplay",
      "engine",
      "studio",
    ];
    return gameDevKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword),
    );
  }

  private generateKeyPoints(question: string): string[] {
    // Simplified key point generation - in production, this would use AI
    const questionLower = question.toLowerCase();

    if (
      questionLower.includes("challenge") ||
      questionLower.includes("difficult")
    ) {
      return [
        "Describe the situation",
        "Explain the challenge",
        "Detail your approach",
        "Share the outcome",
      ];
    }

    if (questionLower.includes("team")) {
      return [
        "Describe the team dynamics",
        "Explain your role",
        "Detail the collaboration",
        "Share results",
      ];
    }

    return [
      "Provide context",
      "Explain your approach",
      "Share specific examples",
      "Discuss the outcome",
    ];
  }

  private generateEvaluationCriteria(
    _question: string,
    type: InterviewType,
  ): string[] {
    const criteria: string[] = [];

    if (type === "behavioral") {
      criteria.push(
        "Uses STAR method",
        "Provides specific examples",
        "Shows self-awareness",
        "Demonstrates learning",
      );
    } else if (type === "technical") {
      criteria.push(
        "Technical accuracy",
        "Problem-solving approach",
        "Code quality",
        "Explains reasoning",
      );
    } else {
      criteria.push(
        "Clarity of response",
        "Relevant examples",
        "Structured thinking",
        "Completeness",
      );
    }

    return criteria;
  }

  private generateId(): string {
  }
}

// Export singleton instance
export const aiInterviewPreparationService =
  AIInterviewPreparationService.getInstance();
