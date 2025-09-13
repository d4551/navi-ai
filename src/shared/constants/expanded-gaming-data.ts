
export interface ExpandedGameStudio {
  id: string;
  name: string;
  logo?: string;
  founded: number;
  headquarters: string;
  locations: string[];
  size: "indie" | "small" | "medium" | "large" | "aaa";
  employeeCount: number;
  type: "developer" | "publisher" | "both" | "platform" | "service";
  platforms: Platform[];
  genres: GameGenre[];
  technologies: string[];
  remoteWork: boolean;
  workCulture: string[];
  benefits: string[];
  careerPrograms: string[];
  majorGames: MajorGame[];
  jobOpenings: JobOpening[];
  glassdoorRating?: number;
  website: string;
  careers?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    discord?: string;
    youtube?: string;
  };
  internships: boolean;
  diversityPrograms: string[];
  sustainability: boolean;
  crunchReputation: "low" | "medium" | "high";
  learningOpportunities: string[];
}

export interface MajorGame {
  name: string;
  year: number;
  platforms: Platform[];
  genre: GameGenre;
  metacriticScore?: number;
  salesMillion?: number;
  awards?: string[];
}

export interface JobOpening {
  title: string;
  department: string;
  level: "junior" | "mid" | "senior" | "lead" | "director";
  location: string;
  remote: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  skills: string[];
  posted: string;
  urgent: boolean;
}

export type Platform =
  | "PC"
  | "Steam"
  | "Epic"
  | "GOG"
  | "PlayStation"
  | "Xbox"
  | "Xbox Series X|S"
  | "Xbox One"
  | "Nintendo Switch"
  | "iOS"
  | "Android"
  | "Mobile"
  | "VR"
  | "Oculus"
  | "PSVR"
  | "Steam VR"
  | "Web"
  | "Browser"
  | "Arcade"
  | "Console";

export type GameGenre =
  | "Action"
  | "Adventure"
  | "RPG"
  | "Strategy"
  | "Simulation"
  | "Sports"
  | "Racing"
  | "Fighting"
  | "Platformer"
  | "Puzzle"
  | "Horror"
  | "Survival"
  | "Battle Royale"
  | "MOBA"
  | "MMO"
  | "FPS"
  | "TPS"
  | "RTS"
  | "Turn-Based"
  | "Real-Time"
  | "Indie"
  | "Casual"
  | "Educational"
  | "Music"
  | "Dance"
  | "VR"
  | "AR"
  | "Social"
  | "Party"
  | "Card"
  | "Board";

