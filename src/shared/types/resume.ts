
export type ExportFormat = "pdf" | "docx" | "html" | "json" | "markdown";

export interface PageMargins {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export interface ExportOptions {
  template?: "modern" | "classic" | "gaming";
  theme?: "light" | "dark";
  margins?: PageMargins;
  // Optional toggles for sections
  includeSummary?: boolean;
  includeProjects?: boolean;
  includeGamingExperience?: boolean;
  // Styling overrides
  customCSS?: string;
}

export interface ResumePersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeExperienceItem {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export interface ResumeEducationItem {
  degree: string;
  field: string;
  school: string;
  year: string;
}

export interface ResumeSkills {
  technical?: string[];
  soft?: string[];
}

export interface ResumeProject {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface GamingExperience {
  gameEngines?: string; // e.g., "Unity, Unreal"
  platforms?: string; // e.g., "PC, Console, Mobile"
  genres?: string; // e.g., "RPG, FPS"
}

export interface ResumeData {
  personalInfo?: ResumePersonalInfo;
  summary?: string;
  experience?: ResumeExperienceItem[];
  skills?: ResumeSkills;
  education?: ResumeEducationItem[];
  gamingExperience?: GamingExperience;
  projects?: ResumeProject[];
}
