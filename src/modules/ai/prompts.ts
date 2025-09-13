// AI Prompts Module
// Centralized prompt templates for AI interactions

export const PROMPT_SYSTEM_PREFIX =
  "You are an AI career advisor specializing in gaming industry careers.";

export const DEFAULT_RESPONSE_FORMAT = {
  temperature: 0.7,
  maxTokens: 300,
  format: "text",
};

// Resume Enhancement Prompts
export const RESUME_PROMPTS = {
  analyze: `You are an expert gaming industry recruiter and AI career advisor. Analyze this resume for a gaming industry position.

Please provide:
1. Overall score (0-100)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Missing keywords for gaming industry
5. ATS optimization suggestions

Resume content:
{content}

Target job (if provided):
{jobDescription}

Respond in JSON format with structured analysis.`,

  enhance: `You are an AI career advisor specializing in gaming industry careers. Help improve this resume section:

Section: {section}
Current content: {content}
Target role: {targetRole}
User background: {userProfile}

Provide 3 specific enhancement suggestions:
1. Content improvements
2. Keyword optimization
3. Impact quantification

Focus on gaming industry terminology and measurable achievements.`,

  quantify: `Help quantify achievements in this resume bullet point for a gaming industry role:

Current: {bulletPoint}
Context: {jobContext}

Provide 3 variations that include specific metrics, percentages, or measurable impacts relevant to gaming industry roles.`,
};

// Cover Letter Prompts
export const COVER_LETTER_PROMPTS = {
  generate: `Write a compelling cover letter for this gaming industry position:

Job Title: {jobTitle}
Company: {company}
Job Description: {jobDescription}

Applicant Profile:
{userProfile}

Key Requirements to Address:
{keyRequirements}

Write a 3-paragraph cover letter that:
1. Shows passion for gaming and the specific company
2. Highlights relevant experience with specific examples
3. Demonstrates cultural fit and enthusiasm
4. Uses gaming industry terminology appropriately

Tone: Professional but passionate about games`,

  customize: `Customize this cover letter template for a specific gaming company:

Template: {template}
Company: {company}
Company Culture: {companyCulture}
Specific Role: {role}
User's Relevant Experience: {relevantExperience}

Adapt the language, examples, and tone to match this specific company's culture and values.`,
};

// Interview Preparation Prompts
export const INTERVIEW_PROMPTS = {
  questions: `Generate interview questions for a {role} position at a {companyType} gaming studio:

Role Level: {level}
Interview Type: {interviewType}
Focus Areas: {focusAreas}

Generate 10 relevant questions covering:
- Technical skills
- Gaming industry knowledge
- Cultural fit
- Problem-solving
- Team collaboration

Include difficulty level and expected answer themes for each question.`,

  feedback: `Analyze this interview response for a gaming industry position:

Question: {question}
Response: {response}
Target Role: {role}
Company Type: {companyType}

Provide feedback on:
1. Content quality and relevance
2. Gaming industry knowledge demonstration
3. Communication effectiveness
4. Areas for improvement
5. Score (1-10) with reasoning

Suggest 2-3 ways to improve the response.`,

  persona: `Act as a {role} interviewer from {company}. Your personality is {personality}.

Interview style: {interviewStyle}
Focus areas: {focusAreas}

Ask follow-up questions based on this response: {response}

Stay in character as the interviewer and ask 1-2 relevant follow-up questions.`,
};

// Job Matching Prompts
export const JOB_MATCHING_PROMPTS = {
  analyze: `Analyze job compatibility between this candidate profile and job posting:

Candidate Profile:
{candidateProfile}

Job Posting:
{jobPosting}

Provide a match analysis with:
1. Overall match score (0-100)
2. Skill alignments (specific matches)
3. Experience relevance
4. Missing qualifications
5. Development opportunities
6. Application strategy recommendations

Focus on gaming industry context and terminology.`,

  recommend: `Based on this user profile, recommend the most suitable gaming industry roles:

User Profile:
{userProfile}

Current Gaming Industry Trends:
{industryTrends}

Recommend 5 role types with:
1. Role title and typical responsibilities
2. Match percentage with user's profile
3. Skills to develop for better fit
4. Typical career progression
5. Company types that hire for these roles

Focus on realistic and achievable career transitions.`,
};

