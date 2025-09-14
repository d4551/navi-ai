// Canonical DB module entrypoint
// Unified database layer with enhanced persistence utilities

export { unifiedStorage as db } from '@/utils/storage'
export { unifiedStorage } from '@/utils/storage'

// Repository exports for direct access
export { JobRepository } from './repositories/jobs';
export { ResumeRepository } from './repositories/resume';
export { PortfolioRepository } from './repositories/portfolio';
export { UserRepository } from './repositories/user';
export { StudioRepository } from './repositories/studios';

// Enhanced database utilities
export * from './models'
export * from './queries'
export * from './migrations'

// Schema exports
export type { Resume } from './repositories/resume';
export type { Portfolio, PortfolioProject } from './repositories/portfolio';
export type { UserProfile, UserSettings } from './repositories/user';
export type { StudioData } from './repositories/studios';

