
import { GAMING_STUDIOS } from "./gaming-studios.js";
import { GAMING_TITLES } from "./gaming-titles.js";

export const GAMING_JOBS = [
  // Epic Games Jobs
  {
    id: "epic-senior-gameplay-programmer",
    title: "Senior Gameplay Programmer - Fortnite",
    company: "Epic Games",
    companyId: "epic-games",
    location: "Cary, NC",
    remote: false,
    hybrid: true,
    description:
      "Join the Fortnite team as a Senior Gameplay Programmer and help shape the future of the battle royale genre. You'll work on core gameplay systems, weapon mechanics, and player interactions that millions of players experience daily.",
    requirements: [
      "Strong understanding of multiplayer systems",
      "Bachelor's degree in Computer Science or equivalent",
      "Experience with performance optimization",
    ],
    technologies: ["C++", "Unreal Engine", "Blueprint", "Perforce", "Jenkins"],
    gamingTitles: ["fortnite"],
    careerSkills: [
      "Strategic Planning",
      "Technical Problem Solving",
      "Performance Optimization",
    ],
    experienceLevel: "Senior",
    type: "Full-time",
    featured: true,
    benefits: [
      "Stock Options",
      "Health Insurance",
      "Unlimited PTO",
      "Game Development Resources",
    ],
    reportingTo: "Lead Gameplay Programmer",
  },

  {
    id: "riot-game-designer-valorant",
    title: "Game Designer - VALORANT Competitive Systems",
    company: "Riot Games",
    companyId: "riot-games",
    location: "Los Angeles, CA",
    remote: false,
    hybrid: true,
    description:
      "Design and balance competitive systems for VALORANT, the world's premier tactical shooter. Work on ranking systems, match-making, and competitive integrity features.",
    requirements: [
      "Strong understanding of competitive gaming",
      "Experience with live service games",
      "Data-driven design approach",
      "Bachelor's degree preferred",
      "FPS game experience required",
    ],
    technologies: [
      "Unity",
      "Riot's proprietary tools",
      "SQL",
      "Tableau",
      "Python",
    ],
    careerSkills: [
      "Tactical Planning",
      "Strategic Analysis",
      "Performance Under Pressure",
    ],
    experienceLevel: "Mid-Senior",
    type: "Full-time",
    featured: true,
    benefits: [
      "Stock Purchase Plan",
      "Health & Wellness",
      "Professional Development",
      "Gaming Sabbatical",
    ],
    reportingTo: "Senior Game Designer",
  },

  {
    id: "ea-live-ops-producer",
    title: "Live Operations Producer - Apex Legends",
    company: "Electronic Arts",
    companyId: "electronic-arts",
    location: "Redwood City, CA",
    remote: true,
    hybrid: true,
    description:
      "Lead live operations for Apex Legends, managing seasonal content, events, and community engagement. Drive player retention and monetization through data-driven decisions.",
    requirements: [
      "Strong analytical skills",
      "Project management experience",
      "Bachelor's degree or equivalent",
      "Battle royale game knowledge preferred",
    ],
    technologies: ["Jira", "Confluence", "Tableau", "Excel", "Git"],
    gamingTitles: ["apex-legends", "fortnite"],
    careerSkills: ["Team Coordination", "Strategic Planning", "Data Analysis"],
    experienceLevel: "Mid-Senior",
    type: "Full-time",
    featured: false,
    benefits: [
      "Stock Purchase Plan",
      "Flexible Work",
      "Learning Stipend",
      "Health Benefits",
    ],
    reportingTo: "Senior Producer",
  },

  {
    id: "valve-software-engineer",
    title: "Software Engineer - Counter-Strike Platform",
    company: "Valve Corporation",
    companyId: "valve-corporation",
    location: "Bellevue, WA",
    remote: false,
    hybrid: false,
    description:
      "Join Valve's flat organization as a Software Engineer working on Counter-Strike platform features. Shape the future of competitive gaming with innovative anti-cheat, matchmaking, and community features.",
    requirements: [
      "Strong C++ and networking skills",
      "Experience with game engines",
      "Linux development experience",
      "Self-directed and collaborative",
      "Passion for gaming and Steam platform",
    ],
    technologies: ["C++", "Source Engine", "Linux", "Python", "OpenGL"],
    careerSkills: [
      "Precision",
      "Technical Excellence",
      "Strategic Implementation",
    ],
    experienceLevel: "Senior",
    type: "Full-time",
    featured: true,
    benefits: [
      "Profit Sharing",
      "Flexible Work",
      "Hardware Discounts",
      "Travel Opportunities",
    ],
    reportingTo: "Self-directed (Flat org)",
  },

  {
    id: "ubisoft-level-designer",
    title: "Senior Level Designer - Assassin's Creed",
    company: "Ubisoft Entertainment",
    companyId: "ubisoft",
    location: "Montreal, Canada",
    remote: false,
    hybrid: true,
    description:
      "Design immersive historical environments for the next Assassin's Creed title. Create memorable gameplay experiences through innovative level design and environmental storytelling.",
    requirements: [
      "Experience with open-world games",
      "Knowledge of Ubisoft tools",
      "Strong creative vision",
      "Historical knowledge a plus",
    ],
    technologies: [
      "Maya",
      "Ubisoft proprietary tools",
      "Substance",
      "Perforce",
    ],
    gamingTitles: [],
    careerSkills: [
      "Creative Problem Solving",
      "Spatial Reasoning",
      "Historical Research",
    ],
    experienceLevel: "Senior",
    type: "Full-time",
    featured: false,
    benefits: [
      "Health Benefits",
      "Profit Sharing",
      "Relocation Assistance",
      "Flexible Hours",
    ],
    reportingTo: "Lead Level Designer",
  },

  {
    id: "naughty-dog-narrative-designer",
    title: "Narrative Designer - New IP",
    company: "Naughty Dog",
    companyId: "naughty-dog",
    location: "Santa Monica, CA",
    remote: false,
    hybrid: false,
    description:
      "Join Naughty Dog's acclaimed narrative team to craft compelling stories for our next groundbreaking IP. Work alongside industry legends to create emotionally resonant gaming experiences.",
    requirements: [
      "Experience with branching dialogue",
      "Strong writing portfolio",
      "Knowledge of narrative structure",
      "Collaborative mindset",
      "Passion for character development",
    ],
    technologies: [
      "Proprietary tools",
      "Final Draft",
      "Articy",
      "Maya",
      "Perforce",
    ],
    gamingTitles: [],
    careerSkills: [
      "Creative Expression",
      "Character Development",
      "Emotional Intelligence",
    ],
    experienceLevel: "Mid",
    type: "Full-time",
    featured: true,
    benefits: [
      "Sony Benefits",
      "Creative Freedom",
      "Industry Recognition",
      "Learning Opportunities",
    ],
    reportingTo: "Narrative Director",
  },

  {
    id: "cd-projekt-quest-designer",
    title: "Senior Quest Designer - Cyberpunk IP",
    company: "CD Projekt RED",
    companyId: "cd-projekt-red",
    location: "Warsaw, Poland",
    remote: false,
    hybrid: true,
    description:
      "Design intricate quest systems and branching narratives for Cyberpunk universe expansions. Create player choice-driven experiences with meaningful consequences.",
    requirements: [
      "Experience with RPG systems",
      "Strong narrative skills",
      "Knowledge of REDengine preferred",
      "Understanding of player psychology",
      "Fluent in English",
    ],
    gamingTitles: [],
    careerSkills: [
      "Complex Problem Solving",
      "Choice & Consequence Design",
      "Player Psychology",
    ],
    experienceLevel: "Senior",
    type: "Full-time",
    featured: false,
    benefits: [
      "Profit Sharing",
      "Health Insurance",
      "Game Copies",
      "Flexible Work",
    ],
    reportingTo: "Lead Quest Designer",
  },

  {
    id: "unity-developer-relations",
    title: "Developer Relations Engineer",
    company: "Unity Technologies",
    companyId: "unity-technologies",
    location: "San Francisco, CA",
    remote: true,
    hybrid: true,
    description:
      "Bridge the gap between Unity's engineering teams and the global developer community. Create technical content, speak at conferences, and help developers succeed with Unity.",
    requirements: [
      "Strong communication skills",
      "Technical writing experience",
      "Public speaking comfortable",
      "Community engagement experience",
      "Shipped Unity projects",
    ],
    technologies: [
      "Unity Engine",
      "JavaScript",
      "Git",
      "Various platforms",
    ],
    gamingTitles: [],
    careerSkills: ["Communication", "Technical Writing", "Community Building"],
    experienceLevel: "Mid",
    type: "Full-time",
    featured: false,
    benefits: [
      "Stock Options",
      "Remote Options",
      "Learning Budget",
      "Conference Travel",
    ],
    reportingTo: "DevRel Manager",
  },

  {
    id: "supercell-mobile-developer",
    title: "Senior Mobile Game Developer - Clash Team",
    company: "Supercell",
    companyId: "supercell",
    location: "Helsinki, Finland",
    remote: false,
    hybrid: false,
    description:
      "Join one of Supercell's small, autonomous teams working on the Clash franchise. Develop innovative mobile gaming experiences with a focus on long-term engagement.",
    requirements: [
      "Unity or native mobile development",
      "Experience with live service games",
      "Understanding of mobile monetization",
      "Data-driven development approach",
      "Team collaboration skills",
    ],
    gamingTitles: [],
    careerSkills: [
      "Mobile Strategy",
      "Long-term Planning",
      "Player Engagement",
    ],
    experienceLevel: "Senior",
    type: "Full-time",
    featured: true,
    benefits: [
      "Profit Sharing",
      "Flexible Work",
      "Health Benefits",
      "Relocation Support",
    ],
    reportingTo: "Team Lead",
  },

  {
    id: "mihoyo-character-artist",
    company: "miHoYo",
    companyId: "mihoyo",
    location: "Shanghai, China",
    remote: false,
    hybrid: false,
    description:
      "Create stunning anime-style characters for Genshin Impact's ever-expanding roster. Work with cutting-edge technology to bring beloved characters to life.",
    requirements: [
      "Strong anime/manga art style knowledge",
      "Experience with PBR workflows",
      "Maya and ZBrush proficiency",
      "Understanding of mobile optimization",
      "Portfolio showcasing character work",
    ],
    technologies: ["Maya", "ZBrush", "Substance Painter", "Unity", "Photoshop"],
    gamingTitles: [],
    careerSkills: [
      "Creative Expression",
      "Attention to Detail",
      "Anime Culture Knowledge",
    ],
    experienceLevel: "Mid",
    type: "Full-time",
    featured: false,
    benefits: [
      "Competitive Salary",
      "Health Coverage",
      "Gaming Perks",
      "Stock Options",
    ],
    reportingTo: "Art Director",
  },

  // Additional Mid-level and Entry-level positions
  {
    id: "indie-studio-gameplay-programmer",
    title: "Gameplay Programmer",
    company: "Hollow Ponds Studio",
    companyId: "hollow-ponds",
    location: "Remote",
    remote: true,
    hybrid: false,
    description:
      "Join our small indie team creating innovative gameplay experiences. Work directly with designers to prototype and implement creative game mechanics.",
    requirements: [
      "Unity or Unreal Engine experience",
      "Indie game development experience",
      "Self-motivated and independent",
      "Passion for innovative gameplay",
    ],
    gamingTitles: [],
    careerSkills: ["Innovation", "Independent Work", "Rapid Prototyping"],
    experienceLevel: "Mid",
    type: "Full-time",
    featured: false,
    benefits: [
      "Flexible Hours",
      "Revenue Share",
      "Creative Freedom",
      "Remote Work",
    ],
    reportingTo: "Studio Lead",
  },

  {
    id: "entry-qa-tester",
    title: "Junior QA Game Tester",
    company: "Keywords Studios",
    companyId: "keywords-studios",
    location: "Austin, TX",
    remote: false,
    hybrid: true,
    description:
      "Begin your gaming career as a QA Tester working on AAA titles. Learn industry-standard testing practices while ensuring game quality and player experience.",
    requirements: [
      "High school diploma or equivalent",
      "Strong attention to detail",
      "Basic understanding of gaming",
      "Good communication skills",
      "Willingness to learn",
      "Gaming experience preferred",
    ],
    technologies: ["TestRail", "Jira", "Excel", "Game consoles", "PC gaming"],
    gamingTitles: [],
    careerSkills: [
      "Attention to Detail",
      "Problem Documentation",
      "Testing Methodologies",
    ],
    experienceLevel: "Entry",
    type: "Full-time",
    featured: false,
    benefits: [
      "Health Insurance",
      "Gaming Experience",
      "Career Growth",
      "Training Programs",
    ],
    reportingTo: "QA Lead",
  },
];

