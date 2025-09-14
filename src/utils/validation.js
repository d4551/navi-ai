import { z } from "zod";
import validator from "validator";
import DOMPurify from "dompurify";

// Schema definitions using Zod for type-safe validation
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || validator.isMobilePhone(val, "any"),
      "Invalid phone number",
    ),
  location: z.string().optional(),
  linkedIn: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  summary: z
    .string()
    .max(500, "Summary must be under 500 characters")
    .optional(),
});

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z
    .array(z.string())
    .min(1, "At least one responsibility required"),
  skills: z.array(z.string()).optional().default([]),
});

export const EducationSchema = z.object({
  id: z.string().uuid(),
  degree: z.string().min(1, "Degree is required"),
  school: z.string().min(1, "School name is required"),
  location: z.string().optional(),
  graduationDate: z.string().optional(),
  gpa: z
    .string()
    .optional()
    .refine(
      (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 4.0),
      "GPA must be between 0.0 and 4.0",
    ),
  relevant: z.array(z.string()).optional().default([]),
});

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Skill name is required"),
  category: z.enum(["technical", "soft", "language", "certification"]),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
});

export const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  additionalExperience: z.array(ExperienceSchema).optional().default([]),
  projects: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        description: z.string(),
        technologies: z.array(z.string()),
        url: z.string().url().optional(),
      }),
    )
    .optional()
    .default([]),
});

// Validation utilities
export class ValidationService {
  static validatePersonalInfo(data) {
    return this.validate(PersonalInfoSchema, data);
  }

  static validateExperience(data) {
    return this.validate(ExperienceSchema, data);
  }

  static validateEducation(data) {
    return this.validate(EducationSchema, data);
  }

  static validateSkill(data) {
    return this.validate(SkillSchema, data);
  }

  static validateResume(data) {
    return this.validate(ResumeSchema, data);
  }

  static validate(schema, data) {
    try {
      const result = schema.parse(data);
      return { success: true, data: result, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          data: null,
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        };
      }
      return {
        success: false,
        data: null,
        errors: [{ field: "general", message: "Validation failed" }],
      };
    }
  }

  // Security utilities
  static sanitizeHtml(html) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li"],
      ALLOWED_ATTR: [],
    });
  }

  static sanitizeText(text) {
    if (typeof text !== "string") {
      return "";
    }
    return validator.escape(text.trim());
  }

  static validateEmail(email) {
    return validator.isEmail(email);
  }

  static validateUrl(url) {
    return validator.isURL(url, {
      protocols: ["http", "https"],
      require_protocol: true,
    });
  }

  static validatePhone(phone, locale = "any") {
    return validator.isMobilePhone(phone, locale);
  }

  // File validation
  static validateFileType(file, allowedTypes) {
    if (!file || !file.type) {
      return false;
    }
    return allowedTypes.includes(file.type);
  }

  static validateFileSize(file, maxSizeMB) {
    if (!file) {
      return false;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{0,15}$/,
  url: /^https?:\/\/.+\..+/,
  linkedIn: /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/,
  github: /^https?:\/\/(www\.)?github\.com\/.+/,
};

// Field validation functions
export const validateField = {
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === "") {
      return { success: false, errors: [`${fieldName} is required`] };
    }
    return { success: true, errors: [] };
  },

  email: (value) => {
    if (value && !VALIDATION_PATTERNS.email.test(value)) {
      return { success: false, errors: ["Please enter a valid email address"] };
    }
    return { success: true, errors: [] };
  },

  phone: (value) => {
    if (value && !validator.isMobilePhone(value, "any")) {
      return { success: false, errors: ["Please enter a valid phone number"] };
    }
    return { success: true, errors: [] };
  },

  url: (value) => {
    if (value && !VALIDATION_PATTERNS.url.test(value)) {
      return { success: false, errors: ["Please enter a valid URL"] };
    }
    return { success: true, errors: [] };
  },

  minLength: (value, min, fieldName) => {
    if (value && value.length < min) {
      return {
        success: false,
        errors: [`${fieldName} must be at least ${min} characters`],
      };
    }
    return { success: true, errors: [] };
  },

  maxLength: (value, max, fieldName) => {
    if (value && value.length > max) {
      return {
        success: false,
        errors: [`${fieldName} must be less than ${max} characters`],
      };
    }
    return { success: true, errors: [] };
  },
};

// Simple validation helpers (consolidated from store duplicates)
export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateRequired = (value) => value && value.trim().length > 0;

export default ValidationService;
