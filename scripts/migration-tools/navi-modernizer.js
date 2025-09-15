#!/usr/bin/env node

// Orchestrates NAVI modernization: Tailwind dark mode, emoji→Heroicons, legacy icons→Heroicons,
// and verifies Pinia + Fira Code wiring.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TailwindDarkModeMigrator } from './tailwind-dark-mode-migrator.js';
import { EmojiToHeroiconsMigrator } from './emoji-to-heroicons-migrator.js';
import { LegacyIconsToHeroiconsMigrator } from './legacy-icons-to-heroicons-migrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(msg, level = 'info') {
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${msg}`);
}

function ensurePackageInstalled(pkgJson, name) {
  const has = (pkgJson.dependencies && pkgJson.dependencies[name]) || (pkgJson.devDependencies && pkgJson.devDependencies[name]);
  return !!has;
}

function verifyPiniaAndFira(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json');
  const results = { pinia: false, fira: false, heroiconsVue: false };
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    results.pinia = ensurePackageInstalled(pkg, 'pinia');
    results.fira = ensurePackageInstalled(pkg, '@fontsource/fira-code');
    results.heroiconsVue = ensurePackageInstalled(pkg, '@heroicons/vue');
  } catch {}

  // Basic runtime checks: main.js using pinia and styles importing Fira Code
  try {
    const mainJs = fs.readFileSync(path.join(projectRoot, 'src/main.js'), 'utf8');
    if (mainJs.includes('createPinia(') || mainJs.includes('createPinia()')) results.pinia = true;
  } catch {}
  try {
    const idxCss = fs.readFileSync(path.join(projectRoot, 'src/styles/index.css'), 'utf8');
    if (/@fontsource\/fira-code\//.test(idxCss)) results.fira = true;
  } catch {}
  return results;
}

async function run() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    projectRoot: process.cwd(),
    backupDir: 'backups'
  };

  log('🚀 NAVI Modernizer starting...');

  const tailwind = new TailwindDarkModeMigrator(options);
  const emoji = new EmojiToHeroiconsMigrator(options);
  const legacy = new LegacyIconsToHeroiconsMigrator(options);

  const tRes = await tailwind.migrate();
  const eRes = await emoji.migrate();
  const lRes = await legacy.migrate();

  const deps = verifyPiniaAndFira(options.projectRoot);

  log('🎉 Modernization complete', 'success');
  console.log('\nSummary');
  console.log('-------');
  console.log(`Tailwind dark mode: processed ${tRes.processedFiles}, modified ${tRes.modifiedFiles}`);
  console.log(`Emoji→Heroicons:    processed ${eRes.processedFiles}, modified ${eRes.modifiedFiles}`);
  console.log(`Legacy→Heroicons:   processed ${lRes.processedFiles}, modified ${lRes.modifiedFiles}`);
  console.log('\nChecks');
  console.log(`Pinia present and used:   ${deps.pinia ? '✅' : '⚠️'}`);
  console.log(`Fira Code imported:       ${deps.fira ? '✅' : '⚠️'}`);
  console.log(`@heroicons/vue installed:  ${deps.heroiconsVue ? '✅' : '⚠️'}`);

  if (!deps.pinia) log('Pinia is not fully configured. Please install and register it in src/main.js', 'warn');
  if (!deps.fira) log('Fira Code font not imported in styles. Add @fontsource/fira-code imports to src/styles/index.css', 'warn');
  if (!deps.heroiconsVue) log('Install @heroicons/vue to use Heroicons Vue components', 'warn');
}

run().catch(err => { log(err.stack || err.message, 'error'); process.exit(1); });
