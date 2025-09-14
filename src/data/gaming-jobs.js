/**
 * Gaming Industry Jobs Database
 * Real-world gaming job opportunities integrated with studios and skill mappings
 */

import { GAMING_STUDIOS } from './gaming-studios.js'
import { GAMING_TITLES } from './gaming-titles.js'

export const GAMING_JOBS = [
  // Epic Games Jobs
  {
    id: 'epic-senior-gameplay-programmer',
    title: 'Senior Gameplay Programmer - Fortnite',
    company: 'Epic Games',
    companyId: 'epic-games',
    location: 'Cary, NC',
    remote: false,
    hybrid: true,
    salary: { min: 140000, max: 190000, currency: 'USD' },
    description: 'Join the Fortnite team as a Senior Gameplay Programmer and help shape the future of the battle royale genre. You\'ll work on core gameplay systems, weapon mechanics, and player interactions that millions of players experience daily.',
    requirements: [
      '5+ years of C++ game development experience',
      'Experience with Unreal Engine 4/5',
      'Strong understanding of multiplayer systems',
      'Bachelor\'s degree in Computer Science or equivalent',
      'Shipped at least 2 commercial games',
      'Experience with performance optimization'
    ],
    technologies: ['C++', 'Unreal Engine', 'Blueprint', 'Perforce', 'Jenkins'],
    gamingTitles: ['fortnite'],
    careerSkills: ['Strategic Planning', 'Technical Problem Solving', 'Performance Optimization'],
    experienceLevel: 'Senior',
    type: 'Full-time',
    postedDate: '2025-09-01',
    featured: true,
    applicants: 89,
    matchScore: 95,
    benefits: ['Stock Options', 'Health Insurance', 'Unlimited PTO', 'Game Development Resources'],
    teamSize: '12-15 engineers',
    reportingTo: 'Lead Gameplay Programmer'
  },

  {
    id: 'riot-game-designer-valorant',
    title: 'Game Designer - VALORANT Competitive Systems',
    company: 'Riot Games',
    companyId: 'riot-games',
    location: 'Los Angeles, CA',
    remote: false,
    hybrid: true,
    salary: { min: 120000, max: 160000, currency: 'USD' },
    description: 'Design and balance competitive systems for VALORANT, the world\'s premier tactical shooter. Work on ranking systems, match-making, and competitive integrity features.',
    requirements: [
      '3+ years of game design experience',
      'Strong understanding of competitive gaming',
      'Experience with live service games',
      'Data-driven design approach',
      'Bachelor\'s degree preferred',
      'FPS game experience required'
    ],
    technologies: ['Unity', 'Riot\'s proprietary tools', 'SQL', 'Tableau', 'Python'],
    gamingTitles: ['valorant', 'counter-strike-2'],
    careerSkills: ['Tactical Planning', 'Strategic Analysis', 'Performance Under Pressure'],
    experienceLevel: 'Mid-Senior',
    type: 'Full-time',
    postedDate: '2025-08-28',
    featured: true,
    applicants: 156,
    matchScore: 88,
    benefits: ['Stock Purchase Plan', 'Health & Wellness', 'Professional Development', 'Gaming Sabbatical'],
    teamSize: '8-10 designers',
    reportingTo: 'Senior Game Designer'
  },

  {
    id: 'ea-live-ops-producer',
    title: 'Live Operations Producer - Apex Legends',
    company: 'Electronic Arts',
    companyId: 'electronic-arts',
    location: 'Redwood City, CA',
    remote: true,
    hybrid: true,
    salary: { min: 110000, max: 145000, currency: 'USD' },
    description: 'Lead live operations for Apex Legends, managing seasonal content, events, and community engagement. Drive player retention and monetization through data-driven decisions.',
    requirements: [
      '4+ years of live operations experience',
      'Experience with F2P games',
      'Strong analytical skills',
      'Project management experience',
      'Bachelor\'s degree or equivalent',
      'Battle royale game knowledge preferred'
    ],
    technologies: ['Jira', 'Confluence', 'Tableau', 'Excel', 'Git'],
    gamingTitles: ['apex-legends', 'fortnite'],
    careerSkills: ['Team Coordination', 'Strategic Planning', 'Data Analysis'],
    experienceLevel: 'Mid-Senior',
    type: 'Full-time',
    postedDate: '2025-08-30',
    featured: false,
    applicants: 67,
    matchScore: 82,
    benefits: ['Stock Purchase Plan', 'Flexible Work', 'Learning Stipend', 'Health Benefits'],
    teamSize: '6-8 team members',
    reportingTo: 'Senior Producer'
  },

  {
    id: 'valve-software-engineer',
    title: 'Software Engineer - Counter-Strike Platform',
    company: 'Valve Corporation',
    companyId: 'valve-corporation',
    location: 'Bellevue, WA',
    remote: false,
    hybrid: false,
    salary: { min: 160000, max: 220000, currency: 'USD' },
    description: 'Join Valve\'s flat organization as a Software Engineer working on Counter-Strike platform features. Shape the future of competitive gaming with innovative anti-cheat, matchmaking, and community features.',
    requirements: [
      '5+ years of software engineering experience',
      'Strong C++ and networking skills',
      'Experience with game engines',
      'Linux development experience',
      'Self-directed and collaborative',
      'Passion for gaming and Steam platform'
    ],
    technologies: ['C++', 'Source Engine', 'Linux', 'Python', 'OpenGL'],
    gamingTitles: ['counter-strike-2', 'dota-2'],
    careerSkills: ['Precision', 'Technical Excellence', 'Strategic Implementation'],
    experienceLevel: 'Senior',
    type: 'Full-time',
    postedDate: '2025-08-25',
    featured: true,
    applicants: 34,
    matchScore: 91,
    benefits: ['Profit Sharing', 'Flexible Work', 'Hardware Discounts', 'Travel Opportunities'],
    teamSize: '4-6 engineers',
    reportingTo: 'Self-directed (Flat org)'
  },

  {
    id: 'ubisoft-level-designer',
    title: 'Senior Level Designer - Assassin\'s Creed',
    company: 'Ubisoft Entertainment',
    companyId: 'ubisoft',
    location: 'Montreal, Canada',
    remote: false,
    hybrid: true,
    salary: { min: 85000, max: 115000, currency: 'CAD' },
    description: 'Design immersive historical environments for the next Assassin\'s Creed title. Create memorable gameplay experiences through innovative level design and environmental storytelling.',
    requirements: [
      '4+ years of level design experience',
      'Experience with open-world games',
      'Knowledge of Ubisoft tools',
      '3D modeling skills preferred',
      'Strong creative vision',
      'Historical knowledge a plus'
    ],
    technologies: ['Maya', 'Ubisoft proprietary tools', '3ds Max', 'Substance', 'Perforce'],
    gamingTitles: [],
    careerSkills: ['Creative Problem Solving', 'Spatial Reasoning', 'Historical Research'],
    experienceLevel: 'Senior',
    type: 'Full-time',
    postedDate: '2025-08-27',
    featured: false,
    applicants: 78,
    matchScore: 76,
    benefits: ['Health Benefits', 'Profit Sharing', 'Relocation Assistance', 'Flexible Hours'],
    teamSize: '10-12 designers',
    reportingTo: 'Lead Level Designer'
  },

  {
    id: 'naughty-dog-narrative-designer',
    title: 'Narrative Designer - New IP',
    company: 'Naughty Dog',
    companyId: 'naughty-dog',
    location: 'Santa Monica, CA',
    remote: false,
    hybrid: false,
    salary: { min: 100000, max: 140000, currency: 'USD' },
    description: 'Join Naughty Dog\'s acclaimed narrative team to craft compelling stories for our next groundbreaking IP. Work alongside industry legends to create emotionally resonant gaming experiences.',
    requirements: [
      '3+ years of narrative design experience',
      'Experience with branching dialogue',
      'Strong writing portfolio',
      'Knowledge of narrative structure',
      'Collaborative mindset',
      'Passion for character development'
    ],
    technologies: ['Proprietary tools', 'Final Draft', 'Articy', 'Maya', 'Perforce'],
    gamingTitles: [],
    careerSkills: ['Creative Expression', 'Character Development', 'Emotional Intelligence'],
    experienceLevel: 'Mid',
    type: 'Full-time',
    postedDate: '2025-08-26',
    featured: true,
    applicants: 123,
    matchScore: 85,
    benefits: ['Sony Benefits', 'Creative Freedom', 'Industry Recognition', 'Learning Opportunities'],
    teamSize: '4-6 writers',
    reportingTo: 'Narrative Director'
  },

  {
    id: 'cd-projekt-quest-designer',
    title: 'Senior Quest Designer - Cyberpunk IP',
    company: 'CD Projekt RED',
    companyId: 'cd-projekt-red',
    location: 'Warsaw, Poland',
    remote: false,
    hybrid: true,
    salary: { min: 65000, max: 85000, currency: 'USD' },
    description: 'Design intricate quest systems and branching narratives for Cyberpunk universe expansions. Create player choice-driven experiences with meaningful consequences.',
    requirements: [
      '4+ years of quest design experience',
      'Experience with RPG systems',
      'Strong narrative skills',
      'Knowledge of REDengine preferred',
      'Understanding of player psychology',
      'Fluent in English'
    ],
    technologies: ['REDengine', 'Lua', 'Python', '3ds Max', 'Perforce'],
    gamingTitles: [],
    careerSkills: ['Complex Problem Solving', 'Choice & Consequence Design', 'Player Psychology'],
    experienceLevel: 'Senior',
    type: 'Full-time',
    postedDate: '2025-08-24',
    featured: false,
    applicants: 97,
    matchScore: 79,
    benefits: ['Profit Sharing', 'Health Insurance', 'Game Copies', 'Flexible Work'],
    teamSize: '8-10 designers',
    reportingTo: 'Lead Quest Designer'
  },

  {
    id: 'unity-developer-relations',
    title: 'Developer Relations Engineer',
    company: 'Unity Technologies',
    companyId: 'unity-technologies',
    location: 'San Francisco, CA',
    remote: true,
    hybrid: true,
    salary: { min: 115000, max: 155000, currency: 'USD' },
    description: 'Bridge the gap between Unity\'s engineering teams and the global developer community. Create technical content, speak at conferences, and help developers succeed with Unity.',
    requirements: [
      '3+ years of Unity development experience',
      'Strong communication skills',
      'Technical writing experience',
      'Public speaking comfortable',
      'Community engagement experience',
      'Shipped Unity projects'
    ],
    technologies: ['Unity Engine', 'C#', 'JavaScript', 'Git', 'Various platforms'],
    gamingTitles: [],
    careerSkills: ['Communication', 'Technical Writing', 'Community Building'],
    experienceLevel: 'Mid',
    type: 'Full-time',
    postedDate: '2025-08-29',
    featured: false,
    applicants: 45,
    matchScore: 73,
    benefits: ['Stock Options', 'Remote Options', 'Learning Budget', 'Conference Travel'],
    teamSize: '12-15 DevRel team',
    reportingTo: 'DevRel Manager'
  },

  {
    id: 'supercell-mobile-developer',
    title: 'Senior Mobile Game Developer - Clash Team',
    company: 'Supercell',
    companyId: 'supercell',
    location: 'Helsinki, Finland',
    remote: false,
    hybrid: false,
    salary: { min: 90000, max: 125000, currency: 'EUR' },
    description: 'Join one of Supercell\'s small, autonomous teams working on the Clash franchise. Develop innovative mobile gaming experiences with a focus on long-term engagement.',
    requirements: [
      '4+ years of mobile game development',
      'Unity or native mobile development',
      'Experience with live service games',
      'Understanding of mobile monetization',
      'Data-driven development approach',
      'Team collaboration skills'
    ],
    technologies: ['Unity', 'C#', 'Python', 'AWS', 'Mobile platforms'],
    gamingTitles: [],
    careerSkills: ['Mobile Strategy', 'Long-term Planning', 'Player Engagement'],
    experienceLevel: 'Senior',
    type: 'Full-time',
    postedDate: '2025-08-23',
    featured: true,
    applicants: 67,
    matchScore: 87,
    benefits: ['Profit Sharing', 'Flexible Work', 'Health Benefits', 'Relocation Support'],
    teamSize: '6-8 developers',
    reportingTo: 'Team Lead'
  },

  {
    id: 'mihoyo-character-artist',
    title: '3D Character Artist - Genshin Impact',
    company: 'miHoYo',
    companyId: 'mihoyo',
    location: 'Shanghai, China',
    remote: false,
    hybrid: false,
    salary: { min: 70000, max: 95000, currency: 'USD' },
    description: 'Create stunning anime-style characters for Genshin Impact\'s ever-expanding roster. Work with cutting-edge technology to bring beloved characters to life.',
    requirements: [
      '3+ years of 3D character modeling',
      'Strong anime/manga art style knowledge',
      'Experience with PBR workflows',
      'Maya and ZBrush proficiency',
      'Understanding of mobile optimization',
      'Portfolio showcasing character work'
    ],
    technologies: ['Maya', 'ZBrush', 'Substance Painter', 'Unity', 'Photoshop'],
    gamingTitles: [],
    careerSkills: ['Creative Expression', 'Attention to Detail', 'Anime Culture Knowledge'],
    experienceLevel: 'Mid',
    type: 'Full-time',
    postedDate: '2025-08-31',
    featured: false,
    applicants: 189,
    matchScore: 81,
    benefits: ['Competitive Salary', 'Health Coverage', 'Gaming Perks', 'Stock Options'],
    teamSize: '15-20 artists',
    reportingTo: 'Art Director'
  },

  // Additional Mid-level and Entry-level positions
  {
    id: 'indie-studio-gameplay-programmer',
    title: 'Gameplay Programmer',
    company: 'Hollow Ponds Studio',
    companyId: 'hollow-ponds',
    location: 'Remote',
    remote: true,
    hybrid: false,
    salary: { min: 60000, max: 80000, currency: 'USD' },
    description: 'Join our small indie team creating innovative gameplay experiences. Work directly with designers to prototype and implement creative game mechanics.',
    requirements: [
      '2+ years of game programming experience',
      'Unity or Unreal Engine experience',
      'Strong C# or C++ skills',
      'Indie game development experience',
      'Self-motivated and independent',
      'Passion for innovative gameplay'
    ],
    technologies: ['Unity', 'C#', 'Git', 'Visual Studio'],
    gamingTitles: [],
    careerSkills: ['Innovation', 'Independent Work', 'Rapid Prototyping'],
    experienceLevel: 'Mid',
    type: 'Full-time',
    postedDate: '2025-09-02',
    featured: false,
    applicants: 23,
    matchScore: 71,
    benefits: ['Flexible Hours', 'Revenue Share', 'Creative Freedom', 'Remote Work'],
    teamSize: '3-5 developers',
    reportingTo: 'Studio Lead'
  },

  {
    id: 'entry-qa-tester',
    title: 'Junior QA Game Tester',
    company: 'Keywords Studios',
    companyId: 'keywords-studios',
    location: 'Austin, TX',
    remote: false,
    hybrid: true,
    salary: { min: 35000, max: 45000, currency: 'USD' },
    description: 'Begin your gaming career as a QA Tester working on AAA titles. Learn industry-standard testing practices while ensuring game quality and player experience.',
    requirements: [
      'High school diploma or equivalent',
      'Strong attention to detail',
      'Basic understanding of gaming',
      'Good communication skills',
      'Willingness to learn',
      'Gaming experience preferred'
    ],
    technologies: ['TestRail', 'Jira', 'Excel', 'Game consoles', 'PC gaming'],
    gamingTitles: [],
    careerSkills: ['Attention to Detail', 'Problem Documentation', 'Testing Methodologies'],
    experienceLevel: 'Entry',
    type: 'Full-time',
    postedDate: '2025-09-01',
    featured: false,
    applicants: 156,
    matchScore: 68,
    benefits: ['Health Insurance', 'Gaming Experience', 'Career Growth', 'Training Programs'],
    teamSize: '20-25 testers',
    reportingTo: 'QA Lead'
  }
];

