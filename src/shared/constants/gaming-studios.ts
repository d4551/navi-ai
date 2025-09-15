/**
 * Gaming Studios Database - Comprehensive data for interview simulation
 * Optimized for gaming industry job seekers
 */

import type { GameStudio } from '../types/interview';

export const GAMING_STUDIOS: Record<string, GameStudio> = {
  'riot-games': {
    id: 'riot-games',
    name: 'Riot Games',
    logo: '/logos/riot-games.png',
    description: 'Creator of League of Legends and Valorant',
    culture: {
      values: ['Player Focus', 'Respect', 'Honesty', 'Growth', 'Excellence'],
      workStyle: 'Collaborative, data-driven, player-first mentality',
      environment: 'Fast-paced, innovative, global team culture'
    },
    games: ['League of Legends', 'Valorant', 'Teamfight Tactics', 'Legends of Runeterra', 'Wild Rift'],
    technologies: ['C++', 'Python', 'Go', 'React', 'TypeScript', 'AWS', 'Kubernetes'],
    commonRoles: ['Software Engineer', 'Game Designer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Esports Coordinator', 'Live Service Engineer'],
    interviewStyle: 'behavioral + technical, gaming passion emphasis',
    headquarters: 'Los Angeles, CA',
    size: '4000+ employees',
    founded: 2006,
    publiclyTraded: false
  },
  
  'blizzard': {
    id: 'blizzard',
    name: 'Blizzard Entertainment',
    logo: '/logos/blizzard.png',
    description: 'Legendary studio behind Warcraft, StarCraft, and Overwatch',
    culture: {
      values: ['Gameplay First', 'Commit to Quality', 'Play Nice, Play Fair', 'Embrace Your Inner Geek', 'Every Voice Matters', 'Think Globally', 'Lead Responsibly'],
      workStyle: 'Quality-focused, long-term thinking, passionate craftsmanship',
      environment: 'Creative, collaborative, high standards culture'
    },
    games: ['World of Warcraft', 'Overwatch 2', 'Diablo IV', 'Hearthstone', 'StarCraft II'],
    technologies: ['C++', 'C#', 'Python', 'Lua', 'Battle.net', 'Cloud Services'],
    commonRoles: ['Game Designer', 'Software Engineer', 'Artist', 'QA Engineer', 'Producer'],
    interviewStyle: 'portfolio review + technical depth, passion for games',
    headquarters: 'Irvine, CA',
    size: '4700+ employees',
    founded: 1991,
    publiclyTraded: false
  },

  'epic-games': {
    id: 'epic-games',
    name: 'Epic Games',
    logo: '/logos/epic-games.png',
    description: 'Creator of Fortnite and Unreal Engine',
    culture: {
      values: ['Excellence', 'Innovation', 'Respect', 'Inclusion', 'Community'],
      workStyle: 'Innovation-driven, engine technology focus, creator empowerment',
      environment: 'Fast-paced, cutting-edge, metaverse-focused'
    },
    games: ['Fortnite', 'Rocket League', 'Fall Guys', 'Unreal Tournament'],
    technologies: ['C++', 'Unreal Engine', 'TypeScript', 'React', 'AWS', 'Kubernetes'],
    commonRoles: ['Software Engineer', 'Engine Programmer', 'Technical Artist', 'DevOps Engineer', 'Product Manager'],
    interviewStyle: 'technical excellence + innovation mindset',
    headquarters: 'Cary, NC',
    size: '3200+ employees',
    founded: 1991,
    publiclyTraded: false
  },

  'valve': {
    id: 'valve',
    name: 'Valve Corporation',
    logo: '/logos/valve.png',
    description: 'Creator of Steam, Half-Life, and Counter-Strike',
    culture: {
      values: ['Innovation', 'Quality', 'Customer Focus', 'Flat Organization', 'Creative Freedom'],
      workStyle: 'Flat hierarchy, self-directed teams, long-term thinking',
      environment: 'Autonomous, experimental, platform-focused'
    },
    games: ['Half-Life: Alyx', 'Counter-Strike 2', 'Dota 2', 'Team Fortress 2', 'Portal'],
    technologies: ['C++', 'Python', 'Source Engine', 'Steam Platform', 'VR/AR'],
    commonRoles: ['Software Engineer', 'Hardware Engineer', 'Game Developer', 'Platform Engineer', 'Designer'],
    interviewStyle: 'problem-solving + cultural fit, autonomous work style',
    headquarters: 'Bellevue, WA',
    size: '360+ employees',
    founded: 1996,
    publiclyTraded: false
  },

  'ubisoft': {
    id: 'ubisoft',
    name: 'Ubisoft',
    logo: '/logos/ubisoft.png',
    description: 'French gaming giant behind Assassin\'s Creed and Far Cry',
    culture: {
      values: ['Dare', 'Pioneer', 'Create', 'Care', 'One Team'],
      workStyle: 'Global collaboration, creative excellence, diverse perspectives',
      environment: 'International, creative, socially conscious'
    },
    games: ['Assassin\'s Creed', 'Far Cry', 'Rainbow Six Siege', 'Just Dance', 'Watch Dogs'],
    technologies: ['C++', 'C#', 'Python', 'Anvil Engine', 'Snowdrop Engine', 'Cloud'],
    commonRoles: ['Game Designer', 'Software Engineer', 'Artist', 'Producer', 'Live Ops Manager', 'UX Designer'],
    interviewStyle: 'creative portfolio + technical skills, global mindset',
    headquarters: 'Montreuil, France',
    size: '18000+ employees',
    founded: 1986,
    publiclyTraded: true
  },

  'naughty-dog': {
    id: 'naughty-dog',
    name: 'Naughty Dog',
    logo: '/logos/naughty-dog.png',
    description: 'Creators of The Last of Us and Uncharted series',
    culture: {
      values: ['Storytelling Excellence', 'Technical Innovation', 'Creative Collaboration', 'Attention to Detail'],
      workStyle: 'Narrative-focused, high-quality production, iterative design',
      environment: 'Intimate team, cinematic focus, PlayStation exclusive'
    },
    games: ['The Last of Us Part II', 'Uncharted 4', 'The Last of Us', 'Jak and Daxter'],
    technologies: ['C++', 'PlayStation SDK', 'Python', 'Maya', 'Motion Capture', 'Custom Engines'],
    commonRoles: ['Game Programmer', 'Technical Artist', 'Animator', 'Game Designer', 'Audio Designer'],
    interviewStyle: 'portfolio showcase + technical depth, storytelling passion',
    headquarters: 'Santa Monica, CA',
    size: '400+ employees',
    founded: 1984,
    publiclyTraded: false
  },

  'rockstar-games': {
    id: 'rockstar-games',
    name: 'Rockstar Games',
    logo: '/logos/rockstar.png',
    description: 'Creators of Grand Theft Auto and Red Dead Redemption',
    culture: {
      values: ['Creative Freedom', 'Technical Excellence', 'Attention to Detail', 'World Building'],
      workStyle: 'Open-world focus, long development cycles, high production values',
      environment: 'Creative autonomy, adult-themed content, blockbuster games'
    },
    games: ['Grand Theft Auto V', 'Red Dead Redemption 2', 'GTA Online', 'Max Payne'],
    technologies: ['C++', 'RAGE Engine', 'Python', 'Euphoria Physics', 'Advanced AI'],
    commonRoles: ['Game Programmer', 'World Designer', 'Technical Artist', 'QA Tester', 'Producer'],
    interviewStyle: 'technical skills + creative vision, mature content comfort',
    headquarters: 'New York, NY',
    size: '2000+ employees',
    founded: 1998,
    publiclyTraded: false
  },

  'activision-blizzard': {
    id: 'activision-blizzard',
    name: 'Activision Blizzard',
    logo: '/logos/activision-blizzard.png',
    description: 'Gaming conglomerate behind Call of Duty and World of Warcraft',
    culture: {
      values: ['Quality Excellence', 'Global Reach', 'Player Experience', 'Innovation', 'Diversity & Inclusion'],
      workStyle: 'Multi-studio coordination, live service focus, franchise management',
      environment: 'Corporate structure, multiple divisions, global operations'
    },
    games: ['Call of Duty', 'World of Warcraft', 'Candy Crush', 'Overwatch', 'Diablo'],
    technologies: ['C++', 'C#', 'Python', 'JavaScript', 'Battle.net', 'King Platform'],
    commonRoles: ['Software Engineer', 'Live Ops Manager', 'Data Analyst', 'Product Manager', 'QA Engineer', 'Community Manager'],
    interviewStyle: 'structured technical + behavioral, franchise knowledge valued',
    headquarters: 'Santa Monica, CA',
    size: '9000+ employees',
    founded: 1979,
    publiclyTraded: true
  },

  'electronic-arts': {
    id: 'electronic-arts',
    name: 'Electronic Arts (EA)',
    logo: '/logos/ea.png',
    description: 'Global publisher of FIFA, The Sims, and Apex Legends',
    culture: {
      values: ['Inclusion', 'Innovation', 'Quality', 'Integrity', 'Fun'],
      workStyle: 'Sports simulation expertise, live service mastery, global publishing',
      environment: 'Corporate, data-driven, multi-franchise management'
    },
    games: ['FIFA', 'Madden NFL', 'The Sims', 'Apex Legends', 'Battlefield', 'Need for Speed'],
    technologies: ['C++', 'C#', 'Python', 'Frostbite Engine', 'Origin Platform', 'AWS'],
    commonRoles: ['Software Engineer', 'Game Designer', 'Data Scientist', 'Producer', 'Technical Artist', 'Sports Designer'],
    interviewStyle: 'technical depth + domain expertise, sports knowledge plus',
    headquarters: 'Redwood City, CA',
    size: '12000+ employees',
    founded: 1982,
    publiclyTraded: true
  },

  'nintendo': {
    id: 'nintendo',
    name: 'Nintendo',
    logo: '/logos/nintendo.png',
    description: 'Japanese gaming pioneer behind Mario and Zelda',
    culture: {
      values: ['Fun for Everyone', 'Innovation', 'Quality', 'Creativity', 'Unique Experiences'],
      workStyle: 'Family-friendly focus, hardware-software integration, Japanese work culture',
      environment: 'Traditional, quality-focused, creative excellence'
    },
    games: ['Super Mario', 'The Legend of Zelda', 'Pokémon', 'Animal Crossing', 'Splatoon', 'Mario Kart'],
    technologies: ['C++', 'C', 'Custom Hardware', 'Nintendo SDK', 'Unity (for indies)', 'Proprietary Tools'],
    commonRoles: ['Game Programmer', 'Hardware Engineer', 'Game Designer', 'Technical Artist', 'Producer', 'Localization Specialist'],
    interviewStyle: 'creativity emphasis + technical skills, Nintendo game knowledge essential',
    headquarters: 'Kyoto, Japan',
    size: '6700+ employees',
    founded: 1889,
    publiclyTraded: true
  },

  'sony-interactive': {
    id: 'sony-interactive',
    name: 'Sony Interactive Entertainment',
    logo: '/logos/sony-interactive.png',
    description: 'PlayStation platform holder and first-party developer',
    culture: {
      values: ['Player First', 'Innovation', 'Excellence', 'Diversity', 'Global Perspective'],
      workStyle: 'Platform ecosystem focus, first-party excellence, global publishing',
      environment: 'Console-focused, cinematic experiences, worldwide studios'
    },
    games: ['God of War', 'Spider-Man', 'Ghost of Tsushima', 'Horizon', 'Gran Turismo'],
    technologies: ['C++', 'PlayStation SDK', 'Python', 'Custom Engines', 'PlayStation Platform'],
    commonRoles: ['Platform Engineer', 'Game Developer', 'System Architect', 'Producer', 'Developer Relations'],
    interviewStyle: 'technical excellence + platform understanding, PlayStation ecosystem knowledge',
    headquarters: 'San Mateo, CA',
    size: '2500+ employees',
    founded: 1993,
    publiclyTraded: false
  },

  'cd-projekt-red': {
    id: 'cd-projekt-red',
    name: 'CD Projekt RED',
    logo: '/logos/cdpr.png',
    description: 'Creators of The Witcher and Cyberpunk 2077',
    culture: {
      values: ['Player First', 'Creative Freedom', 'Quality', 'Innovation', 'Respect'],
      workStyle: 'RPG-focused, narrative depth, player choice emphasis',
      environment: 'European studio, story-driven, ambitious projects'
    },
    games: ['Cyberpunk 2077', 'The Witcher 3', 'The Witcher 2', 'Gwent'],
    technologies: ['C++', 'REDengine', 'Python', 'Advanced Graphics', 'Open World Tech'],
    commonRoles: ['Game Programmer', 'Quest Designer', 'Technical Artist', 'Narrative Designer'],
    interviewStyle: 'RPG passion + technical skills, storytelling focus',
    headquarters: 'Warsaw, Poland',
    size: '1100+ employees',
    founded: 2002,
    publiclyTraded: true
  },

  'bethesda': {
    id: 'bethesda',
    name: 'Bethesda Game Studios',
    logo: '/logos/bethesda.png',
    description: 'Creators of The Elder Scrolls and Fallout series',
    culture: {
      values: ['Player Freedom', 'Modding Support', 'World Building', 'RPG Innovation'],
      workStyle: 'Open-world RPGs, long-term franchises, modding community',
      environment: 'Traditional RPG focus, Microsoft-owned, established franchises'
    },
    games: ['The Elder Scrolls V: Skyrim', 'Fallout 4', 'Starfield', 'The Elder Scrolls VI'],
    technologies: ['C++', 'Creation Engine', 'Python', 'Papyrus Scripting', 'Xbox Platform'],
    commonRoles: ['Game Designer', 'Level Designer', 'Engine Programmer', 'World Artist'],
    interviewStyle: 'RPG knowledge + technical skills, modding appreciation',
    headquarters: 'Rockville, MD',
    size: '450+ employees',
    founded: 2001,
    publiclyTraded: false
  },

  'bungie': {
    id: 'bungie',
    name: 'Bungie',
    logo: '/logos/bungie.png',
    description: 'Creators of Destiny and former Halo developers',
    culture: {
      values: ['Community First', 'Innovation', 'Excellence', 'Inclusion', 'Courage'],
      workStyle: 'Live service focus, community engagement, shared world',
      environment: 'Independent studio, FPS expertise, live operations'
    },
    games: ['Destiny 2', 'Destiny', 'Halo series (legacy)'],
    technologies: ['C++', 'Tiger Engine', 'Python', 'Live Service Tech', 'Cross-platform'],
    commonRoles: ['Software Engineer', 'Live Ops Engineer', 'Game Designer', 'Community Manager'],
    interviewStyle: 'technical excellence + community passion, FPS experience',
    headquarters: 'Bellevue, WA',
    size: '900+ employees',
    founded: 1991,
    publiclyTraded: false
  },

  'insomniac-games': {
    id: 'insomniac-games',
    name: 'Insomniac Games',
    logo: '/logos/insomniac.png',
    description: 'Creators of Spider-Man and Ratchet & Clank',
    culture: {
      values: ['Fun First', 'Quality', 'Innovation', 'Team Spirit', 'Player Focus'],
      workStyle: 'Character action games, PlayStation exclusives, colorful worlds',
      environment: 'Creative, fun-focused, superhero games'
    },
    games: ['Marvel\'s Spider-Man 2', 'Ratchet & Clank: Rift Apart', 'Marvel\'s Wolverine'],
    technologies: ['C++', 'PlayStation SDK', 'Advanced Graphics', 'Ray Tracing', 'SSD Streaming'],
    commonRoles: ['Game Programmer', 'Technical Artist', 'Game Designer', 'Combat Designer'],
    interviewStyle: 'portfolio review + technical skills, fun factor emphasis',
    headquarters: 'Burbank, CA',
    size: '500+ employees',
    founded: 1994,
    publiclyTraded: false
  },

  'id-software': {
    id: 'id-software',
    name: 'id Software',
    logo: '/logos/id-software.png',
    description: 'Pioneers of the FPS genre, creators of DOOM and Quake',
    culture: {
      values: ['Technical Innovation', 'Performance', 'Pure Gameplay', 'Engine Excellence'],
      workStyle: 'Engine technology focus, FPS expertise, optimization masters',
      environment: 'Technical excellence, id Tech engine, fast-paced action'
    },
    games: ['DOOM Eternal', 'Quake Champions', 'Wolfenstein series (tech)'],
    technologies: ['C++', 'id Tech Engine', 'Vulkan', 'Advanced Rendering', 'VR'],
    commonRoles: ['Engine Programmer', 'Graphics Programmer', 'Game Designer', 'Technical Artist'],
    interviewStyle: 'technical depth + FPS passion, engine knowledge',
    headquarters: 'Richardson, TX',
    size: '150+ employees',
    founded: 1991,
    publiclyTraded: false
  },

  'respawn': {
    id: 'respawn',
    name: 'Respawn Entertainment',
    logo: '/logos/respawn.png',
    description: 'Creators of Apex Legends and Titanfall',
    culture: {
      values: ['Innovation', 'Quality', 'Team First', 'Player Respect', 'Creative Freedom'],
      workStyle: 'FPS innovation, battle royale expertise, fast-paced development',
      environment: 'Veteran developer studio, EA-owned, competitive gaming'
    },
    games: ['Apex Legends', 'Titanfall 2', 'Star Wars Jedi: Survivor'],
    technologies: ['C++', 'Source Engine', 'Python', 'Live Service Tech', 'Anti-cheat'],
    commonRoles: ['Software Engineer', 'Live Ops Engineer', 'Game Designer', 'Security Engineer'],
    interviewStyle: 'technical skills + competitive gaming knowledge',
    headquarters: 'Los Angeles, CA',
    size: '400+ employees',
    founded: 2010,
    publiclyTraded: false
  },

  'supercell': {
    id: 'supercell',
    name: 'Supercell',
    logo: '/logos/supercell.png',
    description: 'Mobile gaming powerhouse behind Clash of Clans and Clash Royale',
    culture: {
      values: ['Best Team', 'Best Games', 'Long-term Thinking', 'Players First'],
      workStyle: 'Small teams, mobile-first, live operations, data-driven',
      environment: 'Finnish culture, flat hierarchy, mobile focus'
    },
    games: ['Clash of Clans', 'Clash Royale', 'Hay Day', 'Brawl Stars', 'Boom Beach'],
    technologies: ['C++', 'Python', 'Mobile SDKs', 'Backend Services', 'Analytics'],
    commonRoles: ['Game Developer', 'Backend Engineer', 'Data Scientist', 'Live Ops Manager'],
    interviewStyle: 'mobile expertise + analytics skills, small team fit',
    headquarters: 'Helsinki, Finland',
    size: '500+ employees',
    founded: 2010,
    publiclyTraded: false
  }
};

