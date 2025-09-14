#!/usr/bin/env node
// Safe postinstall for electron-builder native deps
// - Skips in CI or when NAVI_SKIP_POSTINSTALL=1
// - Runs electron-builder install-app-deps
// - Soft-fails on permission or missing-binary issues with guidance

const { spawn } = require('node:child_process');
const { accessSync, constants } = require('node:fs');
const { join } = require('node:path');

function log(msg) {
  console.log(`[postinstall] ${msg}`);
}

const isCI = ["CI", "GITHUB_ACTIONS", "BUILDkite"].some((k) => process.env[k] === 'true' || process.env[k] === '1');
const skipFlag = process.env.NAVI_SKIP_POSTINSTALL === '1';

if (isCI || skipFlag) {
  log(`Skipping electron-builder (CI=${isCI}, NAVI_SKIP_POSTINSTALL=${skipFlag ? '1' : '0'})`);
  process.exit(0);
}

const binDir = join(process.cwd(), 'node_modules', '.bin');
const binName = process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder';
const binPath = join(binDir, binName);

try {
  accessSync(binPath, constants.X_OK);
} catch (e) {
  // If not executable or missing, provide guidance but don't block install
  log(`electron-builder not executable or missing at: ${binPath}`);
  log('Tip: try removing quarantine and setting exec bits:');
  log('  xattr -dr com.apple.quarantine node_modules/.bin || true');
  log('  find node_modules/.bin -type f ! -name "*.cmd" ! -name "*.ps1" -exec chmod +x {} +');
  process.exit(0);
}

log('Running: electron-builder install-app-deps');
const child = spawn(binPath, ['install-app-deps'], { stdio: 'inherit' });

child.on('error', (err) => {
  log(`electron-builder failed to start: ${err && err.message ? err.message : err}`);
  // Soft-fail on typical local env issues
  process.exit(0);
});

child.on('exit', (code) => {
  if (code === 0) {
    process.exit(0);
  }
  // Treat permission (126), not-found (127) as soft failures with guidance
  if (code === 126 || code === 127) {
    log(`electron-builder exited with code ${code}. Continuing install.`);
    log('If native modules fail at runtime, run:');
    log('  npx electron-builder install-app-deps');
    process.exit(0);
  }
  process.exit(code);
});

