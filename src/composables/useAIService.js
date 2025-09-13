import { ref } from "vue";
import { ai } from "@/shared/ai/canonical";
import { generateContent } from "@/utils/aiClient";

  const isLoading = ref(false);
  const _error = ref(null);

  const analyzeWithAI = async (prompt, options = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      let response;
      try {
        // Check if AI service is properly initialized
        response = await ai.generateText(prompt, {
        });

        return response.content || response;
      } catch {
        // Silently try fallback without console warnings
        try {
          response = await generateContent(prompt, "", {
            ...options,
          });
          return response;
        } catch {
          throw new Error(
            "AI service not available - please configure your API key in settings",
          );
        }
      }
    } catch (_err) {
      error.value = err.message;
      console.error("AI analysis error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const summarizeWithAI = async (content, options = {}) => {
    const prompt = `Please summarize the following content concisely:\n\n${content}`;
    return analyzeWithAI(prompt, options);
  };

  const generateCareerInsights = async (userData = {}, marketData = {}) => {
    const prompt = `
      Analyze career opportunities for a gaming professional with:
      Skills: ${userData.skills?.join(", ") || "Not specified"}
      Experience: ${userData.experience || "Not specified"}
      Interests: ${userData.interests?.join(", ") || "Not specified"}
      
      Current market trends: ${JSON.stringify(marketData)}
      
      Provide structured insights including:
      - Market trends analysis
      - In-demand skills
      - Salary expectations
      - Growth opportunities
      - Personalized recommendations
    `;

  };

  return {
    isLoading,
    error,
    analyzeWithAI,
    summarizeWithAI,
    generateCareerInsights,
  };
}
