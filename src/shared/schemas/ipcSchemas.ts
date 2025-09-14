import { z } from 'zod';

export const aiTextRequestSchema = z.object({
  prompt: z.string().min(1),
  systemInstructions: z.string().optional(),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    topK: z.number().min(1).max(64).optional(),
    topP: z.number().min(0).max(1).optional(),
    maxTokens: z.number().min(16).max(16384).optional(),
    model: z.string().optional(),
  }).optional(),
});

export const skillExperienceEntrySchema = z.object({
  text: z.string().min(3),
  hours: z.number().min(0).max(100000).optional(),
  title: z.string().optional(),
});

export const skillMappingRequestSchema = z.object({
  experience: z.array(skillExperienceEntrySchema).min(1),
  options: z.object({
    targetRole: z.string().optional(),
    max: z.number().min(1).max(100).optional(),
  }).optional(),
});

export type AITextRequestPayload = z.infer<typeof aiTextRequestSchema>;
export type SkillMappingRequestPayload = z.infer<typeof skillMappingRequestSchema>;
