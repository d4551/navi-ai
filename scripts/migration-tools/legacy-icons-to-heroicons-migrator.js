#!/usr/bin/env node

// Replaces legacy icon tags/classes (MDI, Bootstrap Icons, Font Awesome, Material Icons)
// with @heroicons/vue components in Vue SFCs. Adds necessary imports.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common mapping between legacy icon token and Heroicons Vue component
// Note: This is intentionally conservative and covers widely used icons.
const TOKEN_TO_HEROICON = {
  home: { name: 'HomeIcon', type: 'outline' },
  settings: { name: 'CogIcon', type: 'outline' },
  cog: { name: 'CogIcon', type: 'outline' },
  search: { name: 'MagnifyingGlassIcon', type: 'outline' },
  user: { name: 'UserIcon', type: 'outline' },
  users: { name: 'UsersIcon', type: 'outline' },
  bell: { name: 'BellIcon', type: 'outline' },
  notification: { name: 'BellIcon', type: 'outline' },
  x: { name: 'XMarkIcon', type: 'outline' },
  close: { name: 'XMarkIcon', type: 'outline' },
  check: { name: 'CheckIcon', type: 'outline' },
  plus: { name: 'PlusIcon', type: 'outline' },
  minus: { name: 'MinusIcon', type: 'outline' },
  add: { name: 'PlusIcon', type: 'outline' },
  remove: { name: 'MinusIcon', type: 'outline' },
  trash: { name: 'TrashIcon', type: 'outline' },
  delete: { name: 'TrashIcon', type: 'outline' },
  pencil: { name: 'PencilIcon', type: 'outline' },
  edit: { name: 'PencilIcon', type: 'outline' },
  info: { name: 'InformationCircleIcon', type: 'outline' },
  warning: { name: 'ExclamationTriangleIcon', type: 'outline' },
  error: { name: 'ExclamationCircleIcon', type: 'outline' },
  calendar: { name: 'CalendarIcon', type: 'outline' },
  clock: { name: 'ClockIcon', type: 'outline' },
  document: { name: 'DocumentIcon', type: 'outline' },
  file: { name: 'DocumentIcon', type: 'outline' },
  folder: { name: 'FolderIcon', type: 'outline' },
  download: { name: 'ArrowDownTrayIcon', type: 'outline' },
  upload: { name: 'ArrowUpTrayIcon', type: 'outline' },
  arrow: { name: 'ArrowRightIcon', type: 'outline' },
  'arrow-right': { name: 'ArrowRightIcon', type: 'outline' },
  'arrow-left': { name: 'ArrowLeftIcon', type: 'outline' },
  'arrow-up': { name: 'ArrowUpIcon', type: 'outline' },
  'arrow-down': { name: 'ArrowDownIcon', type: 'outline' },
  star: { name: 'StarIcon', type: 'solid' },
  trophy: { name: 'TrophyIcon', type: 'solid' },
  bolt: { name: 'BoltIcon', type: 'solid' },
  fire: { name: 'FireIcon', type: 'solid' },
  gift: { name: 'GiftIcon', type: 'solid' },
  eye: { name: 'EyeIcon', type: 'outline' },
  'eye-slash': { name: 'EyeSlashIcon', type: 'outline' },
  lock: { name: 'LockClosedIcon', type: 'outline' },
  'lock-open': { name: 'LockOpenIcon', type: 'outline' },
  key: { name: 'KeyIcon', type: 'outline' },
  phone: { name: 'PhoneIcon', type: 'outline' },
  envelope: { name: 'EnvelopeIcon', type: 'outline' },
  chat: { name: 'ChatBubbleLeftRightIcon', type: 'outline' },
};

// Extract a best-effort token from a legacy icon class list or material-icons inner text
function inferTokenFromLegacy(classes, innerText = '') {
  const cls = (classes || '').toLowerCase();
  const candidates = [];

  // Known libraries and their prefixes
  // mdi-<name>, fa-<name>, fas fa-<name>, far fa-<name>, bi-<name>
  const regexes = [
    /mdi-([a-z0-9-]+)/g,
    /fa[srldb]?\s+fa-([a-z0-9-]+)/g,
    /fa-([a-z0-9-]+)/g,
    /bi-([a-z0-9-]+)/g,
    /icon-([a-z0-9-]+)/g,
  ];
  for (const r of regexes) {
    let m;
    while ((m = r.exec(cls)) !== null) {
      candidates.push(m[1]);
    }
  }

  // Material Icons often use innerText to specify icon name
  if (/material-icons/.test(cls) && innerText) {
    candidates.push(innerText.trim().toLowerCase());
  }

  // Heuristics: try most specific tokens first
  for (const c of candidates) {
    if (TOKEN_TO_HEROICON[c]) return TOKEN_TO_HEROICON[c];
    // map dashed tokens to base
    const base = c.split('-')[0];
    if (TOKEN_TO_HEROICON[c.replace(/_/g, '-')]) return TOKEN_TO_HEROICON[c.replace(/_/g, '-')];
    if (TOKEN_TO_HEROICON[base]) return TOKEN_TO_HEROICON[base];
  }

  return null;
}

