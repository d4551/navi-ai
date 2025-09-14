
import { ref, reactive, computed } from "vue";
import { gameSkillMappingService } from "@/shared/services/GameSkillMappingService";
import { ExportService } from "@/utils/export";
import type {
  SkillMapping,
  TrendingSkill,
  CareerPathway,
  IndustryRole,
  ReadinessAssessment,
  SkillWebVisualization,
  GameToIndustryTranslation,
  SkillExportOptions,
  SkillEvidence,
} from "@/shared/types/skillMapping";

  // Core state
  const mappedSkills = ref<SkillMapping[]>([]);
  const suggestedSkills = ref<SkillMapping[]>([]);
  const trendingSkills = ref<TrendingSkill[]>([]);
  const careerPathways = ref<CareerPathway[]>([]);
  const industryRoles = ref<IndustryRole[]>([]);
  const readinessAssessment = ref<ReadinessAssessment | null>(null);

  // UI state
  const isAnalyzing = ref(false);
  const isLoadingTrends = ref(false);
  const selectedSkill = ref<SkillMapping | null>(null);
  const selectedPathway = ref<CareerPathway | null>(null);
  const viewMode = ref<"visual" | "guided" | "pathways">("visual");

  // Web visualization state
  const skillWebData = reactive<SkillWebVisualization>({
    nodes: [],
    connections: [],
    dimensions: {
    },
    categories: [],
    interactionMode: "view",
  });

  // Analysis input state
  const analysisInput = reactive({
    description: "",
    gamingProfiles: [] as string[],
    achievements: [] as string[],
    documents: [] as File[],
  });

  // Computed properties
  const skillsByCategory = computed(() => {
    const categories: Record<string, SkillMapping[]> = {};
    mappedSkills.value.forEach((skill) => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill);
    });
    return categories;
  });

  const topSkillCategories = computed(() => {
    const categoryScores = Object.entries(skillsByCategory.value).map(
      ([category, skills]) => ({
        category,
        count: skills.length,
        avgConfidence: skills.reduce((sum, skill) => sum + skill.confidence, 0) / skills.length,
        score: skills.reduce((sum, skill) => sum + skill.confidence, 0) / skills.length
      }),
    );
    return categoryScores.sort((a, b) => b.score - a.score);
  });

  const industryReadinessScore = computed(() => {
    return readinessAssessment.value.overallScore;
  });

  const careerMatches = computed(() => {
    return careerPathways.value
      .map((pathway) => ({
        role: pathway.title,
        match: pathway.matchScore,
        pathway,
      }))
      .sort((a, b) => b.match - a.match)
  });

  // Core methods
    if (!analysisInput.description.trim()) {
      throw new Error("Please provide a description of your gaming experience");
    }

    isAnalyzing.value = true;
    try {
      const mappings = await gameSkillMappingService.analyzeGamingExperience({
        description: analysisInput.description,
        gamingProfiles: analysisInput.gamingProfiles.filter((p) => p.trim()),
        achievements: analysisInput.achievements.filter((a) => a.trim()),
        documents: analysisInput.documents,
      });

      suggestedSkills.value = mappings;
      generateSkillWebVisualization();

      return mappings;
    } finally {
      isAnalyzing.value = false;
    }
  }

    isLoadingTrends.value = true;
    try {
      const trends = await gameSkillMappingService.getTrendingSkills();
      trendingSkills.value = trends;
      return trends;
    } finally {
      isLoadingTrends.value = false;
    }
  }

    try {
      const role =
        await gameSkillMappingService.getRoleSkillRequirements(roleId);

      // Update or add to roles array
      const existingIndex = industryRoles.value.findIndex(
        (r) => r.id === roleId,
      );
        industryRoles.value[existingIndex] = role;
      } else {
        industryRoles.value.push(role);
      }

      return role;
    } catch (_error) {
      console.error("Failed to load role requirements:", error);
      throw error;
    }
  }

    const assessment = gameSkillMappingService.calculateReadinessScore(
      mappedSkills.value,
      targetRole,
    );
    readinessAssessment.value = {
      ...assessment,
      lastAssessed: new Date(),
    };
    return assessment;
  }

    const pathways = gameSkillMappingService.generateCareerPathways(
      mappedSkills.value,
    );
    careerPathways.value = pathways;
    return pathways;
  }

  // Skill management
    // Ensure suggestion has a stable id
    const suggestionId =
      suggestion?.id ||

    const skill: SkillMapping = {
      ...suggestion,
      verified: false,
      evidence: [],
      createdAt: new Date(),
      aiGenerated: true,
    };

    mappedSkills.value.push(skill);

    // Remove from suggestions by id when present, otherwise by content match
    suggestedSkills.value = suggestedSkills.value.filter((s) => {
      if (s.id) return s.id !== suggestionId;
      // Fallback: compare essential fields
      return !(
        s.gameExpression === suggestion.gameExpression &&
        s.transferableSkill === suggestion.transferableSkill &&
        JSON.stringify(s.industryApplications || []) ===
          JSON.stringify(suggestion.industryApplications || [])
      );
    });

    // Regenerate visualizations and assessments
    generateSkillWebVisualization();
    calculateReadinessAssessment();
    generateCareerPathways();
  }

    if (!suggestion) return;
    const suggestionId = suggestion?.id;
    suggestedSkills.value = suggestedSkills.value.filter((s) => {
      if (suggestionId) return s.id !== suggestionId;
      // Fallback by content when id is missing
      return !(
        s.gameExpression === suggestion.gameExpression &&
        s.transferableSkill === suggestion.transferableSkill &&
        JSON.stringify(s.industryApplications || []) ===
          JSON.stringify(suggestion.industryApplications || [])
      );
    });
  }

    mappedSkills.value = mappedSkills.value.filter((s) => s.id !== skillId);
    generateSkillWebVisualization();
    calculateReadinessAssessment();
    generateCareerPathways();
  }

    const skillIndex = mappedSkills.value.findIndex((s) => s.id === skillId);
      mappedSkills.value[skillIndex] = {
        ...mappedSkills.value[skillIndex],
        ...updates,
        updatedAt: new Date(),
      };
      generateSkillWebVisualization();
    }
  }

    skillId: string,
    evidence: Omit<SkillEvidence, "id" | "createdAt">,
  ) {
    const skill = mappedSkills.value.find((s) => s.id === skillId);
    if (skill) {
      const newEvidence: SkillEvidence = {
        ...evidence,
        createdAt: new Date(),
        verificationStatus: "pending" as const,
      };
      skill.evidence.push(newEvidence);
      generateSkillWebVisualization();
    }
  }

  // Visual skill web methods
    const { centerX, centerY } = skillWebData.dimensions;

    // Reset nodes and connections
    skillWebData.nodes = [];
    skillWebData.connections = [];

    // Central "You" node
    skillWebData.nodes.push({
      id: "central",
      type: "central",
      label: "You",
      x: centerX,
      y: centerY,
    });

    // Category nodes
    const categories = Object.keys(skillsByCategory.value);

    categories.forEach((category, index) => {
      const skills = skillsByCategory.value[category];

      // Calculate category strength based on skills
      const avgConfidence =
      const strength =
          ? "strong"
            ? "moderate"
            : "weak";

      skillWebData.nodes.push({
        id: `category-${category}`,
        type: "category",
        x,
        y,
        radius,
        strength,
        color: getCategoryColor(category),
        connections: ["central"],
      });

      // Add connection to central node
      skillWebData.connections.push({
        from: "central",
        to: `category-${category}`,
        strength,
        type: "primary",
      });

      // Individual skill nodes around category
      skills.forEach((skill, skillIndex) => {
        const skillStrength =
            ? "strong"
              ? "moderate"
              : "weak";

        skillWebData.nodes.push({
          id: skill.id,
          type: "skill",
          label:
              : skill.gameExpression,
          x: skillX,
          y: skillY,
          strength: skillStrength,
          connections: [`category-${category}`],
        });

        skillWebData.connections.push({
          from: `category-${category}`,
          to: skill.id,
          strength: skillStrength,
          type: "secondary",
        });
      });
    });

    skillWebData.categories = categories as any;
  }

    const colorMap: Record<string, string> = {
    };
  }

    if (nodeId.startsWith("category-")) return;

    const skill = mappedSkills.value.find((s) => s.id === nodeId);
    if (skill) {
      selectedSkill.value = skill;
    }
  }

  // Export methods
    try {
      if (options.format === "json") {
        const exportData = {
          skills: mappedSkills.value,
          readiness: readinessAssessment.value,
          pathways: careerPathways.value,
          exportedAt: new Date().toISOString(),
        };

          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "gaming-skills-export.json";
        link.click();

        URL.revokeObjectURL(url);
        return true;
      }

      // Build a detached export container with minimal, theme-aware styling
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.background =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--bg-primary",
      container.innerHTML = `
        <style>
        </style>
        <div class="skills-export">
          <div class="skills-header">
            <div class="skills-title">Gaming Skills Export</div>
            <div class="skills-meta">${new Date().toLocaleString()}</div>
          </div>
          <div class="readiness">
          </div>
          <div class="grid">
            <div class="card">
              <ul class="list">
                ${topSkillCategories.value
                  .map(
                    (c) =>
                  )
                  .join("")}
              </ul>
            </div>
            <div class="card">
              <ul class="list">
              </ul>
            </div>
          </div>
            <ul class="list">
              ${mappedSkills.value
                .map(
                  (s) =>
                )
                .join("")}
            </ul>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      if (options.format === "pdf") {
        await ExportService.exportElementToPDF(
          container,
          options?.targetStudio
            ? `${options.targetStudio}-skills`
            : "gaming-skills",
        );
        document.body.removeChild(container);
        return true;
      }

      if (options.format === "image") {
        const dataUrl = canvas.toDataURL("image/png");
        document.body.removeChild(container);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download =
          (options?.targetStudio
            ? `${options.targetStudio}-skills`
            : "gaming-skills") + ".png";
        a.click();
        return true;
      }

      // Unknown format
      document.body.removeChild(container);
      return false;
    } catch (_error) {
      console.error("Export failed:", error);
      throw error;
    }
  }

    // Filter and prioritize skills based on studio preferences
    const tailoredSkills = mappedSkills.value
      .filter((skill) =>
        skill.industryApplications.some(
          (app) =>
            app.toLowerCase().includes("game") ||
            app.toLowerCase().includes("design") ||
            app.toLowerCase().includes("development"),
        ),
      )
      .sort((a, b) => b.confidence - a.confidence);

    return exportSkills({
      format: "pdf",
      framework: "custom",
      targetStudio: studioName,
      includeEvidence: true,
      includeAnalysis: true,
      includeReadiness: true,
      customSections: [
        {
          title: `Skills Relevant to ${studioName}`,
          skills: tailoredSkills.map((s) => s.id),
          description: `Key gaming skills that align with ${studioName}'s culture and requirements`,
        },
      ],
    });
  }

  // Game-to-industry translation
    GameToIndustryTranslation[]
  > {
    return gameSkillMappingService.getGameToIndustryTranslations();
  }

  // Initialize with some defaults if needed
    generateSkillWebVisualization();
    loadTrendingSkills();
  }

  return {
    // State
    mappedSkills,
    suggestedSkills,
    trendingSkills,
    careerPathways,
    industryRoles,
    readinessAssessment,
    selectedSkill,
    selectedPathway,
    viewMode,
    skillWebData,
    analysisInput,
    isAnalyzing,
    isLoadingTrends,

    // Computed
    skillsByCategory,
    topSkillCategories,
    industryReadinessScore,
    careerMatches,

    // Methods
    analyzeGamingExperience,
    loadTrendingSkills,
    loadRoleRequirements,
    calculateReadinessAssessment,
    generateCareerPathways,
    acceptSuggestedSkill,
    removeSkill,
    updateSkill,
    addEvidence,
    generateSkillWebVisualization,
    selectSkillNode,
    exportSkills,
    createStudioTailoredExport,
    getGameToIndustryTranslations,
    dismissSuggestedSkill,
    initialize,
  };
}
