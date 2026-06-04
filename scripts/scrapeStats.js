#!/usr/bin/env node
/**
 * Scrapes REAL season scoring leaders from each school's official athletics
 * stats page (no third-party API key needed) and writes them to
 * src/data/statsLeaders.js.
 *
 * Works on Sidearm-platform stats pages, which embed full per-player season
 * stats in the Nuxt payload. WMT sites (e.g. Clemson) load stats through an
 * external iframe widget and are not covered here; those schools simply get no
 * leaders and the UI falls back to the roster.
 *
 * Usage: node scripts/scrapeStats.js [--season 2026]
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SCHOOLS } from '../src/data/schools.js'
import { ROSTER_DATA } from '../src/data/rosterData.js'
import { extractNuxtData, makeHydrator, activeSeasonYear, normalizePosition } from './lib/athleticsParse.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../src/data/statsLeaders.js')
const OUTPUT_DIR = join(__dirname, 'output')

// A browser User-Agent gets past the bot redirects some athletics sites use.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
const DELAY_MS = 2000
const TOP_N = 6

const args = process.argv.slice(2)
const SEASON = Number(args[args.indexOf('--season') + 1]) || activeSeasonYear()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const statsPaths = (s) => [
  `/sports/womens-lacrosse/stats/${s}`,
  `/sports/womens-lacrosse/stats`,
]

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' }, redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// "Humphrey, Chloe" -> "Chloe Humphrey"
function flipName(name) {
  const parts = String(name).split(',')
  return parts.length === 2 ? `${parts[1].trim()} ${parts[0].trim()}` : name.trim()
}

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/** Map a scraped player name to a roster position, if we have the roster. */
function positionFor(schoolId, name) {
  const roster = ROSTER_DATA[schoolId]?.roster || []
  const hit = roster.find((p) => p.name && p.name.toLowerCase() === name.toLowerCase())
  return hit ? hit.position : ''
}

function extractLeaders(arr, schoolId) {
  const hydrate = makeHydrator(arr)
  // Each player appears as an object with playerName + a shotStats block that
  // carries goals/assists/points. A player can appear in several tables
  // (overall, conference); keep the record with the most games played.
  const byName = new Map()
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    if (!('playerName' in v) || !('shotStats' in v)) continue
    const rec = hydrate(i)
    if (rec.isAFooterStat) continue
    const rawName = rec.playerName || ''
    if (!rawName || /\b(total|opponent)/i.test(rawName)) continue
    const ss = rec.shotStats || {}
    const goals = num(ss.goals)
    const assists = num(ss.assists)
    const points = num(ss.points) || goals + assists
    const gp = num(rec.gamesPlayed)
    if (points === 0 && goals === 0) continue
    const name = flipName(rawName)
    const prev = byName.get(name)
    if (!prev || gp > prev.gp) {
      byName.set(name, { name, goals, assists, points, gp, position: positionFor(schoolId, name) })
    }
  }
  return [...byName.values()]
    .sort((a, b) => b.points - a.points || b.goals - a.goals)
    .slice(0, TOP_N)
    .map(({ gp, ...rest }) => rest) // drop the internal gp helper
}

async function scrapeSchool(school) {
  const origin = school.athleticUrl.replace(/\/$/, '')
  let lastError = 'no parseable stats page'
  for (const path of statsPaths(SEASON)) {
    let html
    try { html = await fetchText(`${origin}${path}`) } catch (e) { lastError = e.message; continue }
    const arr = extractNuxtData(html)
    if (!arr) { lastError = 'not a supported (Nuxt) stats page'; continue }
    const leaders = extractLeaders(arr, school.id)
    if (leaders.length) return { ok: true, sourceUrl: `${origin}${path}`, leaders }
    lastError = 'no per-player stats found (likely an iframe widget site)'
  }
  return { ok: false, error: lastError }
}

async function run() {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const targets = SCHOOLS.filter((s) => s.athleticUrl && s.id !== 'undecided')
  const leadersBySchool = {}
  const debug = {}

  console.log(`Scraping ${SEASON} scoring leaders from athletics stats pages...\n`)
  for (let i = 0; i < targets.length; i++) {
    const school = targets[i]
    process.stdout.write(`  ${school.shortName.padEnd(16)} `)
    try {
      const res = await scrapeSchool(school)
      if (res.ok) {
        leadersBySchool[school.id] = res.leaders
        debug[school.id] = res.sourceUrl
        const top = res.leaders[0]
        console.log(`ok — ${res.leaders.length} (top: ${top.name} ${top.points} pts)`)
      } else {
        console.log(`skip — ${res.error}`)
      }
    } catch (e) {
      console.log(`ERROR — ${e.message}`)
    }
    if (i < targets.length - 1) await sleep(DELAY_MS)
  }

  const file = `// Per-team season scoring leaders, scraped from each school's official
// athletics stats page by scripts/scrapeStats.js. Re-run \`npm run scrape-stats\`
// to refresh. Schools whose stats live in an external widget are absent here
// and fall back to the roster in the UI.
export const STATS_SEASON = ${SEASON};
export const STATS_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};
export const STATS_LEADERS = ${JSON.stringify(leadersBySchool, null, 2)};

export function getTeamLeaders(schoolId) {
  return STATS_LEADERS[schoolId] || [];
}

/** YouTube search URL so a recruit can pull up an athlete's film. */
export function filmSearchUrl(playerName, schoolName) {
  const q = encodeURIComponent(\`\${playerName} \${schoolName} lacrosse highlights\`);
  return \`https://www.youtube.com/results?search_query=\${q}\`;
}

export default STATS_LEADERS;
`
  writeFileSync(OUT_PATH, file)
  const total = Object.values(leadersBySchool).reduce((n, a) => n + a.length, 0)
  console.log(`\nWrote ${OUT_PATH}: ${Object.keys(leadersBySchool).length} schools, ${total} leaders.`)
}

run().catch((e) => { console.error('scrapeStats failed:', e); process.exit(1) })
