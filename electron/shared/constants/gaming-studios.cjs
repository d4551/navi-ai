/**
 * Gaming Studios Database - CommonJS version for Electron main process
 */

const GAMING_STUDIOS = {
  'riot-games': {
    id: 'riot-games',
    name: 'Riot Games',
    description: 'Creator of League of Legends and Valorant',
    culture: {
      values: ['Player Focus', 'Respect', 'Honesty', 'Growth', 'Excellence'],
      workStyle: 'Collaborative, data-driven, player-first mentality',
      environment: 'Fast-paced, innovative, global team culture',
    },
    games: [
      'League of Legends',
      'Valorant',
      'Teamfight Tactics',
      'Legends of Runeterra',
      'Wild Rift',
    ],
    technologies: [
      'C++',
      'Python',
      'Go',
      'React',
      'TypeScript',
      'AWS',
      'Kubernetes',
    ],
    headquarters: 'Los Angeles, CA',
    size: '4000+ employees',
    founded: 2006,
  },

  blizzard: {
    id: 'blizzard',
    name: 'Blizzard Entertainment',
    description:
      'Legendary game developer behind World of Warcraft and Overwatch',
    culture: {
      values: [
        'Gameplay First',
        'Commit to Quality',
        'Play Nice; Play Fair',
        'Embrace Your Inner Geek',
        'Every Voice Matters',
      ],
      workStyle: 'Quality-focused, collaborative, creative excellence',
      environment: 'Creative, inclusive, game-focused culture',
    },
    games: [
      'World of Warcraft',
      'Overwatch',
      'Diablo',
      'StarCraft',
      'Hearthstone',
    ],
    technologies: ['C++', 'C#', 'Python', 'React', 'TypeScript', 'AWS'],
    headquarters: 'Irvine, CA',
    size: '4000+ employees',
    founded: 1991,
  },

  'epic-games': {
    id: 'epic-games',
    name: 'Epic Games',
    description: 'Creator of Fortnite and Unreal Engine',
    culture: {
      values: ['Honest', 'Respectful', 'Creative', 'Inclusive', 'Generous'],
      workStyle: 'Innovation-driven, collaborative, empowering',
      environment: 'Creative, innovative, technology-focused',
    },
    games: ['Fortnite', 'Rocket League', 'Fall Guys'],
    technologies: ['C++', 'Unreal Engine', 'Python', 'React', 'TypeScript'],
    headquarters: 'Cary, NC',
    size: '1000+ employees',
    founded: 1991,
  },

  valve: {
    id: 'valve',
    name: 'Valve Corporation',
    description: 'Creator of Steam, Half-Life, Portal, and Counter-Strike',
    culture: {
      values: [
        'No Hierarchy',
        'Self-Direction',
        'Innovation',
        'Long-term Thinking',
      ],
      workStyle:
        'Flat organization, choose your own projects, creative freedom',
      environment: 'Autonomous, innovative, employee-empowered',
    },
    games: [
      'Half-Life',
      'Portal',
      'Counter-Strike',
      'Dota 2',
      'Team Fortress 2',
    ],
    technologies: ['C++', 'Python', 'Source Engine', 'Steam SDK'],
    headquarters: 'Bellevue, WA',
    size: '360 employees',
    founded: 1996,
  },
}

module.exports = { GAMING_STUDIOS }
