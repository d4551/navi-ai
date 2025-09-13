
export const GAMING_TITLES = [
  // Battle Royale & Competitive Shooters
  {
    id: "fortnite",
    title: "Fortnite",
    developer: "Epic Games",
    publisher: "Epic Games",
    genre: ["Battle Royale", "Shooter", "Building"],
    platforms: [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch",
      "Mobile",
      "Mac",
    ],
    competitiveScene: {
      professional: true,
      esportsEvents: ["Fortnite World Cup", "FNCS", "Cash Cups"],
      skillLevel: "High",
    },
    careerSkills: [
      "Strategic Planning",
      "Quick Decision Making",
      "Resource Management",
      "Adaptability",
      "Spatial Awareness",
      "Creative Problem Solving",
      "Time Management",
      "Competitive Analysis",
    ],
    jobMappings: [
      {
        skill: "Building Mechanics",
        maps_to: "Architecture/Design",
        relevance: "High",
      },
      {
        skill: "Resource Management",
        maps_to: "Project Management",
        relevance: "High",
      },
      {
        skill: "Quick Decision Making",
        maps_to: "Executive Leadership",
        relevance: "Medium",
      },
      {
        skill: "Creative Strategy",
        maps_to: "Game Design",
        relevance: "Very High",
      },
    ],
    complexity: "High",
    teamwork: "Medium",
    communication: "High",
  },

  {
    id: "valorant",
    title: "VALORANT",
    developer: "Riot Games",
    publisher: "Riot Games",
    genre: ["Tactical Shooter", "FPS"],
    platforms: ["PC"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["VCT Champions", "VCT Masters", "VCT Game Changers"],
      skillLevel: "Very High",
    },
    careerSkills: [
      "Tactical Planning",
      "Team Coordination",
      "Precise Execution",
      "Risk Assessment",
      "Communication",
      "Leadership",
      "Performance Under Pressure",
      "Strategic Analysis",
    ],
    jobMappings: [
      {
        skill: "Tactical Planning",
        maps_to: "Strategic Consulting",
        relevance: "Very High",
      },
      {
        skill: "Team Coordination",
        maps_to: "Project Management",
        relevance: "Very High",
      },
      {
        skill: "Risk Assessment",
        maps_to: "Financial Analysis",
        relevance: "High",
      },
      {
        skill: "Performance Under Pressure",
        maps_to: "Emergency Management",
        relevance: "High",
      },
    ],
    complexity: "Very High",
    teamwork: "Very High",
    communication: "Very High",
  },

  {
    id: "apex-legends",
    title: "Apex Legends",
    developer: "Respawn Entertainment",
    publisher: "Electronic Arts",
    genre: ["Battle Royale", "Hero Shooter"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["ALGS Championship", "ALGS Pro League"],
      skillLevel: "High",
    },
    careerSkills: [
      "Character Specialization",
      "Team Synergy",
      "Movement Optimization",
      "Situational Awareness",
      "Meta Understanding",
      "Positioning",
      "Team Communication",
      "Adaptation",
    ],
    jobMappings: [
      {
        skill: "Character Specialization",
        maps_to: "Role-based Consulting",
        relevance: "High",
      },
      {
        skill: "Team Synergy",
        maps_to: "Team Building",
        relevance: "Very High",
      },
      {
        skill: "Meta Understanding",
        maps_to: "Market Analysis",
        relevance: "High",
      },
      {
        skill: "Movement Optimization",
        maps_to: "Process Optimization",
        relevance: "Medium",
      },
    ],
    complexity: "High",
    teamwork: "Very High",
    communication: "High",
  },

  // MOBA & Strategy
  {
    id: "league-of-legends",
    title: "League of Legends",
    developer: "Riot Games",
    publisher: "Riot Games",
    genre: ["MOBA", "Strategy"],
    platforms: ["PC", "Mac"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["World Championship", "MSI", "LCS", "LEC", "LCK", "LPL"],
      skillLevel: "Very High",
    },
    careerSkills: [
      "Strategic Thinking",
      "Micro/Macro Management",
      "Team Coordination",
      "Resource Allocation",
      "Meta Analysis",
      "Leadership",
      "Adaptability",
      "Objective Control",
      "Vision Management",
      "Team Fighting",
    ],
    jobMappings: [
      {
        skill: "Micro/Macro Management",
        maps_to: "Operations Management",
        relevance: "Very High",
      },
      {
        skill: "Resource Allocation",
        maps_to: "Financial Planning",
        relevance: "Very High",
      },
      {
        skill: "Vision Management",
        maps_to: "Strategic Planning",
        relevance: "High",
      },
      {
        skill: "Team Fighting",
        maps_to: "Crisis Management",
        relevance: "High",
      },
      {
        skill: "Meta Analysis",
        maps_to: "Market Research",
        relevance: "Very High",
      },
    ],
    complexity: "Very High",
    teamwork: "Very High",
    communication: "Very High",
  },

  {
    developer: "Valve Corporation",
    publisher: "Valve Corporation",
    genre: ["MOBA", "Strategy"],
    platforms: ["PC", "Mac", "Linux"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["The International", "DPC Majors", "Regional Leagues"],
      skillLevel: "Extreme",
    },
    careerSkills: [
      "Complex Problem Solving",
      "Strategic Depth",
      "Pattern Recognition",
      "Economic Management",
      "Team Synergy",
      "Mechanical Skill",
      "Game Theory",
      "Risk Management",
    ],
    jobMappings: [
      {
        skill: "Complex Problem Solving",
        maps_to: "Systems Analysis",
        relevance: "Very High",
      },
      {
        skill: "Economic Management",
        maps_to: "Financial Analysis",
        relevance: "Very High",
      },
      {
        skill: "Game Theory",
        maps_to: "Strategic Consulting",
        relevance: "Very High",
      },
      {
        skill: "Pattern Recognition",
        maps_to: "Data Science",
        relevance: "High",
      },
    ],
    complexity: "Extreme",
    teamwork: "Very High",
    communication: "Very High",
  },

  // MMORPGs
  {
    id: "world-of-warcraft",
    title: "World of Warcraft",
    developer: "Blizzard Entertainment",
    publisher: "Activision Blizzard",
    genre: ["MMORPG", "Fantasy"],
    platforms: ["PC", "Mac"],
    competitiveScene: {
      professional: true,
      esportsEvents: [
        "Arena World Championship",
        "Mythic Dungeon International",
      ],
      skillLevel: "High",
    },
    careerSkills: [
      "Guild Leadership",
      "Raid Coordination",
      "Resource Management",
      "Long-term Planning",
      "Team Building",
      "Performance Optimization",
      "Community Management",
      "Conflict Resolution",
    ],
    jobMappings: [
      {
        skill: "Guild Leadership",
        maps_to: "Team Leadership",
        relevance: "Very High",
      },
      {
        skill: "Raid Coordination",
        maps_to: "Event Management",
        relevance: "Very High",
      },
      {
        skill: "Community Management",
        maps_to: "Community Relations",
        relevance: "Very High",
      },
      {
        skill: "Long-term Planning",
        maps_to: "Strategic Planning",
        relevance: "High",
      },
    ],
    complexity: "High",
    teamwork: "Very High",
    communication: "Very High",
  },

  {
    id: "final-fantasy-xiv",
    title: "Final Fantasy XIV",
    developer: "Square Enix",
    publisher: "Square Enix",
    genre: ["MMORPG", "Fantasy"],
    platforms: ["PC", "PlayStation", "Mac"],
    competitiveScene: {
      professional: false,
      esportsEvents: [],
      skillLevel: "Medium",
    },
    careerSkills: [
      "Role Specialization",
      "Team Coordination",
      "Patience",
      "Planning",
      "Community Building",
      "Creative Expression",
      "Problem Solving",
      "Attention to Detail",
    ],
    jobMappings: [
      {
        skill: "Role Specialization",
        maps_to: "Subject Matter Expert",
        relevance: "High",
      },
      {
        skill: "Creative Expression",
        maps_to: "Creative Design",
        relevance: "High",
      },
      {
        skill: "Attention to Detail",
        maps_to: "Quality Assurance",
        relevance: "Very High",
      },
      {
        skill: "Community Building",
        maps_to: "Community Management",
        relevance: "Very High",
      },
    ],
    complexity: "Medium",
    teamwork: "High",
    communication: "High",
  },

  // Competitive FPS
  {
    developer: "Valve Corporation",
    publisher: "Valve Corporation",
    genre: ["Tactical Shooter", "FPS"],
    platforms: ["PC", "Mac", "Linux"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["ESL Pro League", "IEM", "BLAST Premier", "PGL Majors"],
      skillLevel: "Very High",
    },
    careerSkills: [
      "Precision",
      "Team Coordination",
      "Strategic Planning",
      "Economic Management",
      "Pressure Management",
      "Communication",
      "Map Knowledge",
      "Tactical Execution",
    ],
    jobMappings: [
      {
        skill: "Precision",
        maps_to: "Quality Control",
        relevance: "Very High",
      },
      {
        skill: "Economic Management",
        maps_to: "Budget Management",
        relevance: "High",
      },
      {
        skill: "Tactical Execution",
        maps_to: "Project Execution",
        relevance: "Very High",
      },
      {
        skill: "Map Knowledge",
        maps_to: "Domain Expertise",
        relevance: "Medium",
      },
    ],
    complexity: "Very High",
    teamwork: "Very High",
    communication: "Very High",
  },

  // Fighting Games
  {
    developer: "Capcom",
    publisher: "Capcom",
    genre: ["Fighting"],
    platforms: ["PC", "PlayStation", "Xbox"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["Capcom Cup", "EVO", "Street Fighter League"],
      skillLevel: "Very High",
    },
    careerSkills: [
      "Frame Data Analysis",
      "Pattern Recognition",
      "Adaptation",
      "Mental Fortitude",
      "Precise Execution",
      "Mind Games",
      "Self-Improvement",
      "Individual Performance",
    ],
    jobMappings: [
      {
        skill: "Frame Data Analysis",
        maps_to: "Data Analysis",
        relevance: "High",
      },
      {
        skill: "Pattern Recognition",
        maps_to: "Market Analysis",
        relevance: "High",
      },
      {
        skill: "Mental Fortitude",
        maps_to: "Stress Management",
        relevance: "Very High",
      },
      {
        skill: "Self-Improvement",
        maps_to: "Professional Development",
        relevance: "Very High",
      },
    ],
    complexity: "Very High",
    teamwork: "Low",
    communication: "Low",
  },

  // Real-Time Strategy
  {
    title: "StarCraft II",
    developer: "Blizzard Entertainment",
    publisher: "Activision Blizzard",
    genre: ["RTS", "Strategy"],
    platforms: ["PC", "Mac"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["GSL", "IEM World Championship"],
      skillLevel: "Extreme",
    },
    careerSkills: [
      "Multitasking",
      "Resource Management",
      "Strategic Planning",
      "Micro Management",
      "Economic Optimization",
      "Risk Assessment",
      "Adaptation",
      "Performance Under Pressure",
    ],
    jobMappings: [
      {
        skill: "Multitasking",
        maps_to: "Executive Management",
        relevance: "Very High",
      },
      {
        skill: "Economic Optimization",
        maps_to: "Financial Optimization",
        relevance: "Very High",
      },
      {
        skill: "Micro Management",
        maps_to: "Operations Management",
        relevance: "Very High",
      },
      {
        skill: "Risk Assessment",
        maps_to: "Risk Analysis",
        relevance: "Very High",
      },
    ],
    complexity: "Extreme",
    teamwork: "Low",
    communication: "Medium",
  },

  // Simulation & Management
  {
    id: "cities-skylines",
    title: "Cities: Skylines",
    developer: "Colossal Order",
    publisher: "Paradox Interactive",
    genre: ["City Builder", "Simulation"],
    platforms: ["PC", "Mac", "Linux", "PlayStation", "Xbox", "Nintendo Switch"],
    competitiveScene: {
      professional: false,
      esportsEvents: [],
      skillLevel: "Medium",
    },
    careerSkills: [
      "Urban Planning",
      "Infrastructure Design",
      "Budget Management",
      "Long-term Planning",
      "Problem Solving",
      "Systems Thinking",
      "Creative Design",
      "Optimization",
    ],
    jobMappings: [
      {
        skill: "Urban Planning",
        maps_to: "Urban Planning",
        relevance: "Very High",
      },
      {
        skill: "Infrastructure Design",
        maps_to: "Civil Engineering",
        relevance: "Very High",
      },
      {
        skill: "Budget Management",
        maps_to: "Financial Planning",
        relevance: "Very High",
      },
      {
        skill: "Systems Thinking",
        maps_to: "Systems Analysis",
        relevance: "Very High",
      },
    ],
    complexity: "Medium",
    teamwork: "Low",
    communication: "Low",
  },

  // Creative & Sandbox
  {
    id: "minecraft",
    title: "Minecraft",
    developer: "Mojang Studios",
    publisher: "Microsoft",
    genre: ["Sandbox", "Survival", "Creative"],
    platforms: ["PC", "Mobile", "PlayStation", "Xbox", "Nintendo Switch"],
    competitiveScene: {
      professional: false,
      esportsEvents: ["Minecraft Championships"],
      skillLevel: "Medium",
    },
    careerSkills: [
      "Creative Problem Solving",
      "Architecture Design",
      "Project Planning",
      "Resource Management",
      "Collaboration",
      "Innovation",
      "Spatial Reasoning",
      "Documentation",
    ],
    jobMappings: [
      {
        skill: "Architecture Design",
        maps_to: "Architecture",
        relevance: "Very High",
      },
      {
        skill: "Creative Problem Solving",
        maps_to: "Innovation Consulting",
        relevance: "Very High",
      },
      {
        skill: "Project Planning",
        maps_to: "Project Management",
        relevance: "High",
      },
      {
        skill: "Spatial Reasoning",
        maps_to: "Engineering Design",
        relevance: "High",
      },
    ],
    complexity: "Medium",
    teamwork: "Medium",
    communication: "Medium",
  },

  // Sports & Racing
  {
    id: "rocket-league",
    title: "Rocket League",
    developer: "Psyonix",
    publisher: "Epic Games",
    genre: ["Sports", "Racing"],
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    competitiveScene: {
      professional: true,
      esportsEvents: ["RLCS World Championship", "RLCS Majors"],
      skillLevel: "High",
    },
    careerSkills: [
      "Precision Control",
      "Team Coordination",
      "Positioning",
      "Timing",
      "Mechanical Skill",
      "Quick Adaptation",
      "Spatial Awareness",
      "Pressure Performance",
    ],
    jobMappings: [
      {
        skill: "Precision Control",
        maps_to: "Quality Assurance",
        relevance: "High",
      },
      {
        skill: "Team Coordination",
        maps_to: "Team Management",
        relevance: "Very High",
      },
      { skill: "Timing", maps_to: "Project Scheduling", relevance: "High" },
      {
        skill: "Quick Adaptation",
        maps_to: "Change Management",
        relevance: "High",
      },
    ],
    complexity: "High",
    teamwork: "Very High",
    communication: "High",
  },
];

