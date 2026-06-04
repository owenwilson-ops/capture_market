#!/usr/bin/env node
/**
 * Inside Lacrosse scraper — coaching staff and roster depth by position/year.
 * Run with: node scripts/scrapeInsideLacrosse.js --school clemson
 *           node scripts/scrapeInsideLacrosse.js --all
 *
 * IMPORTANT: Run `node scripts/scrapeInsideLacrosse.js --check-robots` first
 * to verify what the site permits before scraping.
 */

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'output')

// School ID to Inside Lacrosse slug mapping
// These URL patterns need to be verified before use — run --check-robots and then manually
// check 2-3 school pages to confirm the structure before running --all.
const SCHOOL_SLUGS = {
  clemson: 'clemson',
  unc: 'north-carolina',
  maryland: 'maryland',
  syracuse: 'syracuse',
  duke: 'duke',
  'notre-dame': 'notre-dame',
  virginia: 'virginia',
  'johns-hopkins': 'johns-hopkins',
  'penn-state': 'penn-state',
  'nc-state': 'nc-state',
  'ohio-state': 'ohio-state',
  michigan: 'michigan',
  georgetown: 'georgetown',
  'boston-college': 'boston-college',
  denver: 'denver',
  loyola: 'loyola-md',
  princeton: 'princeton',
  yale: 'yale',
  harvard: 'harvard',
  cornell: 'cornell',
  villanova: 'villanova',
  marquette: 'marquette',
  'james-madison': 'james-madison',
  'stony-brook': 'stony-brook',
  army: 'army',
}

const BASE_URL = 'https://www.insidelacrosse.com'
const DELAY_MS = 2000

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function checkRobots(page) {
  console.log('\n--- Checking robots.txt ---')
  await page.goto(`${BASE_URL}/robots.txt`, { waitUntil: 'networkidle' })
  const text = await page.content()
  console.log(text.slice(0, 2000))
  console.log('---')
}

async function scrapeSchool(page, schoolId) {
  const slug = SCHOOL_SLUGS[schoolId]
  if (!slug) throw new Error(`No slug found for school: ${schoolId}`)

  const result = {
    staff: [],
    roster: { Attack: { FR: 0, SO: 0, JR: 0, SR: 0 }, Midfielder: { FR: 0, SO: 0, JR: 0, SR: 0 }, Defense: { FR: 0, SO: 0, JR: 0, SR: 0 }, Goalie: { FR: 0, SO: 0, JR: 0, SR: 0 } },
    lastUpdated: new Date().toISOString(),
    rawHtmlSample: ''
  }

  // Try roster page
  const rosterUrl = `${BASE_URL}/college/team/${slug}/lacrosse/women/roster`
  console.log(`  Fetching: ${rosterUrl}`)
  await page.goto(rosterUrl, { waitUntil: 'networkidle', timeout: 30000 })
  await sleep(500)

  const rawHtml = await page.content()
  result.rawHtmlSample = rawHtml.slice(0, 3000)

  // Extract roster data — position and year for each player
  // We intentionally do NOT collect player names (privacy, not needed for our feature)
  const players = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr, .roster-row, [class*="roster"] tr, [class*="player"]')
    const results = []
    rows.forEach(row => {
      const text = row.textContent || ''
      const posMatch = text.match(/\b(attack|attacker|midfielder|midfield|defender|defense|goalie|goalkeeper)\b/i)
      const yearMatch = text.match(/\b(fr|freshman|so|sophomore|jr|junior|sr|senior)\b/i)
      const gradYearMatch = text.match(/\b(20\d\d)\b/)
      if (posMatch && yearMatch) {
        let pos = posMatch[1].toLowerCase()
        pos = pos.includes('attack') ? 'Attack'
            : pos.includes('mid') ? 'Midfielder'
            : pos.includes('def') ? 'Defense'
            : pos.includes('goal') ? 'Goalie'
            : null
        let year = yearMatch[1].toLowerCase().slice(0, 2).toUpperCase()
        year = { FR: 'FR', SO: 'SO', JR: 'JR', SR: 'SR', FR: 'FR' }[year] || null
        if (pos && year) results.push({ pos, year, gradYear: gradYearMatch ? parseInt(gradYearMatch[1]) : null })
      }
    })
    return results
  })

  players.forEach(({ pos, year }) => {
    if (result.roster[pos] && result.roster[pos][year] !== undefined) {
      result.roster[pos][year]++
    }
  })

  // Try coaching staff page
  await sleep(DELAY_MS)
  const staffUrl = `${BASE_URL}/college/team/${slug}/lacrosse/women/coaches`
  console.log(`  Fetching: ${staffUrl}`)
  await page.goto(staffUrl, { waitUntil: 'networkidle', timeout: 30000 })
  await sleep(500)

  const staff = await page.evaluate(() => {
    const entries = []
    const coaches = document.querySelectorAll('[class*="coach"], [class*="staff"], .coach-card, .staff-member')
    coaches.forEach(el => {
      const nameEl = el.querySelector('h1, h2, h3, h4, .name, [class*="name"]')
      const titleEl = el.querySelector('.title, [class*="title"], .position, [class*="position"]')
      const emailEl = el.querySelector('a[href^="mailto:"]')
      const phoneEl = el.querySelector('a[href^="tel:"]')
      if (nameEl) {
        entries.push({
          name: nameEl.textContent?.trim() || '',
          title: titleEl?.textContent?.trim() || '',
          email: emailEl?.href?.replace('mailto:', '') || '',
          phone: phoneEl?.href?.replace('tel:', '') || '',
          scrapedAt: new Date().toISOString()
        })
      }
    })
    return entries
  })

  result.staff = staff

  return result
}

