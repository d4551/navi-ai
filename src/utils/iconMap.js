export function mapIcon(name) {
  if (!name) return 'squares-2x2'
  // normalize inputs like "bi gear", "mdi-cog", "settings", "chartbar", etc.
  const n = String(name)
    .trim()
    .toLowerCase()
    .replace(/^bi\s+/, '')
    .replace(/^bi-/, '')
    .replace(/^mdi-/, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const m = {
    // navigation basics
    home: 'home',
    house: 'home',
    dashboard: 'squares-2x2',

    // people
    user: 'user',
    users: 'user-group',
    team: 'user-group',
    account: 'user',
    profile: 'user',

    // files/projects
    project: 'folder',
    projects: 'folder',
    folder: 'folder',
    file: 'document',

    // calendar/time
    calendar: 'calendar',
    date: 'calendar',
    schedule: 'calendar-days',

    // charts/reports
    chart: 'chart-bar',
    'chart-bar': 'chart-bar',
    chartbar: 'chart-bar',
    analytics: 'chart-bar',
    report: 'document-chart-bar',
    reports: 'document-chart-bar',

    // settings
    settings: 'cog-6-tooth',
    cog: 'cog-6-tooth',
    gear: 'cog-6-tooth',
    preference: 'adjustments-horizontal',

    // misc common
    search: 'magnifying-glass',
    bell: 'bell',
    notify: 'bell',
    trash: 'trash',
    delete: 'trash',
    info: 'information-circle',
    help: 'question-mark-circle',
  }
  return m[n] || n
}
