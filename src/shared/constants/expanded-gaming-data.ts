/**
 * Comprehensive Gaming Industry Database
 * Expanded studios, games, and career data for NAVI AI Career Assistant
 */

export interface ExpandedGameStudio {
  id: string
  name: string
  logo?: string
  founded: number
  headquarters: string
  locations: string[]
  size: 'indie' | 'small' | 'medium' | 'large' | 'aaa'
  employeeCount: number
  type: 'developer' | 'publisher' | 'both' | 'platform' | 'service'
  platforms: Platform[]
  genres: GameGenre[]
  technologies: string[]
  remoteWork: boolean
  workCulture: string[]
  benefits: string[]
  careerPrograms: string[]
  majorGames: MajorGame[]
  jobOpenings: JobOpening[]
  glassdoorRating?: number
  website: string
  careers?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    discord?: string
    youtube?: string
  }
  internships: boolean
  diversityPrograms: string[]
  sustainability: boolean
  crunchReputation: 'low' | 'medium' | 'high'
  workLifeBalance: number // 1-10
  learningOpportunities: string[]
}

export interface MajorGame {
  name: string
  year: number
  platforms: Platform[]
  genre: GameGenre
  metacriticScore?: number
  salesMillion?: number
  awards?: string[]
}

export interface JobOpening {
  title: string
  department: string
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'director'
  location: string
  remote: boolean
  salary?: {
    min: number
    max: number
    currency: string
  }
  requirements: string[]
  skills: string[]
  posted: string
  urgent: boolean
}

export type Platform = 
  | 'PC' | 'Steam' | 'Epic' | 'GOG'
  | 'PlayStation' | 'PS5' | 'PS4'
  | 'Xbox' | 'Xbox Series X|S' | 'Xbox One'
  | 'Nintendo Switch' | 'Nintendo 3DS'
  | 'iOS' | 'Android' | 'Mobile'
  | 'VR' | 'Oculus' | 'PSVR' | 'Steam VR'
  | 'Web' | 'Browser'
  | 'Arcade' | 'Console'

export type GameGenre = 
  | 'Action' | 'Adventure' | 'RPG' | 'Strategy' | 'Simulation'
  | 'Sports' | 'Racing' | 'Fighting' | 'Platformer' | 'Puzzle'
  | 'Horror' | 'Survival' | 'Battle Royale' | 'MOBA' | 'MMO'
  | 'FPS' | 'TPS' | 'RTS' | 'Turn-Based' | 'Real-Time'
  | 'Indie' | 'Casual' | 'Educational' | 'Music' | 'Dance'
  | 'VR' | 'AR' | 'Social' | 'Party' | 'Card' | 'Board'

