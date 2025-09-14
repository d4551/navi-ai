/**
 * Comprehensive Gaming Studios Database
 * Contains detailed information about major gaming companies worldwide
 * Designed to power job search, networking, and career planning features
 */

export const GAMING_STUDIOS = [
  // Tier 1 - AAA Studios and Major Publishers
  {
    id: 'riot-games',
    name: 'Riot Games',
    description: 'Creators of League of Legends and VALORANT, focused on player-focused game experiences',
    location: 'Los Angeles, CA',
    headquarters: 'Los Angeles, CA',
    logoPath: 'riot-games-logo.svg',
    employeeCount: '2500+',
    founded: '2006',
    industry: 'Game Development & Publishing',
    website: 'https://www.riotgames.com',
    stockTicker: null,
    parentCompany: 'Tencent Holdings',
    games: [
      'League of Legends',
      'VALORANT', 
      'Teamfight Tactics',
      'Legends of Runeterra',
      'League of Legends: Wild Rift'
    ],
    specialties: ['MOBA', 'FPS', 'Auto-battler', 'Card Games', 'Esports'],
    culture: ['Player-focused', 'Innovation-driven', 'Competitive gaming', 'Global reach'],
    careerOpportunities: [
      'Game Designer',
      'Software Engineer', 
      'Data Scientist',
      'Esports Producer',
      'Community Manager',
      'UX Designer',
      '3D Artist',
      'QA Engineer'
    ],
    benefits: ['Stock options', 'Health insurance', 'Gaming sabbatical', 'Professional development'],
    techStack: ['C++', 'Python', 'React', 'AWS', 'Kubernetes'],
    averageSalary: '$120k-$180k',
    glassdoorRating: 4.2
  },
  
  {
    id: 'electronic-arts',
    name: 'Electronic Arts (EA)',
    description: 'One of the largest video game publishers, known for FIFA, The Sims, and Battlefield franchises',
    location: 'Redwood City, CA',
    headquarters: 'Redwood City, CA',
    logoPath: 'ea-logo.svg',
    employeeCount: '9500+',
    founded: '1982',
    industry: 'Game Publishing & Development',
    website: 'https://www.ea.com',
    stockTicker: 'NASDAQ:EA',
    parentCompany: null,
    games: [
      'EA Sports FIFA',
      'The Sims',
      'Battlefield',
      'Apex Legends',
      'Mass Effect',
      'Dragon Age',
      'Need for Speed',
      'Madden NFL'
    ],
    specialties: ['Sports Games', 'Battle Royale', 'RPG', 'Racing', 'Simulation'],
    culture: ['Innovation', 'Inclusion & Diversity', 'Sports passion', 'Creative excellence'],
    careerOpportunities: [
      'Product Manager',
      'Game Producer',
      'Software Developer',
      'Game Designer',
      'Data Analyst',
      'Marketing Manager',
      'Technical Artist',
      'Live Operations'
    ],
    benefits: ['Stock purchase plan', 'Health & wellness', 'Flexible work', 'Learning stipend'],
    techStack: ['C++', 'C#', 'Unity', 'Unreal Engine', 'Java', 'Python'],
    averageSalary: '$115k-$170k',
    glassdoorRating: 3.8
  },

  {
    id: 'activision-blizzard',
    name: 'Activision Blizzard',
    description: 'Publisher of Call of Duty, World of Warcraft, Overwatch, and mobile gaming leader',
    location: 'Santa Monica, CA',
    headquarters: 'Santa Monica, CA',
    logoPath: 'activision-blizzard-logo.svg',
    employeeCount: '9000+',
    founded: '2008',
    industry: 'Game Publishing & Development',
    website: 'https://www.activisionblizzard.com',
    stockTicker: 'NASDAQ:ATVI',
    parentCompany: 'Microsoft Corporation',
    games: [
      'Call of Duty series',
      'World of Warcraft',
      'Overwatch',
      'Diablo',
      'StarCraft',
      'Hearthstone',
      'Candy Crush Saga',
      'Crash Bandicoot'
    ],
    specialties: ['FPS', 'MMORPG', 'Mobile Gaming', 'Real-time Strategy', 'Card Games'],
    culture: ['Excellence', 'Innovation', 'Community-first', 'Global gaming'],
    careerOpportunities: [
      'Senior Game Designer',
      'Engine Programmer',
      'Technical Director',
      'Producer',
      'Community Manager',
      'Monetization Specialist',
      'DevOps Engineer',
      'Security Engineer'
    ],
    benefits: ['Comprehensive healthcare', 'Stock options', 'Sabbatical program', 'Gym membership'],
    techStack: ['C++', 'C#', 'Python', 'Unity', 'Proprietary engines'],
    averageSalary: '$125k-$200k',
    glassdoorRating: 3.5
  },

  {
    id: 'ubisoft',
    name: 'Ubisoft Entertainment',
    description: 'French multinational developer of Assassin\'s Creed, Rainbow Six, and Far Cry franchises',
    location: 'Montreal, Canada',
    headquarters: 'Montreuil, France',
    logoPath: 'ubisoft-logo.svg',
    employeeCount: '18000+',
    founded: '1986',
    industry: 'Game Development & Publishing',
    website: 'https://www.ubisoft.com',
    stockTicker: 'EPA:UBI',
    parentCompany: null,
    games: [
      'Assassin\'s Creed series',
      'Rainbow Six Siege',
      'Far Cry series', 
      'Watch Dogs series',
      'The Division',
      'Ghost Recon',
      'Mario + Rabbids',
      'Just Dance'
    ],
    specialties: ['Open World', 'Tactical Shooters', 'Action-Adventure', 'Motion Gaming'],
    culture: ['Creative freedom', 'Global collaboration', 'Diversity', 'Innovation'],
    careerOpportunities: [
      'Level Designer',
      'Gameplay Programmer',
      '3D Environment Artist',
      'Game Producer',
      'AI Programmer',
      'UX/UI Designer',
      'Narrative Designer',
      'Technical Artist'
    ],
    benefits: ['Profit sharing', 'Health benefits', 'Flexible hours', 'Relocation assistance'],
    techStack: ['C++', 'Python', 'Proprietary engines', 'Maya', 'Substance'],
    averageSalary: '$85k-$140k',
    glassdoorRating: 4.0
  },

  {
    id: 'epic-games',
    name: 'Epic Games',
    description: 'Creator of Fortnite and Unreal Engine, pioneering metaverse experiences',
    location: 'Cary, NC',
    headquarters: 'Cary, NC',
    logoPath: 'epic-games-logo.svg',
    employeeCount: '3000+',
    founded: '1991',
    industry: 'Game Development & Technology',
    website: 'https://www.epicgames.com',
    stockTicker: null,
    parentCompany: null,
    games: [
      'Fortnite',
      'Rocket League', 
      'Fall Guys',
      'Gears of War series',
      'Unreal Tournament'
    ],
    specialties: ['Battle Royale', 'Game Engine Technology', 'Metaverse', 'Digital Distribution'],
    culture: ['Innovation', 'Player empowerment', 'Open development', 'Technical excellence'],
    careerOpportunities: [
      'Engine Programmer',
      'Technical Artist',
      'DevRel Engineer',
      'Product Manager',
      'Backend Engineer',
      'Platform Engineer',
      'Cloud Architect',
      'Security Engineer'
    ],
    benefits: ['Stock options', 'Comprehensive health', 'Professional development', 'Remote-friendly'],
    techStack: ['C++', 'Unreal Engine', 'Python', 'AWS', 'Kubernetes'],
    averageSalary: '$130k-$220k',
    glassdoorRating: 4.3
  },

  // Tier 2 - Mid-size and Specialized Studios
  {
    id: 'naughty-dog',
    name: 'Naughty Dog',
    description: 'Acclaimed studio behind The Last of Us and Uncharted, masters of narrative-driven games',
    location: 'Santa Monica, CA',
    headquarters: 'Santa Monica, CA',
    logoPath: 'naughty-dog-logo.svg',
    employeeCount: '300+',
    founded: '1984',
    industry: 'Game Development',
    website: 'https://www.naughtydog.com',
    stockTicker: null,
    parentCompany: 'Sony Interactive Entertainment',
    games: [
      'The Last of Us series',
      'Uncharted series',
      'Jak and Daxter series'
    ],
    specialties: ['Action-Adventure', 'Narrative Design', 'Character Development', 'PlayStation Exclusives'],
    culture: ['Creative excellence', 'Storytelling mastery', 'Team collaboration', 'PlayStation heritage'],
    careerOpportunities: [
      'Narrative Designer',
      'Character Artist',
      'Animation Programmer',
      'Level Designer',
      'Audio Designer',
      'Gameplay Engineer',
      'Technical Animator',
      'Cinematics Artist'
    ],
    benefits: ['Sony benefits', 'Creative freedom', 'Learning opportunities', 'Industry recognition'],
    techStack: ['C++', 'Proprietary engine', 'Maya', 'Houdini', 'Perforce'],
    averageSalary: '$110k-$160k',
    glassdoorRating: 4.4
  },

  {
    id: 'cd-projekt-red',
    name: 'CD Projekt RED',
    description: 'Polish developer of The Witcher series and Cyberpunk 2077, known for ambitious RPGs',
    location: 'Warsaw, Poland',
    headquarters: 'Warsaw, Poland', 
    logoPath: 'cd-projekt-red-logo.svg',
    employeeCount: '800+',
    founded: '2002',
    industry: 'Game Development',
    website: 'https://www.cdprojekt.com',
    stockTicker: 'WSE:CDR',
    parentCompany: 'CD Projekt',
    games: [
      'The Witcher 3: Wild Hunt',
      'Cyberpunk 2077',
      'The Witcher series',
      'Gwent: The Witcher Card Game'
    ],
    specialties: ['Open World RPG', 'Narrative Design', 'Choice & Consequence', 'DLC Excellence'],
    culture: ['Artistic vision', 'Player respect', 'Polish gaming pride', 'Innovation'],
    careerOpportunities: [
      'Quest Designer',
      'World Builder',
      'RPG Systems Designer',
      'Environment Artist',
      'Gameplay Programmer',
      'Narrative Writer',
      'Technical Designer',
      'QA Analyst'
    ],
    benefits: ['Profit sharing', 'Health insurance', 'Flexible work', 'Game copies'],
    techStack: ['C++', 'REDengine', 'Python', 'Lua', '3ds Max'],
    averageSalary: '$45k-$80k',
    glassdoorRating: 3.9
  },

  {
    id: 'respawn-entertainment',
    name: 'Respawn Entertainment',
    description: 'Studio behind Titanfall, Apex Legends, and Star Wars Jedi series',
    location: 'Los Angeles, CA',
    headquarters: 'Los Angeles, CA',
    logoPath: 'respawn-entertainment-logo.svg',
    employeeCount: '400+',
    founded: '2010',
    industry: 'Game Development',
    website: 'https://www.respawn.com',
    stockTicker: null,
    parentCompany: 'Electronic Arts',
    games: [
      'Apex Legends',
      'Titanfall series',
      'Star Wars Jedi: Fallen Order',
      'Star Wars Jedi: Survivor',
      'Medal of Honor: Above and Beyond'
    ],
    specialties: ['Battle Royale', 'FPS Innovation', 'Mobility Systems', 'Star Wars Games'],
    culture: ['Innovation', 'Player-first design', 'Fast iteration', 'Team empowerment'],
    careerOpportunities: [
      'Gameplay Engineer', 
      'Network Programmer',
      'Live Service Designer',
      'Weapons Designer',
      'Character Artist',
      'VFX Artist',
      'Audio Programmer',
      'Backend Engineer'
    ],
    benefits: ['EA benefits package', 'Stock options', 'Creative freedom', 'Industry connections'],
    techStack: ['C++', 'Source Engine', 'Python', 'Perforce', 'Maya'],
    averageSalary: '$120k-$175k',
    glassdoorRating: 4.1
  },

  // Gaming Technology & Platform Companies
  {
    id: 'valve-corporation',
    name: 'Valve Corporation',
    description: 'Creator of Steam platform, Half-Life, Portal, and pioneers in VR with Steam Deck',
    location: 'Bellevue, WA',
    headquarters: 'Bellevue, WA',
    logoPath: 'valve-logo.svg',
    employeeCount: '360+',
    founded: '1996',
    industry: 'Game Development & Platform',
    website: 'https://www.valvesoftware.com',
    stockTicker: null,
    parentCompany: null,
    games: [
      'Half-Life series',
      'Portal series',
      'Counter-Strike series',
      'Dota 2',
      'Team Fortress 2',
      'Left 4 Dead series'
    ],
    specialties: ['Digital Distribution', 'VR Technology', 'Competitive Gaming', 'Platform Technology'],
    culture: ['Flat organization', 'Self-direction', 'Innovation freedom', 'Long-term thinking'],
    careerOpportunities: [
      'Software Engineer',
      'Hardware Engineer',
      'VR Developer',
      'Platform Engineer',
      'Economist',
      'Data Scientist',
      'Network Engineer',
      'Linux Developer'
    ],
    benefits: ['Profit sharing', 'Flexible work', 'Travel opportunities', 'Hardware discounts'],
    techStack: ['C++', 'Python', 'Linux', 'OpenGL/Vulkan', 'Steam SDK'],
    averageSalary: '$150k-$250k',
    glassdoorRating: 4.2
  },

  {
    id: 'unity-technologies',
    name: 'Unity Technologies',
    description: 'Leading game engine provider empowering millions of creators worldwide',
    location: 'San Francisco, CA',
    headquarters: 'San Francisco, CA',
    logoPath: 'unity-logo.svg',
    employeeCount: '5000+',
    founded: '2004',
    industry: 'Game Engine & Technology',
    website: 'https://unity.com',
    stockTicker: 'NYSE:U',
    parentCompany: null,
    games: [
      'Unity Engine (Platform)',
      'Unity Asset Store',
      'Unity Cloud Build',
      'Unity Analytics'
    ],
    specialties: ['Game Engine', 'Cross-platform Development', 'AR/VR', 'Real-time 3D'],
    culture: ['Creator empowerment', 'Innovation', 'Global impact', 'Technical excellence'],
    careerOpportunities: [
      'Engine Developer',
      'Developer Relations',
      'Technical Writer',
      'Product Manager',
      'Graphics Programmer',
      'Platform Engineer',
      'DevOps Engineer',
      'Solutions Engineer'
    ],
    benefits: ['Stock options', 'Learning budget', 'Flexible PTO', 'Remote options'],
    techStack: ['C++', 'C#', 'Unity Engine', 'JavaScript', 'Python'],
    averageSalary: '$125k-$190k',
    glassdoorRating: 4.0
  },

  // Mobile Gaming Leaders
  {
    id: 'supercell',
    name: 'Supercell',
    description: 'Finnish mobile game company behind Clash of Clans, Clash Royale, and Brawl Stars',
    location: 'Helsinki, Finland',
    headquarters: 'Helsinki, Finland',
    logoPath: 'supercell-logo.svg',
    employeeCount: '300+',
    founded: '2010',
    industry: 'Mobile Game Development',
    website: 'https://supercell.com',
    stockTicker: null,
    parentCompany: 'Tencent Holdings',
    games: [
      'Clash of Clans',
      'Clash Royale',
      'Brawl Stars',
      'Hay Day',
      'Boom Beach'
    ],
    specialties: ['Mobile Strategy', 'Live Service', 'Community Building', 'Monetization'],
    culture: ['Small teams', 'Best people', 'Long-term thinking', 'Player-first'],
    careerOpportunities: [
      'Game Designer',
      'Mobile Developer',
      'Data Analyst',
      'Community Manager',
      'Product Manager',
      'Backend Engineer',
      'LiveOps Specialist',
      'Art Director'
    ],
    benefits: ['Profit sharing', 'Flexible work', 'Health benefits', 'Relocation support'],
    techStack: ['Unity', 'C#', 'Python', 'AWS', 'Kubernetes'],
    averageSalary: '$95k-$150k',
    glassdoorRating: 4.5
  },

  {
    id: 'king',
    name: 'King',
    description: 'Mobile gaming giant behind Candy Crush Saga and other casual gaming hits',
    location: 'London, UK',
    headquarters: 'Stockholm, Sweden',
    logoPath: 'king-logo.svg',
    employeeCount: '2000+',
    founded: '2003',
    industry: 'Mobile Game Development',
    website: 'https://king.com',
    stockTicker: null,
    parentCompany: 'Activision Blizzard',
    games: [
      'Candy Crush Saga',
      'Candy Crush Soda Saga',
      'Farm Heroes Saga',
      'Pet Rescue Saga',
      'Bubble Witch series'
    ],
    specialties: ['Casual Mobile Games', 'Match-3 Games', 'LiveOps', 'Data-driven Design'],
    culture: ['Fun-first', 'Data-driven decisions', 'Global reach', 'Player engagement'],
    careerOpportunities: [
      'Data Scientist',
      'Mobile Game Designer',
      'LiveOps Manager',
      'User Acquisition',
      'Backend Developer',
      'Product Manager',
      'UI/UX Designer',
      'QA Engineer'
    ],
    benefits: ['Health insurance', 'Stock options', 'Learning opportunities', 'Flexible hours'],
    techStack: ['C++', 'Java', 'Unity', 'Python', 'Scala'],
    averageSalary: '$85k-$130k',
    glassdoorRating: 3.8
  },

  // Emerging and Indie Studios
  {
    id: 'mihoyo',
    name: 'miHoYo (HoYoverse)',
    description: 'Chinese developer of Genshin Impact and Honkai series, leading in anime-style games',
    location: 'Shanghai, China',
    headquarters: 'Shanghai, China',
    logoPath: 'mihoyo-logo.svg',
    employeeCount: '5000+',
    founded: '2012',
    industry: 'Mobile & PC Game Development',
    website: 'https://www.hoyoverse.com',
    stockTicker: null,
    parentCompany: null,
    games: [
      'Genshin Impact',
      'Honkai Impact 3rd',
      'Honkai: Star Rail',
      'Tears of Themis',
      'Zenless Zone Zero'
    ],
    specialties: ['Anime-style RPG', 'Gacha Systems', 'Cross-platform', 'Live Service'],
    culture: ['Tech otaku', 'Anime culture', 'Global expansion', 'Innovation'],
    careerOpportunities: [
      'Game Designer',
      'Character Artist',
      'Technical Artist',
      'Backend Engineer',
      'Localization Manager',
      'Community Manager',
      'Product Manager',
      'Data Analyst'
    ],
    benefits: ['Competitive salary', 'Stock options', 'Health coverage', 'Gaming perks'],
    techStack: ['Unity', 'C#', 'Python', 'Lua', 'Maya'],
    averageSalary: '$70k-$120k',
    glassdoorRating: 4.2
  },

  {
    id: 'larian-studios',
    name: 'Larian Studios',
    description: 'Belgian RPG specialists behind Baldur\'s Gate 3 and Divinity series',
    location: 'Ghent, Belgium',
    headquarters: 'Ghent, Belgium',
    logoPath: 'larian-studios-logo.svg',
    employeeCount: '450+',
    founded: '1996',
    industry: 'Game Development',
    website: 'https://larian.com',
    stockTicker: null,
    parentCompany: null,
    games: [
      'Baldur\'s Gate 3',
      'Divinity: Original Sin 2',
      'Divinity: Original Sin',
      'Dragon Commander'
    ],
    specialties: ['CRPG', 'Turn-based Combat', 'Narrative Design', 'Co-op Multiplayer'],
    culture: ['Player freedom', 'Creative storytelling', 'Quality over quantity', 'Innovation'],
    careerOpportunities: [
      'RPG Systems Designer',
      'Narrative Writer',
      'Quest Designer',
      'Technical Designer',
      'Character Artist',
      'Environment Artist',
      'Gameplay Programmer',
      'Tool Programmer'
    ],
    benefits: ['Profit sharing', 'Health insurance', 'Flexible work', 'Creative freedom'],
    techStack: ['C++', 'Proprietary engine', 'Python', 'Lua', 'Maya'],
    averageSalary: '$65k-$110k',
    glassdoorRating: 4.3
  },

  {
    id: 'fromsoft',
    name: 'FromSoftware',
    description: 'Japanese developer renowned for Dark Souls, Elden Ring, and challenging action RPGs',
    location: 'Tokyo, Japan',
    headquarters: 'Tokyo, Japan',
    logoPath: 'fromsoft-logo.svg',
    employeeCount: '300+',
    founded: '1986',
    industry: 'Game Development',
    website: 'https://www.fromsoftware.jp',
    stockTicker: null,
    parentCompany: 'Kadokawa Corporation',
    games: [
      'Elden Ring',
      'Dark Souls series',
      'Bloodborne',
      'Sekiro: Shadows Die Twice',
      'Demon\'s Souls'
    ],
    specialties: ['Action RPG', 'Challenging Gameplay', 'Atmospheric Design', 'Boss Design'],
    culture: ['Artistic vision', 'Challenge-focused', 'Japanese craftsmanship', 'Innovation'],
    careerOpportunities: [
      'Game Designer',
      'Boss Designer',
      'Level Designer',
      'Gameplay Programmer',
      'Animation Programmer',
      'Character Artist',
      'Environment Artist',
      'Technical Artist'
    ],
    benefits: ['Japanese benefits', 'Creative freedom', 'Industry prestige', 'Skill development'],
    techStack: ['C++', 'Proprietary engine', 'Maya', '3ds Max', 'Substance'],
    averageSalary: '$55k-$95k',
    glassdoorRating: 4.1
  },

  {
    id: 'rockstar-games',
    name: 'Rockstar Games',
    description: 'Creator of Grand Theft Auto and Red Dead series, masters of open-world gaming',
    location: 'New York, NY',
    headquarters: 'New York, NY',
    logoPath: 'rockstar-logo.svg',
    employeeCount: '2000+',
    founded: '1998',
    industry: 'Game Development & Publishing',
    website: 'https://www.rockstargames.com',
    stockTicker: null,
    parentCompany: 'Take-Two Interactive',
    games: [
      'Grand Theft Auto V',
      'Red Dead Redemption 2',
      'Grand Theft Auto series',
      'Red Dead series',
      'Max Payne series',
      'Bully'
    ],
    specialties: ['Open World', 'Crime/Western Themes', 'Narrative Design', 'Technical Achievement'],
    culture: ['Perfectionism', 'Attention to detail', 'Long development cycles', 'High standards'],
    careerOpportunities: [
      'World Designer',
      'Mission Designer',
      'Narrative Designer',
      'Engine Programmer',
      'Graphics Programmer',
      'Character Artist',
      'Environment Artist',
      'Technical Artist'
    ],
    benefits: ['Take-Two benefits', 'Stock options', 'Health coverage', 'Industry prestige'],
    techStack: ['C++', 'RAGE engine', 'Python', 'Maya', 'Substance'],
    averageSalary: '$110k-$180k',
    glassdoorRating: 3.7
  },

  {
    id: 'bungie',
    name: 'Bungie',
    description: 'Creators of Halo and Destiny franchises, pioneers in shared-world shooters',
    location: 'Bellevue, WA',
    headquarters: 'Bellevue, WA',
    logoPath: 'bungie-logo.svg',
    employeeCount: '900+',
    founded: '1991',
    industry: 'Game Development',
    website: 'https://www.bungie.net',
    stockTicker: null,
    parentCompany: 'Sony Interactive Entertainment',
    games: [
      'Destiny 2',
      'Destiny',
      'Halo series (legacy)',
      'Marathon series'
    ],
    specialties: ['Shared World Shooters', 'Live Service', 'Community Building', 'FPS Innovation'],
    culture: ['Community first', 'Continuous improvement', 'Player engagement', 'Innovation'],
    careerOpportunities: [
      'Live Service Designer',
      'Network Programmer',
      'Backend Engineer',
      'Community Manager',
      'Data Analyst',
      'Platform Engineer',
      'Security Engineer',
      'DevOps Engineer'
    ],
    benefits: ['Sony benefits', 'Stock options', 'Health coverage', 'Gaming perks'],
    techStack: ['C++', 'Tiger engine', 'Python', 'AWS', 'Kubernetes'],
    averageSalary: '$125k-$190k',
    glassdoorRating: 4.0
  },

  {
    id: 'kojima-productions',
    name: 'Kojima Productions',
    description: 'Hideo Kojima\'s independent studio behind Death Stranding and innovative gaming experiences',
    location: 'Tokyo, Japan',
    headquarters: 'Tokyo, Japan',
    logoPath: 'kojima-productions-logo.svg',
    employeeCount: '80+',
    founded: '2015',
    industry: 'Game Development',
    website: 'https://www.kojimaproductions.jp',
    stockTicker: null,
    parentCompany: null,
    games: [
      'Death Stranding',
      'Death Stranding Director\'s Cut'
    ],
    specialties: ['Innovative Gameplay', 'Narrative Design', 'Cinematic Experiences', 'Social Strand'],
    culture: ['Creative freedom', 'Artistic vision', 'Innovation', 'Experimental design'],
    careerOpportunities: [
      'Game Designer',
      'Narrative Designer',
      'Technical Designer',
      'Graphics Programmer',
      'Engine Programmer',
      'Character Artist',
      'Cinematics Artist',
      'Audio Designer'
    ],
    benefits: ['Creative freedom', 'Industry prestige', 'Innovative projects', 'Small team dynamics'],
    techStack: ['C++', 'Decima engine', 'Python', 'Maya', 'Substance'],
    averageSalary: '$60k-$110k',
    glassdoorRating: 4.2
  },

  {
    id: 'insomniac-games',
    name: 'Insomniac Games',
    description: 'Creators of Spider-Man, Ratchet & Clank, and innovative PlayStation exclusives',
    location: 'Burbank, CA',
    headquarters: 'Burbank, CA',
    logoPath: 'insomniac-logo.svg',
    employeeCount: '300+',
    founded: '1994',
    industry: 'Game Development',
    website: 'https://insomniac.games',
    stockTicker: null,
    parentCompany: 'Sony Interactive Entertainment',
    games: [
      'Marvel\'s Spider-Man series',
      'Ratchet & Clank series',
      'Marvel\'s Wolverine (upcoming)',
      'Resistance series',
      'Sunset Overdrive'
    ],
    specialties: ['Action-Adventure', 'Character Action', 'PlayStation Exclusives', 'Licensed Games'],
    culture: ['Positive workplace', 'Work-life balance', 'Creative collaboration', 'Quality focus'],
    careerOpportunities: [
      'Game Designer',
      'Level Designer',
      'Gameplay Programmer',
      'Graphics Programmer',
      'Technical Artist',
      'Character Artist',
      'Animation Programmer',
      'Audio Designer'
    ],
    benefits: ['Sony benefits', 'Positive culture', 'Work-life balance', 'Creative projects'],
    techStack: ['C++', 'Proprietary engine', 'Python', 'Maya', 'Houdini'],
    averageSalary: '$115k-$165k',
    glassdoorRating: 4.4
  },

  {
    id: 'obsidian-entertainment',
    name: 'Obsidian Entertainment',
    description: 'RPG specialists behind Pillars of Eternity, The Outer Worlds, and narrative-driven games',
    location: 'Irvine, CA',
    headquarters: 'Irvine, CA',
    logoPath: 'obsidian-logo.svg',
    employeeCount: '200+',
    founded: '2003',
    industry: 'Game Development',
    website: 'https://www.obsidian.net',
    stockTicker: null,
    parentCompany: 'Microsoft Studios',
    games: [
      'The Outer Worlds',
      'Pillars of Eternity series',
      'Grounded',
      'Pentiment',
      'Avowed (upcoming)',
      'Fallout: New Vegas'
    ],
    specialties: ['RPG Development', 'Narrative Design', 'Choice & Consequence', 'World Building'],
    culture: ['Narrative focus', 'Creative freedom', 'RPG passion', 'Microsoft support'],
    careerOpportunities: [
      'Narrative Designer',
      'Quest Designer',
      'Systems Designer',
      'Technical Designer',
      'Gameplay Programmer',
      'RPG Programmer',
      'Character Artist',
      'World Builder'
    ],
    benefits: ['Microsoft benefits', 'Creative freedom', 'RPG expertise', 'Stable funding'],
    techStack: ['C++', 'Unity', 'Unreal Engine', 'Python', 'Maya'],
    averageSalary: '$105k-$155k',
    glassdoorRating: 4.1
  },

  {
    id: 'remedy-entertainment',
    name: 'Remedy Entertainment',
    description: 'Finnish studio behind Max Payne, Alan Wake, and innovative narrative action games',
    location: 'Espoo, Finland',
    headquarters: 'Espoo, Finland',
    logoPath: 'remedy-logo.svg',
    employeeCount: '300+',
    founded: '1995',
    industry: 'Game Development',
    website: 'https://www.remedygames.com',
    stockTicker: 'NASDAQ:REMEDY',
    parentCompany: null,
    games: [
      'Alan Wake 2',
      'Control',
      'Alan Wake',
      'Quantum Break',
      'Max Payne series'
    ],
    specialties: ['Narrative Action', 'Supernatural Themes', 'Technical Innovation', 'Storytelling'],
    culture: ['Artistic vision', 'Technical excellence', 'Story-driven', 'Finnish work culture'],
    careerOpportunities: [
      'Narrative Designer',
      'Technical Designer',
      'Graphics Programmer',
      'Engine Programmer',
      'Gameplay Programmer',
      'Character Artist',
      'Environment Artist',
      'Audio Designer'
    ],
    benefits: ['Nordic benefits', 'Creative freedom', 'Technical challenges', 'International projects'],
    techStack: ['C++', 'Northlight engine', 'Python', 'Maya', 'Substance'],
    averageSalary: '$70k-$120k',
    glassdoorRating: 4.0
  },

  // Indie and Rising Studios
  {
    id: 'hollow-ponds',
    name: 'Hollow Ponds Studio',
    description: 'Independent studio focused on innovative gameplay mechanics and artistic expression',
    location: 'Remote',
    headquarters: 'London, UK',
    logoPath: 'hollow-ponds-logo.svg',
    employeeCount: '8',
    founded: '2018',
    industry: 'Indie Game Development',
    website: 'https://www.hollowponds.com',
    stockTicker: null,
    parentCompany: null,
    games: [
      'I Am Dead',
      'Wilmot\'s Warehouse',
      'Various experimental projects'
    ],
    specialties: ['Experimental Gameplay', 'Art Games', 'Narrative Innovation', 'Small Team Development'],
    culture: ['Creative freedom', 'Experimental design', 'Artistic expression', 'Remote collaboration'],
    careerOpportunities: [
      'Gameplay Programmer',
      'Technical Artist',
      'Game Designer',
      'Narrative Designer',
      '2D Artist',
      'Audio Designer',
      'Producer',
      'QA Tester'
    ],
    benefits: ['Remote work', 'Creative freedom', 'Flexible hours', 'Profit sharing'],
    techStack: ['Unity', 'C#', 'Git', 'Aseprite', 'FMOD'],
    averageSalary: '$45k-$75k',
    glassdoorRating: 4.5
  },

  {
    id: 'keywords-studios',
    name: 'Keywords Studios',
    description: 'Global services provider for the video game industry, specializing in QA, localization, and more',
    location: 'Dublin, Ireland',
    headquarters: 'Dublin, Ireland',
    logoPath: 'keywords-logo.svg',
    employeeCount: '12000+',
    founded: '1998',
    industry: 'Game Services',
    website: 'https://www.keywordsstudios.com',
    stockTicker: 'LSE:KWS',
    parentCompany: null,
    games: [
      'QA Services for AAA titles',
      'Localization for major releases',
      'Art services',
      'Audio production'
    ],
    specialties: ['Quality Assurance', 'Localization', 'Audio', 'Art Services', 'Player Support'],
    culture: ['Global diversity', 'Service excellence', 'Career development', 'Industry partnerships'],
    careerOpportunities: [
      'QA Tester',
      'QA Lead',
      'Localization Specialist',
      'Audio Engineer',
      'Community Manager',
      'Art Director',
      'Project Manager',
      'Business Analyst'
    ],
    benefits: ['Global opportunities', 'Career progression', 'Training programs', 'Healthcare'],
    techStack: ['TestRail', 'Jira', 'Unity', 'Unreal Engine', 'Various tools'],
    averageSalary: '$35k-$85k',
    glassdoorRating: 3.8
  }
];

