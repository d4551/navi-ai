#!/usr/bin/env node

const { spawn } = require('child_process')

const child = spawn(
  process.execPath,
  ['scripts/cleanup/standardize-comments.cjs', '--dry'],
  { stdio: ['ignore', 'pipe', 'inherit'] }
)

let out = ''
child.stdout.on('data', chunk => (out += chunk.toString()))
child.on('close', code => {
  const hasFindings = /\[DRY\] Would clean non-technical comments:/i.test(out)
  if (hasFindings) {
    console.error('\nNon-technical comments detected. Run:')
    console.error('  npm run cleanup:comments')
    process.exit(1)
  }
  process.exit(0)
})
