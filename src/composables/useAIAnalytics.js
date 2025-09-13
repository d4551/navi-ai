import { ref } from "vue";
import { useAIService } from "./useAIService";

  const { analyzeWithAI } = useAIService();
  const isLoading = ref(false);
  const _error = ref(null);

  const getCareerInsights = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // In a real implementation, this would analyze user data, skills, and market trends
      // For now, we'll return mock insights with AI-generated content
      const prompt = `
        Provide career insights for a gaming industry professional. 
        Include: market trends, in-demand skills, salary insights, and growth opportunities.
        Focus on game development, esports, and related fields.
        Keep it concise and actionable.
      `;

      const response = await analyzeWithAI(prompt);

      // Fallback to mock data if AI service is not available
      if (!response) {
        return {
          marketTrends:
            "The gaming industry is growing rapidly with increased demand for Unity and Unreal Engine developers.",
          inDemandSkills: [
            "Unity",
            "Unreal Engine",
            "C++",
            "Game Design",
            "Multiplayer Networking",
          ],
          salaryInsights: "Salaries for this role typically range from $65k-120k depending on experience and location",
          growthOpportunities: "Strong growth potential in indie and mobile gaming sectors",
          recommendation: "Focus on building a strong portfolio with Unity projects"
        };
      }

      return response;
    } catch (_err) {
      error.value = err.message;
      console.error("AI Analytics error:", err);

      // Return fallback insights
      return {
        marketTrends:
          "Gaming industry experiencing strong growth with increased remote opportunities.",
        inDemandSkills: [
          "Unity",
          "Unreal Engine",
          "Game Design",
          "UI/UX",
          "Multiplayer",
        ],
        salaryInsights: "Senior game developers earn $80K-$150K+ depending on experience and location",
        growthOpportunities:
          "Mobile, AR/VR, and cloud gaming are expanding rapidly",
        recommendation:
          "Build specialized expertise in emerging technologies like VR development",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const analyzeSkillDemand = async (skills = []) => {
    try {
      isLoading.value = true;

      const prompt = `
        Analyze current job market demand for these gaming skills: ${skills.join(", ")}.
        Provide: demand level (high/medium/low), average salary range, and growth potential.
        Focus on the gaming industry specifically.
      `;

      const response = await analyzeWithAI(prompt);

      if (!response) {
        return skills.map((skill) => ({
          skill,
        }));
      }

      return response;
    } catch (_err) {
      console.error("Skill analysis error:", err);
      return skills.map((skill) => ({
        skill,
        demand: "medium",
      }));
    } finally {
      isLoading.value = false;
    }
  };

  const getCareerRecommendations = async (userProfile = {}) => {
    try {
      isLoading.value = true;

      const prompt = `
        Provide personalized career recommendations for a gaming professional with:
        Skills: ${userProfile.skills?.join(", ") || "not specified"}
        Experience: ${userProfile.experience || "not specified"}
        Interests: ${userProfile.interests?.join(", ") || "not specified"}
        
        Include: recommended learning paths, target companies, and portfolio project ideas.
      `;

      const response = await analyzeWithAI(prompt);

      if (!response) {
        return {
          learningPaths: [
            "Advanced Unity Development",
            "Multiplayer Game Networking",
            "VR/AR Development",
          ],
          targetCompanies: [
            "Indie studios for creative freedom",
            "AAA studios for stability",
            "Remote-first companies",
          ],
          portfolioIdeas: [
            "Multiplayer mini-game",
            "VR experience",
            "Mobile game with monetization",
          ],
        };
      }

      return response;
    } catch (_err) {
      console.error("Career recommendations error:", err);
      return {
        learningPaths: [
          "Game engine specialization",
          "Online multiplayer development",
        ],
        targetCompanies: [
          "Established studios with mentorship programs",
          "Innovative indie teams",
        ],
        portfolioIdeas: [
          "Complete game project from concept to launch",
          "Technical demo showcasing specific skills",
        ],
      };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getCareerInsights,
    analyzeSkillDemand,
    getCareerRecommendations,
  };
}
