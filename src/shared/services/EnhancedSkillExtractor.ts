
import nlp from "compromise";
// @ts-ignore - compromise plugins don't have types
import plg from "compromise/plugins";
import { logger } from "../utils/logger";

// Gaming-specific skill categories and patterns
export interface GamingSkill {
  id: string;
  skill: string;
  category: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsExperience?: number;
  context?: string[];
  transferable: boolean;
  professionalEquivalent?: string;
  demandLevel: "High" | "Medium" | "Low";
}

export interface SkillExtractionResult {
  skills: GamingSkill[];
  insights: string[];
  suggestions: string[];
  confidence: number;
  totalSkillsFound: number;
}

class EnhancedSkillExtractor {
  private static instance: EnhancedSkillExtractor;
  private nlpDoc: any;

  // Gaming industry skill patterns
  private readonly GAMING_SKILL_PATTERNS = {
    // Game Engines
    engines: {
      patterns: [
        "Unity",
        "Unreal Engine",
        "Godot",
        "CryEngine",
        "Source Engine",
        "Frostbite",
        "id Tech",
      ],
      category: "Game Engines",
      demandLevel: "High" as const,
      transferable: true,
    },

    // Programming Languages (Gaming Context)
    programming: {
      patterns: [
        "C++",
        "JavaScript",
        "TypeScript",
        "Python",
        "Lua",
        "HLSL",
        "GLSL",
        "Rust",
        "Java",
      ],
      category: "Programming",
      demandLevel: "High" as const,
      transferable: true,
    },

    // Game Design Skills
    design: {
      patterns: [
        "Level Design",
        "Game Design",
        "UX Design",
        "UI Design",
        "System Design",
        "Narrative Design",
        "Quest Design",
      ],
      category: "Game Design",
      demandLevel: "High" as const,
      transferable: true,
    },

    // Art & Animation
    art: {
      patterns: [
        "Texturing",
        "Animation",
        "Rigging",
        "VFX",
        "Concept Art",
        "Environmental Art",
      ],
      category: "Art & Animation",
      demandLevel: "High" as const,
      transferable: true,
    },

    // Tools & Software
    tools: {
      patterns: [
        "Maya",
        "Blender",
        "Photoshop",
        "Substance",
        "Houdini",
        "ZBrush",
        "Perforce",
        "Git",
      ],
      category: "Tools & Software",
      demandLevel: "Medium" as const,
      transferable: true,
    },

    // Gaming-Specific Technologies
    gamingTech: {
      patterns: [
        "DirectX",
        "OpenGL",
        "Vulkan",
        "Physics Engine",
        "Networking",
        "Multiplayer",
        "Shaders",
        "Rendering",
      ],
      category: "Gaming Technology",
      demandLevel: "High" as const,
      transferable: true,
    },

    // Esports & Streaming
    esports: {
      patterns: [
        "Streaming",
        "Content Creation",
        "Tournament Organization",
        "Community Management",
        "Broadcasting",
      ],
      category: "Esports & Content",
      demandLevel: "Medium" as const,
      transferable: true,
    },

    // Transferable Gaming Skills
    transferable: {
      patterns: [
        "Leadership",
        "Teamwork",
        "Problem Solving",
        "Communication",
        "Project Management",
        "Analytics",
      ],
      category: "Soft Skills",
      demandLevel: "High" as const,
      transferable: true,
    },
  };

  // Professional equivalents for gaming activities
  private readonly PROFESSIONAL_MAPPINGS = {
    "Guild Leader": "Team Leadership & Project Management",
    "Raid Coordinator": "Event Planning & Resource Management",
    Streamer: "Content Creation & Digital Marketing",
    Modder: "Software Development & Problem Solving",
    "Beta Tester": "Quality Assurance & Bug Reporting",
    "Game Master": "Community Management & Conflict Resolution",
    "Clan Manager": "Community Building & Team Leadership",
    "Tournament Player": "Performance Under Pressure & Strategic Thinking",
    "Content Creator": "Digital Marketing & Brand Building",
    "Game Reviewer": "Technical Writing & Critical Analysis",
  };

  private constructor() {
    // Initialize NLP with custom gaming terminology
    this.initializeNLP();
  }

  static getInstance(): EnhancedSkillExtractor {
    if (!EnhancedSkillExtractor.instance) {
      EnhancedSkillExtractor.instance = new EnhancedSkillExtractor();
    }
    return EnhancedSkillExtractor.instance;
  }

