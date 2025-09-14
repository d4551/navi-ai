export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{ title: string; company: string; description: string; }>;
  education: Array<{ institution: string; degree: string; year: string; }>;
  skills: Array<{ name: string }>;
  projects: Array<{ title: string; description: string }>;
}

export interface CoverLetterData {
  jobInfo: {
    company: string;
    position: string;
    hiringManager?: string;
  };
  content: {
    opening: string;
    body: string;
    closing: string;
  };
}

export interface JobInfo {
  company: string
  position: string
}
export interface AIConfig {
  [key: string]: any
}
export interface UserPreferences {
  [key: string]: any
}
export interface DocumentVersion {
  [key: string]: any
}

export function useDocumentManager(): {
  resumeData: ResumeData
  coverLetterData: CoverLetterData
  jobDescription: string
  jobInfo: JobInfo
  selectedTemplate: string
  aiConfig: AIConfig
  userPreferences: UserPreferences
  documentVersions: DocumentVersion[]
  currentStep: { value: number }
  updateDocumentData: (_data: any) => void
  updateJobDescription: (_desc: string) => void
  selectTemplate: (_template: string) => void
  updateAIConfig: (_config: AIConfig) => void
  updatePreferences: (_prefs: UserPreferences) => void
  revertToVersion: (_version: DocumentVersion) => void
};
