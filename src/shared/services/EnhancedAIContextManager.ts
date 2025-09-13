
import { ref, computed } from "vue";
import { logger } from "@/shared/utils/logger";

export interface ConversationContext {
  id: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    metadata?: Record<string, any>;
  }>;
  topic?: string;
  domain?: "job-search" | "resume" | "interview" | "portfolio" | "general";
  userProfile?: {
    skills: string[];
    experience: string;
    goals: string[];
    preferences: Record<string, any>;
  };
  sessionData?: Record<string, any>;
  createdAt: number;
  lastActivity: number;
}

export interface ContextualResponse {
  content: string;
  confidence: number;
  suggestedActions?: Array<{
    label: string;
    action: string;
    params?: Record<string, any>;
  }>;
  followUpQuestions?: string[];
  relatedTopics?: string[];
}

class EnhancedAIContextManager {
  private static instance: EnhancedAIContextManager;

  // Reactive state
  public readonly contexts = ref<ConversationContext[]>([]);
  public readonly activeContext = ref<ConversationContext | null>(null);

  // Configuration

  // AI optimization
  private readonly domainPrompts = {
    "job-search":
      "You are a gaming industry career advisor helping with job searches.",
    resume: "You are a resume expert specializing in gaming industry roles.",
    interview: "You are an interview coach for gaming industry positions.",
    portfolio: "You are a portfolio advisor for gaming professionals.",
    general: "You are NAVI, an AI career assistant for the gaming industry.",
  };

  private readonly skillKeywords = [
    "Unity",
    "Unreal Engine",
    "C++",
    "JavaScript",
    "Python",
    "Game Design",
    "Level Design",
    "UI/UX",
    "Art",
    "Animation",
    "QA",
    "Testing",
    "Agile",
    "Scrum",
    "Live Ops",
  ];

  static getInstance(): EnhancedAIContextManager {
    if (!EnhancedAIContextManager.instance) {
      EnhancedAIContextManager.instance = new EnhancedAIContextManager();
    }
    return EnhancedAIContextManager.instance;
  }

  private constructor() {
    this.loadStoredContexts();
    this.setupPeriodicCleanup();
  }

