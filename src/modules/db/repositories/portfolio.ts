// Portfolio Repository - Database operations for portfolio management
// Centralized portfolio data persistence and project management

import { unifiedStorage } from '@/utils/storage';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'game' | 'web' | 'mobile' | 'tool' | 'other';
  status: 'completed' | 'in-progress' | 'planned' | 'archived';
  technologies: string[];
  role: string;
  teamSize?: number;
  duration?: {
    startDate: Date;
    endDate?: Date;
  };
  media: {
    screenshots?: string[];
    videos?: string[];
    demos?: string[];
  };
  links: {
    live?: string;
    github?: string;
    documentation?: string;
    store?: string;
  };
  achievements?: string[];
  challenges?: string[];
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: string;
  personalInfo: {
    name: string;
    title: string;
    bio: string;
    location?: string;
    email?: string;
    website?: string;
    social: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      artstation?: string;
      behance?: string;
    };
  };
  projects: PortfolioProject[];
  skills: {
    primary: string[];
    secondary: string[];
    tools: string[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    layout: 'grid' | 'masonry' | 'list';
    showContact: boolean;
    showSkills: boolean;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PortfolioRepository {
  private static readonly STORE_KEY = 'portfolio';
  private static readonly PROJECTS_KEY = 'portfolioProjects';
  private static readonly VERSIONS_KEY = 'portfolioVersions';

  static async get(): Promise<Portfolio | null> {
    const portfolio = await unifiedStorage.get(this.STORE_KEY);
    return portfolio || null;
  }

  static async create(portfolioData: Omit<Portfolio, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Promise<Portfolio> {
    // Generate ID using crypto or fallback
    const getCrypto = () => {
      if (typeof crypto !== 'undefined') {
        return crypto;
      }
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto;
      }
      // Fallback for environments without crypto
      return {
        randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      };
    };
    
    const portfolio: Portfolio = {
      ...portfolioData,
      id: getCrypto().randomUUID(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await unifiedStorage.set(this.STORE_KEY, portfolio);
    await this.saveVersion(portfolio);
    
    return portfolio;
  }

  static async update(updates: Partial<Portfolio>): Promise<Portfolio | null> {
    const current = await this.get();
    if (!current) return null;

    const updated: Portfolio = {
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
    await unifiedStorage.remove(this.PROJECTS_KEY);
    return true;
  }

  // Project management
  static async getProjects(): Promise<PortfolioProject[]> {
    const portfolio = await this.get();
    return portfolio?.projects || [];
  }

  static async getProject(id: string): Promise<PortfolioProject | null> {
    const projects = await this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  static async addProject(projectData: Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<PortfolioProject> {
    const portfolio = await this.get();
    if (!portfolio) throw new Error('No portfolio found');

    const projects = portfolio.projects;
    const maxOrder = Math.max(0, ...projects.map(p => p.order));
    
    // Generate ID using crypto or fallback  
    const getCrypto = () => {
      if (typeof crypto !== 'undefined') {
        return crypto;
      }
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto;
      }
      // Fallback for environments without crypto
      return {
        randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      };
    };
    
    const project: PortfolioProject = {
      ...projectData,
      id: getCrypto().randomUUID(),
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    projects.push(project);
    await this.update({ projects });
    
    return project;
  }

  static async updateProject(id: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject | null> {
    const portfolio = await this.get();
    if (!portfolio) return null;

    const projects = [...portfolio.projects];
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) return null;
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    await this.update({ projects });
    return projects[projectIndex];
  }

  static async deleteProject(id: string): Promise<boolean> {
    const portfolio = await this.get();
    if (!portfolio) return false;

    const projects = portfolio.projects.filter(p => p.id !== id);
    await this.update({ projects });
    
    return projects.length !== portfolio.projects.length;
  }

  static async reorderProjects(projectIds: string[]): Promise<void> {
    const portfolio = await this.get();
    if (!portfolio) return;

    const projects = [...portfolio.projects];
    
    // Update order based on position in array
    projectIds.forEach((id, index) => {
      const project = projects.find(p => p.id === id);
      if (project) {
        project.order = index;
        project.updatedAt = new Date();
      }
    });
    
    // Sort by order
    projects.sort((a, b) => a.order - b.order);
    
    await this.update({ projects });
  }

  static async getFeaturedProjects(): Promise<PortfolioProject[]> {
    const projects = await this.getProjects();
    return projects
      .filter(p => p.featured)
      .sort((a, b) => a.order - b.order);
  }

  // Version management
  static async getVersions(): Promise<Portfolio[]> {
    const versions = await unifiedStorage.get(this.VERSIONS_KEY);
    return Array.isArray(versions) ? versions : [];
  }

  static async saveVersion(portfolio: Portfolio): Promise<void> {
    const versions = await this.getVersions();
    versions.push(portfolio);
    
    // Keep only last 5 versions
    const recentVersions = versions.slice(-5);
    await unifiedStorage.set(this.VERSIONS_KEY, recentVersions);
  }

  // Export functionality
  static async export(format: 'pdf' | 'html' | 'json', options?: {
    includeImages?: boolean;
    projectIds?: string[];
  }): Promise<{
    format: string;
    data: string;
    filename: string;
    contentType: string;
  }> {
    const portfolio = await this.get();
    if (!portfolio) throw new Error('No portfolio found to export');

    let exportData = { ...portfolio };
    
    // Filter projects if specified
    if (options?.projectIds) {
      exportData.projects = portfolio.projects.filter(p => 
        options.projectIds!.includes(p.id)
      );
    }
    
    const filename = `portfolio.${format}`;
    const contentTypes = {
      'pdf': 'application/pdf',
      'html': 'text/html',
      'json': 'application/json'
    };

    return {
      format,
      data: JSON.stringify(exportData, null, 2),
      filename,
      contentType: contentTypes[format]
    };
  }
}