  private initializeNLP(): void {
    try {
      // Add gaming-specific terms to NLP lexicon
      nlp.extend({
        words: {
          unity: "GameEngine",
          unreal: "GameEngine",
          "c++": "ProgrammingLanguage",
          blender: "Tool",
          photoshop: "Tool",
          streamer: "GamingRole",
          modder: "GamingRole",
          guild: "GamingConcept",
          raid: "GamingConcept",
          esports: "GamingConcept",
        },
      });
    } catch (_error) {
      logger.warn("Failed to extend NLP lexicon:", error);
    }
  }

  async extractSkills(
    experienceText: string,
    _context: "resume" | "portfolio" | "freeform" = "freeform",
  ): Promise<SkillExtractionResult> {
    try {
      const text = experienceText.toLowerCase();
      const skills: GamingSkill[] = [];
      const insights: string[] = [];
      const suggestions: string[] = [];

      // Process text with NLP
      this.nlpDoc = nlp(experienceText);

      // Extract skills using different methods
      await this.extractSkillsByPatterns(text, skills);
      await this.extractSkillsByNLP(skills);
      await this.extractTransferableSkills(text, skills);

      // Remove duplicates and enhance skills
      const uniqueSkills = this.deduplicateSkills(skills);
      const enhancedSkills = await this.enhanceSkills(uniqueSkills, text);

      // Generate insights and suggestions
      this.generateInsights(enhancedSkills, insights, suggestions);

      totalSkillsFound = enhancedSkills.length;
      const confidence = this.calculateConfidence(
        enhancedSkills,
        experienceText,
      );

      return {
        skills: enhancedSkills,
        insights,
        suggestions,
        confidence,
        totalSkillsFound,
      };
    } catch (_error) {
      logger.error("Skill extraction failed:", error);
      return {
        skills: [],
        insights: [
          "Unable to process experience text. Please check the format.",
        ],
        suggestions: [
          "Try providing more specific details about your gaming experience.",
        ],
      };
    }
  }

  private async extractSkillsByPatterns(
    text: string,
    skills: GamingSkill[],
  ): Promise<void> {
    for (const [categoryKey, categoryData] of Object.entries(
      this.GAMING_SKILL_PATTERNS,
    )) {
      for (const pattern of categoryData.patterns) {
        if (text.includes(pattern.toLowerCase())) {
          const skill: GamingSkill = {
            id: createId(),
            skill: pattern,
            category: categoryData.category,
            transferable: categoryData.transferable,
            demandLevel: categoryData.demandLevel,
            context: [categoryKey],
          };

          // Try to extract proficiency context
          skill.proficiency = this.extractProficiency(text, pattern);
          skill.yearsExperience = this.extractYearsExperience(text, pattern);

          skills.push(skill);
        }
      }
    }
  }

  private async extractSkillsByNLP(skills: GamingSkill[]): Promise<void> {
    try {
      // Extract entities and proper nouns that might be skills
      const nouns = this.nlpDoc.nouns().out("array");

      // Process potential skill terms
      const potentialSkills = [...new Set([...entities, ...nouns])];

      for (const term of potentialSkills) {
        if (
          this.isLikelyGameSkill(term) &&
          !skills.find((s) => s.skill.toLowerCase() === term.toLowerCase())
        ) {
          skills.push({
            id: createId(),
            skill: term,
            category: "Identified Skills",
            transferable: true,
            demandLevel: "Medium",
            context: ["nlp_extracted"],
          });
        }
      }
    } catch (_error) {
      logger.debug("NLP skill extraction failed:", error);
    }
  }

  private async extractTransferableSkills(
    text: string,
    skills: GamingSkill[],
  ): Promise<void> {
    // Look for gaming activities that map to professional skills
    for (const [gamingActivity, professionalSkill] of Object.entries(
      this.PROFESSIONAL_MAPPINGS,
    )) {
      if (
        text.includes(gamingActivity.toLowerCase()) ||
        text.includes(gamingActivity.replace(/\s+/g, "").toLowerCase())
      ) {
        skills.push({
          id: createId(),
          skill: gamingActivity,
          category: "Gaming Experience",
          transferable: true,
          professionalEquivalent: professionalSkill,
          demandLevel: "High",
          context: ["gaming_activity"],
        });
      }
    }
  }

