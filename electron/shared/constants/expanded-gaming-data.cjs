/**
 * Expanded Gaming Data - CommonJS version for Electron main process
 */

const EXPANDED_GAMING_STUDIOS = {
  'riot-games': {
    id: 'riot-games',
    name: 'Riot Games',
    founded: 2006,
    headquarters: 'Los Angeles, CA',
    locations: ['Los Angeles, CA', 'Berlin, Germany', 'Dublin, Ireland'],
    size: 'large',
    employeeCount: 2500,
    type: 'developer',
    platforms: ['PC', 'Mobile'],
    genres: ['MOBA', 'FPS', 'Strategy'],
    technologies: ['C++', 'Python', 'Go', 'React', 'TypeScript'],
    remoteWork: true,
    workCulture: ['Player-focused', 'Collaborative', 'Data-driven'],
    benefits: ['Health insurance', 'Stock options', 'Professional development'],
    careerPrograms: ['Riot University', 'Mentorship programs'],
    majorGames: [
      {
        name: 'League of Legends',
        year: 2009,
        platforms: ['PC'],
        genre: 'MOBA',
      },
      { name: 'Valorant', year: 2020, platforms: ['PC'], genre: 'FPS' },
    ],
    glassdoorRating: 4.2,
    website: 'https://www.riotgames.com',
    internships: true,
    diversityPrograms: ['Women in Gaming', 'LGBTQ+ initiatives'],
    sustainability: true,
    crunchReputation: 'low',
    workLifeBalance: 8,
    learningOpportunities: ['Internal training', 'Conference attendance'],
  },

  blizzard: {
    id: 'blizzard',
    name: 'Blizzard Entertainment',
    founded: 1991,
    headquarters: 'Irvine, CA',
    locations: ['Irvine, CA', 'Austin, TX', 'Paris, France'],
    size: 'large',
    employeeCount: 4000,
    type: 'developer',
    platforms: ['PC', 'Console'],
    genres: ['MMORPG', 'FPS', 'RTS'],
    technologies: ['C++', 'C#', 'Python'],
    remoteWork: false,
    workCulture: ['Quality-focused', 'Creative', 'Inclusive'],
    benefits: ['Health benefits', 'Retirement plan', 'Game library'],
    careerPrograms: ['Blizzard University'],
    majorGames: [
      {
        name: 'World of Warcraft',
        year: 2004,
        platforms: ['PC'],
        genre: 'MMORPG',
      },
      {
        name: 'Overwatch',
        year: 2016,
        platforms: ['PC', 'Console'],
        genre: 'FPS',
      },
    ],
    glassdoorRating: 4.0,
    website: 'https://www.blizzard.com',
    internships: true,
    diversityPrograms: ['Diversity initiatives'],
    sustainability: true,
    crunchReputation: 'medium',
    workLifeBalance: 7,
    learningOpportunities: ['Professional development budget'],
  },
}

module.exports = { EXPANDED_GAMING_STUDIOS }
