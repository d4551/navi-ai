/**
 * Shared Portfolio Types
 * Canonical interfaces for portfolio data used across exports, views, and services.
 */

export type PortfolioLinkType =
  | 'live'
  | 'source'
  | 'video'
  | 'article'
  | 'store'
  | 'itch'
  | 'steam'
  | 'docs'
  | 'other';

export interface PortfolioLink {
  label?: string;
  url: string;
  type?: PortfolioLinkType;
}

export type PortfolioMediaType = 'image' | 'video' | 'gif';

export interface PortfolioMedia {
  url: string;
  type?: PortfolioMediaType;
  caption?: string;
  alt?: string;
}

export interface PortfolioProject {
  id?: string;
  title: string;
  description: string;
  technologies?: string[];
  image?: string; // Can be URL or data URI
  liveUrl?: string;
  githubUrl?: string;
  links?: PortfolioLink[];
  media?: PortfolioMedia[];
  tags?: string[];
  featured?: boolean;
  date?: string; // ISO date string
  role?: string;
  responsibilities?: string[];
  outcomes?: string[];
  metrics?: Record<string, number | string>;
  // Optional gaming-specific metadata
  platforms?: string[];
  engines?: string[];
  genres?: string[];
}

export interface PortfolioMetadata {
  author?: string;
  title?: string;
  description?: string;
  website?: string;
  social?: Record<string, string>; // platform -> url
}

export interface PortfolioData {
  projects: PortfolioProject[];
  metadata?: PortfolioMetadata;
}

export type PortfolioExportFormat = 'pdf' | 'zip' | 'html' | 'json' | 'website';

export interface PortfolioExportOptions {
  template?: 'modern' | 'gaming' | 'minimal' | 'showcase';
  theme?: 'light' | 'dark' | 'gaming' | 'neon';
  includeImages?: boolean;
  includeSource?: boolean;
  includeReadme?: boolean;
  customCSS?: string;
  metadata?: PortfolioMetadata;
  includeAnalytics?: boolean;
  includeFeaturedOnly?: boolean;
}

export type PortfolioItemType = 'project' | 'game' | 'tool' | 'demo' | 'achievement' | 'clip' | 'other';

export interface PortfolioStats {
  totalItems: number;
  featuredItems: number;
  skillsCount: number;
  gamesCount: number;
  typeBreakdown: Record<PortfolioItemType, number>;
  topSkills: Array<{ skill: string; count: number }>;
  recentActivity: PortfolioItem[];
  // Additional computed properties for template compatibility
  totalProjects: number;
  totalClips: number;
  totalAchievements: number;
  featuredCount: number;
  recentItemsCount: number;
  completionRate: number;
  itemsByType: Record<string, number>;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type?: PortfolioItemType;
  game?: string;
  skills?: string[];
  date?: string;
  featured?: boolean;
  url?: string;
  thumbnail?: string;
  metrics?: Record<string, number | string>;
  createdAt?: string;
  updatedAt?: string;
  technologies?: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  responsibilities?: string[];
  outcomes?: string[];
  role?: string;
  platforms?: string[];
  engines?: string[];
  genres?: string[];
  links?: PortfolioLink[];
  media?: PortfolioMedia[];
  tags?: string[];
}

export interface PortfolioFilters {
  search?: string;
  type?: PortfolioItemType;
  skills?: string[];
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PortfolioExportData {
  user: any;
  portfolio: PortfolioItem[];
  stats: PortfolioStats;
  exportedAt: string;
  settings: any;
}
