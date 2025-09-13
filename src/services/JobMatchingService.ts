
import type { Job, UserProfile } from "@/shared/types/jobs";

export interface JobMatchCriteria {
  skills: string[];
  experience: number;
  interests: string[];
  location?: string;
  salaryExpectation?: { min: number; max: number };
  workStyle?: "remote" | "hybrid" | "onsite";
  rolePreferences: string[];
  companySize?: string;
  technologies: string[];
}

export interface MatchResult {
  jobId: string;
  matchScore: number;
  matchBreakdown: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    cultureMatch: number;
    technologyMatch: number;
  };
  missingSkills: string[];
  recommendedSkills: string[];
  strengths: string[];
  improvementAreas: string[];
}

export interface SkillGapAnalysis {
  missingCriticalSkills: string[];
  missingPreferredSkills: string[];
  strengthAreas: string[];
  recommendedLearning: {
    skill: string;
    priority: "high" | "medium" | "low";
    resources: string[];
    estimatedTimeToLearn: string;
  }[];
}

export class JobMatchingService {

  calculateMatchScore(userProfile: UserProfile, job: Job): MatchResult {
    const criteria = this.extractUserCriteria(userProfile);

    const skillsMatch = this.calculateSkillsMatch(
      criteria.skills,
      job.requirements || [],
      job.technologies || [],
    );
    const experienceMatch = this.calculateExperienceMatch(
      criteria.experience,
      job.experienceLevel || "mid",
    );
    const locationMatch = this.calculateLocationMatch(
      criteria.location,
      criteria.workStyle,
      job.location || "",
      !!job.remote,
    );
    const salaryMatch = this.calculateSalaryMatch(
      criteria.salaryExpectation,
      job.salary,
    );
    const cultureMatch = this.calculateCultureMatch(
      criteria.interests || [],
      job.company || "",
      job.studioType,
    );
    const technologyMatch = this.calculateTechnologyMatch(
      criteria.technologies || [],
      job.technologies || [],
    );

    // Calculate weighted overall score
    const matchScore = Math.round(
    );

    // Analyze skill gaps and strengths
    const { missingSkills, recommendedSkills, strengths } =
      this.analyzeSkillGaps(
        criteria.skills,
        job.requirements || [],
        job.technologies || [],
      );

    const improvementAreas = this.identifyImprovementAreas({
      skillsMatch: skillsMatch.score,
      experienceMatch,
      locationMatch,
      salaryMatch,
      cultureMatch,
      technologyMatch,
    });

    return {
      jobId: job.id,
      matchScore,
      matchBreakdown: {
        skillsMatch: skillsMatch.score,
        experienceMatch,
        locationMatch,
        salaryMatch,
        cultureMatch,
        technologyMatch,
      },
      missingSkills,
      recommendedSkills,
      strengths,
      improvementAreas,
    };
  }

  private calculateSkillsMatch(
    userSkills: string[],
    jobRequirements: string[],
    jobTechnologies: string[],
  ): {
    score: number;
    matchedSkills: string[];
    missingCritical: string[];
    missingPreferred: string[];
  } {
    const allJobSkills = [...jobRequirements, ...jobTechnologies].map((s) =>
      s.toLowerCase(),
    );
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());

    // Categorize job skills
    const criticalSkills = jobRequirements.slice(
    );
    const preferredSkills = jobRequirements.slice(criticalSkills.length);

    // Calculate matches
    const matchedSkills = userSkillsLower.filter((skill) =>
      allJobSkills.some((jobSkill) => this.skillsSimilar(skill, jobSkill)),
    );

    const criticalMatches = criticalSkills.filter((skill) =>
      userSkillsLower.some((userSkill) =>
        this.skillsSimilar(userSkill, skill.toLowerCase()),
      ),
    );

    const preferredMatches = preferredSkills.filter((skill) =>
      userSkillsLower.some((userSkill) =>
        this.skillsSimilar(userSkill, skill.toLowerCase()),
      ),
    );

    const criticalScore =
    const preferredScore =


