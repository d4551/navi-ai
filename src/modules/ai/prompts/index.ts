// Centralized AI Prompts
// Single source of truth for all AI prompt templates

export interface PromptTemplate {
  systemPrompt: string
  userPrompt: string
  context?: Record<string, any>
}

// Resume-related prompts
export const resumePrompts = {
  generate: {
    systemPrompt: `You are an expert career counselor specializing in gaming industry resumes.
Create compelling, ATS-friendly resume content that highlights gaming expertise and transferable skills.`,
    userPrompt: `Generate a professional resume section for: {sectionType}

User Profile: {userProfile}
Current Role: {currentRole}
Current Company: {currentCompany}
Years Experience: {yearsExperience}
Links (LinkedIn/GitHub/Portfolio): {links}
Gaming Experience: {gamingExperience}
Target Role: {targetRole}

Focus on:
- Quantifiable achievements
- Gaming-specific skills transferrable to professional roles
- Industry-relevant technologies
- Leadership and collaboration experience`,
  },

  optimize: {
    systemPrompt: `You are a senior technical recruiter specializing in gaming to tech career transitions.
Optimize resume content for maximum impact and ATS compatibility.`,
    userPrompt: `Optimize this resume content: {content}

Target Industry: {targetIndustry}
Target Role: {targetRole}
Keywords to include: {keywords}

Ensure:
- Strong action verbs
- Measurable results
- Relevant technical skills
- Professional formatting`,
  },
}

// Cover letter prompts
export const coverLetterPrompts = {
  generate: {
    systemPrompt: `You are a professional career counselor specializing in gaming industry transitions.
Create compelling cover letters that bridge gaming experience to professional roles.`,
    userPrompt: `Write a cover letter for this position:

Job Title: {jobTitle}
Company: {company}
Job Description: {jobDescription}

My Background:
- Gaming Experience: {gamingExperience}
- Professional Skills: {professionalSkills}
- Key Achievements: {achievements}
- Current Role: {currentRole}
- Current Company: {currentCompany}
- Years Experience: {yearsExperience}
- Links: {links}

Make it:
- Personalized to the company
- Highlight transferable skills
- Professional yet engaging
- 3-4 paragraphs maximum`,
  },
}

// Job matching prompts
export const jobMatchingPrompts = {
  analyze: {
    systemPrompt: `You are an expert career matcher specializing in gaming to tech transitions.
Analyze job requirements and candidate profiles to find the best matches.`,
    userPrompt: `Analyze this job posting and candidate profile for compatibility:

Job Posting: {jobPosting}
Candidate Profile: {candidateProfile}
Current Role: {currentRole}
Current Company: {currentCompany}
Years Experience: {yearsExperience}
Links: {links}

Provide:
1. Match percentage (0-100)
2. Key matching skills
3. Missing skills to develop
4. Recommended next steps`,
  },
}

// Interview preparation prompts
export const interviewPrompts = {
  questions: {
    systemPrompt: `You are a senior interviewer for gaming/tech companies.
Generate relevant, challenging interview questions that assess both technical and soft skills.`,
    userPrompt: `Generate interview questions for: {jobTitle}

Company: {company}
Candidate Background: {candidateBackground}

Include:
- Technical questions
- Behavioral questions
- Gaming-specific scenarios
- Problem-solving exercises`,
  },

  feedback: {
    systemPrompt: `You are an expert interview coach.
Provide constructive feedback on interview performance and improvement suggestions.`,
    userPrompt: `Provide feedback on this interview response:

Question: {question}
Response: {response}
Job Title: {jobTitle}

Rate the response (1-10) and provide:
- Strengths
- Areas for improvement
- Suggested better response`,
  },
}

// Utility functions for prompt building
export const buildPrompt = (
  template: PromptTemplate,
  variables: Record<string, any>
): string => {
  let prompt = template.userPrompt

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value))
  })

  return prompt
}

export const getSystemPrompt = (type: string, subtype: string): string => {
  const promptGroups = {
    resumePrompts,
    coverLetterPrompts,
    jobMatchingPrompts,
    interviewPrompts,
  }
  const group = promptGroups[type as keyof typeof promptGroups]

  if (group && subtype in group) {
    const promptTemplate = group[
      subtype as keyof typeof group
    ] as PromptTemplate
    return promptTemplate.systemPrompt
  }

  return 'You are a helpful AI assistant.'
}
