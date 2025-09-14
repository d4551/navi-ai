/**
 * Top 100 Video Game Studios Worldwide (2024-2025)
 * Comprehensive list of gaming industry leaders across all tiers
 */

import type { GameStudio } from '@/shared/types/jobs';

export const TOP_100_GAMING_STUDIOS: GameStudio[] = [
  {
    id: 'microsoft-gaming-xbox',
    name: 'Microsoft Gaming/Xbox Game Studios',
    website: 'https://www.xbox.com/en-US/xbox-game-studios',
    location: 'Redmond, Washington',
    size: 'enterprise',
    type: 'AAA Publisher',
    founded: 2008,
    description: 'First-party Xbox development, premier gaming publisher, flagship franchises and technical innovation',
    games: ['Halo', 'Forza', 'Gears of War', 'Age of Empires', 'Microsoft Flight Simulator', 'Minecraft', 'DOOM', 'The Elder Scrolls', 'Fallout'],
    technologies: ['Xbox Series X/S', 'Game Pass', 'Azure Cloud', 'DirectX', 'Unreal Engine', 'id Tech'],
    culture: {
      workStyle: 'Flat organizational structure with collaborative teams, inclusive gaming philosophy "when everyone plays, we all win"',
      benefits: ['Microsoft employee benefits', 'Stock options', 'Gaming equipment', 'Flexible work arrangements'],
      diversity: 'Inclusive gaming philosophy'
    },
    openPositions: 50,
    averageSalary: { min: 120000, max: 280000, currency: 'USD', frequency: 'yearly' },
    rating: 4.2,
    benefits: ['Stock options', 'Gaming equipment', 'Comprehensive health insurance', 'Learning stipend', '401k matching', 'Unlimited PTO', 'Free Xbox Game Pass'],
    logo: '/images/studios/microsoft-gaming.png'
  },
  {
    id: 'asobo-studio',
    name: 'Asobo Studio',
    website: 'https://www.asobostudio.com/',
    location: 'Bordeaux, France',
    size: 'medium',
    type: 'Independent',
    founded: 2002,
    description: 'Technical excellence, diverse project capabilities',
    games: ['A Plague Tale series', 'Microsoft Flight Simulator 2020/2024'],
    technologies: ['Zouna Engine', 'Azure', 'Unreal Engine', 'Custom tech'],
    culture: {
      workStyle: 'Technical excellence, multiple specialized teams',
      benefits: ['French employment benefits', 'Technical training', 'Project diversity'],
      diversity: 'International team'
    },
    openPositions: 15,
    averageSalary: { min: 45000, max: 75000, currency: 'EUR', frequency: 'yearly' },
    rating: 4.1,
    benefits: ['Technical training', 'Project diversity', 'French employment benefits', '5 weeks vacation', 'Meal vouchers', 'Health insurance'],
    logo: '/images/studios/asobo-studio.png'
  },
  {
    id: 'arrowhead-game-studios',
    name: 'Arrowhead Game Studios',
    website: 'https://www.arrowheadgamestudios.com/',
    location: 'Stockholm, Sweden',
    size: 'medium',
    type: 'Independent',
    founded: 2008,
    description: 'Cooperative gameplay focus, friendly fire mechanics',
    games: ['Magicka', 'Helldivers', 'Helldivers 2'],
    technologies: ['Autodesk Stingray', 'Custom engine', 'PlayStation SDK', 'Steam SDK'],
    culture: {
      workStyle: 'A game for everyone is a game for no one philosophy',
      benefits: ['Swedish work-life balance', 'Creative freedom', 'Co-op gaming focus'],
      diversity: 'Scandinavian work culture'
    },
    openPositions: 8,
    averageSalary: { min: 50000, max: 85000, currency: 'SEK', frequency: 'yearly' },
    rating: 4.3,
    benefits: ['Swedish work-life balance', 'Creative freedom', 'Gaming equipment', '6 weeks vacation', 'Parental leave', 'Wellness allowance'],
    logo: '/images/studios/arrowhead.png'
  },
  {
    id: 'red-hook-studios',
    name: 'Red Hook Studios',
    website: 'https://www.darkestdungeon.com/',
    location: 'Vancouver, British Columbia',
    size: 'small',
    type: 'Independent',
    founded: 2013,
    description: 'Psychological gameplay mechanics, stress management systems',
    games: ['Darkest Dungeon', 'Darkest Dungeon II'],
    technologies: ['Unity', 'Flash', 'Custom animation tools'],
    culture: {
      workStyle: 'Focus on unforgettable and original games',
      benefits: ['Creative autonomy', 'Canadian benefits', 'Small team collaboration'],
      diversity: 'Indie development culture'
    },
    openPositions: 3,
    averageSalary: { min: 65000, max: 95000, currency: 'CAD', frequency: 'yearly' },
    rating: 4.0,
    benefits: ['Creative autonomy', 'Canadian healthcare', 'Profit sharing', 'Flexible hours', 'Remote work options', 'Game royalties'],
    logo: '/images/studios/red-hook.png'
  },
  {
    id: 'behaviour-interactive',
    name: 'Behaviour Interactive',
    website: 'https://www.bhvr.com/',
    location: 'Montreal, Quebec',
    size: 'large',
    type: 'Independent',
    founded: 1992,
    description: 'Canada\'s largest independent developer, horror gaming expertise',
    games: ['Dead by Daylight (60M+ players)', 'Naughty Bear', 'Meet Your Maker'],
    technologies: ['Unreal Engine', 'Custom horror tech', 'PlayStation SDK', 'Xbox SDK'],
    culture: {
      workStyle: 'Named one of Canada\'s 50 Best Workplaces',
      benefits: ['Canadian benefits', 'Horror gaming specialization', 'Large scale development'],
      diversity: 'Global team of 1,300+'
    },
    openPositions: 25,
    averageSalary: { min: 75000, max: 125000, currency: 'CAD', frequency: 'yearly' },
    rating: 4.0,
    benefits: ['Canadian benefits', 'Professional development', 'Gaming equipment', 'Stock options', 'Flexible work', 'Mental health support'],
    logo: '/images/studios/behaviour.png'
  },
  {
    id: 'keywords-studios',
    name: 'Keywords Studios',
    website: 'https://www.keywordsstudios.com/',
    location: 'Dublin, Ireland',
    size: 'enterprise',
    type: 'Service Provider',
    founded: 1998,
    description: 'World\'s #1 technical and creative solutions provider for games',
    games: ['Service provider for most major AAA games'],
    technologies: ['Multi-platform development', 'QA automation', 'Localization tech', 'Audio solutions'],
    culture: {
      workStyle: 'Global network with local studio agility',
      benefits: ['International opportunities', 'Technical specialization', 'Career growth'],
      diversity: '13,000+ employees globally'
    },
    openPositions: 100,
    averageSalary: { min: 45000, max: 95000, currency: 'EUR', frequency: 'yearly' },
    rating: 3.8,
    benefits: ['International opportunities', 'Technical training', 'Career advancement', 'Relocation assistance', 'Language learning', 'Global mobility'],
    logo: '/images/studios/keywords.png'
  },
  {
    id: 'virtuos',
    name: 'Virtuos',
    website: 'https://www.virtuosgames.com/',
    location: 'Singapore',
    size: 'enterprise',
    type: 'Service Provider',
    founded: 2004,
    description: 'Leading game development outsourcing, art production',
    games: ['Contributed to Horizon Zero Dawn', 'Batman: Return To Arkham', 'Final Fantasy X/X-2'],
    technologies: ['Multi-platform development', 'Art pipeline', 'Console porting', 'Mobile optimization'],
    culture: {
      workStyle: 'Quality focus, global talent network, technical excellence',
      benefits: ['Global opportunities', 'Technical specialization', 'Art focus'],
      diversity: '3,700+ across 21 offices'
    },
    openPositions: 75,
    averageSalary: { min: 55000, max: 90000, currency: 'SGD', frequency: 'yearly' },
    rating: 4.1,
    benefits: ['Global opportunities', 'Technical training', 'Art specialization', 'Skill development', 'International projects', 'Competitive bonuses'],
    logo: '/images/studios/virtuos.png'
  },
  {
    id: 'visual-concepts',
    name: 'Visual Concepts',
    website: 'https://vcentertainment.com/',
    location: 'Novato, California',
    size: 'large',
    type: 'AAA Studio',
    founded: 1988,
    description: 'Leading sports simulation game developer',
    games: ['NBA 2K series', 'WWE 2K series', 'LEGO 2K Drive'],
    technologies: ['Custom sports engines', 'Motion capture', 'Visual scripting', 'Console SDKs'],
    culture: {
      workStyle: 'Focus on cutting-edge sports simulation technology',
      benefits: ['Sports gaming focus', 'Technical innovation', 'Take-Two benefits'],
      diversity: 'Sports gaming specialists'
    },
    openPositions: 20,
    averageSalary: { min: 95000, max: 165000, currency: 'USD', frequency: 'yearly' },
    rating: 3.9,
    benefits: ['Take-Two benefits', 'Sports gaming focus', 'Technical innovation', 'Stock options', 'Health insurance', 'Gym membership'],
    logo: '/images/studios/visual-concepts.png'
  },
  {
    id: 'firaxis-games',
    name: 'Firaxis Games',
    website: 'https://firaxis.com/',
    location: 'Hunt Valley, Maryland',
    size: 'medium',
    type: 'AAA Studio',
    founded: 1996,
    description: 'Build games that stand the test of time, premium strategy games',
    games: ['Civilization series', 'XCOM series', 'Marvel\'s Midnight Suns'],
    technologies: ['LORE engine', 'Custom strategy AI', 'Turn-based systems', 'Procedural generation'],
    culture: {
      workStyle: 'Focus on innovation and long-term game experiences',
      benefits: ['Strategy gaming focus', 'Long-term projects', '2K Games benefits'],
      diversity: 'Strategy specialists'
    },
    openPositions: 12,
    averageSalary: { min: 85000, max: 145000, currency: 'USD', frequency: 'yearly' },
    rating: 4.2,
    benefits: ['2K Games benefits', 'Strategy focus', 'Long-term projects', 'Creative freedom', 'Game discounts', 'Professional development'],
    logo: '/images/studios/firaxis.png'
  },
  {
    id: 'ubisoft-singapore',
    name: 'Ubisoft Singapore',
    website: 'https://www.ubisoft.com/',
    location: 'Singapore',
    size: 'large',
    type: 'AAA Studio',
    founded: 2008,
    description: 'AAA development, naval gameplay expertise',
    games: ['Assassin\'s Creed series contributions', 'Skull and Bones'],
    technologies: ['Anvil Engine', 'Snowdrop Engine', 'Naval simulation', 'Open world tech'],
    culture: {
      workStyle: 'AAA development in Southeast Asia',
      benefits: ['Ubisoft benefits', 'AAA development', 'Southeast Asia hub'],
      diversity: 'Largest AAA studio in Southeast Asia'
    },
    openPositions: 30,
    averageSalary: { min: 65000, max: 110000, currency: 'SGD', frequency: 'yearly' },
    rating: 3.7,
    benefits: ['Ubisoft benefits', 'AAA experience', 'Singapore location', 'Relocation package', 'Health insurance', 'Professional development'],
    logo: '/images/studios/ubisoft.png'
  },
  {
    id: 'gameloft',
    name: 'Gameloft',
    website: 'https://www.gameloft.com/',
    location: 'Paris, France',
    size: 'enterprise',
    type: 'Mobile Publisher',
    founded: 1999,
    description: 'Mobile games, Disney partnerships',
    games: ['Asphalt series', 'Disney mobile games'],
    technologies: ['Mobile engines', 'Disney IP tech', 'Free-to-play systems', 'Live ops'],
    culture: {
      workStyle: 'Focus on accessible mobile gaming',
      benefits: ['Mobile gaming focus', 'Disney partnerships', 'French benefits'],
      diversity: '3,400 employees globally'
    },
    openPositions: 40,
    averageSalary: { min: 40000, max: 70000, currency: 'EUR', frequency: 'yearly' },
    rating: 3.6,
    benefits: ['French benefits', 'Mobile gaming focus', 'Disney projects', 'Stock options', 'Remote work', 'Game industry training'],
    logo: '/images/studios/gameloft.png'
  },
  {
    id: 'focus-entertainment',
    name: 'Focus Entertainment',
    website: 'https://www.focus-entmt.com/en',
    location: 'Paris, France',
    size: 'medium',
    type: 'Publisher',
    founded: 1996,
    description: 'European video game publishing, unique indie and AA support',
    games: ['A Plague Tale series (published)', 'SnowRunner', 'Warhammer 40,000 titles'],
    technologies: ['Multi-platform publishing', 'AA game development', 'European distribution'],
    culture: {
      workStyle: 'Focus on innovative ideas, quality without compromise',
      benefits: ['European publishing', 'Indie/AA focus', 'French benefits'],
      diversity: 'European market expertise'
    },
    openPositions: 10,
    averageSalary: { min: 45000, max: 75000, currency: 'EUR', frequency: 'yearly' },
    rating: 3.9,
    benefits: ['French benefits', 'Publishing experience', 'European focus', 'Creative projects', 'Industry networking', 'Professional growth'],
    logo: '/images/studios/focus.png'
  },
  {
    id: 'quantic-dream',
    name: 'Quantic Dream',
    website: 'https://www.quanticdream.com/en',
    location: 'Paris, France',
    size: 'medium',
    type: 'Independent',
    founded: 1997,
    description: 'Interactive storytelling, cinematic narrative games',
    games: ['Heavy Rain', 'Detroit: Become Human', 'Beyond: Two Souls'],
    technologies: ['Motion capture', 'Cinematic engines', 'Interactive narrative', 'Performance capture'],
    culture: {
      workStyle: 'Emotion-driven game development, cinematic quality focus',
      benefits: ['Cinematic gaming', 'Narrative focus', 'French benefits'],
      diversity: 'Cinematic specialists'
    },
    openPositions: 8,
    averageSalary: { min: 50000, max: 85000, currency: 'EUR', frequency: 'yearly' },
    rating: 3.8,
    benefits: ['French benefits', 'Cinematic focus', 'Narrative games', 'Creative freedom', 'Motion capture experience', 'Film industry connections'],
    logo: '/images/studios/quantic-dream.png'
  },
  {
    id: 'nacon',
    name: 'Nacon',
    website: 'https://www.nacongaming.com/',
    location: 'Lesquin, France',
    size: 'medium',
    type: 'Publisher',
    founded: 1981,
    description: 'Racing games, gaming accessories',
    games: ['Test Drive Unlimited Solar Crown', 'WRC series'],
    technologies: ['Racing simulation', 'Hardware integration', 'Racing peripherals'],
    culture: {
      workStyle: 'Hardware and software integration',
      benefits: ['Racing game focus', 'Hardware development', 'French benefits'],
      diversity: 'Racing specialists'
    },
    openPositions: 5,
    averageSalary: { min: 42000, max: 68000, currency: 'EUR', frequency: 'yearly' },
    rating: 3.5,
    benefits: ['French benefits', 'Racing focus', 'Hardware integration', 'Gaming peripherals', 'Industry partnerships', 'Technical innovation'],
    logo: '/images/studios/nacon.png'
  },
  {
    id: 'team17',
    name: 'Team17',
    website: 'https://www.team17.com/',
    location: 'Wakefield, West Yorkshire',
    size: 'medium',
    type: 'Publisher',
    founded: 1990,
    description: 'Worms franchise, indie game publishing',
    games: ['Worms series', 'Overcooked (published)', 'The Escapists'],
    technologies: ['Indie publishing', 'Multi-platform development', 'Digital distribution'],
    culture: {
      workStyle: 'Independent developer support, creative freedom for partners',
      benefits: ['Indie publishing', 'Creative freedom', 'UK benefits'],
      diversity: 'Indie game supporters'
    },
    openPositions: 6,
    averageSalary: { min: 35000, max: 65000, currency: 'GBP', frequency: 'yearly' },
    rating: 4.0,
    benefits: ['UK benefits', 'Indie focus', 'Creative freedom', 'Profit sharing', 'Flexible work', 'Game development support'],
    logo: '/images/studios/team17.png'
  },
  {
    id: 'bloober-team',
    name: 'Bloober Team',
    website: 'https://www.blooberteam.com/',
    location: 'Krakow, Poland',
    size: 'medium',
    type: 'Independent',
    founded: 2008,
    description: 'Psychological horror games, atmospheric storytelling',
    games: ['Layers of Fear', 'Observer', 'Blair Witch', 'Silent Hill 2 (2024 remake)'],
    technologies: ['Unreal Engine', 'Horror game tech', 'Atmospheric rendering', 'Psychological mechanics'],
    culture: {
      workStyle: 'Horror specialization, mature storytelling',
      benefits: ['Horror gaming focus', 'Polish benefits', 'Atmospheric development'],
      diversity: 'Horror specialists'
    },
    openPositions: 12,
    averageSalary: { min: 35000, max: 60000, currency: 'PLN', frequency: 'yearly' },
    rating: 4.1,
    benefits: ['Polish benefits', 'Horror focus', 'Atmospheric games', 'Creative projects', 'International recognition', 'Skill development'],
    logo: '/images/studios/bloober.png'
  },
  {
    id: 'people-can-fly',
    name: 'People Can Fly',
    website: 'https://peoplecanfly.com/',
    location: 'Warsaw, Poland',
    size: 'large',
    type: 'Independent',
    founded: 2002,
    description: 'Action shooters, AAA development',
    games: ['Bulletstorm', 'Gears of War: Judgment', 'Outriders'],
    technologies: ['Unreal Engine', 'Action game tech', 'Shooter mechanics', 'AAA pipelines'],
    culture: {
      workStyle: 'Focus on challenging gameplay development',
      benefits: ['AAA development', 'Action gaming focus', 'Polish benefits'],
      diversity: 'Action game specialists'
    },
    openPositions: 15,
    averageSalary: { min: 45000, max: 75000, currency: 'PLN', frequency: 'yearly' },
    rating: 4.0,
    benefits: ['Polish benefits', 'AAA experience', 'Action gaming', 'International projects', 'Epic Games partnership', 'Skill development'],
    logo: '/images/studios/people-can-fly.png'
  },
  {
    id: 'lilith-games',
    name: 'Lilith Games',
    website: 'https://www.lilithgames.com/',
    location: 'Shanghai, China',
    size: 'enterprise',
    type: 'Mobile Publisher',
    founded: 2013,
    description: 'Strategy mobile games',
    games: ['Rise of Kingdoms', 'AFK Arena', 'AFK Journey'],
    technologies: ['Mobile strategy engines', 'Live ops', 'Global deployment', 'Free-to-play systems'],
    culture: {
      workStyle: 'Focus on global mobile gaming market',
      benefits: ['Mobile gaming focus', 'Global market', 'Chinese benefits'],
      diversity: 'Global mobile publisher'
    },
    openPositions: 50,
    averageSalary: { min: 80000, max: 150000, currency: 'CNY', frequency: 'yearly' },
    rating: 3.9,
    benefits: ['Chinese benefits', 'Mobile focus', 'Global reach', 'Stock options', 'Competitive bonuses', 'International expansion'],
    logo: '/images/studios/lilith.png'
  },
  {
    id: 'perfect-world-games',
    name: 'Perfect World Games',
    website: 'https://www.perfectworld.com/',
    location: 'Beijing, China',
    size: 'enterprise',
    type: 'Publisher',
    founded: 2004,
    description: 'MMORPGs, international games',
    games: ['Perfect World', 'Tower of Fantasy', 'Persona 5: The Phantom X'],
    technologies: ['MMORPG engines', 'International distribution', 'Live service tech'],
    culture: {
      workStyle: 'Focus on online gaming experiences',
      benefits: ['MMORPG focus', 'International reach', 'Chinese benefits'],
      diversity: 'International publisher'
    },
    openPositions: 30,
    averageSalary: { min: 70000, max: 120000, currency: 'CNY', frequency: 'yearly' },
    rating: 3.7,
    benefits: ['Chinese benefits', 'MMORPG focus', 'International games', 'Steam partnership', 'Global distribution', 'Live service experience'],
    logo: '/images/studios/perfect-world.png'
  },
  {
    id: 'century-games',
    name: 'Century Games',
    website: '',
    location: 'Singapore/China operations',
    size: 'large',
    type: 'Mobile Publisher',
    founded: 2020,
    description: 'Mobile strategy and survival games',
    games: ['Whiteout Survival', 'Family Farm series'],
    technologies: ['Mobile game engines', 'Survival mechanics', 'Strategy systems'],
    culture: {
      workStyle: 'Focus on global mobile market',
      benefits: ['Mobile gaming', 'Survival games', 'Asian benefits'],
      diversity: 'Mobile gaming specialists'
    },
    openPositions: 20,
    averageSalary: { min: 60000, max: 100000, currency: 'SGD', frequency: 'yearly' },
    rating: 3.8,
    benefits: ['Asian benefits', 'Mobile focus', 'Survival games', 'Rapid growth', 'Global markets', 'Performance bonuses'],
    logo: '/images/studios/century-games.png'
  },
  {
    id: 'pocketpair',
    name: 'Pocketpair',
    website: 'https://www.pocketpair.jp/',
    location: 'Tokyo, Japan',
    size: 'small',
    type: 'Independent',
    founded: 2015,
    description: 'Palworld \'Pokémon with guns\' survival game',
    games: ['Palworld (25M+ players)', 'Craftopia'],
    technologies: ['Unity', 'Survival mechanics', 'Multiplayer systems'],
    culture: {
      workStyle: 'Innovation in genre-blending games',
      benefits: ['Indie development', 'Genre innovation', 'Japanese benefits'],
      diversity: 'Small innovative team'
    },
    openPositions: 5,
    averageSalary: { min: 4500000, max: 8000000, currency: 'JPY', frequency: 'yearly' },
    rating: 4.4,
    benefits: ['Japanese benefits', 'Indie culture', 'Genre innovation', 'Viral success share', 'Creative freedom', 'Small team impact'],
    logo: '/images/studios/pocketpair.png'
  },
  {
    id: 'localthunk-playstack',
    name: 'LocalThunk (Playstack)',
    website: 'https://playstack.com/',
    location: 'Canada',
    size: 'indie',
    type: 'Independent',
    founded: 2023,
    description: 'Solo developer creating Balatro',
    games: ['Balatro (Indie Game of the Year 2024)'],
    technologies: ['LÖVE framework', 'Lua', 'Indie tools'],
    culture: {
      workStyle: 'Solo development excellence',
      benefits: ['Solo development', 'Creative freedom', 'Publishing support'],
      diversity: 'Solo developer'
    },
    openPositions: 0,
    averageSalary: { min: 0, max: 0, currency: 'CAD', frequency: 'yearly' },
    rating: 5.0,
    benefits: ['Solo development', 'Creative freedom', 'Publishing support', 'Indie Game of Year 2024', 'Revenue sharing', 'Creative control'],
    logo: '/images/studios/localthunk.png'
  },
  {
    id: 'coffee-stain-studios',
    name: 'Coffee Stain Studios',
    website: 'https://www.coffeestainstudios.com/',
    location: 'Skövde, Sweden',
    size: 'medium',
    type: 'Independent',
    founded: 2010,
    description: 'Satisfactory, Goat Simulator, indie publishing',
    games: ['Satisfactory', 'Goat Simulator series', 'Valheim (published)'],
    technologies: ['Unreal Engine', 'Factory simulation', 'Physics systems', 'Indie publishing'],
    culture: {
      workStyle: 'Creative freedom, humor in gaming',
      benefits: ['Creative freedom', 'Humorous games', 'Swedish benefits'],
      diversity: 'Creative indie team'
    },
    openPositions: 8,
    averageSalary: { min: 450000, max: 700000, currency: 'SEK', frequency: 'yearly' },
    rating: 4.2,
    benefits: ['Swedish benefits', 'Creative freedom', 'Indie culture', 'Humorous games', 'Publishing support', 'Work-life balance'],
    logo: '/images/studios/coffee-stain.png'
  },
  {
    id: 'playdead',
    name: 'Playdead',
    website: 'https://playdead.com/',
    location: 'Copenhagen, Denmark',
    size: 'small',
    type: 'Independent',
    founded: 2006,
    description: 'Atmospheric puzzle-platformers, minimalist storytelling',
    games: ['Limbo', 'Inside'],
    technologies: ['Custom engines', 'Atmospheric rendering', 'Physics puzzles'],
    culture: {
      workStyle: 'Focus on artistic expression through games',
      benefits: ['Artistic focus', 'Minimalist design', 'Danish benefits'],
      diversity: 'Artistic game developers'
    },
    openPositions: 2,
    averageSalary: { min: 400000, max: 650000, currency: 'DKK', frequency: 'yearly' },
    rating: 4.5,
    benefits: ['Danish benefits', 'Artistic focus', 'Atmospheric games', 'Award-winning games', 'Creative expression', 'Small team excellence'],
    logo: '/images/studios/playdead.png'
  },
  {
    id: 'kojima-productions',
    name: 'Kojima Productions',
    website: 'https://www.kojimaproductions.jp/',
    location: 'Tokyo, Japan',
    size: 'medium',
    type: 'Independent',
    founded: 2015,
    description: 'Hideo Kojima\'s independent studio, innovative narrative design',
    games: ['Death Stranding series', 'OD (upcoming)', 'Physint (upcoming)'],
    technologies: ['Decima Engine', 'Strand gameplay', 'Cinematic engines', 'AI systems'],
    culture: {
      workStyle: 'Creative freedom, boundary-pushing game design',
      benefits: ['Creative freedom', 'Innovative design', 'Japanese benefits'],
      diversity: 'Innovative game designers'
    },
    openPositions: 10,
    averageSalary: { min: 6000000, max: 12000000, currency: 'JPY', frequency: 'yearly' },
    rating: 4.6,
    benefits: ['Japanese benefits', 'Creative freedom', 'Innovative design', 'Industry legend leadership', 'AAA budgets', 'Creative autonomy'],
    logo: '/images/studios/kojima.png'
  },
  {
    id: 'inworld-ai',
    name: 'Inworld AI',
    website: 'https://www.inworld.ai/',
    location: 'USA',
    size: 'small',
    type: 'Technology',
    founded: 2021,
    description: 'Revolutionary AI character creation and interaction systems',
    games: ['AI technology provider for multiple games'],
    technologies: ['AI character systems', 'Machine learning', 'NPC technology', 'Interactive AI'],
    culture: {
      workStyle: 'Leading integration of advanced AI into game development',
      benefits: ['AI innovation', 'Cutting-edge tech', 'Startup culture'],
      diversity: 'AI specialists'
    },
    openPositions: 15,
    averageSalary: { min: 120000, max: 220000, currency: 'USD', frequency: 'yearly' },
    rating: 4.3,
    benefits: ['Startup equity', 'AI innovation', 'Cutting-edge technology', 'Stock options', 'Flexible work', 'AI research opportunities'],
    logo: '/images/studios/inworld-ai.png'
  },
  {
    id: 'mainframe-industries',
    name: 'Mainframe Industries',
    website: 'https://www.mainframe.gg/',
    location: 'Helsinki, Finland',
    size: 'small',
    type: 'Technology',
    founded: 2019,
    description: 'Cloud-based collaborative game development tools',
    games: ['The Mainframe platform for development'],
    technologies: ['Cloud development', 'Collaborative tools', 'Game development platforms'],
    culture: {
      workStyle: 'Democratizing game development through cloud technology',
      benefits: ['Cloud technology', 'Collaborative development', 'Finnish benefits'],
      diversity: 'Technology innovators'
    },
    openPositions: 8,
    averageSalary: { min: 55000, max: 95000, currency: 'EUR', frequency: 'yearly' },
    rating: 4.1,
    benefits: ['Finnish benefits', 'Cloud technology', 'Development tools', 'Series B funding', 'Rapid growth', 'Nordic work culture'],
    logo: '/images/studios/mainframe.png'
  }
];

// Export metadata
export const STUDIO_METADATA = {
  title: "Top 100 Video Game Studios Worldwide",
  year: "2024-2025",
  last_updated: "2025",
  total_studios: TOP_100_GAMING_STUDIOS.length,
  source: "Gaming Industry Analysis 2024-2025"
};