  private deduplicateSkills(skills: GamingSkill[]): GamingSkill[] {
    const seen = new Set<string>();
    return skills.filter((skill) => {
      const key = skill.skill.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async enhanceSkills(
    skills: GamingSkill[],
    originalText: string,
  ): Promise<GamingSkill[]> {
    return skills.map((skill) => {
      // Add context clues from original text
      const contexts = this.findContextClues(originalText, skill.skill);
        skill.context = [...(skill.context || []), ...contexts];
      }

      // Enhance transferable skills
      if (skill.transferable && !skill.professionalEquivalent) {
        skill.professionalEquivalent = this.suggestProfessionalEquivalent(
          skill.skill,
        );
      }

      return skill;
    });
  }

  private extractProficiency(
    text: string,
    skillName: string,
  ): GamingSkill["proficiency"] {

    if (/expert|master|advanced|senior|lead/i.test(skillContext))
      return "Expert";
    if (/experienced|intermediate|competent/i.test(skillContext))
      return "Advanced";
    if (/familiar|some|basic|learning/i.test(skillContext))
      return "Intermediate";
    if (/beginner|new|started/i.test(skillContext)) return "Beginner";

    return undefined;
  }

  private extractYearsExperience(
    text: string,
    skillName: string,
  ): number | undefined {
  }

  private getSkillContext(
    text: string,
    skill: string,
    wordRadius: number,
  ): string {
    const skillIndex = text.toLowerCase().indexOf(skill.toLowerCase());

    const words = text.split(/\s+/);
    const skillWordIndex =


    return words.slice(start, end).join(" ");
  }

  private findContextClues(text: string, skill: string): string[] {
    const contexts: string[] = [];

    // Look for project contexts
    if (/project|built|created|developed|worked on/i.test(skillContext)) {
      contexts.push("project_work");
    }

    // Look for team contexts
    if (/team|group|collaborated|together/i.test(skillContext)) {
      contexts.push("team_work");
    }

    // Look for leadership contexts
    if (/led|managed|organized|coordinated/i.test(skillContext)) {
      contexts.push("leadership");
    }

    return contexts;
  }

  private isLikelyGameSkill(term: string): boolean {
    const gamingTerms = [
      "fps",
      "rts",
      "mmo",
      "rpg",
      "api",
      "sdk",
      "engine",
      "shader",
      "texture",
      "mesh",
      "animation",
      "rigging",
      "modeling",
      "scripting",
      "programming",
      "debugging",
    ];

    const termLower = term.toLowerCase();
    return (
      gamingTerms.some(
        (gt) => termLower.includes(gt) || gt.includes(termLower),
      ) ||
    ); // Proper nouns
  }

  private suggestProfessionalEquivalent(skill: string): string {
    // Simple mapping for common gaming skills to professional equivalents
    const mappings: Record<string, string> = {
      leadership: "Team Leadership & Management",
      communication: "Professional Communication",
      "problem solving": "Analytical Problem Solving",
      "project management": "Project Planning & Execution",
      analytics: "Data Analysis & Reporting",
    };

    const skillLower = skill.toLowerCase();
    for (const [key, value] of Object.entries(mappings)) {
      if (skillLower.includes(key)) {
        return value;
      }
    }

    return `Professional ${skill}`;
  }

  private generateInsights(
    skills: GamingSkill[],
    insights: string[],
    suggestions: string[],
  ): void {
    const categories = [...new Set(skills.map((s) => s.category))];
    const transferableCount = skills.filter((s) => s.transferable).length;
    const technicalCount = skills.filter(
      (s) =>
        s.category.includes("Programming") || s.category.includes("Technology"),
    ).length;

    // Generate insights
    insights.push(
      `Found ${skills.length} relevant skills across ${categories.length} categories`,
    );

      insights.push(
        `${transferableCount} skills are highly transferable to professional roles`,
      );
    }

      insights.push(
        `${technicalCount} technical skills identified that are valuable in the gaming industry`,
      );
    }

    // Generate suggestions
      suggestions.push(
        "Consider adding more specific details about your gaming experience and tools used",
      );
    }

      suggestions.push(
        "Highlight more leadership, teamwork, and problem-solving experiences from gaming",
      );
    }

      suggestions.push(
        "Consider learning programming or game development tools to increase your technical skills",
      );
    }
  }

  private calculateConfidence(
    skills: GamingSkill[],
    originalText: string,
  ): number {

    const textLength = originalText.split(/\s+/).length;

    // Base confidence on number of skills found relative to text length
    confidence += Math.min(
    );

    // Bonus for specific skill types
    const specificSkills = skills.filter(
      (s) => s.proficiency || s.yearsExperience,
    );

    // Bonus for transferable skills
    const transferableRatio =
      skills.filter((s) => s.transferable).length / skills.length;

  }
}

// Export singleton instance
export const enhancedSkillExtractor = EnhancedSkillExtractor.getInstance();
export default enhancedSkillExtractor;
