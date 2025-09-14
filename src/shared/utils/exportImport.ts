/**
 * Canonical Export/Import Utilities - Single Source of Truth
 * 
 * Consolidated data export/import functionality with consistent schemas
 * across all modules (resume, portfolio, settings, etc.)
 */

import { logger } from './logger';
import { z } from 'zod';
import { getAppVersion } from '@/utils/version';

// Consistent export schema definitions
export const ExportSchemas = {
  User: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    gamingProfile: z.object({
      portfolioUrl: z.string().url().optional().or(z.literal('')),
      demoReelUrl: z.string().url().optional().or(z.literal('')),
      shippedTitles: z.string().optional(),
      gameEngines: z.string().optional(),
      specialization: z.string().optional()
    }).optional(),
    skills: z.array(z.any()).optional(),
    portfolio: z.array(z.any()).optional()
  }),

  Settings: z.object({
    geminiApiKey: z.string().optional(),
    selectedModel: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    autoSave: z.boolean().optional(),
    notifications: z.boolean().optional(),
    analytics: z.boolean().optional(),
    voiceMode: z.boolean().optional(),
    voiceLang: z.string().optional(),
    ttsProvider: z.enum(['system', 'gemini']).optional(),
    sttProvider: z.enum(['system', 'gemini']).optional(),
    // Gaming career settings
    primaryGamingFocus: z.string().optional(),
    gamingExperienceLevel: z.string().optional(),
    targetIndustry: z.string().optional(),
    careerTimeline: z.string().optional(),
    skillsToEmphasize: z.array(z.string()).optional(),
    contentTone: z.string().optional(),
    aiFocusLevel: z.string().optional()
  }),

  ResumeData: z.object({
    personalInfo: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      website: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional()
    }).optional(),
    summary: z.string().optional(),
    experience: z.array(z.object({
      id: z.string().optional(),
      company: z.string().optional(),
      position: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
      achievements: z.array(z.string()).optional()
    })).optional(),
    education: z.array(z.object({
      id: z.string().optional(),
      institution: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      gpa: z.string().optional()
    })).optional(),
    skills: z.array(z.object({
      category: z.string().optional(),
      items: z.array(z.string()).optional()
    })).optional(),
    projects: z.array(z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      url: z.string().optional(),
      githubUrl: z.string().optional()
    })).optional()
  }),

  Portfolio: z.object({
    items: z.array(z.object({
      id: z.string(),
      type: z.enum(['project', 'game', 'artwork', 'video', 'document']),
      title: z.string(),
      description: z.string().optional(),
      url: z.string().optional(),
      imageUrl: z.string().optional(),
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      featured: z.boolean().optional(),
      completionDate: z.string().optional(),
      technologies: z.array(z.string()).optional(),
      role: z.string().optional(),
      teamSize: z.number().optional(),
      duration: z.string().optional()
    })).optional(),
    settings: z.object({
      layout: z.enum(['grid', 'list', 'masonry']).optional(),
      theme: z.string().optional(),
      showCategories: z.boolean().optional(),
      itemsPerPage: z.number().optional()
    }).optional()
  }),

  ChatHistory: z.array(z.object({
    id: z.string(),
    timestamp: z.string(),
    type: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    metadata: z.object({
      model: z.string().optional(),
      tokens: z.number().optional(),
      context: z.string().optional()
    }).optional()
  })),

  JobSearchData: z.object({
    applications: z.array(z.object({
      id: z.string(),
      position: z.string(),
      company: z.string(),
      status: z.enum(['applied', 'interviewing', 'offered', 'rejected', 'withdrawn']),
      appliedDate: z.string(),
      source: z.string().optional(),
      notes: z.string().optional(),
      contacts: z.array(z.object({
        name: z.string(),
        role: z.string(),
        email: z.string().optional(),
        linkedin: z.string().optional()
      })).optional()
    })).optional(),
    savedJobs: z.array(z.object({
      id: z.string(),
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      salary: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      savedDate: z.string()
    })).optional(),
    searchPreferences: z.object({
      keywords: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      salaryRange: z.object({
        min: z.number(),
        max: z.number()
      }).optional(),
      jobTypes: z.array(z.enum(['full-time', 'part-time', 'contract', 'remote'])).optional(),
      industries: z.array(z.string()).optional()
    }).optional()
  })
};

// Main export data schema
export const NaviExportSchema = z.object({
  version: z.string(),
  exportDate: z.string(),
  user: ExportSchemas.User.optional(),
  settings: ExportSchemas.Settings.optional(),
  resumeData: ExportSchemas.ResumeData.optional(),
  portfolio: ExportSchemas.Portfolio.optional(),
  chatHistory: ExportSchemas.ChatHistory.optional(),
  jobSearchData: ExportSchemas.JobSearchData.optional(),
  metadata: z.object({
    appVersion: z.string().optional(),
    platform: z.string().optional(),
    totalItems: z.number().optional()
  }).optional()
});