class LegacyIconsToHeroiconsMigrator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.backupDir = options.backupDir || 'backups';
    this.projectRoot = options.projectRoot || process.cwd();
    this.changes = [];
  }

  log(message, level = 'info') {
    if (this.verbose || level === 'error') {
      const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} ${message}`);
    }
  }

  async findFiles() {
    const patterns = [
      'src/**/*.vue',
      'src/**/*.html',
    ];
    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: this.projectRoot });
      files.push(...matches.map(f => path.join(this.projectRoot, f)));
    }
    return files;
  }

  createBackup(filePath) {
    if (this.dryRun) return;
    const backupPath = path.join(this.projectRoot, this.backupDir, path.relative(this.projectRoot, filePath));
    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(filePath, backupPath);
    this.log(`Backup created: ${backupPath}`);
  }

  generateIconComponent(iconConfig, extraClasses = '') {
    const size = 'w-5 h-5';
    const classes = extraClasses ? `${size} ${extraClasses}`.trim() : size;
    const classProp = classes ? ` class="${classes}"` : '';
    const aria = ' aria-hidden="true"';
    return `<${iconConfig.name}${classProp}${aria} />`;
  }

  addImports(content, fileIcons) {
    if (fileIcons.size === 0) return content;
    const outline = [];
    const solid = [];
    for (const icon of fileIcons) {
      (icon.type === 'solid' ? solid : outline).push(icon.name);
    }
    let imports = '';
    if (outline.length) imports += `import { ${Array.from(new Set(outline)).join(', ')} } from '@heroicons/vue/24/outline';\n`;
    if (solid.length) imports += `import { ${Array.from(new Set(solid)).join(', ')} } from '@heroicons/vue/24/solid';\n`;

    // Avoid duplicate imports if already present
    if (imports && content.includes("@heroicons/vue/24/")) {
      return content; // heuristic: already has heroicons imports
    }

    const scriptSetup = content.match(/<script setup[^>]*>/);
    const script = content.match(/<script[^>]*>/);
    if (scriptSetup) {
      const idx = scriptSetup.index + scriptSetup[0].length;
      return content.slice(0, idx) + '\n' + imports + content.slice(idx);
    } else if (script) {
      const idx = script.index + script[0].length;
      return content.slice(0, idx) + '\n' + imports + content.slice(idx);
    }
    // If no script section, prepend a script setup block
    return `<script setup>\n${imports}</script>\n\n` + content;
  }

  migrateFile(filePath) {
    const original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    let modified = false;
    const fileIcons = new Set();

    // Replace <i class="...">
  content = content.replace(/<i([^>]*?)class=["']([^"']+)["']([^>]*)><\/i>/gi, (match, _pre, classes, _post) => {
      const icon = inferTokenFromLegacy(classes);
      if (!icon) return match;
      fileIcons.add(icon);
      modified = true;
      // Preserve any extra classes from the original (excluding known lib classes)
      const extra = classes
        .split(/\s+/)
        .filter(c => !/^(mdi|mdi-[^\s]+|fa|fas|far|fal|fad|fab|fa-[^\s]+|bi|bi-[^\s]+|icon-[^\s]+|material-icons)$/.test(c))
        .join(' ');
      return this.generateIconComponent(icon, extra);
    });

    // Replace <span class="material-icons">name</span>
    content = content.replace(/<span([^>]*?)class=["'][^"']*material-icons[^"']*["']([^>]*)>([^<]+)<\/span>/gi, (match, pre, post, inner) => {
      const icon = inferTokenFromLegacy('material-icons', inner);
      if (!icon) return match;
      fileIcons.add(icon);
      modified = true;
      return this.generateIconComponent(icon);
    });

    if (!modified) return false;

    // Add imports for Vue SFCs only
    if (filePath.endsWith('.vue')) {
      content = this.addImports(content, fileIcons);
    }

    if (!this.dryRun) {
      this.createBackup(filePath);
      fs.writeFileSync(filePath, content);
    }

    this.changes.push({ file: path.relative(this.projectRoot, filePath), icons: Array.from(fileIcons).map(i => i.name) });
    this.log(`Migrated icons in ${path.relative(this.projectRoot, filePath)}`);
    return true;
  }

  async migrate() {
    this.log('🎯 Starting legacy icons → Heroicons migration...');
    const files = await this.findFiles();
    this.log(`Found ${files.length} files to scan`);
    let processed = 0; let modified = 0;
    for (const f of files) {
      try {
        if (this.migrateFile(f)) modified++;
        processed++;
      } catch (e) {
        this.log(`Failed to process ${f}: ${e.message}`, 'error');
      }
    }
    this.log(`✅ Migration complete. Processed: ${processed}, Modified: ${modified}`);
    return { processedFiles: processed, modifiedFiles: modified, changes: this.changes };
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    backupDir: args.find(a => a.startsWith('--backup-dir='))?.split('=')[1] || 'backups',
  };
  const migrator = new LegacyIconsToHeroiconsMigrator(options);
  migrator.migrate()
    .then(() => process.exit(0))
    .catch(err => { console.error('❌ Migration failed:', err); process.exit(1); });
}

export { LegacyIconsToHeroiconsMigrator };
