#!/usr/bin/env node
/**
 * Scrapes coaching staff and player rosters from each school's OFFICIAL
 * athletics website (the `athleticUrl` in src/data/schools.js), not a third
 * party. All data collected here is published publicly on those team pages.
 *
 * Usage:
 *   node scripts/scrapeAthletics.js --school clemson   # one school
 *   node scripts/scrapeAthletics.js --all              # every tracked school
 *
 * Output: scripts/output/athletics.json
 *
 * Politeness: identifies itself in the User-Agent, checks robots.txt for each
 * host, and waits between requests. Run buildRosterData.js afterward to fold
 * the results into the app.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SCHOOLS } from '../src/data/schools.js'
import {
  extractNuxtData, makeHydrator, findStaff, findPlayers,
  normalizeStaff, normalizePlayer, activeSeasonYear,
} from './lib/athleticsParse.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'output')
const OUTPUT_FILE = join(OUTPUT_DIR, 'athletics.json')

const USER_AGENT =
  'RecruitReadyBot/1.0 (recruiting research tool; reads public team roster pages)'
const DELAY_MS = 2500
const SEASON = activeSeasonYear()

// Candidate roster page paths, tried in order until one returns parseable data.
const ROSTER_PATHS = [
  '/sports/womens-lacrosse/roster',
  '/sports/wlax/roster',
  '/sports/womens-lacrosse/roster/',
  '/sports/w-lacros/roster',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

/** Minimal robots.txt check for the wildcard agent. Fails open on fetch error. */
async function pathAllowed(origin, path) {
  try {
    const txt = await fetchText(`${origin}/robots.txt`)
    const lines = txt.split('\n').map((l) => l.trim())
    let applies = false
    const disallows = []
    for (const line of lines) {
      if (/^user-agent:/i.test(line)) {
        applies = line.split(':')[1].trim() === '*'
      } else if (applies && /^disallow:/i.test(line)) {
        const rule = line.split(':').slice(1).join(':').trim()
        if (rule) disallows.push(rule)
      }
    }
    return !disallows.some((rule) => path.startsWith(rule))
  } catch {
    return true
  }
}

async function scrapeSchool(school) {
  const origin = school.athleticUrl.replace(/\/$/, '')
  let lastError = 'no parseable roster page found'

  for (const path of ROSTER_PATHS) {
    const allowed = await pathAllowed(origin, path)
    if (!allowed) {
      lastError = `robots.txt disallows ${path}`
      continue
    }
    const url = `${origin}${path}`
    let html
    try {
      html = await fetchText(url)
    } catch (e) {
      lastError = `${e.message} for ${path}`
      continue
    }

    const arr = extractNuxtData(html)
    if (!arr) {
      lastError = 'page is not a supported (WMT/Nuxt) athletics site'
      continue
    }

    const hydrate = makeHydrator(arr)
    const rawStaff = findStaff(arr, hydrate)
    const rawPlayers = findPlayers(arr, hydrate)

    const staff = rawStaff.map((s) => normalizeStaff(s, origin)).filter((s) => s.name)
    const players = rawPlayers
      .map((p) => normalizePlayer(p, SEASON))
      .filter(Boolean)

    if (!staff.length && !players.length) {
      lastError = 'parsed page but found no staff or players'
      continue
    }

    return {
      ok: true,
      sourceUrl: url,
      season: SEASON,
      staff,
      players,
      scrapedAt: new Date().toISOString(),
    }
  }

  return { ok: false, error: lastError, scrapedAt: new Date().toISOString() }
}

async function run() {
  const args = process.argv.slice(2)
  const schoolFlag = args[args.indexOf('--school') + 1]
  const allFlag = args.includes('--all')

  if (!allFlag && !args.includes('--school')) {
    console.log(`Usage:
  node scripts/scrapeAthletics.js --school clemson
  node scripts/scrapeAthletics.js --all`)
    process.exit(0)
  }

  const targets = (allFlag ? SCHOOLS : SCHOOLS.filter((s) => s.id === schoolFlag))
    .filter((s) => s.athleticUrl && s.id !== 'undecided')

  if (!targets.length) {
    console.error(`No matching school with an athleticUrl: ${schoolFlag || ''}`)
    process.exit(1)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  let out = {}
  if (existsSync(OUTPUT_FILE)) {
    try { out = JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8')) } catch {}
  }

  console.log(`Scraping ${targets.length} school(s); season ${SEASON}\n`)
  for (let i = 0; i < targets.length; i++) {
    const school = targets[i]
    process.stdout.write(`  ${school.shortName.padEnd(16)} `)
    try {
      const data = await scrapeSchool(school)
      out[school.id] = data
      console.log(
        data.ok
          ? `ok — ${data.staff.length} staff, ${data.players.length} players`
          : `FAILED — ${data.error}`
      )
    } catch (e) {
      out[school.id] = { ok: false, error: e.message, scrapedAt: new Date().toISOString() }
      console.log(`ERROR — ${e.message}`)
    }
    writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2))
    if (i < targets.length - 1) await sleep(DELAY_MS)
  }

  const ok = Object.values(out).filter((d) => d.ok).length
  console.log(`\nDone. ${ok}/${Object.keys(out).length} schools succeeded.`)
  console.log(`Output: ${OUTPUT_FILE}`)
  console.log(`Next: node scripts/buildRosterData.js`)
}

run().catch((e) => { console.error('Scraper failed:', e); process.exit(1) })