export const STUDIO_CATEGORIES = {
  AAA_PUBLISHERS: ['electronic-arts', 'activision-blizzard', 'ubisoft'],
  COMPETITIVE_GAMING: ['riot-games', 'valve-corporation'],
  ENGINE_PLATFORM: ['epic-games', 'unity-technologies', 'valve-corporation'],
  MOBILE_LEADERS: ['supercell', 'king', 'mihoyo'],
  NARRATIVE_FOCUSED: ['naughty-dog', 'cd-projekt-red'],
  EMERGING_POWERHOUSES: ['mihoyo', 'respawn-entertainment']
};

export const JOB_ROLES_BY_CATEGORY = {
  PROGRAMMING: ['Software Engineer', 'Gameplay Programmer', 'Engine Programmer', 'Backend Engineer', 'Graphics Programmer', 'AI Programmer', 'Network Programmer', 'Platform Engineer'],
  DESIGN: ['Game Designer', 'Level Designer', 'Systems Designer', 'UX/UI Designer', 'Narrative Designer', 'Quest Designer'],
  ART: ['3D Artist', 'Character Artist', 'Environment Artist', 'Technical Artist', 'Animator', 'VFX Artist', 'Concept Artist'],
  PRODUCTION: ['Producer', 'Product Manager', 'Project Manager', 'Scrum Master', 'Technical Director'],
  DATA_ANALYTICS: ['Data Scientist', 'Data Analyst', 'Business Analyst', 'User Researcher'],
  COMMUNITY: ['Community Manager', 'Developer Relations', 'Content Creator', 'Social Media Manager'],
  BUSINESS: ['Marketing Manager', 'Business Development', 'User Acquisition', 'Monetization Specialist']
};

export default GAMING_STUDIOS;