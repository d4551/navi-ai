import type { GameStudio, InterviewSession } from "@/shared/types/interview";

export interface InterviewContextInput {
  studio?: Partial<GameStudio> | null;
  roleType?: string;
  experienceLevel?: string | number;
  difficulty?: string;
  focusAreas?: string[];
  persona?: any;
  session?: InterviewSession | null;
  userProfile?: Record<string, any> | null;
}

export function buildInterviewSystemContext(input: InterviewContextInput) {
  const lines: string[] = [];
  if (input.studio) {
    lines.push(`Studio: ${input.studio.name} (${input.studio.id})`);
    if (input.studio.category)
      lines.push(`Studio Category: ${input.studio.category}`);
    if (input.studio.region) lines.push(`Region: ${input.studio.region}`);
    if (input.studio.commonRoles?.length)
      lines.push(
        `Common Roles: ${input.studio.commonRoles.slice(0, 6).join(", ")}`,
      );
    if (input.studio.technologies?.length)
      lines.push(
        `Tech Stack: ${input.studio.technologies.slice(0, 8).join(", ")}`,
      );
  }
  if (input.roleType) lines.push(`Target Role: ${input.roleType}`);
  if (input.experienceLevel)
    lines.push(`Experience Level: ${input.experienceLevel}`);
  if (input.difficulty) lines.push(`Difficulty: ${input.difficulty}`);
  if (input.focusAreas?.length)
    lines.push(`Focus Areas: ${input.focusAreas.join(", ")}`);
  if (input.persona) {
    lines.push(
      `Interviewer Persona: ${input.persona.name} - ${input.persona.role}`,
    );
    if (input.persona.style)
      lines.push(
        `Interview Style: ${String(input.persona.style).slice(0, 160)}`,
      );
  }
  if (input.session?.currentQuestion) {
    const cq: any = input.session.currentQuestion;
    const topic = cq.topic || cq.category || cq.title || cq.id || "general";
    lines.push(`Current Question Topic: ${topic}`);
  }
  if (input.userProfile) {
    const { gamerTag, primarySkills, careerGoal } = input.userProfile as any;
    if (gamerTag) lines.push(`Candidate Gamer Tag: ${gamerTag}`);
    if (careerGoal) lines.push(`Career Goal: ${careerGoal}`);
    if (Array.isArray(primarySkills) && primarySkills.length)
      lines.push(`Primary Skills: ${primarySkills.slice(0, 8).join(", ")}`);
  }
  return lines.join("\n");
}

export function buildInterviewContextObject(input: InterviewContextInput) {
  return {
    studio: input.studio
      ? {
          id: input.studio.id,
          name: input.studio.name,
          category: input.studio.category,
        }
      : undefined,
    roleType: input.roleType,
    experienceLevel: input.experienceLevel,
    difficulty: input.difficulty,
    focusAreas: input.focusAreas,
    persona: input.persona
      ? {
          name: input.persona.name,
          role: input.persona.role,
          style: input.persona.style,
        }
      : undefined,
  };
}