export const EXPANDED_GAMING_STUDIOS: Record<string, ExpandedGameStudio> = {
  // Major AAA Studios
  epic_games: {
    id: "epic_games",
    name: "Epic Games",
    logo: "/logos/epic-games.png",
    headquarters: "Cary, North Carolina, USA",
    locations: [
      "Cary, NC",
      "Seattle, WA",
      "Los Angeles, CA",
      "Montreal, Canada",
      "Berlin, Germany",
      "Seoul, South Korea",
    ],
    size: "aaa",
    type: "both",
    platforms: [
      "PC",
      "PlayStation",
      "Xbox",
      "Nintendo Switch",
      "iOS",
      "Android",
      "VR",
    ],
    genres: ["Action", "Battle Royale", "Adventure"],
    technologies: [
      "C++",
      "Blueprint",
      "MetaHuman",
      "Lumen",
      "Nanite",
    ],
    remoteWork: true,
    workCulture: [
      "Innovation",
      "Creativity",
      "Collaboration",
      "Work-Life Balance",
    ],
    benefits: [
      "Health Insurance",
      "Flexible PTO",
      "Game Development Tools",
      "Learning Stipend",
    ],
    careerPrograms: [
      "Early Career Program",
      "Mentorship Program",
      "Leadership Development",
    ],
    majorGames: [
      {
        name: "Fortnite",
        platforms: [
          "PC",
          "PlayStation",
          "Xbox",
          "Nintendo Switch",
          "iOS",
          "Android",
        ],
        genre: "Battle Royale",
      },
      {
        name: "Gears of War",
        platforms: ["Xbox", "PC"],
        genre: "Action",
      },
      {
        name: "Unreal Tournament",
        platforms: ["PC"],
        genre: "FPS",
      },
    ],
    jobOpenings: [
      {
        title: "Senior Game Designer",
        department: "Game Design",
        level: "senior",
        location: "Cary, NC",
        remote: true,
        requirements: [
          "Unreal Engine experience",
          "Live service games",
        ],
        skills: ["Game Design", "Unreal Engine", "Scripting", "Balancing"],
        urgent: true,
      },
      {
        title: "Unreal Engine Developer",
        department: "Engineering",
        level: "mid",
        location: "Seattle, WA",
        remote: false,
        requirements: [
          "Unreal Engine experience",
          "Graphics programming",
        ],
        skills: ["C++", "Unreal Engine", "Graphics", "Optimization"],
        urgent: false,
      },
    ],
    website: "https://www.epicgames.com",
    careers: "https://www.epicgames.com/site/en-US/careers",
    socialLinks: {
      twitter: "@EpicGames",
      linkedin: "epic-games",
      discord: "Epic Games",
      youtube: "EpicGames",
    },
    internships: true,
    diversityPrograms: [
      "Diversity & Inclusion Council",
      "Mentorship for Underrepresented Groups",
      "Inclusive Hiring Practices",
    ],
    sustainability: true,
    crunchReputation: "medium",
    learningOpportunities: [
      "Unreal Engine Training",
      "GDC Conference",
      "Internal Tech Talks",
      "Cross-Department Shadowing",
    ],
  },

  riot_games: {
    id: "riot_games",
    name: "Riot Games",
    logo: "/logos/riot-games.png",
    headquarters: "Los Angeles, California, USA",
    locations: [
      "Los Angeles, CA",
      "Berlin, Germany",
      "Dublin, Ireland",
      "Hong Kong",
      "Seoul, South Korea",
      "Shanghai, China",
    ],
    size: "aaa",
    type: "developer",
    platforms: ["PC", "Mobile", "Console"],
    genres: ["MOBA", "FPS", "Strategy", "Fighting", "Card"],
    remoteWork: true,
    workCulture: [
      "Player Focus",
      "Innovation",
      "Competitive Excellence",
      "Global Mindset",
    ],
    benefits: [
      "Comprehensive Health",
      "Unlimited PTO",
      "Employee Stock Program",
      "Gaming Allowance",
      "Wellness Programs",
    ],
    careerPrograms: [
      "Riot Academy",
      "Leadership Path",
      "Technical Track",
    ],
    majorGames: [
      {
        name: "League of Legends",
        platforms: ["PC"],
        genre: "MOBA",
      },
      {
        name: "Valorant",
        platforms: ["PC"],
        genre: "FPS",
      },
      {
        name: "Teamfight Tactics",
        platforms: ["PC", "Mobile"],
        genre: "Strategy",
      },
      {
        name: "Legends of Runeterra",
        platforms: ["PC", "Mobile"],
        genre: "Card",
      },
    ],
    jobOpenings: [
      {
        title: "Senior Software Engineer - Valorant",
        department: "Engineering",
        level: "senior",
        location: "Los Angeles, CA",
        remote: false,
        requirements: [
          "FPS game experience",
          "Anti-cheat systems",
        ],
        skills: [
          "C++",
          "Network Programming",
          "Game Security",
          "Performance Optimization",
        ],
        urgent: true,
      },
    ],
    website: "https://www.riotgames.com",
    careers: "https://www.riotgames.com/en/work-with-us",
    socialLinks: {
      twitter: "@riotgames",
      linkedin: "riot-games",
      youtube: "riotgames",
    },
    internships: true,
    diversityPrograms: [
      "Riot Diversity Initiative",
      "Women in Gaming",
      "LGBTQ+ Alliance",
      "Inclusion Champions",
    ],
    sustainability: true,
    crunchReputation: "low",
    learningOpportunities: [
      "Tech Talks",
      "Game Jams",
      "Conference Sponsorship",
      "Skill Development Stipend",
    ],
  },

  blizzard: {
    id: "blizzard",
    name: "Blizzard Entertainment",
    logo: "/logos/blizzard.png",
    headquarters: "Irvine, California, USA",
    locations: [
      "Irvine, CA",
      "Austin, TX",
      "Albany, NY",
      "Shanghai, China",
      "Versailles, France",
    ],
    size: "aaa",
    type: "developer",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    genres: ["Action", "RPG", "Strategy", "FPS", "MMO"],
    technologies: [
      "C++",
      "Python",
      "Lua",
      "Custom Engines",
      "Battle.net",
    ],
    remoteWork: true,
    workCulture: [
      "Gameplay First",
      "Commit to Quality",
      "Play Nice; Play Fair",
      "Embrace Your Inner Geek",
    ],
    benefits: [
      "Medical/Dental/Vision",
      "Game Credits",
      "Free Games",
      "Fitness Center",
      "On-site Dining",
    ],
    careerPrograms: [
      "Blizzard College Program",
      "Leadership Training",
      "Cross-Team Collaboration",
    ],
    majorGames: [
      {
        name: "World of Warcraft",
        platforms: ["PC"],
        genre: "MMO",
      },
      {
        name: "Overwatch",
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        genre: "FPS",
      },
      {
        name: "Diablo IV",
        platforms: ["PC", "PlayStation", "Xbox"],
        genre: "RPG",
      },
      {
        name: "StarCraft II",
        platforms: ["PC"],
        genre: "Strategy",
      },
    ],
    jobOpenings: [
      {
        department: "Art",
        level: "senior",
        location: "Irvine, CA",
        remote: false,
        requirements: [
          "Game art pipeline",
        ],
        urgent: false,
      },
    ],
    website: "https://www.blizzard.com",
    careers: "https://careers.blizzard.com",
    internships: true,
    diversityPrograms: [
      "Call of Duty Endowment",
      "Women at Blizzard",
      "Pride Alliance",
    ],
    sustainability: false,
    crunchReputation: "medium",
    learningOpportunities: [
      "BlizzCon",
      "Game Development Courses",
      "Art Workshops",
      "Technical Seminars",
    ],
  },

  // Indie/Mid-Size Studios
  supergiant_games: {
    id: "supergiant_games",
    name: "Supergiant Games",
    logo: "/logos/supergiant.png",
    headquarters: "San Francisco, California, USA",
    locations: ["San Francisco, CA", "Remote"],
    size: "small",
    type: "developer",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    genres: ["Action", "RPG", "Indie"],
    remoteWork: true,
    workCulture: [
      "Creative Freedom",
      "Small Team Collaboration",
      "Quality over Quantity",
      "Work-Life Balance",
    ],
    benefits: [
      "Health Insurance",
      "Flexible Schedule",
      "Profit Sharing",
      "Creative Input",
    ],
    careerPrograms: ["Mentorship", "Cross-Discipline Learning"],
    majorGames: [
      {
        name: "Hades",
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        genre: "Action",
      },
      {
        name: "Bastion",
        platforms: ["PC", "Xbox"],
        genre: "Action",
      },
      {
        name: "Transistor",
        platforms: ["PC", "PlayStation"],
        genre: "Action",
      },
      {
        name: "Pyre",
        platforms: ["PC", "PlayStation"],
        genre: "RPG",
      },
    ],
    jobOpenings: [],
    website: "https://www.supergiantgames.com",
    socialLinks: {
      twitter: "@SupergiantGames",
    },
    internships: false,
    diversityPrograms: ["Inclusive Culture", "Equal Opportunity"],
    sustainability: true,
    crunchReputation: "low",
    learningOpportunities: [
      "Cross-Training",
      "Industry Conferences",
      "Creative Workshops",
    ],
  },

  team_cherry: {
    id: "team_cherry",
    name: "Team Cherry",
    logo: "/logos/team-cherry.png",
    headquarters: "Adelaide, Australia",
    locations: ["Adelaide, Australia", "Remote"],
    size: "indie",
    type: "developer",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    genres: ["Platformer", "Action", "Indie"],
    remoteWork: true,
    workCulture: ["Artistic Vision", "Perfectionism", "Independent Spirit"],
    benefits: ["Creative Control", "Flexible Hours", "Profit Sharing"],
    careerPrograms: [],
    majorGames: [
      {
        name: "Hollow Knight",
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        genre: "Platformer",
      },
    ],
    jobOpenings: [],
    website: "http://teamcherry.com.au",
    internships: false,
    diversityPrograms: [],
    sustainability: false,
    crunchReputation: "low",
    learningOpportunities: ["Self-Directed Learning", "Art Communities"],
  },

  // Mobile/Social Game Studios
  king: {
    id: "king",
    name: "King (Activision)",
    logo: "/logos/king.png",
    headquarters: "London, United Kingdom",
    locations: [
      "London, UK",
      "Stockholm, Sweden",
      "Barcelona, Spain",
      "Berlin, Germany",
      "Tel Aviv, Israel",
    ],
    size: "aaa",
    type: "developer",
    platforms: ["Mobile", "Web"],
    genres: ["Casual", "Puzzle", "Social"],
    remoteWork: true,
    workCulture: [
      "Data-Driven",
      "Global Collaboration",
      "Innovation",
    ],
    benefits: [
      "Health Insurance",
      "Stock Options",
      "Free Snacks",
      "Game Development Budget",
    ],
    careerPrograms: [
      "Graduate Program",
      "Leadership Academy",
      "Cross-Studio Exchange",
    ],
    majorGames: [
      {
        name: "Candy Crush Saga",
        platforms: ["Mobile", "Web"],
        genre: "Puzzle",
      },
      {
        name: "Farm Heroes Saga",
        platforms: ["Mobile"],
        genre: "Puzzle",
      },
      {
        name: "Bubble Witch Saga",
        platforms: ["Mobile", "Web"],
        genre: "Puzzle",
      },
    ],
    jobOpenings: [
      {
        title: "Mobile Game Designer",
        department: "Game Design",
        level: "mid",
        location: "London, UK",
        remote: true,
        requirements: [
          "Data analysis",
        ],
        skills: [
          "Game Design",
          "Unity",
          "Analytics",
          "A/B Testing",
          "Monetization",
        ],
        urgent: false,
      },
    ],
    website: "https://king.com",
    careers: "https://king.com/careers",
    internships: true,
    diversityPrograms: [
      "Inclusion & Diversity Committee",
      "Women in Gaming Network",
    ],
    sustainability: true,
    crunchReputation: "low",
    learningOpportunities: [
      "King Academy",
      "Tech Talks",
      "Mobile Gaming Conferences",
    ],
  },

  // Japanese Studios
  nintendo: {
    id: "nintendo",
    name: "Nintendo",
    logo: "/logos/nintendo.png",
    headquarters: "Kyoto, Japan",
    locations: [
      "Kyoto, Japan",
      "Tokyo, Japan",
      "Redmond, WA",
      "Frankfurt, Germany",
    ],
    size: "aaa",
    type: "both",
    genres: ["Platformer", "Adventure", "Racing", "Fighting", "Party"],
    technologies: ["C++", "C", "Custom Engines", "Proprietary Hardware"],
    remoteWork: false,
    workCulture: [
      "Creativity",
      "Innovation",
      "Family-Friendly",
      "Japanese Work Ethics",
    ],
    benefits: [
      "Health Insurance",
      "Retirement Plan",
      "Employee Discounts",
      "Cafeteria",
    ],
    careerPrograms: ["Nintendo Developer Program", "International Exchange"],
    majorGames: [
      {
        platforms: ["Nintendo Switch"],
        genre: "Adventure",
      },
      {
        name: "Super Mario Odyssey",
        platforms: ["Nintendo Switch"],
        genre: "Platformer",
      },
      {
        platforms: ["Nintendo Switch"],
        genre: "Racing",
      },
      {
        name: "Animal Crossing: New Horizons",
        platforms: ["Nintendo Switch"],
        genre: "Social",
      },
    ],
    jobOpenings: [],
    website: "https://www.nintendo.com",
    careers: "https://careers.nintendo.com",
    internships: true,
    diversityPrograms: ["Global Diversity Initiative"],
    sustainability: true,
    crunchReputation: "low",
    learningOpportunities: [
      "Nintendo University",
      "Game Development Workshops",
    ],
  },

  // VR/AR Studios
  ready_at_dawn: {
    id: "ready_at_dawn",
    name: "Ready At Dawn Studios",
    logo: "/logos/ready-at-dawn.png",
    headquarters: "Irvine, California, USA",
    locations: ["Irvine, CA"],
    size: "medium",
    type: "developer",
    platforms: ["VR", "PlayStation", "PC"],
    genres: ["Action", "Adventure", "VR"],
    technologies: ["C++", "Unreal Engine", "Custom VR Engine", "Oculus SDK"],
    remoteWork: true,
    workCulture: ["Innovation", "VR Pioneers", "Technical Excellence"],
    benefits: [
      "Health Insurance",
      "Stock Options",
      "VR Equipment",
      "Flexible Hours",
    ],
    careerPrograms: ["VR Development Training", "Technical Mentorship"],
    majorGames: [
      {
        name: "Echo VR",
        platforms: ["VR"],
        genre: "Action",
      },
      {
        name: "Lone Echo",
        platforms: ["VR"],
        genre: "Adventure",
      },
      {
        platforms: ["PlayStation"],
        genre: "Action",
      },
    ],
    jobOpenings: [
      {
        title: "VR Interaction Designer",
        department: "Design",
        level: "mid",
        location: "Irvine, CA",
        remote: false,
        requirements: [
          "VR development experience",
          "Unity/Unreal Engine",
          "UX design principles",
        ],
        skills: [
          "VR Design",
          "Unity",
          "UX/UI",
          "Prototyping",
        ],
        urgent: false,
      },
    ],
    website: "https://www.readyatdawn.com",
    internships: true,
    diversityPrograms: ["Inclusive Hiring"],
    sustainability: false,
    crunchReputation: "medium",
    learningOpportunities: [
      "VR Conferences",
      "Technical Workshops",
      "Innovation Days",
    ],
  },

  // European Studios
  cd_projekt: {
    id: "cd_projekt",
    name: "CD Projekt RED",
    logo: "/logos/cd-projekt.png",
    headquarters: "Warsaw, Poland",
    locations: [
      "Warsaw, Poland",
      "Krakow, Poland",
      "Wroclaw, Poland",
      "Boston, MA",
    ],
    size: "aaa",
    type: "both",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    genres: ["RPG", "Adventure", "Action"],
    remoteWork: true,
    workCulture: [
      "Storytelling Excellence",
      "Player Respect",
      "Innovation",
      "Polish Gaming Pride",
    ],
    benefits: [
      "Private Healthcare",
      "Flexible Hours",
      "Game Copies",
      "Fitness Benefits",
    ],
    careerPrograms: [
      "RED Academy",
      "Mentorship Program",
      "International Exchange",
    ],
    majorGames: [
      {
        platforms: ["PC", "PlayStation", "Xbox"],
        genre: "RPG",
      },
      {
        platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        genre: "RPG",
      },
      {
        platforms: ["PC", "Xbox"],
        genre: "RPG",
      },
    ],
    jobOpenings: [
      {
        title: "Senior Quest Designer",
        department: "Design",
        level: "senior",
        location: "Warsaw, Poland",
        remote: true,
        requirements: [
          "Narrative writing",
          "Branching storylines",
        ],
        skills: [
          "Quest Design",
          "Narrative Writing",
          "RPG Systems",
          "Scripting",
        ],
        urgent: false,
      },
    ],
    website: "https://www.cdprojekt.com",
    careers: "https://cdprojekt.com/en/jobs",
    internships: true,
    diversityPrograms: ["Women in Gaming Poland", "LGBTQ+ Support"],
    sustainability: true,
    crunchReputation: "high",
    learningOpportunities: [
      "Conference Sponsorship",
      "Technical Training",
      "Language Learning",
    ],
  },
};