export const EXPANDED_GAMING_STUDIOS: Record<string, ExpandedGameStudio> = {
  // Major AAA Studios
  epic_games: {
    id: 'epic_games',
    name: 'Epic Games',
    logo: '/logos/epic-games.png',
    founded: 1991,
    headquarters: 'Cary, North Carolina, USA',
    locations: ['Cary, NC', 'Seattle, WA', 'Los Angeles, CA', 'Montreal, Canada', 'Berlin, Germany', 'Seoul, South Korea'],
    size: 'aaa',
    employeeCount: 3200,
    type: 'both',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'iOS', 'Android', 'VR'],
    genres: ['Action', 'Battle Royale', 'Adventure'],
    technologies: ['Unreal Engine 5', 'C++', 'Blueprint', 'MetaHuman', 'Lumen', 'Nanite'],
    remoteWork: true,
    workCulture: ['Innovation', 'Creativity', 'Collaboration', 'Work-Life Balance'],
    benefits: ['Health Insurance', '401k Matching', 'Flexible PTO', 'Game Development Tools', 'Learning Stipend'],
    careerPrograms: ['Early Career Program', 'Mentorship Program', 'Leadership Development'],
    majorGames: [
      { name: 'Fortnite', year: 2017, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'iOS', 'Android'], genre: 'Battle Royale', metacriticScore: 81, salesMillion: 400 },
      { name: 'Gears of War', year: 2006, platforms: ['Xbox', 'PC'], genre: 'Action', metacriticScore: 94, awards: ['Game of the Year 2006'] },
      { name: 'Unreal Tournament', year: 1999, platforms: ['PC'], genre: 'FPS', metacriticScore: 91 }
    ],
    jobOpenings: [
      {
        title: 'Senior Game Designer',
        department: 'Game Design',
        level: 'senior',
        location: 'Cary, NC',
        remote: true,
        salary: { min: 120000, max: 180000, currency: 'USD' },
        requirements: ['5+ years game design', 'Unreal Engine experience', 'Live service games'],
        skills: ['Game Design', 'Unreal Engine', 'Scripting', 'Balancing'],
        posted: '2024-01-15',
        urgent: true
      },
      {
        title: 'Unreal Engine Developer',
        department: 'Engineering',
        level: 'mid',
        location: 'Seattle, WA',
        remote: false,
        salary: { min: 100000, max: 150000, currency: 'USD' },
        requirements: ['3+ years C++', 'Unreal Engine experience', 'Graphics programming'],
        skills: ['C++', 'Unreal Engine', 'Graphics', 'Optimization'],
        posted: '2024-01-20',
        urgent: false
      }
    ],
    glassdoorRating: 4.4,
    website: 'https://www.epicgames.com',
    careers: 'https://www.epicgames.com/site/en-US/careers',
    socialLinks: {
      twitter: '@EpicGames',
      linkedin: 'epic-games',
      discord: 'Epic Games',
      youtube: 'EpicGames'
    },
    internships: true,
    diversityPrograms: ['Diversity & Inclusion Council', 'Mentorship for Underrepresented Groups', 'Inclusive Hiring Practices'],
    sustainability: true,
    crunchReputation: 'medium',
    workLifeBalance: 7,
    learningOpportunities: ['Unreal Engine Training', 'GDC Conference', 'Internal Tech Talks', 'Cross-Department Shadowing']
  },

  riot_games: {
    id: 'riot_games',
    name: 'Riot Games',
    logo: '/logos/riot-games.png',
    founded: 2006,
    headquarters: 'Los Angeles, California, USA',
    locations: ['Los Angeles, CA', 'Berlin, Germany', 'Dublin, Ireland', 'Hong Kong', 'Seoul, South Korea', 'Shanghai, China'],
    size: 'aaa',
    employeeCount: 4500,
    type: 'developer',
    platforms: ['PC', 'Mobile', 'Console'],
    genres: ['MOBA', 'FPS', 'Strategy', 'Fighting', 'Card'],
    technologies: ['C++', 'C#', 'Python', 'Golang', 'Unity', 'Custom Engine'],
    remoteWork: true,
    workCulture: ['Player Focus', 'Innovation', 'Competitive Excellence', 'Global Mindset'],
    benefits: ['Comprehensive Health', 'Unlimited PTO', 'Employee Stock Program', 'Gaming Allowance', 'Wellness Programs'],
    careerPrograms: ['Riot Academy', 'Leadership Path', 'Technical Track', 'Cross-Functional Training'],
    majorGames: [
      { name: 'League of Legends', year: 2009, platforms: ['PC'], genre: 'MOBA', metacriticScore: 78, salesMillion: 150 },
      { name: 'Valorant', year: 2020, platforms: ['PC'], genre: 'FPS', metacriticScore: 80 },
      { name: 'Teamfight Tactics', year: 2019, platforms: ['PC', 'Mobile'], genre: 'Strategy', metacriticScore: 77 },
      { name: 'Legends of Runeterra', year: 2020, platforms: ['PC', 'Mobile'], genre: 'Card', metacriticScore: 82 }
    ],
    jobOpenings: [
      {
        title: 'Senior Software Engineer - Valorant',
        department: 'Engineering',
        level: 'senior',
        location: 'Los Angeles, CA',
        remote: false,
        salary: { min: 150000, max: 220000, currency: 'USD' },
        requirements: ['5+ years software engineering', 'FPS game experience', 'Anti-cheat systems'],
        skills: ['C++', 'Network Programming', 'Game Security', 'Performance Optimization'],
        posted: '2024-01-18',
        urgent: true
      }
    ],
    glassdoorRating: 4.6,
    website: 'https://www.riotgames.com',
    careers: 'https://www.riotgames.com/en/work-with-us',
    socialLinks: {
      twitter: '@riotgames',
      linkedin: 'riot-games',
      youtube: 'riotgames'
    },
    internships: true,
    diversityPrograms: ['Riot Diversity Initiative', 'Women in Gaming', 'LGBTQ+ Alliance', 'Inclusion Champions'],
    sustainability: true,
    crunchReputation: 'low',
    workLifeBalance: 8,
    learningOpportunities: ['Tech Talks', 'Game Jams', 'Conference Sponsorship', 'Skill Development Stipend']
  },

  blizzard: {
    id: 'blizzard',
    name: 'Blizzard Entertainment',
    logo: '/logos/blizzard.png',
    founded: 1991,
    headquarters: 'Irvine, California, USA',
    locations: ['Irvine, CA', 'Austin, TX', 'Albany, NY', 'Shanghai, China', 'Versailles, France'],
    size: 'aaa',
    employeeCount: 4700,
    type: 'developer',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
    genres: ['Action', 'RPG', 'Strategy', 'FPS', 'MMO'],
    technologies: ['C++', 'C#', 'Python', 'Lua', 'Custom Engines', 'Battle.net'],
    remoteWork: true,
    workCulture: ['Gameplay First', 'Commit to Quality', 'Play Nice; Play Fair', 'Embrace Your Inner Geek'],
    benefits: ['Medical/Dental/Vision', 'Game Credits', 'Free Games', 'Fitness Center', 'On-site Dining'],
    careerPrograms: ['Blizzard College Program', 'Leadership Training', 'Cross-Team Collaboration'],
    majorGames: [
      { name: 'World of Warcraft', year: 2004, platforms: ['PC'], genre: 'MMO', metacriticScore: 93, salesMillion: 100 },
      { name: 'Overwatch', year: 2016, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], genre: 'FPS', metacriticScore: 91 },
      { name: 'Diablo IV', year: 2023, platforms: ['PC', 'PlayStation', 'Xbox'], genre: 'RPG', metacriticScore: 86 },
      { name: 'StarCraft II', year: 2010, platforms: ['PC'], genre: 'Strategy', metacriticScore: 93 }
    ],
    jobOpenings: [
      {
        title: 'Senior 3D Artist',
        department: 'Art',
        level: 'senior',
        location: 'Irvine, CA',
        remote: false,
        requirements: ['7+ years 3D art experience', 'Maya/3ds Max proficiency', 'Game art pipeline'],
        skills: ['Maya', '3D Modeling', 'Texturing', 'Lighting', 'Pipeline'],
        posted: '2024-01-12',
        urgent: false
      }
    ],
    glassdoorRating: 4.1,
    website: 'https://www.blizzard.com',
    careers: 'https://careers.blizzard.com',
    internships: true,
    diversityPrograms: ['Call of Duty Endowment', 'Women at Blizzard', 'Pride Alliance'],
    sustainability: false,
    crunchReputation: 'medium',
    workLifeBalance: 6,
    learningOpportunities: ['BlizzCon', 'Game Development Courses', 'Art Workshops', 'Technical Seminars']
  },

  // Indie/Mid-Size Studios
  supergiant_games: {
    id: 'supergiant_games',
    name: 'Supergiant Games',
    logo: '/logos/supergiant.png',
    founded: 2009,
    headquarters: 'San Francisco, California, USA',
    locations: ['San Francisco, CA', 'Remote'],
    size: 'small',
    employeeCount: 20,
    type: 'developer',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Action', 'RPG', 'Indie'],
    technologies: ['C#', 'Unity', 'Custom Tools', 'Wwise'],
    remoteWork: true,
    workCulture: ['Creative Freedom', 'Small Team Collaboration', 'Quality over Quantity', 'Work-Life Balance'],
    benefits: ['Health Insurance', 'Flexible Schedule', 'Profit Sharing', 'Creative Input'],
    careerPrograms: ['Mentorship', 'Cross-Discipline Learning'],
    majorGames: [
      { name: 'Hades', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], genre: 'Action', metacriticScore: 93, awards: ['Game of the Year 2020'] },
      { name: 'Bastion', year: 2011, platforms: ['PC', 'Xbox'], genre: 'Action', metacriticScore: 86 },
      { name: 'Transistor', year: 2014, platforms: ['PC', 'PlayStation'], genre: 'Action', metacriticScore: 83 },
      { name: 'Pyre', year: 2017, platforms: ['PC', 'PlayStation'], genre: 'RPG', metacriticScore: 79 }
    ],
    jobOpenings: [],
    glassdoorRating: 4.8,
    website: 'https://www.supergiantgames.com',
    socialLinks: {
      twitter: '@SupergiantGames'
    },
    internships: false,
    diversityPrograms: ['Inclusive Culture', 'Equal Opportunity'],
    sustainability: true,
    crunchReputation: 'low',
    workLifeBalance: 9,
    learningOpportunities: ['Cross-Training', 'Industry Conferences', 'Creative Workshops']
  },

  team_cherry: {
    id: 'team_cherry',
    name: 'Team Cherry',
    logo: '/logos/team-cherry.png',
    founded: 2014,
    headquarters: 'Adelaide, Australia',
    locations: ['Adelaide, Australia', 'Remote'],
    size: 'indie',
    employeeCount: 3,
    type: 'developer',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['Platformer', 'Action', 'Indie'],
    technologies: ['Unity', 'C#', 'Custom Animation Tools'],
    remoteWork: true,
    workCulture: ['Artistic Vision', 'Perfectionism', 'Independent Spirit'],
    benefits: ['Creative Control', 'Flexible Hours', 'Profit Sharing'],
    careerPrograms: [],
    majorGames: [
      { name: 'Hollow Knight', year: 2017, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], genre: 'Platformer', metacriticScore: 90, salesMillion: 3 }
    ],
    jobOpenings: [],
    website: 'http://teamcherry.com.au',
    internships: false,
    diversityPrograms: [],
    sustainability: false,
    crunchReputation: 'low',
    workLifeBalance: 10,
    learningOpportunities: ['Self-Directed Learning', 'Art Communities']
  },

  // Mobile/Social Game Studios
  king: {
    id: 'king',
    name: 'King (Activision)',
    logo: '/logos/king.png',
    founded: 2003,
    headquarters: 'London, United Kingdom',
    locations: ['London, UK', 'Stockholm, Sweden', 'Barcelona, Spain', 'Berlin, Germany', 'Tel Aviv, Israel'],
    size: 'aaa',
    employeeCount: 2000,
    type: 'developer',
    platforms: ['Mobile', 'Web'],
    genres: ['Casual', 'Puzzle', 'Social'],
    technologies: ['Unity', 'C#', 'Python', 'Java', 'JavaScript', 'AWS'],
    remoteWork: true,
    workCulture: ['Fun First', 'Data-Driven', 'Global Collaboration', 'Innovation'],
    benefits: ['Health Insurance', 'Stock Options', 'Free Snacks', 'Game Development Budget'],
    careerPrograms: ['Graduate Program', 'Leadership Academy', 'Cross-Studio Exchange'],
    majorGames: [
      { name: 'Candy Crush Saga', year: 2012, platforms: ['Mobile', 'Web'], genre: 'Puzzle', salesMillion: 500 },
      { name: 'Farm Heroes Saga', year: 2013, platforms: ['Mobile'], genre: 'Puzzle' },
      { name: 'Bubble Witch Saga', year: 2011, platforms: ['Mobile', 'Web'], genre: 'Puzzle' }
    ],
    jobOpenings: [
      {
        title: 'Mobile Game Designer',
        department: 'Game Design',
        level: 'mid',
        location: 'London, UK',
        remote: true,
        salary: { min: 60000, max: 90000, currency: 'GBP' },
        requirements: ['3+ years mobile game design', 'F2P/LiveOps experience', 'Data analysis'],
        skills: ['Game Design', 'Unity', 'Analytics', 'A/B Testing', 'Monetization'],
        posted: '2024-01-10',
        urgent: false
      }
    ],
    glassdoorRating: 4.2,
    website: 'https://king.com',
    careers: 'https://king.com/careers',
    internships: true,
    diversityPrograms: ['Inclusion & Diversity Committee', 'Women in Gaming Network'],
    sustainability: true,
    crunchReputation: 'low',
    workLifeBalance: 8,
    learningOpportunities: ['King Academy', 'Tech Talks', 'Mobile Gaming Conferences']
  },

  // Japanese Studios
  nintendo: {
    id: 'nintendo',
    name: 'Nintendo',
    logo: '/logos/nintendo.png',
    founded: 1889,
    headquarters: 'Kyoto, Japan',
    locations: ['Kyoto, Japan', 'Tokyo, Japan', 'Redmond, WA', 'Frankfurt, Germany'],
    size: 'aaa',
    employeeCount: 6574,
    type: 'both',
    platforms: ['Nintendo Switch', 'Nintendo 3DS'],
    genres: ['Platformer', 'Adventure', 'Racing', 'Fighting', 'Party'],
    technologies: ['C++', 'C', 'Custom Engines', 'Proprietary Hardware'],
    remoteWork: false,
    workCulture: ['Creativity', 'Innovation', 'Family-Friendly', 'Japanese Work Ethics'],
    benefits: ['Health Insurance', 'Retirement Plan', 'Employee Discounts', 'Cafeteria'],
    careerPrograms: ['Nintendo Developer Program', 'International Exchange'],
    majorGames: [
      { name: 'The Legend of Zelda: Breath of the Wild', year: 2017, platforms: ['Nintendo Switch'], genre: 'Adventure', metacriticScore: 97 },
      { name: 'Super Mario Odyssey', year: 2017, platforms: ['Nintendo Switch'], genre: 'Platformer', metacriticScore: 97 },
      { name: 'Mario Kart 8 Deluxe', year: 2017, platforms: ['Nintendo Switch'], genre: 'Racing', metacriticScore: 92 },
      { name: 'Animal Crossing: New Horizons', year: 2020, platforms: ['Nintendo Switch'], genre: 'Social', metacriticScore: 90 }
    ],
    jobOpenings: [],
    glassdoorRating: 4.3,
    website: 'https://www.nintendo.com',
    careers: 'https://careers.nintendo.com',
    internships: true,
    diversityPrograms: ['Global Diversity Initiative'],
    sustainability: true,
    crunchReputation: 'low',
    workLifeBalance: 7,
    learningOpportunities: ['Nintendo University', 'Game Development Workshops']
  },

  // VR/AR Studios
  ready_at_dawn: {
    id: 'ready_at_dawn',
    name: 'Ready At Dawn Studios',
    logo: '/logos/ready-at-dawn.png',
    founded: 2003,
    headquarters: 'Irvine, California, USA',
    locations: ['Irvine, CA'],
    size: 'medium',
    employeeCount: 180,
    type: 'developer',
    platforms: ['VR', 'PlayStation', 'PC'],
    genres: ['Action', 'Adventure', 'VR'],
    technologies: ['C++', 'Unreal Engine', 'Custom VR Engine', 'Oculus SDK'],
    remoteWork: true,
    workCulture: ['Innovation', 'VR Pioneers', 'Technical Excellence'],
    benefits: ['Health Insurance', 'Stock Options', 'VR Equipment', 'Flexible Hours'],
    careerPrograms: ['VR Development Training', 'Technical Mentorship'],
    majorGames: [
      { name: 'Echo VR', year: 2017, platforms: ['VR'], genre: 'Action', metacriticScore: 78 },
      { name: 'Lone Echo', year: 2017, platforms: ['VR'], genre: 'Adventure', metacriticScore: 82 },
      { name: 'The Order: 1886', year: 2015, platforms: ['PlayStation'], genre: 'Action', metacriticScore: 63 }
    ],
    jobOpenings: [
      {
        title: 'VR Interaction Designer',
        department: 'Design',
        level: 'mid',
        location: 'Irvine, CA',
        remote: false,
        requirements: ['VR development experience', 'Unity/Unreal Engine', 'UX design principles'],
        skills: ['VR Design', 'Unity', 'UX/UI', '3D Interaction', 'Prototyping'],
        posted: '2024-01-14',
        urgent: false
      }
    ],
    glassdoorRating: 4.0,
    website: 'https://www.readyatdawn.com',
    internships: true,
    diversityPrograms: ['Inclusive Hiring'],
    sustainability: false,
    crunchReputation: 'medium',
    workLifeBalance: 7,
    learningOpportunities: ['VR Conferences', 'Technical Workshops', 'Innovation Days']
  },

  // European Studios
  cd_projekt: {
    id: 'cd_projekt',
    name: 'CD Projekt RED',
    logo: '/logos/cd-projekt.png',
    founded: 1994,
    headquarters: 'Warsaw, Poland',
    locations: ['Warsaw, Poland', 'Krakow, Poland', 'Wroclaw, Poland', 'Boston, MA'],
    size: 'aaa',
    employeeCount: 1111,
    type: 'both',
    platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    genres: ['RPG', 'Adventure', 'Action'],
    technologies: ['REDengine', 'C++', 'C#', 'Python', 'Lua'],
    remoteWork: true,
    workCulture: ['Storytelling Excellence', 'Player Respect', 'Innovation', 'Polish Gaming Pride'],
    benefits: ['Private Healthcare', 'Flexible Hours', 'Game Copies', 'Fitness Benefits'],
    careerPrograms: ['RED Academy', 'Mentorship Program', 'International Exchange'],
    majorGames: [
      { name: 'Cyberpunk 2077', year: 2020, platforms: ['PC', 'PlayStation', 'Xbox'], genre: 'RPG', metacriticScore: 86, salesMillion: 25 },
      { name: 'The Witcher 3: Wild Hunt', year: 2015, platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], genre: 'RPG', metacriticScore: 93, awards: ['Game of the Year 2015'], salesMillion: 50 },
      { name: 'The Witcher 2', year: 2011, platforms: ['PC', 'Xbox'], genre: 'RPG', metacriticScore: 88 }
    ],
    jobOpenings: [
      {
        title: 'Senior Quest Designer',
        department: 'Design',
        level: 'senior',
        location: 'Warsaw, Poland',
        remote: true,
        salary: { min: 80000, max: 120000, currency: 'PLN' },
        requirements: ['5+ years RPG design', 'Narrative writing', 'Branching storylines'],
        skills: ['Quest Design', 'Narrative Writing', 'RPG Systems', 'Scripting'],
        posted: '2024-01-16',
        urgent: false
      }
    ],
    glassdoorRating: 3.9,
    website: 'https://www.cdprojekt.com',
    careers: 'https://cdprojekt.com/en/jobs',
    internships: true,
    diversityPrograms: ['Women in Gaming Poland', 'LGBTQ+ Support'],
    sustainability: true,
    crunchReputation: 'high',
    workLifeBalance: 5,
    learningOpportunities: ['Conference Sponsorship', 'Technical Training', 'Language Learning']
  }
}

