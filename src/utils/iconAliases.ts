// Centralized MDI icon aliasing to ensure compatibility across versions
// Map non-standard or removed names to stable, widely-supported equivalents

// Exported so other systems (e.g., Vuetify icons) can consume the mapping
export const ALIASES: Record<string, string> = {
  // Existing
  'mdi-multimedia': 'mdi-video-outline',
  'mdi-robot-excited': 'mdi-robot',
  'mdi-connection': 'mdi-transit-connection',
  'mdi-sparkles': 'mdi-auto-fix',
  'mdi-wand': 'mdi-magic-staff',

  // Missing/renamed in current @mdi/font version
  'mdi-adobe-photoshop': 'mdi-palette',
  'mdi-brain-outline': 'mdi-brain',
  'mdi-cache': 'mdi-database-outline',
  'mdi-checklist': 'mdi-format-list-checks',
  'mdi-discord': 'mdi-chat',
  'mdi-flow-chart': 'mdi-chart-sankey',
  'mdi-magnify-off': 'mdi-magnify-close',
  'mdi-octopus': 'mdi-octagram',
  'mdi-school-plus': 'mdi-school',
  'mdi-scroll-text': 'mdi-script-text',
  'mdi-spell-check': 'mdi-spellcheck',
  'mdi-stars': 'mdi-star-four-points',
  'mdi-story-outline': 'mdi-book-open-outline',
  'mdi-summarize': 'mdi-text-long',
  'mdi-template': 'mdi-shape-outline',
  'mdi-text-to-speech': 'mdi-account-voice',
  'mdi-tower': 'mdi-office-building',
  'mdi-tune-vertical-outline': 'mdi-tune-vertical-variant',
  'mdi-video-settings': 'mdi-video-outline',
  'mdi-web-outline': 'mdi-web',

  // Additional stability aliases
  'mdi-waveform': 'mdi-sine-wave',
  'mdi-graph-outline': 'mdi-chart-line',
  'mdi-graph': 'mdi-chart-line',
  
  // Document icon aliases
  'mdi-file-document-outline-edit': 'mdi-file-document-edit',
  'mdi-file-document-edit-outline': 'mdi-file-document-edit'
}

export function getMdiAlias(name?: string | null): string | undefined {
  if (!name) return name || undefined
  const n = String(name).trim()
  if (!n.startsWith('mdi-')) return n
  return ALIASES[n] || n
}

export function aliasIcon(name?: string | null): string | undefined {
  return getMdiAlias(name)
}

export default {
  getMdiAlias,
  aliasIcon,
}