// Game Genres with Career Information
export const GAME_GENRE_CAREERS = {
  Action: {
    commonRoles: [
      "Gameplay Programmer",
      "Combat Designer",
      "Level Designer",
      "Animation Programmer",
    ],
    skills: ["C++", "Physics", "AI Programming", "Animation Systems"],
    growthRate: "High",
    description:
      "Fast-paced games requiring precise controls and engaging combat systems",
  },
  RPG: {
    commonRoles: [
      "Systems Designer",
      "Narrative Designer",
      "Quest Designer",
      "Database Designer",
    ],
    skills: [
      "Game Balance",
      "Narrative Writing",
      "Database Design",
      "Progression Systems",
    ],
    growthRate: "Medium",
    description:
      "Character-driven games with deep progression and story systems",
  },
  Strategy: {
    commonRoles: [
      "AI Programmer",
      "Systems Designer",
      "UI/UX Designer",
      "Balance Designer",
    ],
    skills: [
      "AI Programming",
      "Game Theory",
      "Data Analysis",
      "Mathematical Modeling",
    ],
    growthRate: "Medium",
    description:
      "Complex games requiring strategic thinking and resource management",
  },
  Mobile: {
    commonRoles: [
      "Mobile Developer",
      "LiveOps Designer",
      "Monetization Analyst",
      "ASO Specialist",
    ],
    skills: [
      "Unity",
      "Swift/Kotlin",
      "Analytics",
      "A/B Testing",
      "User Acquisition",
    ],
    growthRate: "Very High",
    description:
      "Games designed for mobile platforms with focus on accessibility and monetization",
  },
  VR: {
    commonRoles: [
      "VR Developer",
      "Interaction Designer",
      "Technical Artist",
      "UX Researcher",
    ],
    skills: [
      "Unity/Unreal VR",
      "Spatial Design",
      "Human Factors",
      "Optimization",
    ],
    growthRate: "Very High",
    description:
      "Immersive experiences requiring specialized knowledge of VR technology",
  },
  Indie: {
    commonRoles: [
      "Solo Developer",
      "Generalist",
      "Community Manager",
      "Publisher Relations",
    ],
    skills: [
      "Multiple Disciplines",
      "Self-Management",
      "Marketing",
      "Publishing",
    ],
    growthRate: "Variable",
    description:
      "Independent game development with smaller teams and creative freedom",
  },
};