export const JOB_CATEGORIES = {
  PROGRAMMING: [
    'Software Engineer', 'Game Programmer', 'Gameplay Programmer', 'Engine Programmer',
    'Graphics Programmer', 'Network Programmer', 'Tools Programmer', 'AI Programmer'
  ],
  DESIGN: [
    'Game Designer', 'Level Designer', 'Systems Designer', 'UX Designer',
    'Narrative Designer', 'Quest Designer', 'Monetization Designer'
  ],
  ART: [
    '3D Artist', 'Character Artist', 'Environment Artist', 'Concept Artist',
    'Technical Artist', 'Animator', 'VFX Artist', 'UI Artist'
  ],
  PRODUCTION: [
    'Producer', 'Product Manager', 'Project Manager', 'Scrum Master',
    'Live Operations Manager', 'Community Manager'
  ],
  BUSINESS: [
    'Business Developer', 'Marketing Manager', 'User Acquisition',
    'Analytics Manager', 'Monetization Specialist', 'Partnership Manager'
  ]
};

export const EXPERIENCE_LEVELS = {
  ENTRY: 'Entry Level (0-2 years)',
  MID: 'Mid Level (2-5 years)',
  SENIOR: 'Senior Level (5-8 years)',
  LEAD: 'Lead Level (8+ years)',
  PRINCIPAL: 'Principal Level (10+ years)'
};

