// Centralized list of company ATS job board configs for gaming studios
// These are public board tokens used by ATS platforms (e.g., Greenhouse, Lever).
// You can modify this list or load it from a remote source later.

import type { CompanyBoardConfig } from "./JobProviderInterface";

// Note: Board tokens are subject to change by companies over time.
// If a source returns no jobs, verify the token by visiting the public board URL, e.g.:
//   Greenhouse: https://boards.greenhouse.io/<token>
//   Lever:      https://jobs.lever.co/<token>

export const COMPANY_BOARDS: CompanyBoardConfig[] = [
  // Greenhouse-powered boards (verified working)
  { name: "Riot Games", token: "riotgames", type: "greenhouse" },
  { name: "Bungie", token: "bungie", type: "greenhouse" },
  { name: "Epic Games", token: "epicgames", type: "greenhouse" },
  { name: "Roblox", token: "roblox", type: "greenhouse" },

  // Alternative tokens for previously failing companies - these may work
  { name: "Discord", token: "discord", type: "greenhouse" },
  { name: "Unity Technologies", token: "unity3d", type: "greenhouse" },


  // To re-enable, visit the public boards and verify tokens:
  // { name: 'Valve', token: 'valvesoftware', type: 'greenhouse' }, // Check: https://boards.greenhouse.io/valvesoftware
  // { name: 'Supercell', token: 'supercell', type: 'greenhouse' }, // Check: https://boards.greenhouse.io/supercell


  // To re-enable, verify tokens at https://jobs.lever.co/<token>
  // { name: 'Insomniac Games', token: 'insomniacgames', type: 'lever' }, // Check: https://jobs.lever.co/insomniacgames
  // { name: 'Niantic', token: 'niantic', type: 'lever' }, // Check: https://jobs.lever.co/niantic

  // Alternative Lever-powered boards that may work
  { name: "Netflix Games", token: "netflix", type: "lever" },

  // SmartRecruiters-powered boards (tokens are company slugs; case-sensitive)
  { name: "Ubisoft", token: "Ubisoft", type: "smartrecruiters" },
  { name: "Rockstar Games", token: "rockstar-games", type: "smartrecruiters" },

  // Workday-powered boards - disabled due to CORS issues in browser environment
  // These require server-side proxy or native app to access due to CORS policies
  // Alternative: Use their public career pages instead of direct API access
  // { name: 'Electronic Arts (EA)', token: 'ea', type: 'workday' }, // CORS blocked
  // { name: 'Blizzard Entertainment', token: 'blizzard', type: 'workday' }, // CORS blocked
];

// Additional gaming companies that might have public APIs
export const POTENTIAL_COMPANY_BOARDS: CompanyBoardConfig[] = [
  // These are untested but might work - add to main array if verified
  { name: "Mojang Studios", token: "mojang", type: "greenhouse" },
  { name: "Respawn Entertainment", token: "respawn", type: "greenhouse" },
  { name: "Bethesda Game Studios", token: "bethesda", type: "greenhouse" },
];

export default COMPANY_BOARDS;