// Portfolio Optimization Prompts
export const PORTFOLIO_PROMPTS = {
  optimize: `Optimize this gaming portfolio project description:

Project: {projectTitle}
Current Description: {description}
Technologies Used: {technologies}
Target Audience: {targetAudience}
Role Applied For: {targetRole}

Improve the description to:
1. Highlight technical achievements
2. Quantify impact and results
3. Use gaming industry terminology
4. Show problem-solving skills
5. Demonstrate collaboration (if applicable)

Provide an enhanced description that's engaging and professional.`,

  structure: `Suggest the optimal structure for a gaming industry portfolio:

User's Role Focus: {roleFocus}
Experience Level: {experienceLevel}
Key Projects: {projectTypes}
Target Companies: {targetCompanies}

Recommend:
1. Portfolio sections and order
2. Projects to highlight for each section
3. Visual presentation suggestions
4. Technical details to emphasize
5. Call-to-action strategies for each project`,
};

// Skills Analysis Prompts
export const SKILLS_PROMPTS = {
  gap: `Identify skill gaps for this gaming industry career goal:

Current Skills: {currentSkills}
Target Role: {targetRole}
Experience Level: {experienceLevel}
Career Timeline: {timeline}

Identify:
1. Critical missing skills
2. Skills to improve
3. Learning path recommendations
4. Priority order (high/medium/low)
5. Estimated time to develop each skill
6. Recommended resources or courses

Focus on practical, achievable skill development.`,

  categorize: `Categorize and organize these skills for a gaming industry resume:

Skills List: {skillsList}
Target Role: {targetRole}

Organize into categories:
1. Technical Skills (programming, tools, engines)
2. Creative Skills (design, art, audio)
3. Industry Knowledge (platforms, trends, processes)
4. Soft Skills (teamwork, communication, problem-solving)
5. Specialized Knowledge (genre-specific, platform-specific)

Rate each skill's relevance to the target role (High/Medium/Low).`,
};

// System Prompts for Different Contexts
export const SYSTEM_PROMPTS = {
  resume:
    "You are an expert gaming industry career coach specializing in resume optimization. You understand gaming terminology, industry standards, and what recruiters look for in gaming candidates.",

  interview:
    "You are a seasoned gaming industry professional conducting interviews. You understand different studio cultures, technical requirements, and team dynamics in game development.",

  portfolio:
    "You are a gaming industry creative director and technical lead reviewing portfolios. You evaluate technical skill, creativity, problem-solving, and industry fit.",

  career:
    "You are a gaming industry career strategist with deep knowledge of career paths, industry trends, skill requirements, and market dynamics across all gaming disciplines.",

  general:
    "You are an AI assistant specializing in gaming industry careers. You provide practical, actionable advice while maintaining enthusiasm for games and game development.",
};

// Response Format Templates
export const RESPONSE_FORMATS = {
  analysis: {
    temperature: 0.3,
    maxTokens: 800,
    format: "json",
  },

  creative: {
    temperature: 0.8,
    maxTokens: 600,
    format: "text",
  },

  technical: {
    temperature: 0.2,
    maxTokens: 500,
    format: "structured",
  },

  conversational: {
    temperature: 0.7,
    maxTokens: 300,
    format: "text",
  },
};

// Gaming Industry Specific Constants
export const GAMING_INDUSTRY_CONTEXT = {
  engines: [
    "Unity",
    "Unreal Engine",
    "Godot",
    "GameMaker",
    "Construct",
    "RPG Maker",
  ],
  platforms: ["PC", "Console", "Mobile", "VR/AR", "Web", "Streaming"],
  genres: [
    "Action",
    "RPG",
    "Strategy",
    "Simulation",
    "Puzzle",
    "Casual",
    "Indie",
  ],
  roles: [
    "Game Designer",
    "Programmer",
    "Artist",
    "Producer",
    "QA Tester",
    "Audio Designer",
  ],
  companies: [
    "AAA Studio",
    "Indie Studio",
    "Mobile Games",
    "Publisher",
    "Platform Holder",
  ],
  skills: [
    "Game Design",
    "Programming",
    "3D Modeling",
    "Animation",
    "UI/UX",
    "Audio",
  ],
};
