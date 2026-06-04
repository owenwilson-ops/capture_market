#!/usr/bin/env node
/**
 * refreshData.js — Run this monthly to update coaching staff and roster data.
 * Runs the scraper for all schools, then runs the merge.
 * Usage: node scripts/refreshData.js
 */

import { execSync } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(cmd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: dirname(__dirname) })
}

console.log('=== Recruit Ready Data Refresh ===')
console.log(`Started: ${new Date().toISOString()}`)

try {
  run('node scripts/scrapeInsideLacrosse.js --all')
  run('node scripts/mergeToApp.js')
  console.log(`\nCompleted: ${new Date().toISOString()}`)
} catch (err) {
  console.error('\nRefresh failed:', err.message)
  process.exit(1)
}
