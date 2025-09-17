import { z } from 'zod'

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(254, 'Email is too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

export const phoneSchema = z
  .string()
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional()

// User profile schemas
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s\-.]+$/, 'First name contains invalid characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s\-.]+$/, 'Last name contains invalid characters'),

  email: emailSchema,

  phone: phoneSchema,

  location: z
    .string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),

  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
})

// Career and work experience schemas
export const experienceSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title cannot exceed 100 characters'),

  company: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name cannot exceed 100 characters'),

  location: z
    .string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),

  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)')
    .optional()
    .or(z.literal('present')),

  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),

  achievements: z
    .array(z.string().max(200, 'Each achievement cannot exceed 200 characters'))
    .max(10, 'Cannot have more than 10 key achievements')
    .optional(),
})

// Education schema
export const educationSchema = z.object({
  institution: z
    .string()
    .min(1, 'Institution is required')
    .max(100, 'Institution name cannot exceed 100 characters'),

  degree: z
    .string()
    .min(1, 'Degree is required')
    .max(100, 'Degree cannot exceed 100 characters'),

  fieldOfStudy: z
    .string()
    .max(100, 'Field of study cannot exceed 100 characters')
    .optional(),

  startDate: z.string().regex(/^\d{4}$/, 'Invalid start year format'),

  endDate: z
    .string()
    .regex(/^\d{4}$/, 'Invalid end year format')
    .optional()
    .or(z.literal('present')),

  gpa: z
    .number()
    .min(0, 'GPA cannot be negative')
    .max(4.0, 'GPA cannot exceed 4.0')
    .optional(),
})

// Skills schema
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name cannot exceed 50 characters'),

  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),

  yearsOfExperience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50')
    .optional(),
})

// Job search preferences
export const jobSearchSchema = z.object({
  keywords: z
    .array(
      z
        .string()
        .min(1, 'Keywords cannot be empty')
        .max(50, 'Each keyword cannot exceed 50 characters')
    )
    .max(10, 'Cannot have more than 10 keywords')
    .optional(),

  locations: z
    .array(z.string().max(100, 'Each location cannot exceed 100 characters'))
    .max(5, 'Cannot have more than 5 locations')
    .optional(),

  remoteWork: z.enum(['remote', 'hybrid', 'onsite', 'any']),

  salaryRange: z
    .object({
      min: z.number().min(0, 'Minimum salary cannot be negative').optional(),
      max: z.number().min(0, 'Maximum salary cannot be negative').optional(),
      currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
    })
    .optional(),

  employmentType: z
    .array(
      z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship'])
    )
    .optional(),
})

// AI interaction schemas
export const aiPromptSchema = z.object({
  systemMessage: z
    .string()
    .max(2000, 'System message cannot exceed 2000 characters'),

  userMessage: z
    .string()
    .min(1, 'User message is required')
    .max(4000, 'User message cannot exceed 4000 characters'),

  context: z
    .object({
      resume: z.boolean().default(false),
      skills: z.boolean().default(false),
      portfolio: z.boolean().default(false),
      experience: z.boolean().default(false),
    })
    .optional(),

  temperature: z
    .number()
    .min(0, 'Temperature cannot be less than 0')
    .max(2, 'Temperature cannot exceed 2')
    .default(0.7),

  maxTokens: z
    .number()
    .min(50, 'Max tokens cannot be less than 50')
    .max(4000, 'Max tokens cannot exceed 4000')
    .default(1000),
})

// File upload schemas
export const fileUploadSchema = z.object({
  name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name cannot exceed 255 characters'),

  size: z
    .number()
    .min(1, 'File size must be greater than 0')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB

  type: z.string().regex(/^(application|image|text)\//, 'Invalid file type'),

  content: z.string().optional(), // Base64 encoded content
})

// Portfolio schemas
export const portfolioItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),

  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),

  url: z.string().url('Invalid URL format').optional(),

  technologies: z
    .array(z.string().max(30, 'Technology name cannot exceed 30 characters'))
    .max(20, 'Cannot have more than 20 technologies')
    .optional(),

  category: z.enum([
    'web-development',
    'mobile-development',
    'game-development',
    'data-science',
    'design',
    'other',
  ]),

  dateCompleted: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
})

// Settings schemas
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),

  notifications: z
    .object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      marketing: z.boolean().default(false),
    })
    .default({}),

  privacy: z
    .object({
      profileVisibility: z
        .enum(['public', 'private', 'connections'])
        .default('public'),
      dataSharing: z.boolean().default(false),
      analytics: z.boolean().default(true),
    })
    .default({}),

  ai: z
    .object({
      model: z
        .enum(['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'])
        .default('gemini-1.5-flash'),
      temperature: z.number().min(0).max(2).default(0.7),
      maxTokens: z.number().min(1).max(4096).default(1024),
    })
    .default({}),
})

// Validation utility functions
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean
  data?: T
  errors?: z.ZodIssue[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors,
      }
    }
    return { success: false, errors: [] }
  }
}

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  // Lightweight HTML entity escaping (DOMPurify available in project, but avoid DOM dependency here)
  const map: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return String(input).replace(/[&<>"'/]/g, ch => map[ch] || ch)
}

export function sanitizeSql(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '')
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (password.length >= 12) score += 1
  else feedback.push('Consider using 12+ characters for better security')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')

  if (/\d/.test(password)) score += 1
  else feedback.push('Include numbers')

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1
  else feedback.push('Include special characters')

  if (score >= 4) feedback.push('Good password strength')
  if (score >= 5) feedback.push('Strong password strength')
  if (score >= 6) feedback.push('Very strong password strength')

  return { score, feedback }
}