// Technology Stack Information
export const TECHNOLOGY_STACKS = {
  Unity: {
    type: "Game Engine",
    platforms: ["PC", "Mobile", "Console", "VR", "AR"],
    jobDemand: "Very High",
    learningCurve: "Medium",
    companies: [
      "Unity Technologies",
      "Many Indie Studios",
      "Mobile Game Companies",
    ],
  },
  "Unreal Engine": {
    type: "Game Engine",
    primaryLanguage: "C++",
    platforms: ["PC", "Console", "Mobile", "VR"],
    jobDemand: "High",
    learningCurve: "Hard",
    companies: ["Epic Games", "AAA Studios", "VR Companies"],
  },
  Godot: {
    type: "Game Engine",
    platforms: ["PC", "Mobile", "Console"],
    jobDemand: "Growing",
    learningCurve: "Easy",
    companies: ["Indie Studios", "Small Studios", "Educational Games"],
  },
};

// Career Path Templates
export const CAREER_PATHS = {
  "game-programmer": {
    title: "Game Programmer",
    levels: [
      {
        title: "Junior Game Programmer",
        responsibilities: [
          "Bug fixing",
          "Feature implementation",
          "Code reviews",
          "Learning",
        ],
      },
      {
        title: "Game Programmer",
        skills: [
          "Advanced Engine Knowledge",
          "Optimization",
          "AI Programming",
          "Graphics",
        ],
        responsibilities: [
          "System design",
          "Performance optimization",
          "Mentoring juniors",
          "Architecture decisions",
        ],
      },
      {
        title: "Senior Game Programmer",
        skills: [
          "Engine Architecture",
          "Leadership",
          "Cross-platform",
          "Advanced Graphics",
        ],
        responsibilities: [
          "Technical leadership",
          "Architecture design",
          "Team coordination",
          "Performance analysis",
        ],
      },
      {
        title: "Lead Programmer / Technical Director",
        skills: [
          "Team Leadership",
          "Strategic Planning",
          "Technology Evaluation",
          "Hiring",
        ],
        responsibilities: [
          "Team management",
          "Technology strategy",
          "Cross-department collaboration",
          "Hiring decisions",
        ],
      },
    ],
  },
  "game-designer": {
    title: "Game Designer",
    levels: [
      {
        title: "Associate Game Designer",
        skills: [
          "Game Analysis",
          "Basic Prototyping",
          "Documentation",
          "Playtesting",
        ],
        responsibilities: [
          "Level design",
          "Content creation",
          "Balance testing",
          "Documentation",
        ],
      },
      {
        title: "Game Designer",
        skills: [
          "Systems Design",
          "Monetization",
          "User Research",
          "Analytics",
        ],
        responsibilities: [
          "Feature design",
          "Economy design",
          "User experience",
          "Data analysis",
        ],
      },
      {
        title: "Senior Game Designer",
        skills: [
          "Vision Setting",
          "Team Leadership",
          "Stakeholder Management",
          "Market Analysis",
        ],
        responsibilities: [
          "Design leadership",
          "Cross-team collaboration",
          "Strategic planning",
          "Mentoring",
        ],
      },
      {
        title: "Creative Director / Design Director",
        skills: [
          "Creative Vision",
          "Business Strategy",
          "Team Building",
          "Industry Networking",
        ],
        responsibilities: [
          "Creative direction",
          "Strategic decisions",
          "Team building",
          "Stakeholder communication",
        ],
      },
    ],
  },
};

