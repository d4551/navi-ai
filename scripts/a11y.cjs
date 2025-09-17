/*
  Simple Pa11y audit runner for the dev server.
  Audits the home page and key routes for common WCAG issues.
*/

const pa11y = require('pa11y')

async function run() {
  const port = process.env.VITE_PORT || '5173'
  const base = `http://127.0.0.1:${port}`
  const urls = [
    `${base}/#/`,
    `${base}/#/resume`,
    `${base}/#/jobs`,
    `${base}/#/skills`,
    `${base}/#/settings`,
  ]

  const options = {
    standard: 'WCAG2AAA',
    threshold: 0,
    log: { debug: () => {}, error: console.error, info: () => {} },
    hideElements: ['.vite-error-overlay'],
    ignore: [
      // SPA hash routing false positives (anchor targets handled by router)
      'WCAG2AAA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID',
    ],
  }

  let failures = 0

  for (const url of urls) {
    console.log(`\nRunning a11y audit for: ${url}`)
    const result = await pa11y(url, options)
    const issues = result.issues || []
    if (issues.length) {
      failures += issues.length
      for (const issue of issues) {
        console.log(`- [${issue.code}] ${issue.message} (${issue.type})`)
        if (issue.selector) console.log(`  selector: ${issue.selector}`)
      }
    } else {
      console.log('No issues found.')
    }
  }

  if (failures > 0) {
    console.error(`\nAccessibility audit completed with ${failures} issues.`)
    process.exitCode = 1
  } else {
    console.log('\nAccessibility audit passed with no issues.')
  }
}

run().catch(err => {
  console.error(err)
  process.exitCode = 1
})
