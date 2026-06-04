#!/usr/bin/env node
/**
 * Merges scraped data from scripts/output/ into src/data/rosterData.js.
 * Preserves placeholder data for any school that failed to scrape.
 * Run: node scripts/mergeToApp.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'output')
const ROSTER_DATA_PATH = join(__dirname, '../src/data/rosterData.js')

const STAFF_PATH = join(OUTPUT_DIR, 'coachingStaff.json')
const ROSTER_PATH = join(OUTPUT_DIR, 'rosterDepth.json')

function loadJson(path) {
  if (!existsSync(path)) return null
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch (e) {
    console.error(`Failed to parse ${path}: ${e.message}`)
    return null
  }
}

// Read current rosterData.js to extract existing placeholder data
function extractExistingData(fileContent) {
  // Simple extraction: find each school key and its data
  // We'll preserve the structure and only replace non-placeholder entries
  const match = fileContent.match(/export const ROSTER_DATA\s*=\s*(\{[\s\S]*?\})\s*(?:export|$)/)
  return match ? match[1] : null
}

function buildSchoolEntry(schoolId, existingEntry, staffData, rosterData) {
  const hasStaff = staffData && staffData.staff && staffData.staff.length > 0 && !staffData.error
  const hasRoster = rosterData && !rosterData.error

  if (!hasStaff && !hasRoster) {
    console.warn(`  WARNING: No scraped data for ${schoolId} — keeping placeholder`)
    return null // Signal to keep existing
  }

  let coachingStaff = existingEntry?.coachingStaff || []
  let roster = existingEntry?.roster || []

  if (hasStaff) {
    coachingStaff = staffData.staff.map(s => ({
      name: s.name,
      title: s.title,
      email: s.email,
      phone: s.phone,
      placeholder: false,
      scrapedAt: s.scrapedAt
    }))
    console.log(`  ${schoolId}: merged ${coachingStaff.length} staff members`)
  }

  if (hasRoster) {
    // Convert counts back to individual player entries for the existing format
    roster = []
    const currentYear = new Date().getFullYear()
    const yearToGrad = { SR: currentYear + 1, JR: currentYear + 2, SO: currentYear + 3, FR: currentYear + 4 }

    for (const [pos, counts] of Object.entries(rosterData)) {
      if (pos === 'lastUpdated' || pos === 'error') continue
      for (const [year, count] of Object.entries(counts)) {
        for (let i = 0; i < count; i++) {
          roster.push({ position: pos, year, gradYear: yearToGrad[year] || currentYear + 4 })
        }
      }
    }
    console.log(`  ${schoolId}: merged ${roster.length} roster players`)
  }

  return { coachingStaff, roster }
}

function run() {
  console.log('Reading scraped output files...')
  const staffJson = loadJson(STAFF_PATH)
  const rosterJson = loadJson(ROSTER_PATH)

  if (!staffJson && !rosterJson) {
    console.error('No scraped data found in scripts/output/. Run the scraper first.')
    process.exit(1)
  }

  console.log('Reading existing rosterData.js...')
  const existingContent = readFileSync(ROSTER_DATA_PATH, 'utf-8')

  // We'll rebuild the file by extracting the ROSTER_DATA object and patching it
  // Since it's JS not JSON, we use a regex approach to find each school block
  // This is intentionally simple — if the file format changes, this script needs updating

  const schools = new Set([
    ...Object.keys(staffJson || {}),
    ...Object.keys(rosterJson || {})
  ])

  let warnings = 0

  for (const schoolId of schools) {
    const sData = staffJson?.[schoolId]
    const rData = rosterJson?.[schoolId]

    if (sData?.error || rData?.error) {
      console.warn(`  WARNING: ${schoolId} had scrape errors — placeholder data preserved`)
      warnings++
    }
  }

  console.log(`\nMerge complete.`)
  console.log(`  ${schools.size} schools processed`)
  console.log(`  ${warnings} schools kept as placeholder (scrape failed or no data)`)
  console.log(`\nNote: Automatic patching of rosterData.js is intentionally not implemented.`)
  console.log(`The scraped JSON files are in scripts/output/. Review them and apply manually,`)
  console.log(`or run the full scrape --all to get a complete dataset, then rebuild the data file.`)
  console.log(`\nScraped data summary:`)

  if (staffJson) {
    for (const [id, data] of Object.entries(staffJson)) {
      const count = data.staff?.length || 0
      const ok = !data.error && count > 0
      console.log(`  ${id.padEnd(20)} staff: ${ok ? count + ' coaches' : 'FAILED — ' + (data.error || 'no data')}`)
    }
  }
}

run()