// Skill Assessment Framework
export const SKILL_ASSESSMENTS = {
  technical: [
    {
      skill: "C++ Programming",
      category: "Programming",
      difficulty: "Hard",
      demand: "High",
    },
    {
      category: "Programming",
      difficulty: "Medium",
      demand: "Very High",
    },
    {
      skill: "Unity Engine",
      category: "Tools",
      difficulty: "Medium",
      demand: "Very High",
    },
    {
      skill: "Unreal Engine",
      category: "Tools",
      difficulty: "Hard",
      demand: "High",
    },
    {
      skill: "Graphics Programming",
      category: "Programming",
      difficulty: "Very Hard",
      demand: "High",
    },
    {
      skill: "AI Programming",
      category: "Programming",
      difficulty: "Hard",
      demand: "Medium",
    },
    {
      skill: "Network Programming",
      category: "Programming",
      difficulty: "Hard",
      demand: "Medium",
    },
  ],
  creative: [
    {
      skill: "Game Design",
      category: "Design",
      difficulty: "Medium",
      demand: "High",
    },
    {
      skill: "Level Design",
      category: "Design",
      difficulty: "Medium",
      demand: "High",
    },
    {
      skill: "Narrative Design",
      category: "Design",
      difficulty: "Medium",
      demand: "Medium",
    },
    { skill: "Animation", category: "Art", difficulty: "Hard", demand: "High" },
    {
      skill: "UI/UX Design",
      category: "Design",
      difficulty: "Medium",
      demand: "Very High",
    },
  ],
  business: [
    {
      skill: "Product Management",
      category: "Management",
      difficulty: "Medium",
      demand: "High",
    },
    {
      skill: "Data Analytics",
      category: "Analytics",
      difficulty: "Medium",
      demand: "Very High",
    },
    {
      skill: "User Research",
      category: "Research",
      difficulty: "Medium",
      demand: "High",
    },
    {
      skill: "Marketing",
      category: "Marketing",
      difficulty: "Medium",
      demand: "High",
    },
    {
      skill: "Community Management",
      category: "Community",
      difficulty: "Easy",
      demand: "High",
    },
  ],
};

export default {
  EXPANDED_GAMING_STUDIOS,
  GAME_GENRE_CAREERS,
  TECHNOLOGY_STACKS,
  CAREER_PATHS,
  SKILL_ASSESSMENTS,
};