async function run() {
  const args = process.argv.slice(2)
  const checkRobotsFlag = args.includes('--check-robots')
  const schoolFlag = args.find((_, i) => args[i - 1] === '--school')
  const allFlag = args.includes('--all')

  if (!checkRobotsFlag && !schoolFlag && !allFlag) {
    console.log(`
Usage:
  node scripts/scrapeInsideLacrosse.js --check-robots   Check robots.txt first
  node scripts/scrapeInsideLacrosse.js --school clemson  Scrape a single school
  node scripts/scrapeInsideLacrosse.js --all             Scrape all schools

IMPORTANT: Always run --check-robots before --all to verify what the site permits.
After --school, review the raw HTML sample in output/ before running --all.
    `)
    process.exit(0)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (compatible; RecruitReadyBot/1.0; Research tool for student-athletes)' })

  try {
    if (checkRobotsFlag) {
      await checkRobots(page)
      await browser.close()
      return
    }

    const coachingStaffOutput = {}
    const rosterDepthOutput = {}

    const schoolsToScrape = allFlag
      ? Object.keys(SCHOOL_SLUGS)
      : [schoolFlag]

    for (const schoolId of schoolsToScrape) {
      console.log(`\nScraping: ${schoolId}`)
      try {
        const data = await scrapeSchool(page, schoolId)

        coachingStaffOutput[schoolId] = {
          staff: data.staff,
          lastUpdated: data.lastUpdated
        }

        rosterDepthOutput[schoolId] = {
          ...data.roster,
          lastUpdated: data.lastUpdated
        }

        // If single school, output raw HTML sample for verification
        if (schoolFlag && !allFlag) {
          console.log('\n--- RAW HTML SAMPLE (first 3000 chars) ---')
          console.log(data.rawHtmlSample)
          console.log('---')
          console.log('\n--- STRUCTURED DATA EXTRACTED ---')
          console.log('Staff:', JSON.stringify(data.staff, null, 2))
          console.log('Roster depth:', JSON.stringify(data.roster, null, 2))
          console.log('---')
          console.log('\nVerify the above before running --all.')
        }

        if (allFlag && schoolsToScrape.indexOf(schoolId) < schoolsToScrape.length - 1) {
          console.log(`  Waiting ${DELAY_MS}ms before next request...`)
          await sleep(DELAY_MS)
        }
      } catch (err) {
        console.error(`  FAILED: ${schoolId} — ${err.message}`)
        // Continue with remaining schools — don't abort
        coachingStaffOutput[schoolId] = { staff: [], lastUpdated: new Date().toISOString(), error: err.message }
        rosterDepthOutput[schoolId] = { Attack: { FR: 0, SO: 0, JR: 0, SR: 0 }, Midfielder: { FR: 0, SO: 0, JR: 0, SR: 0 }, Defense: { FR: 0, SO: 0, JR: 0, SR: 0 }, Goalie: { FR: 0, SO: 0, JR: 0, SR: 0 }, lastUpdated: new Date().toISOString(), error: err.message }
      }
    }

    // Write output files
    if (allFlag || schoolFlag) {
      const staffPath = join(OUTPUT_DIR, 'coachingStaff.json')
      const rosterPath = join(OUTPUT_DIR, 'rosterDepth.json')

      // Merge with existing output if it exists (for incremental runs)
      let existingStaff = {}
      let existingRoster = {}
      try { existingStaff = JSON.parse(readFileSync(staffPath, 'utf-8')) } catch {}
      try { existingRoster = JSON.parse(readFileSync(rosterPath, 'utf-8')) } catch {}

      writeFileSync(staffPath, JSON.stringify({ ...existingStaff, ...coachingStaffOutput }, null, 2))
      writeFileSync(rosterPath, JSON.stringify({ ...existingRoster, ...rosterDepthOutput }, null, 2))

      console.log(`\nOutput written to:`)
      console.log(`  ${staffPath}`)
      console.log(`  ${rosterPath}`)
    }
  } finally {
    await browser.close()
  }
}

run().catch(err => {
  console.error('Scraper failed:', err)
  process.exit(1)
})