// Game Genres with Career Information
export const GAME_GENRE_CAREERS = {
  'Action': {
    commonRoles: ['Gameplay Programmer', 'Combat Designer', 'Level Designer', 'Animation Programmer'],
    skills: ['C++', 'Physics', 'AI Programming', 'Animation Systems'],
    averageSalary: { min: 70000, max: 140000 },
    growthRate: 'High',
    description: 'Fast-paced games requiring precise controls and engaging combat systems'
  },
  'RPG': {
    commonRoles: ['Systems Designer', 'Narrative Designer', 'Quest Designer', 'Database Designer'],
    skills: ['Game Balance', 'Narrative Writing', 'Database Design', 'Progression Systems'],
    averageSalary: { min: 75000, max: 150000 },
    growthRate: 'Medium',
    description: 'Character-driven games with deep progression and story systems'
  },
  'Strategy': {
    commonRoles: ['AI Programmer', 'Systems Designer', 'UI/UX Designer', 'Balance Designer'],
    skills: ['AI Programming', 'Game Theory', 'Data Analysis', 'Mathematical Modeling'],
    averageSalary: { min: 80000, max: 160000 },
    growthRate: 'Medium',
    description: 'Complex games requiring strategic thinking and resource management'
  },
  'Mobile': {
    commonRoles: ['Mobile Developer', 'LiveOps Designer', 'Monetization Analyst', 'ASO Specialist'],
    skills: ['Unity', 'Swift/Kotlin', 'Analytics', 'A/B Testing', 'User Acquisition'],
    averageSalary: { min: 65000, max: 130000 },
    growthRate: 'Very High',
    description: 'Games designed for mobile platforms with focus on accessibility and monetization'
  },
  'VR': {
    commonRoles: ['VR Developer', 'Interaction Designer', 'Technical Artist', 'UX Researcher'],
    skills: ['Unity/Unreal VR', 'C#', 'Spatial Design', 'Human Factors', 'Optimization'],
    averageSalary: { min: 85000, max: 180000 },
    growthRate: 'Very High',
    description: 'Immersive experiences requiring specialized knowledge of VR technology'
  },
  'Indie': {
    commonRoles: ['Solo Developer', 'Generalist', 'Community Manager', 'Publisher Relations'],
    skills: ['Multiple Disciplines', 'Self-Management', 'Marketing', 'Publishing'],
    averageSalary: { min: 30000, max: 200000 },
    growthRate: 'Variable',
    description: 'Independent game development with smaller teams and creative freedom'
  }
}

