import { ref, reactivewatch} from "vue";
import { databaseService } from "@/services/SimpleDocumentStorage";
import { useToast } from "@/composables/useToast";

export interface ResumeData {
  id?: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    location: string;
    gpa: string;
  }>;
  skills: Array<{
    name: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }>;
  achievements: Array<{
    description: string;
  }>;
  certifications: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverLetterData {
  id?: string;
  jobInfo: {
    company: string;
    position: string;
    hiringManager: string;
  };
  content: {
    opening: string;
    body: string;
    closing: string;
  };
  tone: string;
  focus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobInfo {
  company: string;
  position: string;
  hiringManager: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  location?: string;
}

export interface AIConfig {
  tone: "professional" | "friendly" | "impactful";
  level: "conservative" | "balanced" | "creative";
  focus: "ats" | "recruiter";
}

export interface UserPreferences {
  autoSave: boolean;
  showTokens: boolean;
  defaultTemplate: string;
  language: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  documentType: "resume" | "cover-letter";
  timestamp: number;
  label: string;
  jobHash?: number;
  data: ResumeData | CoverLetterData;
  changes?: {
    additions: number;
    modifications: number;
    deletions: number;
    description: string;
  };
}

export function useDocumentManager() {
  const toast = useToast();

  // Reactive state with proper initialization
  const resumeData = reactive<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
  });

  const coverLetterData = reactive<CoverLetterData>({
    jobInfo: {
      company: "",
      position: "",
      hiringManager: "",
    },
    content: {
      opening: "",
      body: "",
      closing: "",
    },
    tone: "professional",
    focus: "experience",
  });

  const jobDescription = ref("");
  const selectedTemplate = ref("modern");
  const currentStep = ref(1);
  const isLoading = ref(false);
  const isSaving = ref(false);

  const aiConfig = reactive<AIConfig>({
    tone: "professional",
    level: "balanced",
    focus: "ats",
  });

  const userPreferences = reactive<UserPreferences>({
    autoSave: true,
    showTokens: false,
    defaultTemplate: "modern",
    language: "en",
  });

  const documentVersions = ref<DocumentVersion[]>([]);

  // Enhanced job info extraction with AI assistance
  const jobInfo = computed<JobInfo>(() => {
    if (!jobDescription.value) {
      return {
        company: "",
        position: "",
        hiringManager: "",
        description: "",
        requirements: [],
        skills: [],
        location: "",
      };
    }

    const lines = jobDescription.value
      .split("\n")
      .filter((line) => line.trim());
    return {
      company: extractCompany(lines) || "",
      position: extractPosition(lines) || "",
      hiringManager: extractHiringManager(lines) || "",
      description: jobDescription.value,
      requirements: extractRequirements(lines),
      skills: extractSkills(lines),
      location: extractLocation(lines),
    };
  });

  // Database operations
  const saveDocumentToDatabase = async (
    type: "resume" | "cover-letter",
    data: ResumeData | CoverLetterData,
  ) => {
    try {
      const timestamp = new Date().toISOString();
      const documentData = {
        ...data,
        id: data.id || generateId(),
        updatedAt: timestamp,
        createdAt: data.createdAt || timestamp,
      };

      await databaseService.saveDocument(type, documentData);

      // Create version snapshot
      await createVersionSnapshot(type, documentData);

      return documentData;
    } catch (_error) {
      console.error("Failed to save document to database:", error);
      throw error;
    }
  };

  const loadDocumentFromDatabase = async (
    type: "resume" | "cover-letter",
    id?: string,
  ) => {
    try {
      const document = await databaseService.getDocument(type, id);
      if (document) {
        if (type === "resume") {
          Object.assign(resumeData, document);
        } else {
          Object.assign(coverLetterData, document);
        }
      }
      return document;
    } catch (_error) {
      console.error("Failed to load document from database:", error);
      return null;
    }
  };

  const createVersionSnapshot = async (
    type: "resume" | "cover-letter",
    documentData: ResumeData | CoverLetterData,
  ) => {
    try {
      const version: DocumentVersion = {
        id: generateId(),
        documentId: documentData.id || generateId(),
        documentType: type,
        timestamp: Date.now(),
        label: `Auto-save ${new Date().toLocaleTimeString()}`,
        jobHash: jobDescription.value
          ? hashString(jobDescription.value)
          : undefined,
        data: JSON.parse(JSON.stringify(documentData)),
        changes: calculateChanges(documentData),
      };

      await databaseService.saveVersion(version);

      // Update local versions array
      documentVersions.value.unshift(version);


      if (documentVersions.value.length > 50) {
        const toRemove = documentVersions.value.slice(50);
        for (const v of toRemove) {
          await databaseService.deleteVersion(v.id);
        }
        documentVersions.value = documentVersions.value.slice(0, 50);
      }
    } catch (_error) {
      console.error("Failed to create version snapshot:", error);
    }
  };

  const loadVersionHistory = async () => {
    try {
      const versions = await databaseService.getVersions();
      documentVersions.value = versions.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
    } catch (_error) {
      console.error("Failed to load version history:", error);
    }
  };

  // Methods
  const updateDocumentData = async (
    type: "resume" | "cover-letter",
    data: any,
  ) => {
    try {
      if (type === "resume") {
        Object.assign(resumeData, data);
      } else {
        Object.assign(coverLetterData, data);
      }

      if (userPreferences.autoSave) {
        await saveToStorage();
      }
    } catch (_error) {
      console.error("Failed to update document data:", error);
      toast?.error("Failed to update document");
    }
  };

  const updateJobDescription = (description: string) => {
    jobDescription.value = description;
  };

  const selectTemplate = (template: string) => {
    selectedTemplate.value = template;
    try {
      localStorage.setItem("navi-document-template", template);
    } catch {}
  };

  const updateAIConfig = (config: Partial<AIConfig>) => {
    Object.assign(aiConfig, config);
    try {
      localStorage.setItem("navi-ai-config", JSON.stringify(aiConfig));
    } catch {}
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    Object.assign(userPreferences, preferences);
    try {
      localStorage.setItem(
        "navi-user-preferences",
        JSON.stringify(userPreferences),
      );
    } catch {}
  };

  const revertToVersion = async (version: DocumentVersion) => {
    try {
      if (version.documentType === "resume") {
        Object.assign(resumeData, version.data);
      } else {
        Object.assign(coverLetterData, version.data);
      }

      await saveToStorage();
      toast?.success("Document reverted to selected version");
    } catch (_error) {
      console.error("Failed to revert to version:", error);
      toast?.error("Failed to revert document");
    }
  };


  function extractCompany(lines: string[]): string {
    const companyKeywords = [
      "at",
      "company",
      "organization",
      "firm",
      "corporation",
      "inc",
      "llc",
    ];
    for (const line of lines) {
      for (const keyword of companyKeywords) {
        const regex = new RegExp(
          `\\b${keyword}\\s+([A-Z][A-Za-z\\s&,.-]+)`,
          "i",
        );
        const match = line.match(regex);
        if (match && match[1]) {
          return match[1].split(/[,\\.;]/)[0].trim();
        }
      }
    }

    // Try to extract from email domains or common patterns
    const emailMatch = lines.join(" ").match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const domain = emailMatch[1]
        .replace(/\.(com|org|net|co|io)$/, "")
        .replace(/\./g, " ");
      return domain
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return "";
  }

  function extractPosition(lines: string[]): string {
    const positionKeywords = [
      "position",
      "role",
      "job",
      "title",
      "seeking",
      "looking for",
      "hiring",
    ];
    const commonTitles = [
      "developer",
      "engineer",
      "designer",
      "manager",
      "director",
      "lead",
      "senior",
      "junior",
      "analyst",
      "specialist",
      "coordinator",
      "assistant",
      "executive",
      "consultant",
    ];

    for (const line of lines.slice(0, 5)) {

      for (const keyword of positionKeywords) {
        const regex = new RegExp(`${keyword}:?\\s*([A-Za-z\\s/&-]+)`, "i");
        const match = line.match(regex);
        if (match && match[1]) {
          const position = match[1].split(/[,\\.;]/)[0].trim();
          if (
            commonTitles.some((title) => position.toLowerCase().includes(title))
          ) {
            return position;
          }
        }
      }

      // Check if line starts with a common job title pattern
      for (const title of commonTitles) {
        if (line.toLowerCase().includes(title)) {
          const words = line.split(" ");
          const titleIndex = words.findIndex((word) =>
            word.toLowerCase().includes(title),
          );
          if (titleIndex >= 0) {
            return words
              .slice(Math.max(0, titleIndex - 1), titleIndex + 2)
              .join(" ");
          }
        }
      }
    }
    return "";
  }

  function extractHiringManager(lines: string[]): string {
    const managerKeywords = [
      "hiring manager",
      "recruiter",
      "contact",
      "hr manager",
      "talent",
      "recruitement",
    ];
    for (const line of lines) {
      for (const keyword of managerKeywords) {
        const index = line.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          const afterKeyword = line.substring(index + keyword.length).trim();
          if (afterKeyword) {
            // Extract name pattern
            const nameMatch = afterKeyword.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            if (nameMatch) {
              return nameMatch[1];
            }
            return afterKeyword.split(/[,\\.]/)[0].trim();
          }
        }
      }
    }
    return "";
  }

  function extractRequirements(lines: string[]): string[] {
    const requirements: string[] = [];
    const requirementKeywords = [
      "requirements",
      "qualifications",
      "must have",
      "required",
      "essential",
    ];

    let inRequirementsSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if we're entering requirements section
      if (requirementKeywords.some((keyword) => lowerLine.includes(keyword))) {
        inRequirementsSection = true;
        continue;
      }

      // Extract requirements if we're in the section
      if (inRequirementsSection) {
        if (
          line.startsWith("•") ||
          line.startsWith("-") ||
          line.startsWith("*") ||
          /^\d+\./.test(line)
        ) {
          requirements.push(line.replace(/^[-•*\d.\s]+/, "").trim());
        } else if (
          line.trim() === "" ||
          lowerLine.includes("responsibilities") ||
          lowerLine.includes("duties")
        ) {
          inRequirementsSection = false;
        }
      }
    }

    return requirements.slice(0, 10);
  }

  function extractSkills(lines: string[]): string[] {
    const skills: string[] = [];
    const skillKeywords = [
      "skills",
      "technologies",
      "experience with",
      "proficient in",
      "knowledge of",
    ];
    const commonSkills = [
      "javascript",
      "python",
      "java",
      "react",
      "node.js",
      "sql",
      "html",
      "css",
      "git",
      "aws",
      "docker",
      "kubernetes",
      "typescript",
      "vue",
      "angular",
      "mongodb",
      "postgresql",
    ];

    let inSkillsSection = false;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if we're entering skills section
      if (skillKeywords.some((keyword) => lowerLine.includes(keyword))) {
        inSkillsSection = true;

        // Extract skills from the same line
        for (const skill of commonSkills) {
          if (lowerLine.includes(skill)) {
            skills.push(skill);
          }
        }
        continue;
      }

      // Extract skills if we're in the section
      if (inSkillsSection) {
        for (const skill of commonSkills) {
          if (lowerLine.includes(skill) && !skills.includes(skill)) {
            skills.push(skill);
          }
        }

        if (
          line.trim() === "" ||
          lowerLine.includes("experience") ||
          lowerLine.includes("responsibilities")
        ) {
          inSkillsSection = false;
        }
      }
    }

    return [...new Set(skills)].slice(0, 15);
  }

  function extractLocation(lines: string[]): string {
    const locationKeywords = [
      "location",
      "based",
      "office",
      "remote",
      "hybrid",
      "city",
      "state",
    ];
    const locationPatterns = [
      /\b([A-Z][a-z]+,\s*[A-Z]{2})\b/, // City, State
      /\b([A-Z][a-z]+\s*,\s*[A-Z][a-z]+)\b/, // City, Country
      /\b(Remote|Hybrid|On-site)\b/i,
    ];

    for (const line of lines.slice(0, 10)) {

      // Check for location keywords
      for (const keyword of locationKeywords) {
        if (line.toLowerCase().includes(keyword)) {
          for (const pattern of locationPatterns) {
            const match = line.match(pattern);
            if (match) {
              return match[1];
            }
          }
        }
      }

      // Direct pattern matching
      for (const pattern of locationPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }

    return "";
  }

  // Load from both localStorage and database
  const loadFromStorage = async () => {
    isLoading.value = true;
    try {
      // Try to load from database first
      await loadDocumentFromDatabase("resume");
      await loadDocumentFromDatabase("cover-letter");
      await loadVersionHistory();

      // Fallback to localStorage if database is empty
      if (!resumeData.personalInfo.name && !resumeData.summary) {
        const savedResume = localStorage.getItem("navi-resume-data");
        if (savedResume) {
          Object.assign(resumeData, JSON.parse(savedResume));
        }
      }

      if (!coverLetterData.content.opening && !coverLetterData.content.body) {
        const savedCoverLetter = localStorage.getItem("navi-cover-letter-data");
        if (savedCoverLetter) {
          Object.assign(coverLetterData, JSON.parse(savedCoverLetter));
        }
      }

      const savedJobDesc = localStorage.getItem("navi-job-description");
      if (savedJobDesc) {
        jobDescription.value = savedJobDesc;
      }

      const savedTemplate = localStorage.getItem("navi-document-template");
      if (savedTemplate) {
        selectedTemplate.value = savedTemplate;
      }

      const savedAIConfig = localStorage.getItem("navi-ai-config");
      if (savedAIConfig) {
        Object.assign(aiConfig, JSON.parse(savedAIConfig));
      }

      const savedPreferences = localStorage.getItem("navi-user-preferences");
      if (savedPreferences) {
        Object.assign(userPreferences, JSON.parse(savedPreferences));
      }
    } catch (_error) {
      console.warn("Failed to load document data from storage:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Save to both localStorage and database
  const saveToStorage = async () => {
    isSaving.value = true;
    try {
      // Save to database
      await saveDocumentToDatabase("resume", resumeData);
      await saveDocumentToDatabase("cover-letter", coverLetterData);

      // Also save to localStorage as backup
      localStorage.setItem("navi-resume-data", JSON.stringify(resumeData));
      localStorage.setItem(
        "navi-cover-letter-data",
        JSON.stringify(coverLetterData),
      );
      localStorage.setItem("navi-job-description", jobDescription.value);

      return true;
    } catch (_error) {
      console.warn("Failed to save document data to storage:", error);
      return false;
    } finally {
      isSaving.value = false;
    }
  };


  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }

  function calculateChanges(documentData: ResumeData | CoverLetterData) {
    // Simple change calculation - in production this would compare with previous version
    return {
      additions: 0,
      modifications: 1,
      deletions: 0,
      description: "Document updated",
    };
  }


  watch(
    [resumeData, coverLetterData, jobDescription],
    async () => {
      if (userPreferences.autoSave && !isLoading.value) {
        await saveToStorage();
      }
    },
    { deep: true },
  );

  // Load initial data
  onMounted(async () => {
    await loadFromStorage();
  });

  return {
    resumeData,
    coverLetterData,
    jobDescription,
    jobInfo,
    selectedTemplate,
    aiConfig,
    userPreferences,
    documentVersions,
    currentStep,
    isLoading,
    isSaving,
    updateDocumentData,
    updateJobDescription,
    selectTemplate,
    updateAIConfig,
    updatePreferences,
    revertToVersion,
    saveToStorage,
    loadFromStorage,
    loadVersionHistory,
  };
}