    return {
      score,
      matchedSkills,
      missingCritical: criticalSkills.filter(
        (skill) => !criticalMatches.includes(skill),
      ),
      missingPreferred: preferredSkills.filter(
        (skill) => !preferredMatches.includes(skill),
      ),
    };
  }

  private calculateExperienceMatch(
    userExperience: number,
    jobExperience: string,
  ): number {
    const experienceMapping = {
    };

    const jobExp =
      experienceMapping[jobExperience as keyof typeof experienceMapping];

    // Perfect match if within range
    if (userExperience >= jobExp.min && userExperience <= jobExp.max) {
    }

    // Calculate distance penalty
    let distance: number;
    if (userExperience < jobExp.min) {
      distance = jobExp.min - userExperience;
    } else {
      distance = userExperience - jobExp.max;
    }

  }

  private calculateLocationMatch(
    userLocation: string | undefined,
    workStyle: string | undefined,
    jobLocation: string,
    jobRemote: boolean,
  ): number {
    // Remote work preference

    // On-site preference

    // Location-based matching

    const userLocationLower = userLocation.toLowerCase();
    const jobLocationLower = jobLocation.toLowerCase();

    // Exact city match
    if (
      userLocationLower.includes(jobLocationLower) ||
      jobLocationLower.includes(userLocationLower)
    ) {
    }

    // Same state/region match
    const userParts = userLocation
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const jobParts = jobLocation.split(",").map((s) => s.trim().toLowerCase());

    if (userParts.some((part) => jobParts.includes(part))) {
    }

    // Gaming hub bonus - major gaming cities get higher scores
    const gamingHubs = [
      "san francisco",
      "los angeles",
      "seattle",
      "austin",
      "montreal",
      "london",
      "tokyo",
    ];
    if (gamingHubs.some((hub) => jobLocationLower.includes(hub))) {
    }

  }

  private calculateSalaryMatch(
    userSalaryExpectation: { min: number; max: number } | undefined,
    jobSalary: { min: number; max: number } | string | undefined,
  ): number {


    // Check overlap
    const userMin = userSalaryExpectation.min;
    const userMax = userSalaryExpectation.max;
    const jobMin = jobSalary.min;
    const jobMax = jobSalary.max;

    // Perfect overlap

    // Partial overlap
    if (jobMax >= userMin && jobMin <= userMax) {
      const overlapSize = Math.min(jobMax, userMax) - Math.max(jobMin, userMin);
      const userRange = userMax - userMin;
    }

    // No overlap but close
    const distance = Math.min(
      Math.abs(jobMax - userMin),
      Math.abs(userMax - jobMin),
    );

    const distancePercent = distance / avgSalary;

  }

  private calculateCultureMatch(
    userInterests: string[],
    company: string,
    studioType: string | undefined,
  ): number {

    // Studio type preferences
    if (studioType) {
      const interestsLower = userInterests.map((i) => i.toLowerCase());

      // AAA studio bonuses
      if (
        studioType === "AAA" &&
        interestsLower.some((i) =>
          [
            "aaa",
            "large team",
            "big budget",
            "console",
            "blockbuster",
          ].includes(i),
        )
      ) {
      }

      // Indie studio bonuses
      if (
        studioType === "Indie" &&
        interestsLower.some((i) =>
          [
            "indie",
            "small team",
            "creative freedom",
            "innovation",
            "experimental",
          ].includes(i),
        )
      ) {
      }

      // Mobile game bonuses
      if (
        studioType === "Mobile" &&
        interestsLower.some((i) =>
        )
      ) {
      }
    }

    // Company recognition bonus
    const recognizedStudios = [
      "epic games",
      "blizzard",
      "valve",
      "riot games",
      "nintendo",
      "sony",
      "microsoft",
    ];
    if (
      recognizedStudios.some((studio) => company.toLowerCase().includes(studio))
    ) {
    }

  }

  private calculateTechnologyMatch(
    userTechnologies: string[],
    jobTechnologies: string[],
  ): number {

    const userTechLower = userTechnologies.map((t) => t.toLowerCase());
    const jobTechLower = jobTechnologies.map((t) => t.toLowerCase());

    const matches = jobTechLower.filter((tech) =>
      userTechLower.some((userTech) => this.skillsSimilar(userTech, tech)),
    );

    const matchPercentage = matches.length / jobTechnologies.length;
  }

  private analyzeSkillGaps(
    userSkills: string[],
    jobRequirements: string[],
    jobTechnologies: string[],
  ): {
    missingSkills: string[];
    recommendedSkills: string[];
    strengths: string[];
  } {
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());
    const allJobSkills = [...jobRequirements, ...jobTechnologies];

    const missingSkills = allJobSkills.filter(
      (skill) =>
        !userSkillsLower.some((userSkill) =>
          this.skillsSimilar(userSkill, skill.toLowerCase()),
        ),
    );

    const strengths = userSkills.filter((skill) =>
      allJobSkills.some((jobSkill) =>
        this.skillsSimilar(skill.toLowerCase(), jobSkill.toLowerCase()),
      ),
    );

    // Recommend complementary skills based on matched skills
    const recommendedSkills = this.getComplementarySkills(strengths);

    return { missingSkills, recommendedSkills, strengths };
  }

  private identifyImprovementAreas(
    breakdown: Record<string, number>,
  ): string[] {
    const areas: string[] = [];

      areas.push("skills");
    }

      areas.push("experience");
    }

      areas.push("technology");
    }

      areas.push("location");
    }

    return areas;
  }

  private getComplementarySkills(userSkills: string[]): string[] {
    const skillComplements: Record<string, string[]> = {
      "c++": ["unreal engine", "game optimization", "graphics programming"],
      "game design": ["unity", "balancing", "user research"],
      "ui/ux": ["figma", "user research", "prototyping"],
    };

    const recommendations = new Set<string>();

    userSkills.forEach((skill) => {
      const complements = skillComplements[skill.toLowerCase()];
      if (complements) {
        complements.forEach((complement) => recommendations.add(complement));
      }
    });

    return Array.from(recommendations).filter(
      (rec) =>
        !userSkills.some((skill) => skill.toLowerCase() === rec.toLowerCase()),
    );
  }



    // Handle common variations
    const variations: Record<string, string[]> = {
      javascript: ["js", "node.js", "nodejs"],
      typescript: ["ts"],
      "c++": ["cpp", "c plus plus"],
      python: ["py"],
      photoshop: ["ps", "adobe photoshop"],
      git: ["version control", "source control"],
    };

    // Check if either skill has variations that match the other
    for (const [main, vars] of Object.entries(variations)) {
      if (
      ) {
        return true;
      }
    }

    // Partial matching for compound skills
    }

    return false;
  }

  private extractUserCriteria(profile: UserProfile): JobMatchCriteria {
    // Handle both legacy array format and new object format for skills
    let skillsArray: string[] = [];
    if (profile.skills) {
      if (Array.isArray(profile.skills)) {
        // Legacy format: skills is already an array
        skillsArray = profile.skills;
      } else if (
        typeof profile.skills === "object" &&
        profile.skills !== null
      ) {
        // New format: skills is an object with categories
        const skillsObj = profile.skills as any; // Type assertion for object format
        skillsArray = [
          ...(skillsObj.technical || []),
          ...(skillsObj.soft || []),
          ...(skillsObj.languages || []),
          ...(skillsObj.tools || []),
          ...(skillsObj.frameworks || []),
          ...(skillsObj.gaming || []),
        ];
      }
    }

    return {
      skills: skillsArray,
      interests: profile.interests || [],
      location: profile.location,
      salaryExpectation: profile.salaryExpectation,
      workStyle: profile.workStyle,
      rolePreferences: profile.rolePreferences || [],
      companySize: profile.companySize,
      technologies: profile.technologies || [],
    };
  }

  generateRecommendations(
    userProfile: UserProfile,
    jobs: Job[],
  ): MatchResult[] {
    const matches = jobs.map((job) =>
      this.calculateMatchScore(userProfile, job),
    );

    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  analyzeSkillGapsForJobs(
    userProfile: UserProfile,
    jobs: Job[],
  ): SkillGapAnalysis {
    const allRequiredSkills = new Set<string>();
    const allTechnologies = new Set<string>();

    jobs.forEach((job: Job) => {
      const reqs: string[] = job.requirements ?? [];
      for (const skill of reqs) {
        allRequiredSkills.add(skill);
      }
      const techs: string[] = job.technologies ?? [];
      for (const tech of techs) {
        allTechnologies.add(tech);
      }
    });

    const userSkillsLower = (userProfile.skills || []).map((s) =>
      s.toLowerCase(),
    );
    const missingCritical: string[] = [];
    const missingPreferred: string[] = [];
    const strengthAreas: string[] = [];

    Array.from(allRequiredSkills).forEach((skill: string) => {
      if (
        !userSkillsLower.some((userSkill) =>
          this.skillsSimilar(userSkill, skill.toLowerCase()),
        )
      ) {
        const frequency = jobs.filter((job: Job) =>
          (job.requirements || []).includes(skill),
        ).length;
          missingCritical.push(skill);
        } else {
          missingPreferred.push(skill);
        }
      } else {
        strengthAreas.push(skill);
      }
    });

    const recommendedLearning = this.generateLearningRecommendations(
      missingCritical,
      missingPreferred,
    );

    return {
      missingCriticalSkills: missingCritical,
      missingPreferredSkills: missingPreferred,
      strengthAreas,
      recommendedLearning,
    };
  }

  private generateLearningRecommendations(
    criticalSkills: string[],
    preferredSkills: string[],
  ): SkillGapAnalysis["recommendedLearning"] {
    const learningResources: Record<
      string,
      {
        priority: "high" | "medium" | "low";
        resources: string[];
        estimatedTime: string;
      }
    > = {
      unity: {
        priority: "high",
        resources: [
          "Unity Learn",
          "Coursera Unity Courses",
          "YouTube Unity Tutorials",
        ],
      },
        priority: "high",
      },
      "game design": {
        priority: "medium",
        resources: [
          "Game Design Workshop",
          "Extra Credits",
          "Game Design Documents",
        ],
      },
      // Add more skill resources...
    };

    const recommendations: SkillGapAnalysis["recommendedLearning"] = [];

    // High priority for critical skills
    criticalSkills.forEach((skill) => {
      const resource = learningResources[skill.toLowerCase()];
      recommendations.push({
        skill,
        priority: "high",
        resources: resource?.resources || [
          "Online courses",
          "Documentation",
          "Practice projects",
        ],
      });
    });

    // Medium/low priority for preferred skills
    preferredSkills.forEach((skill) => {
      const resource = learningResources[skill.toLowerCase()];
      recommendations.push({
        skill,
        priority: "medium",
        resources: resource?.resources || [
          "Online tutorials",
          "Community resources",
        ],
      });
    });

    return recommendations;
  }
}

// Singleton instance
export const jobMatchingService = new JobMatchingService();
