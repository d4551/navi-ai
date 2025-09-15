#!/usr/bin/env node

/**
 * Store Migration Script
 * Helps migrate from monolithic app store to domain-specific stores
 */

const fs = require('fs');
const path = require('path');

const STORES_DIR = path.join(__dirname, '../src/stores');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const VIEWS_DIR = path.join(__dirname, '../src/views');

// Mapping of old store usage to new stores
const STORE_MAPPINGS = {
  // User-related
  'store.user': 'userStore.user',
  'store.updateUser': 'userStore.updateUser',
  'store.userProfile': 'userStore.userProfile',
  'store.personalInfo': 'userStore.personalInfo',
  'store.hasValidEmail': 'userStore.hasValidEmail',
  'store.profileCompleteness': 'userStore.profileCompleteness',

  // Settings-related
  'store.settings': 'settingsStore.settings',
  'store.updateSettings': 'settingsStore.updateSettings',
  'store.saveSettings': 'settingsStore.saveSettings',
  'store.isConfigured': 'settingsStore.isConfigured',

  // AI-related
  'store.aiStatus': 'aiStore.aiStatus',
  'store.availableModels': 'aiStore.availableModels',
  'store.testGeminiApiKey': 'aiStore.testGeminiApiKey',
  'store.connectGeminiApi': 'aiStore.connectGeminiApi',

  // Jobs-related
  'store.jobSearchData': 'jobsStore.jobSearchData',
  'store.saveJob': 'jobsStore.saveJob',
  'store.coverLetterDrafts': 'jobsStore.coverLetterDrafts',
  'store.saveCoverLetterDraft': 'jobsStore.saveCoverLetterDraft',
};

const IMPORT_REPLACEMENTS = {
  "import { useAppStore } from '@/stores/app'": `import { useAppStore } from '@/stores/app-refactored'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useAIStore } from '@/stores/ai'
import { useJobsStore } from '@/stores/jobs'`,

  "import { useAppStore } from \"@/stores/app\"": `import { useAppStore } from "@/stores/app-refactored"
import { useUserStore } from "@/stores/user"
import { useSettingsStore } from "@/stores/settings"
import { useAIStore } from "@/stores/ai"
import { useJobsStore } from "@/stores/jobs"`,
};

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { success: false, reason: 'File not found' };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Skip if already migrated
  if (content.includes('app-refactored') || content.includes('useUserStore')) {
    return { success: false, reason: 'Already migrated' };
  }

  // Replace imports first
  for (const [oldImport, newImport] of Object.entries(IMPORT_REPLACEMENTS)) {
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      hasChanges = true;
    }
  }

  // If we added new imports, we need to initialize the stores in setup
  if (hasChanges && (content.includes('const store = useAppStore') || content.includes('store = useAppStore'))) {
    // Add store initializations after the main store
    const storePattern = /(const\s+store\s*=\s*useAppStore\(\))/;
    const setupStores = `$1
    const userStore = useUserStore()
    const settingsStore = useSettingsStore()
    const aiStore = useAIStore()
    const jobsStore = useJobsStore()`;

    content = content.replace(storePattern, setupStores);
  }

  // Replace store method calls
  for (const [oldUsage, newUsage] of Object.entries(STORE_MAPPINGS)) {
    const pattern = new RegExp(oldUsage.replace('.', '\\.'), 'g');
    if (pattern.test(content)) {
      content = content.replace(pattern, newUsage);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, reason: 'Migrated successfully' };
  }

  return { success: false, reason: 'No changes needed' };
}

function findVueFiles(dir) {
  const files = [];

  function scanDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.vue') || item.endsWith('.ts') || item.endsWith('.js')) {
        files.push(itemPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

function main() {
  console.log('🔄 Starting store migration...\n');

  const componentsFiles = findVueFiles(COMPONENTS_DIR);
  const viewFiles = findVueFiles(VIEWS_DIR);
  const allFiles = [...componentsFiles, ...viewFiles];

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of allFiles) {
    try {
      const result = migrateFile(file);
      const relativePath = path.relative(process.cwd(), file);

      if (result.success) {
        console.log(`✅ ${relativePath} - ${result.reason}`);
        migrated++;
      } else {
        console.log(`⏭️  ${relativePath} - ${result.reason}`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ ${file} - Error: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Migrated: ${migrated} files`);
  console.log(`   Skipped: ${skipped} files`);
  console.log(`   Errors: ${errors} files`);
  console.log(`   Total: ${allFiles.length} files`);

  if (migrated > 0) {
    console.log(`\n🎉 Migration completed! ${migrated} files updated.`);
    console.log('\n📝 Next steps:');
    console.log('1. Test the application to ensure everything works');
    console.log('2. Update any remaining direct store references manually');
    console.log('3. Consider renaming app-refactored.ts to app.ts when ready');
  } else {
    console.log('\n💡 No files needed migration. You may need to update the migration patterns.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, STORE_MAPPINGS };