  getOrCreateContext(
    options: {
      domain?: ConversationContext["domain"];
      topic?: string;
      userProfile?: ConversationContext["userProfile"];
      sessionData?: Record<string, any>;
    } = {},
  ): ConversationContext {
    // Try to find existing context for the same domain/topic
    const existing = this.contexts.value.find(
      (ctx) =>
        ctx.domain === options.domain &&
        ctx.topic === options.topic &&
        Date.now() - ctx.lastActivity < this.contextExpiryTime,
    );

    if (existing) {
      this.activeContext.value = existing;
      existing.lastActivity = Date.now();
      return existing;
    }

    // Create new context
    const newContext: ConversationContext = {
      id: this.generateContextId(),
      messages: [],
      domain: options.domain || "general",
      topic: options.topic,
      userProfile: options.userProfile,
      sessionData: options.sessionData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    // Add system message with domain-specific prompt
    newContext.messages.push({
      role: "system",
      content: this.buildSystemPrompt(newContext),
      timestamp: Date.now(),
    });

    this.contexts.value.unshift(newContext);
    this.activeContext.value = newContext;

    // Maintain context limit
    if (this.contexts.value.length > this.maxContexts) {
    }

    this.saveContexts();

    logger.debug("Created new conversation context:", newContext.id);
    return newContext;
  }

  addMessage(
    role: "user" | "assistant",
    content: string,
    metadata?: Record<string, any>,
  ): void {
    if (!this.activeContext.value) {
      this.getOrCreateContext();
    }

    const context = this.activeContext.value!;
    const message = {
      role,
      content,
      timestamp: Date.now(),
      metadata,
    };

    context.messages.push(message);
    context.lastActivity = Date.now();

    // Maintain message limit per context
    if (context.messages.length > this.maxMessagesPerContext) {
      // Keep system message and recent messages
      const systemMessages = context.messages.filter(
        (m) => m.role === "system",
      );
      const recentMessages = context.messages
        .filter((m) => m.role !== "system")
        .slice(-this.maxMessagesPerContext + systemMessages.length);

      context.messages = [...systemMessages, ...recentMessages];
    }

    // Update domain if we can infer it from conversation
    if (role === "user") {
      const inferredDomain = this.inferDomainFromMessage(content);
      if (inferredDomain && inferredDomain !== context.domain) {
        context.domain = inferredDomain;
        // Update system message
        const systemMsg = context.messages.find((m) => m.role === "system");
        if (systemMsg) {
          systemMsg.content = this.buildSystemPrompt(context);
        }
      }
    }

    this.saveContexts();
  }

  async getContextualResponse(
    message: string,
    options: {
      maxTokens?: number;
      temperature?: number;
      includeActions?: boolean;
    } = {},
  ): Promise<ContextualResponse> {
    if (!this.activeContext.value) {
      this.getOrCreateContext();
    }

    const context = this.activeContext.value!;
    this.addMessage("user", message);

    try {
      // Prepare enhanced prompt with context
      const enhancedPrompt = this.buildEnhancedPrompt(
        context,
        message,
        options,
      );

      // Get AI response (this would integrate with your existing AI service)
      const { aiService } = await import("@/shared/services/AIService");
      const ai = aiService.getInstance();

      const response = await ai.streamCompletion({
        message: enhancedPrompt,
        context: this.getContextSummary(context),
        metadata: {
          domain: context.domain,
          topic: context.topic,
          userProfile: context.userProfile,
        },
      });

      const aiResponse = response.content;

      // Add AI response to context
      this.addMessage("assistant", aiResponse, {
        confidence: response.confidence,
        tokensUsed: response.tokensUsed,
      });

      // Parse and enhance response
      const enhancedResponse = this.enhanceResponse(aiResponse, context);

      logger.debug("Generated contextual response:", {
        domain: context.domain,
        confidence: enhancedResponse.confidence,
      });

      return enhancedResponse;
    } catch (error) {
      logger.error("Error generating contextual response:", error);

      // Fallback response
      return {
        content:
          "I'm sorry, I'm having trouble processing that request right now. Could you try rephrasing or asking something else?",
        suggestedActions: [
          { label: "Try again", action: "retry", params: { message } },
          { label: "Get help", action: "help" },
        ],
      };
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    let prompt = this.domainPrompts[context.domain || "general"];

    // Add user profile context
    if (context.userProfile) {
      const { skills, experience, goals } = context.userProfile;

      if (skills?.length) {
        prompt += `\n\nUser's skills: ${skills.join(", ")}`;
      }

      if (experience) {
        prompt += `\n\nUser's experience level: ${experience}`;
      }

      if (goals?.length) {
        prompt += `\n\nUser's goals: ${goals.join(", ")}`;
      }
    }

    // Add conversation context
    if (context.topic) {
      prompt += `\n\nCurrent topic: ${context.topic}`;
    }

    prompt += `
    
Guidelines:
- Be helpful, concise, and specific to the gaming industry
- Provide actionable advice when possible
- Ask clarifying questions to better understand user needs
- Reference previous conversation when relevant
- Suggest concrete next steps
- Use gaming industry terminology appropriately`;

    return prompt;
  }

  private buildEnhancedPrompt(
    context: ConversationContext,
    currentMessage: string,
    options: any,
  ): string {
    // Get recent conversation history
    const recentMessages = context.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    let enhancedPrompt = currentMessage;

    // Add conversation context if there's history
    if (recentMessages) {
      enhancedPrompt = `Previous conversation:\n${recentMessages}\n\nCurrent question: ${currentMessage}`;
    }

    // Add user context
    if (context.userProfile) {
      enhancedPrompt += `\n\nUser context: ${JSON.stringify(context.userProfile)}`;
    }

    // Add domain-specific enhancement
    if (options.includeActions !== false) {
      enhancedPrompt += `
      
ACTIONS:
    }

    return enhancedPrompt;
  }

  private enhanceResponse(
    aiResponse: string,
    context: ConversationContext,
  ): ContextualResponse {
    // Extract suggested actions if present
    const suggestedActions: ContextualResponse["suggestedActions"] = [];

    if (actionsMatch) {
        .split("\n")
        .filter((line) => line.trim());

      actionLines.forEach((line) => {
        if (actionText) {
          suggestedActions.push({
            label: actionText,
            action: this.inferActionType(actionText),
            params: { description: actionText },
          });
        }
      });
    }

    // Generate follow-up questions based on domain
    const followUpQuestions = this.generateFollowUpQuestions(context);

    // Generate related topics
    const relatedTopics = this.generateRelatedTopics(context, aiResponse);

    // Clean response (remove action markers)
    const cleanContent = aiResponse
      .trim();

    return {
      content: cleanContent,
      confidence: this.calculateConfidence(aiResponse, context),
      suggestedActions:
      followUpQuestions,
      relatedTopics,
    };
  }

  private calculateConfidence(
    response: string,
    context: ConversationContext,
  ): number {

    // Increase confidence for domain-specific responses
    if (context.domain && context.domain !== "general") {
    }

    // Increase confidence for responses with specific actions
    if (response.includes("ACTIONS:")) {
    }

    // Increase confidence based on conversation length (more context)
    const messageCount = context.messages.filter(
      (m) => m.role !== "system",
    ).length;

    // Decrease confidence for very short responses
    }

  }

  private inferDomainFromMessage(
    message: string,
  ): ConversationContext["domain"] | null {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("job") ||
      lowerMessage.includes("position") ||
      lowerMessage.includes("hiring")
    ) {
      return "job-search";
    }

    if (lowerMessage.includes("resume") || lowerMessage.includes("cv")) {
      return "resume";
    }

    if (
      lowerMessage.includes("interview") ||
      lowerMessage.includes("questions")
    ) {
      return "interview";
    }

    if (
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("project")
    ) {
      return "portfolio";
    }

    return null;
  }

  private generateFollowUpQuestions(context: ConversationContext): string[] {
    const questions: string[] = [];

    switch (context.domain) {
      case "job-search":
        questions.push(
          "What specific roles are you most interested in?",
          "Which gaming studios would you prefer to work for?",
          "What's your preferred location or are you open to remote work?",
        );
        break;

      case "resume":
        questions.push(
          "What specific achievements would you like to highlight?",
          "Which projects showcase your best work?",
          "What skills do you want to emphasize?",
        );
        break;

      case "interview":
        questions.push(
          "What type of role are you interviewing for?",
          "What aspects of interviewing concern you most?",
          "Would you like to practice specific interview questions?",
        );
        break;

      case "portfolio":
        questions.push(
          "What types of projects do you want to showcase?",
          "Who is your target audience?",
          "What format do you prefer for your portfolio?",
        );
        break;
    }

  }

  private generateRelatedTopics(
    context: ConversationContext,
    response: string,
  ): string[] {
    const topics: string[] = [];

    // Extract gaming industry keywords from response
    this.skillKeywords.forEach((keyword) => {
      if (response.toLowerCase().includes(keyword.toLowerCase())) {
        topics.push(keyword);
      }
    });

  }

  private inferActionType(actionText: string): string {
    const lowerText = actionText.toLowerCase();

    if (lowerText.includes("search") || lowerText.includes("find"))
      return "search";
    if (lowerText.includes("create") || lowerText.includes("build"))
      return "create";
    if (lowerText.includes("update") || lowerText.includes("edit"))
      return "update";
    if (lowerText.includes("view") || lowerText.includes("open")) return "view";
    if (lowerText.includes("practice") || lowerText.includes("prepare"))
      return "practice";

    return "general";
  }

  private getContextSummary(context: ConversationContext): string {
    const messageCount = context.messages.filter(
      (m) => m.role !== "system",
    ).length;
    const lastActivity = new Date(context.lastActivity).toLocaleDateString();

    return `Domain: ${context.domain}, Messages: ${messageCount}, Last active: ${lastActivity}`;
  }

  private generateContextId(): string {
  }

  private loadStoredContexts(): void {
    try {
      const stored = localStorage.getItem("navi_ai_contexts");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out expired contexts
        const validContexts = parsed.filter(
          (ctx: ConversationContext) =>
            Date.now() - ctx.lastActivity < this.contextExpiryTime,
        );
        this.contexts.value = validContexts;
      }
    } catch (error) {
      logger.warn("Failed to load stored contexts:", error);
    }
  }

  private saveContexts(): void {
    try {
      localStorage.setItem(
        "navi_ai_contexts",
        JSON.stringify(this.contexts.value),
      );
    } catch (error) {
      logger.warn("Failed to save contexts:", error);
    }
  }

  private setupPeriodicCleanup(): void {
    setInterval(
      () => {
        const now = Date.now();
        this.contexts.value = this.contexts.value.filter(
          (ctx) => now - ctx.lastActivity < this.contextExpiryTime,
        );
        this.saveContexts();
      },
    ); // Cleanup every hour
  }

  // Public methods for external use

  clearAllContexts(): void {
    this.contexts.value = [];
    this.activeContext.value = null;
    this.saveContexts();
  }

  getContextById(id: string): ConversationContext | undefined {
    return this.contexts.value.find((ctx) => ctx.id === id);
  }

  switchToContext(id: string): boolean {
    const context = this.getContextById(id);
    if (context) {
      this.activeContext.value = context;
      context.lastActivity = Date.now();
      return true;
    }
    return false;
  }

  exportContext(id: string): ConversationContext | null {
    const context = this.getContextById(id);
    return context ? { ...context } : null;
  }
}

export const enhancedAIContext = EnhancedAIContextManager.getInstance();
