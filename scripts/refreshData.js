#!/usr/bin/env node
/**
 * refreshData.js — refresh coaching staff and roster data for all schools.
 * Scrapes each school's official athletics site, then regenerates rosterData.js.
 * Usage: node scripts/refreshData.js   (or: npm run refresh-data)
 *
 * To also refresh stat leaders, set PARSE_API_KEY and run `npm run fetch-stats`.
 */

import { execSync } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(cmd) {
  console.log(`\n> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: dirname(__dirname) })
}

console.log('=== Sirius Recruit Data Refresh ===')
console.log(`Started: ${new Date().toISOString()}`)

try {
  run('node scripts/scrapeAthletics.js --all')
  run('node scripts/buildRosterData.js')
  console.log(`\nCompleted: ${new Date().toISOString()}`)
} catch (err) {
  console.error('\nRefresh failed:', err.message)
  process.exit(1)
}