// Technology Stack Information
export const TECHNOLOGY_STACKS = {
  'Unity': {
    type: 'Game Engine',
    primaryLanguage: 'C#',
    platforms: ['PC', 'Mobile', 'Console', 'VR', 'AR'],
    jobDemand: 'Very High',
    learningCurve: 'Medium',
    averageSalary: { min: 65000, max: 130000 },
    companies: ['Unity Technologies', 'Many Indie Studios', 'Mobile Game Companies']
  },
  'Unreal Engine': {
    type: 'Game Engine',
    primaryLanguage: 'C++',
    platforms: ['PC', 'Console', 'Mobile', 'VR'],
    jobDemand: 'High',
    learningCurve: 'Hard',
    averageSalary: { min: 75000, max: 160000 },
    companies: ['Epic Games', 'AAA Studios', 'VR Companies']
  },
  'Godot': {
    type: 'Game Engine',
    primaryLanguage: 'GDScript/C#',
    platforms: ['PC', 'Mobile', 'Console'],
    jobDemand: 'Growing',
    learningCurve: 'Easy',
    averageSalary: { min: 50000, max: 100000 },
    companies: ['Indie Studios', 'Small Studios', 'Educational Games']
  }
}

// Career Path Templates
export const CAREER_PATHS = {
  'game-programmer': {
    title: 'Game Programmer',
    levels: [
      {
        title: 'Junior Game Programmer',
        experience: '0-2 years',
        salary: { min: 55000, max: 85000 },
        skills: ['C++/C#', 'Basic Game Engine', 'Version Control', 'Debugging'],
        responsibilities: ['Bug fixing', 'Feature implementation', 'Code reviews', 'Learning']
      },
      {
        title: 'Game Programmer',
        experience: '2-5 years',
        salary: { min: 75000, max: 120000 },
        skills: ['Advanced Engine Knowledge', 'Optimization', 'AI Programming', 'Graphics'],
        responsibilities: ['System design', 'Performance optimization', 'Mentoring juniors', 'Architecture decisions']
      },
      {
        title: 'Senior Game Programmer',
        experience: '5-8 years',
        salary: { min: 100000, max: 160000 },
        skills: ['Engine Architecture', 'Leadership', 'Cross-platform', 'Advanced Graphics'],
        responsibilities: ['Technical leadership', 'Architecture design', 'Team coordination', 'Performance analysis']
      },
      {
        title: 'Lead Programmer / Technical Director',
        experience: '8+ years',
        salary: { min: 130000, max: 220000 },
        skills: ['Team Leadership', 'Strategic Planning', 'Technology Evaluation', 'Hiring'],
        responsibilities: ['Team management', 'Technology strategy', 'Cross-department collaboration', 'Hiring decisions']
      }
    ]
  },
  'game-designer': {
    title: 'Game Designer',
    levels: [
      {
        title: 'Associate Game Designer',
        experience: '0-2 years',
        salary: { min: 45000, max: 70000 },
        skills: ['Game Analysis', 'Basic Prototyping', 'Documentation', 'Playtesting'],
        responsibilities: ['Level design', 'Content creation', 'Balance testing', 'Documentation']
      },
      {
        title: 'Game Designer',
        experience: '2-5 years',
        salary: { min: 65000, max: 100000 },
        skills: ['Systems Design', 'Monetization', 'User Research', 'Analytics'],
        responsibilities: ['Feature design', 'Economy design', 'User experience', 'Data analysis']
      },
      {
        title: 'Senior Game Designer',
        experience: '5-8 years',
        salary: { min: 90000, max: 140000 },
        skills: ['Vision Setting', 'Team Leadership', 'Stakeholder Management', 'Market Analysis'],
        responsibilities: ['Design leadership', 'Cross-team collaboration', 'Strategic planning', 'Mentoring']
      },
      {
        title: 'Creative Director / Design Director',
        experience: '8+ years',
        salary: { min: 120000, max: 200000 },
        skills: ['Creative Vision', 'Business Strategy', 'Team Building', 'Industry Networking'],
        responsibilities: ['Creative direction', 'Strategic decisions', 'Team building', 'Stakeholder communication']
      }
    ]
  }
}

