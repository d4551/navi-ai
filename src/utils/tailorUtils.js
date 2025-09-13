
import { useAppStore } from "@/stores/app";

  const store = useAppStore();

  const applyTailoredSummary = (summary) => {
    if (!summary?.trim()) {
      return false;
    }
    store.resumeData.personalInfo.summary = summary.trim();
    return true;
  };

    if (!selectedBullets?.length) {
      return false;
    }

    const experiences = store.resumeData.experience;
    if (experiences[experienceIndex]) {
      const currentBullets =
        experiences[experienceIndex].description.split("\n");
      const newBullets = [...currentBullets, ...selectedBullets];
      experiences[experienceIndex].description = newBullets.join("\n");
      return true;
    }
    return false;
  };

  const insertKeywordsToSkills = (keywords, skillType = "technical") => {
    if (!keywords?.length) {
      return false;
    }

    if (!store.resumeData) {
      store.resumeData = {
        personalInfo: {},
        experience: [],
        education: [],
        skills: { technical: [], soft: [] },
        achievements: [],
        portfolio: [],
      };
    }
    if (!store.resumeData.skills) {
      store.resumeData.skills = { technical: [], soft: [] };
    }
    const skillsSection = store.resumeData.skills[skillType] || [];
    const existingSkills = new Set(
      skillsSection.map((skill) => skill.toLowerCase()),
    );

    const newSkills = keywords
      .filter(
        (keyword) =>
          keyword?.trim() && !existingSkills.has(keyword.trim().toLowerCase()),
      )
      .map((keyword) => keyword.trim());

      store.resumeData.skills[skillType] = [...skillsSection, ...newSkills];
      return true;
    }
    return false;
  };

  const validateTailorData = (tailorData) => {
    return (
      tailorData &&
      (tailorData.revisedSummary?.trim() ||
    );
  };

  return {
    applyTailoredSummary,
    applySelectedBullets,
    insertKeywordsToSkills,
    validateTailorData,
  };
}