export const JOB_CATEGORIES = {
  PROGRAMMING: [
    "Software Engineer",
    "Game Programmer",
    "Gameplay Programmer",
    "Engine Programmer",
    "Graphics Programmer",
    "Network Programmer",
    "Tools Programmer",
    "AI Programmer",
  ],
  DESIGN: [
    "Game Designer",
    "Level Designer",
    "Systems Designer",
    "UX Designer",
    "Narrative Designer",
    "Quest Designer",
    "Monetization Designer",
  ],
  ART: [
    "Character Artist",
    "Environment Artist",
    "Concept Artist",
    "Technical Artist",
    "Animator",
    "VFX Artist",
    "UI Artist",
  ],
  PRODUCTION: [
    "Producer",
    "Product Manager",
    "Project Manager",
    "Scrum Master",
    "Live Operations Manager",
    "Community Manager",
  ],
  BUSINESS: [
    "Business Developer",
    "Marketing Manager",
    "User Acquisition",
    "Analytics Manager",
    "Monetization Specialist",
    "Partnership Manager",
  ],
};

export const EXPERIENCE_LEVELS = {
};

export const SALARY_RANGES = {
  USD: {
  },
  EUR: {
  },
};

export const LOCATION_HUBS = [
  "San Francisco, CA",
  "Los Angeles, CA",
  "Seattle, WA",
  "Austin, TX",
  "Montreal, Canada",
  "London, UK",
  "Stockholm, Sweden",
  "Helsinki, Finland",
  "Tokyo, Japan",
  "Shanghai, China",
  "Remote",
  "Hybrid",
];

  return GAMING_JOBS.filter((job) => job.companyId === studioId);
}

  return GAMING_JOBS.filter((job) =>
    job.careerSkills.some((skill) =>
      skill.toLowerCase().includes(skillName.toLowerCase()),
    ),
  );
}

  return GAMING_JOBS.filter((job) => job.experienceLevel === level);
}

  return GAMING_JOBS.filter(
    (job) =>
      job.salary.currency === currency &&
      job.salary.min >= min &&
      job.salary.max <= max,
  );
}

  return GAMING_JOBS.filter((job) => job.featured);
}

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return GAMING_JOBS.filter((job) => new Date(job.postedDate) >= cutoff);
}

export default GAMING_JOBS;
