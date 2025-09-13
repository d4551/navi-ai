import { userProfileService } from "./UserProfileService";
import { searchJobsUnified } from "./JobAPIService";
import { logger } from "@/shared/utils/logger";

class AIOrchestrationService {
  private aiService?: any;
  private userProfileService = userProfileService;

  constructor() {}

  private async getAIService(): Promise<any> {
    if (this.aiService) return this.aiService;
    try {
      const mod: any = await import("../../electron/services/AIService.cjs");
      const MainAIService = mod?.MainAIService;
      this.aiService = new MainAIService();
      return this.aiService;
    } catch {
      this.aiService = { async generateText() { return { text: JSON.stringify({}) }; } };
      return this.aiService;
    }
  }

  async analyzeUserProfile(userId: string): Promise<any> {
    const userProfile = await this.userProfileService.getProfile(userId);
    if (!userProfile) {
      logger.warn(`User profile not found for ID: ${userId}`);
      return null;
    }

    const prompt = `Analyze the following user profile for a person in the gaming industry.\nProfile:`;
    try {
      const ai = await this.getAIService();
      const result = await ai.generateText(prompt, {
        systemInstructions: "You are a helpful career assistant for the gaming industry.",
      });
      return JSON.parse(result.text);
    } catch (error) {
      logger.error("Error analyzing user profile with AI:", error);
      return null;
    }
  }
}

export const aiOrchestrationService = new AIOrchestrationService();
export default aiOrchestrationService;

