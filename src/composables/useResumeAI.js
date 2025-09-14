import { ref } from "vue";
import { aiService } from "@/shared/services/AIService";

export function useResumeAI({ store, toast }) {
  const skillSuggestions = ref([]);
  const resumeScore = ref(null);
  const autoFillSuggestions = ref({ summary: [] });
  const aiInitialized = ref(false);

  const initializeAI = async () => {
    try {
      await aiService.initialize({
        primaryProvider: 'google',
        enableContextPersistence: true,
        enableRealTime: false
      });
      aiInitialized.value = true;
    } catch (error) {
      console.warn('AI service initialization failed:', error);
      if (toast) {
        toast('AI service not available. Please check your API key in settings.', 'error');
      }
    }
  };

  // Initialize AI service
  initializeAI();

  const getSkillSuggestions = async (
    skills,
    additionalExperience,
    targetRole = "",
  ) => {
    if (!aiInitialized.value) {
      if (toast) {
        toast('AI service not available. Please check your settings.', 'error');
      }
      return;
    }
    
    store.setLoading("skillSuggestions", true);
    try {
      // Use centralized AI service for gaming skill analysis
      const experience = additionalExperience.map(exp => ({
        text: exp.description || exp,
        title: exp.title || '',
        type: exp.type || 'competitive'
      }));

      const response = await aiService.analyzeGamingSkills(
        targetRole || 'Gaming Professional',
        experience.map(exp => exp.title || exp.text),
        targetRole || 'Gaming Industry Role'
      );

      // Parse skills from response
      const responseText = response.content;
      const lines = responseText.split('\n').filter(line => line.trim());
      
      // Extract skills that look like skill suggestions
      const extractedSkills = lines
        .filter(line => line.includes('-') || line.match(/^\d+\./))
        .map(line => line.replace(/^[\d\-.\s]+/, '').trim())
        .filter(skill => skill.length > 0)
        .slice(0, 10);

      skillSuggestions.value = extractedSkills.length > 0 
        ? extractedSkills 
        : ['Team Leadership', 'Problem Solving', 'Strategic Thinking', 'Communication', 'Project Management'];

    } catch (error) {
      console.error('Failed to get skill suggestions:', error);
      if (toast) {
        toast('Failed to generate skill suggestions. Please try again.', 'error');
      }
    } finally {
      store.setLoading("skillSuggestions", false);
    }
  };

  const scoreResume = async (resumeData, targetRole = "") => {
    if (!aiInitialized.value) {
      if (toast) {
        toast('AI service not available. Please check your settings.', 'error');
      }
      return;
    }
    
    store.setLoading("scoring", true);
    try {
      const resumeText = JSON.stringify(resumeData, null, 2);
      
      const response = await aiService.analyzeResume(resumeText, targetRole);
      
      // Parse score from response or provide structured scoring
      const scoreText = response.content.toLowerCase();
      let score = 75; // Default score
      
      // Try to extract numerical score from response
      const scoreMatch = scoreText.match(/(?:score|rating|grade)[\s:]*(\d+)(?:%|\s|\/100)/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
      }
      
      resumeScore.value = {
        overall: score,
        breakdown: {
          content: score - 5,
          format: score + 5,
          keywords: score,
          experience: score - 10
        },
        feedback: response.content,
        suggestions: [
          'Add more specific achievements',
          'Include relevant keywords',
          'Improve formatting consistency'
        ]
      };
      
    } catch (error) {
      console.error('Failed to score resume:', error);
      if (toast) {
        toast('Failed to analyze resume. Please try again.', 'error');
      }
    } finally {
      store.setLoading("scoring", false);
    }
  };

  const optimizeSection = async (
    sectionType,
    sectionContent,
    targetRole = "",
  ) => {
    if (!aiInitialized.value) {
      if (toast) {
        toast('AI service not available. Please check your settings.', 'error');
      }
      return null;
    }
    
    store.setLoading("optimization", true);
    try {
      const contextInfo = `Section Type: ${sectionType}
Target Role: ${targetRole}
Current Content: ${JSON.stringify(sectionContent)}

Please provide improved, ATS-friendly content that highlights relevant experience and skills for the ${targetRole} role.`;

      const response = await aiService.chat({
        message: `Optimize this ${sectionType} section for a ${targetRole} role. Return only the optimized content without explanations.`,
        context: contextInfo,
        type: 'generation'
      });

      return response.content;
    } catch (error) {
      console.error('Failed to optimize section:', error);
      if (toast) {
        toast('Failed to optimize section. Please try again.', 'error');
      }
      return null;
    } finally {
      store.setLoading("optimization", false);
    }
  };

  const getAutoFill = async (fieldType, userContext, currentValue = "") => {
    if (!aiInitialized.value) {
      if (toast) {
        toast('AI service not available. Please check your settings.', 'error');
      }
      return;
    }
    
    store.setLoading("autoFill", true);
    try {
      const contextInfo = `Field Type: ${fieldType}
User Context: ${JSON.stringify(userContext)}
Current Value: ${currentValue}

Generate 3-5 professional suggestions for this resume field that would improve the content and make it more ATS-friendly.`;

      const response = await aiService.chat({
        message: `Generate ${fieldType} suggestions for a resume. Provide 3-5 professional, impactful suggestions. Return them as a list.`,
        context: contextInfo,
        type: 'generation'
      });

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(response.content);
        autoFillSuggestions.value[fieldType] = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // Fallback: extract suggestions from text
        const lines = response.content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.replace(/^[\d\-*+•]\s*/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 5);
          
        autoFillSuggestions.value[fieldType] = lines.length > 0 
          ? lines 
          : [
            'Improved professional summary highlighting key achievements',
            'Enhanced skills section with relevant keywords',
            'Quantified experience with metrics and results'
          ];
      }
    } catch (error) {
      console.error('Failed to generate auto-fill suggestions:', error);
      if (toast) {
        toast('Failed to generate suggestions. Please try again.', 'error');
      }
      autoFillSuggestions.value[fieldType] = [];
    } finally {
      store.setLoading("autoFill", false);
    }
  };

  return {
    skillSuggestions,
    resumeScore,
    autoFillSuggestions,
    aiInitialized,
    getSkillSuggestions,
    scoreResume,
    optimizeSection,
    getAutoFill,
  };
}