export const SALARY_RANGES = {
  USD: {
    ENTRY: { min: 50000, max: 75000 },
    MID: { min: 75000, max: 120000 },
    SENIOR: { min: 120000, max: 180000 },
    LEAD: { min: 180000, max: 250000 }
  },
  EUR: {
    ENTRY: { min: 45000, max: 65000 },
    MID: { min: 65000, max: 100000 },
    SENIOR: { min: 100000, max: 150000 },
    LEAD: { min: 150000, max: 200000 }
  }
};

export const LOCATION_HUBS = [
  'San Francisco, CA', 'Los Angeles, CA', 'Seattle, WA', 'Austin, TX',
  'Montreal, Canada', 'London, UK', 'Stockholm, Sweden', 'Helsinki, Finland',
  'Tokyo, Japan', 'Shanghai, China', 'Remote', 'Hybrid'
];

// Helper functions
export function getJobsByStudio(studioId) {
  return GAMING_JOBS.filter(job => job.companyId === studioId);
}

export function getJobsBySkill(skillName) {
  return GAMING_JOBS.filter(job => 
    job.careerSkills.some(skill => 
      skill.toLowerCase().includes(skillName.toLowerCase())
    )
  );
}

export function getJobsByExperienceLevel(level) {
  return GAMING_JOBS.filter(job => job.experienceLevel === level);
}

export function getJobsBySalaryRange(min, max, currency = 'USD') {
  return GAMING_JOBS.filter(job => 
    job.salary.currency === currency && 
    job.salary.min >= min && 
    job.salary.max <= max
  );
}

export function getFeaturedJobs() {
  return GAMING_JOBS.filter(job => job.featured);
}

export function getRecentJobs(days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return GAMING_JOBS.filter(job => 
    new Date(job.postedDate) >= cutoff
  );
}

export default GAMING_JOBS;
