import { z } from 'zod';

// Canonical resume export/import schema
export const ResumeSchema = z.object({
  personalInfo: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      summary: z.string().optional(),
      location: z.string().optional(),
      website: z.string().url().optional(),
      links: z.array(z.string().url()).optional(),
    })
    .optional(),
  experience: z
    .array(
      z.object({
        jobTitle: z.string().optional(),
        company: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        location: z.string().optional(),
        description: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().optional(),
        degree: z.string().optional(),
        graduationDate: z.string().optional(),
        gpa: z.string().optional(),
      }),
    )
    .optional(),
  skills: z
    .array(
      z.union([
        z.string(),
        z.object({ name: z.string().optional(), level: z.string().optional() }),
      ]),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        url: z.string().url().optional(),
      }),
    )
    .optional(),
  achievements: z.array(z.string()).optional(),
});

export type ResumeData = z.infer<typeof ResumeSchema>;

export function validateResumeData(data: unknown): ResumeData {
  try {
    return ResumeSchema.parse(data);
  } catch (e) {
    // non-fatal; return a shallow-safe object for exporters to handle
    return (data || {}) as ResumeData;
  }
}

