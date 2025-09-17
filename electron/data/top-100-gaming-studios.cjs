/**
 * Top 100 Gaming Studios - CommonJS version for Electron main process
 */

const TOP_100_GAMING_STUDIOS = [
  {
    id: 'microsoft-gaming-xbox',
    name: 'Microsoft Gaming/Xbox Game Studios',
    website: 'https://www.xbox.com/en-US/xbox-game-studios',
    location: 'Redmond, Washington',
    size: 'enterprise',
    type: 'AAA Publisher',
    founded: 2008,
    description:
      'First-party Xbox development, premier gaming publisher, flagship franchises and technical innovation',
    games: [
      'Halo',
      'Forza',
      'Gears of War',
      'Age of Empires',
      'Microsoft Flight Simulator',
      'Minecraft',
      'DOOM',
      'The Elder Scrolls',
      'Fallout',
    ],
    technologies: ['Xbox Series X/S', 'DirectX', 'Azure', 'C++', 'C#'],
  },
  {
    id: 'sony-interactive-entertainment',
    name: 'Sony Interactive Entertainment',
    website: 'https://www.playstation.com',
    location: 'San Mateo, California',
    size: 'enterprise',
    type: 'AAA Publisher',
    founded: 1993,
    description:
      "World's leading gaming entertainment company, PlayStation ecosystem",
    games: [
      'God of War',
      'The Last of Us',
      'Spider-Man',
      'Uncharted',
      'Horizon Zero Dawn',
      'Gran Turismo',
      'Bloodborne',
    ],
    technologies: ['PlayStation 5', 'PS4', 'PSVR', 'C++', 'Unreal Engine'],
  },
  {
    id: 'nintendo',
    name: 'Nintendo Co., Ltd.',
    website: 'https://www.nintendo.com',
    location: 'Kyoto, Japan',
    size: 'enterprise',
    type: 'AAA Publisher',
    founded: 1889,
    description:
      'Global entertainment company, creator of Mario, Zelda, Pokemon franchises',
    games: [
      'Super Mario',
      'The Legend of Zelda',
      'Pokemon',
      'Fire Emblem',
      'Animal Crossing',
      'Splatoon',
      'Metroid',
    ],
    technologies: ['Nintendo Switch', 'Wii U', '3DS', 'Proprietary Engines'],
  },
]

module.exports = { TOP_100_GAMING_STUDIOS }
