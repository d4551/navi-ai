// Resume Repository - Database operations for resume management
// Centralized resume data persistence and versioning

import { unifiedStorage } from '@/utils/storage';

export interface Resume {
  id: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    company: string;
    title: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current?: boolean;
    description: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
    honors?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    tools?: string[];
  };
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    startDate?: Date;
    endDate?: Date;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: Date;
    expiryDate?: Date;
    credentialId?: string;
    url?: string;
  }>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ResumeRepository {
  private static readonly STORE_KEY = 'resume';
  private static readonly VERSIONS_KEY = 'resumeVersions';
  private static readonly TEMPLATES_KEY = 'resumeTemplates';

  static async get(): Promise<Resume | null> {
    const resume = await unifiedStorage.get(this.STORE_KEY);
    return resume || null;
  }

  static async create(resumeData: Omit<Resume, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Resume> {
    const resume: Resume = {
      ...resumeData,
      id: ((typeof globalThis !== 'undefined' && (globalThis as any).crypto?.randomUUID)
        ? (globalThis as any).crypto.randomUUID()
        : `resume_${Date.now()}_${Math.random().toString(36).slice(2)}`),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await unifiedStorage.set(this.STORE_KEY, resume);
    await this.saveVersion(resume);
    
    return resume;
  }

  static async update(updates: Partial<Resume>): Promise<Resume | null> {
    const current = await this.get();
    if (!current) return null;

    const updated: Resume = {
      ...current,
      ...updates,
      version: current.version + 1,
      updatedAt: new Date()
    };
    
    await unifiedStorage.set(this.STORE_KEY, updated);
    await this.saveVersion(updated);
    
    return updated;
  }

  static async delete(): Promise<boolean> {
    await unifiedStorage.remove(this.STORE_KEY);
    return true;
  }

  // Version management
  static async getVersions(): Promise<Resume[]> {
    const versions = await unifiedStorage.get(this.VERSIONS_KEY);
    return Array.isArray(versions) ? versions : [];
  }

  static async saveVersion(resume: Resume): Promise<void> {
    const versions = await this.getVersions();
    versions.push(resume);
    
    // Keep only last 10 versions
    const recentVersions = versions.slice(-10);
    await unifiedStorage.set(this.VERSIONS_KEY, recentVersions);
  }

  static async getVersion(version: number): Promise<Resume | null> {
    const versions = await this.getVersions();
    return versions.find(v => v.version === version) || null;
  }

  static async restoreVersion(version: number): Promise<Resume | null> {
    const versionData = await this.getVersion(version);
    if (!versionData) return null;

    const restored: Resume = {
      ...versionData,
      version: ((await this.get())?.version ?? 0) + 1,
      updatedAt: new Date()
    };
    
    await unifiedStorage.set(this.STORE_KEY, restored);
    await this.saveVersion(restored);
    
    return restored;
  }

  // Template management
  static async getTemplates(): Promise<Array<{id: string, name: string, description: string}>> {
    const templates = await unifiedStorage.get(this.TEMPLATES_KEY);
    return Array.isArray(templates) ? templates : [
      {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Clean, modern design with emphasis on technical skills'
      },
      {
        id: 'creative',
        name: 'Creative Gaming',
        description: 'Vibrant design tailored for creative roles in gaming'
      },
      {
        id: 'technical',
        name: 'Technical Focus',
        description: 'Detailed technical sections for engineering roles'
      },
      {
        id: 'minimal',
        name: 'Minimal Classic',
        description: 'Simple, clean layout focusing on content'
      }
    ];
  }

  static async saveTemplate(template: {id: string, name: string, description: string}): Promise<void> {
    const templates = await this.getTemplates();
    const existing = templates.findIndex(t => t.id === template.id);
    
    if (existing >= 0) {
      templates[existing] = template;
    } else {
      templates.push(template);
    }
    
    await unifiedStorage.set(this.TEMPLATES_KEY, templates);
  }

  // Export functionality
  static async export(format: 'pdf' | 'docx' | 'html' | 'json', _template?: string): Promise<{
    format: string;
    data: string;
    filename: string;
    contentType: string;
  }> {
    const resume = await this.get();
    if (!resume) throw new Error('No resume found to export');

    const filename = `resume.${format}`;
    const contentTypes = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'html': 'text/html',
      'json': 'application/json'
    };

    // For now, return JSON data - would integrate with actual export libraries
    return {
      format,
      data: JSON.stringify(resume, null, 2),
      filename,
      contentType: contentTypes[format]
    };
  }
}