// ---- Derived constants for search/filters ----

// All roles across studios (sorted, unique)
export const ROLE_TYPES: readonly string[] = Object.freeze(
  Array.from(
    new Set(
      Object.values(GAMING_STUDIOS).flatMap((s) => s.commonRoles || [])
    )
  ).sort()
);

// All technologies across studios (sorted, unique)
export const TECHNOLOGY_TAGS: readonly string[] = Object.freeze(
  Array.from(
    new Set(
      Object.values(GAMING_STUDIOS).flatMap((s) => s.technologies || [])
    )
  ).sort()
);

// Helper to categorize roles
function categorizeRole(role: string): string {
  const r = role.toLowerCase();
  if (/(engineer|programmer|developer|devops|platform|hardware)/.test(r)) return 'Engineering';
  if (/(designer|ux|ui|director)/.test(r)) return 'Design';
  if (/(artist|animator|technical artist|art)/.test(r)) return 'Art';
  if (/(producer|product manager|manager)/.test(r)) return 'Production';
  if (/(qa|quality|test)/.test(r)) return 'QA';
  if (/(data scientist|data|analytics)/.test(r)) return 'Data';
  if (/(esports)/.test(r)) return 'Esports';
  if (/(live service)/.test(r)) return 'Live Service';
  return 'Other';
}