export type NaviExportData = z.infer<typeof NaviExportSchema>;

/**
 * Export utilities
 */
export class NaviExporter {
  static createExport(data: Partial<NaviExportData>): NaviExportData {
    const exportData: NaviExportData = {
      version: getAppVersion(),
      exportDate: new Date().toISOString(),
      ...data,
      metadata: {
        appVersion: getAppVersion(),
        platform: typeof window !== 'undefined' ? 'web' : 'electron',
        totalItems: this.countItems(data),
        ...data.metadata
      }
    };

    return exportData;
  }

  static validateExport(data: unknown): { valid: boolean; data?: NaviExportData; errors?: string[] } {
    try {
      const validated = NaviExportSchema.parse(_data);
      return { valid: true, data: validated };
    } catch (_error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { valid: false, errors };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }

  static exportToBlob(data: NaviExportData, filename?: string): { blob: Blob; filename: string } {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const defaultFilename = `navi-cv-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    return {
      blob,
      filename: filename || defaultFilename
    };
  }

  static downloadExport(data: NaviExportData, filename?: string): void {
    const { blob, filename: finalFilename } = this.exportToBlob(data, filename);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.info('Export downloaded:', finalFilename);
  }

  private static countItems(data: Partial<NaviExportData>): number {
    let count = 0;
    
    if (data.user?.skills?.length) count += data.user.skills.length;
    if (data.user?.portfolio?.length) count += data.user.portfolio.length;
    if (data.resumeData?.experience?.length) count += data.resumeData.experience.length;
    if (data.resumeData?.education?.length) count += data.resumeData.education.length;
    if (data.resumeData?.projects?.length) count += data.resumeData.projects.length;
    if (data.portfolio?.items?.length) count += data.portfolio.items.length;
    if (data.chatHistory?.length) count += data.chatHistory.length;
    if (data.jobSearchData?.applications?.length) count += data.jobSearchData.applications.length;
    if (data.jobSearchData?.savedJobs?.length) count += data.jobSearchData.savedJobs.length;
    
    return count;
  }
}

/**
 * Import utilities
 */
export class NaviImporter {
  static async importFromFile(file: File): Promise<{ success: boolean; data?: NaviExportData; error?: string }> {
    try {
      const text = await this.readFileAsText(file);
      const parsed = JSON.parse(text);
      
      const validation = NaviExporter.validateExport(parsed);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Invalid export file: ${validation.errors?.join(', ')}` 
        };
      }
      
      logger.info('Import file validated successfully');
      return { success: true, data: validation.data };
      
    } catch (error) {
      logger.error('Import failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown import error' 
      };
    }
  }

  static async importFromJson(jsonString: string): Promise<{ success: boolean; data?: NaviExportData; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      
      const validation = NaviExporter.validateExport(parsed);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Invalid JSON: ${validation.errors?.join(', ')}` 
        };
      }
      
      return { success: true, data: validation.data };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format' 
      };
    }
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static migrateOldFormat(data: any): Partial<NaviExportData> {
    // Handle migration from older export formats
    if (data.version && data.version.startsWith('0.')) {
      logger.info('Migrating from legacy format:', data.version);
      
      // Convert old format to new format
      const migrated: Partial<NaviExportData> = {
        version: getAppVersion(),
        exportDate: data.exportDate || new Date().toISOString(),
        user: data.user,
        settings: data.settings,
        resumeData: data.resumeData,
        // Convert old portfolio format if needed
        portfolio: data.portfolio ? {
          items: Array.isArray(data.portfolio) ? data.portfolio : data.portfolio.items || [],
          settings: data.portfolio.settings || {}
        } : undefined,
        chatHistory: data.chatHistory,
        jobSearchData: data.jobSearchData
      };
      
      return migrated;
    }
    
    return data;
  }
}

/**
 * Specialized export functions for different data types
 */
export const ExportTypes = {
  resume: (resumeData: any) => NaviExporter.createExport({ resumeData }),
  portfolio: (portfolio: any) => NaviExporter.createExport({ portfolio }),
  settings: (settings: any) => NaviExporter.createExport({ settings }),
  userProfile: (user: any) => NaviExporter.createExport({ user }),
  complete: (allData: Partial<NaviExportData>) => NaviExporter.createExport(allData)
};

/**
 * Utility functions for UI components
 */
export const ExportHelpers = {
  getFileExtension: () => 'json',
  getDefaultFilename: (type: string = 'complete') => `navi-cv-${type}-${new Date().toISOString().split('T')[0]}.json`,
  getMimeType: () => 'application/json',
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default {
  NaviExporter,
  NaviImporter,
  ExportSchemas,
  ExportTypes,
  ExportHelpers
};