// Skill Assessment Framework
export const SKILL_ASSESSMENTS = {
  'technical': [
    { skill: 'C++ Programming', category: 'Programming', difficulty: 'Hard', demand: 'High' },
    { skill: 'C# Programming', category: 'Programming', difficulty: 'Medium', demand: 'Very High' },
    { skill: 'Unity Engine', category: 'Tools', difficulty: 'Medium', demand: 'Very High' },
    { skill: 'Unreal Engine', category: 'Tools', difficulty: 'Hard', demand: 'High' },
    { skill: 'Graphics Programming', category: 'Programming', difficulty: 'Very Hard', demand: 'High' },
    { skill: 'AI Programming', category: 'Programming', difficulty: 'Hard', demand: 'Medium' },
    { skill: 'Network Programming', category: 'Programming', difficulty: 'Hard', demand: 'Medium' }
  ],
  'creative': [
    { skill: 'Game Design', category: 'Design', difficulty: 'Medium', demand: 'High' },
    { skill: 'Level Design', category: 'Design', difficulty: 'Medium', demand: 'High' },
    { skill: 'Narrative Design', category: 'Design', difficulty: 'Medium', demand: 'Medium' },
    { skill: '3D Art', category: 'Art', difficulty: 'Hard', demand: 'High' },
    { skill: '2D Art', category: 'Art', difficulty: 'Medium', demand: 'High' },
    { skill: 'Animation', category: 'Art', difficulty: 'Hard', demand: 'High' },
    { skill: 'UI/UX Design', category: 'Design', difficulty: 'Medium', demand: 'Very High' }
  ],
  'business': [
    { skill: 'Product Management', category: 'Management', difficulty: 'Medium', demand: 'High' },
    { skill: 'Data Analytics', category: 'Analytics', difficulty: 'Medium', demand: 'Very High' },
    { skill: 'User Research', category: 'Research', difficulty: 'Medium', demand: 'High' },
    { skill: 'Marketing', category: 'Marketing', difficulty: 'Medium', demand: 'High' },
    { skill: 'Community Management', category: 'Community', difficulty: 'Easy', demand: 'High' }
  ]
}

export default {
  EXPANDED_GAMING_STUDIOS,
  GAME_GENRE_CAREERS,
  TECHNOLOGY_STACKS,
  CAREER_PATHS,
  SKILL_ASSESSMENTS
}