// Map of role categories to roles
const roleCategoryMap = new Map<string, Set<string>>();
for (const role of ROLE_TYPES) {
  const cat = categorizeRole(role);
  if (!roleCategoryMap.has(cat)) roleCategoryMap.set(cat, new Set());
  roleCategoryMap.get(cat)!.add(role);
}

export const ROLE_CATEGORIES: Readonly<Record<string, readonly string[]>> = Object.freeze(
  Array.from(roleCategoryMap.entries()).reduce((acc, [k, v]) => {
    acc[k] = Object.freeze(Array.from(v).sort());
    return acc;
  }, {} as Record<string, readonly string[]>)
);

// Studio type categories (broad buckets)
const studioTypeBuckets: Record<string, string[]> = {
  'AAA': [
    'riot-games','blizzard','epic-games','valve','ubisoft','naughty-dog','rockstar-games',
    'activision-blizzard','electronic-arts','cd-projekt-red','bethesda','bungie','respawn'
  ],
  'First-Party': ['naughty-dog','sony-interactive','nintendo','bethesda'],
  'Platform': ['valve','epic-games','sony-interactive','nintendo'],
  'Publisher': ['ubisoft','electronic-arts','activision-blizzard'],
  'Mobile': ['supercell']
};

// Invert buckets into category->studioIds constrained to existing ids
export const STUDIO_CATEGORIES: Readonly<Record<string, readonly string[]>> = Object.freeze(
  Object.entries(studioTypeBuckets).reduce((acc, [category, ids]) => {
    const existing = ids.filter((id) => !!GAMING_STUDIOS[id]);
    if (existing.length) acc[category] = Object.freeze(existing);
    return acc;
  }, {} as Record<string, readonly string[]>)
);

// Company size labels used in filters/UI
export const COMPANY_SIZES: readonly string[] = Object.freeze([
  'Startup (1-10)',
  'Small (11-50)',
  'Medium (51-200)',
  'Large (201-1000)',
  'Enterprise (1000+)'
]);

// Regions for location-based filtering
export const REGIONS: readonly string[] = Object.freeze([
  'North America',
  'Europe',
  'Asia-Pacific',
  'South America',
  'Africa',
  'Remote'
]);

