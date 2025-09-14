// Database Query Utilities
// Centralized query builders and data access patterns

import { db } from '../index'
import type {
  UserProfile,
  Resume,
  CoverLetter,
  Portfolio,
  JobSearch,
  InterviewSession,
  UserPreferences
} from '../models/index.ts'

// Generic query builders
export class QueryBuilder {
  private collection: string

  constructor(collection: string) {
    this.collection = collection
  }

  async findById(id: string): Promise<any | null> {
    return await db.get(`${this.collection}:${id}`)
  }

  async findAll(): Promise<any[]> {
    const keys = await db.keys(`${this.collection}:*`)
    const items = await Promise.all(
      keys.map((key: string) => db.get(key))
    )
    return items.filter(item => item !== null)
  }

  async findWhere(predicate: (item: any) => boolean): Promise<any[]> {
    const all = await this.findAll()
    return all.filter(predicate)
  }

  async create(data: any): Promise<any> {
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
    
    const id = data.id || getCrypto().randomUUID()
    const item = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await db.set(`${this.collection}:${id}`, item)
    return item
  }

  async update(id: string, updates: Partial<any>): Promise<any | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    await db.set(`${this.collection}:${id}`, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const key = `${this.collection}:${id}`
    const exists = await db.has(key)
    if (exists) {
      await db.delete(key)
      return true
    }
    return false
  }
}

// Specialized query classes
export class UserQueries extends QueryBuilder {
  constructor() {
    super('users')
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const users = await this.findAll()
    return users.find(user => user.email === email) || null
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    return await this.update(userId, updates)
  }
}

export class ResumeQueries extends QueryBuilder {
  constructor() {
    super('resumes')
  }

  async findByUserId(userId: string): Promise<Resume[]> {
    return await this.findWhere(resume => resume.userId === userId)
  }

  async findPublic(): Promise<Resume[]> {
    return await this.findWhere(resume => resume.isPublic)
  }

  async createForUser(userId: string, resumeData: Omit<Resume, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Resume> {
    return await this.create({ ...resumeData, userId })
  }
}

export class CoverLetterQueries extends QueryBuilder {
  constructor() {
    super('cover-letters')
  }

  async findByUserId(userId: string): Promise<CoverLetter[]> {
    return await this.findWhere(letter => letter.userId === userId)
  }

  async findByJob(jobId: string): Promise<CoverLetter[]> {
    return await this.findWhere(letter => letter.jobId === jobId)
  }

  async createForUser(userId: string, letterData: Omit<CoverLetter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<CoverLetter> {
    return await this.create({ ...letterData, userId })
  }
}

export class PortfolioQueries extends QueryBuilder {
  constructor() {
    super('portfolios')
  }

  async findByUserId(userId: string): Promise<Portfolio[]> {
    return await this.findWhere(portfolio => portfolio.userId === userId)
  }

  async findPublic(): Promise<Portfolio[]> {
    return await this.findWhere(portfolio => portfolio.isPublic)
  }

  async createForUser(userId: string, portfolioData: Omit<Portfolio, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Portfolio> {
    return await this.create({ ...portfolioData, userId })
  }
}

export class JobSearchQueries extends QueryBuilder {
  constructor() {
    super('job-searches')
  }

  async findByUserId(userId: string): Promise<JobSearch[]> {
    return await this.findWhere(search => search.userId === userId)
  }

  async findActive(userId: string): Promise<JobSearch[]> {
    return await this.findWhere(search => search.userId === userId && search.isActive)
  }

  async createForUser(userId: string, criteria: JobSearch['criteria']): Promise<JobSearch> {
    return await this.create({
      userId,
      criteria,
      results: [],
      isActive: true
    })
  }
}

export class InterviewQueries extends QueryBuilder {
  constructor() {
    super('interviews')
  }

  async findByUserId(userId: string): Promise<InterviewSession[]> {
    return await this.findWhere(session => session.userId === userId)
  }

  async findUpcoming(userId: string): Promise<InterviewSession[]> {
    const now = new Date()
    return await this.findWhere(session =>
      session.userId === userId &&
      session.status === 'scheduled' &&
      session.scheduledAt &&
      session.scheduledAt > now
    )
  }

  async findCompleted(userId: string): Promise<InterviewSession[]> {
    return await this.findWhere(session =>
      session.userId === userId &&
      session.status === 'completed'
    )
  }

  async createForUser(userId: string, sessionData: Omit<InterviewSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<InterviewSession> {
    return await this.create({ ...sessionData, userId })
  }
}

export class PreferencesQueries extends QueryBuilder {
  constructor() {
    super('preferences')
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const prefs = await this.findAll()
    return prefs.find(pref => pref.userId === userId) || null
  }

  async createForUser(userId: string, preferences: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserPreferences> {
    return await this.create({ ...preferences, userId })
  }
}

// Export query instances
export const userQueries = new UserQueries()
export const resumeQueries = new ResumeQueries()
export const coverLetterQueries = new CoverLetterQueries()
export const portfolioQueries = new PortfolioQueries()
export const jobSearchQueries = new JobSearchQueries()
export const interviewQueries = new InterviewQueries()
export const preferencesQueries = new PreferencesQueries()