export const GENRE_CATEGORIES = {
  COMPETITIVE_MULTIPLAYER: [
    "Battle Royale",
    "MOBA",
    "Tactical Shooter",
    "FPS",
    "Fighting",
    "RTS",
  ],
  COOPERATIVE: ["MMORPG", "Co-op Shooter", "Team Strategy"],
  CREATIVE: ["Sandbox", "City Builder", "Simulation"],
  INDIVIDUAL_SKILL: ["Fighting", "RTS", "Racing", "Puzzle"],
  TEAM_BASED: ["MOBA", "Tactical Shooter", "Sports", "Battle Royale"],
};

export const SKILL_MAPPINGS = {
  LEADERSHIP: [
    "Guild Leadership",
    "Team Coordination",
    "Raid Coordination",
    "Shot Calling",
  ],
  PROJECT_MANAGEMENT: [
    "Resource Management",
    "Long-term Planning",
    "Economic Management",
    "Budget Management",
  ],
  ANALYTICAL: [
    "Meta Analysis",
    "Frame Data Analysis",
    "Pattern Recognition",
    "Strategic Analysis",
  ],
  COMMUNICATION: [
    "Team Communication",
    "Community Management",
    "Conflict Resolution",
    "Teaching",
  ],
  TECHNICAL: [
    "Precision Control",
    "Mechanical Skill",
    "Systems Thinking",
    "Optimization",
  ],
  CREATIVE: [
    "Creative Problem Solving",
    "Innovation",
    "Architecture Design",
    "Creative Design",
  ],
};

export const CAREER_RELEVANCE_LEVELS = {
  VERY_HIGH: [
    "Leadership roles",
    "Management positions",
    "Strategic consulting",
    "Team coordination",
  ],
  HIGH: [
    "Analytical roles",
    "Project management",
    "Technical positions",
    "Creative roles",
  ],
  LOW: ["Entry-level positions", "General roles"],
};

export const PROFESSIONAL_GAMING_TIERS = {
  TIER_A: ["Fortnite", "Apex Legends", "Rocket League", "StarCraft II"],
  TIER_C: ["Minecraft", "Cities: Skylines", "Final Fantasy XIV"],
};

export default GAMING_TITLES;
