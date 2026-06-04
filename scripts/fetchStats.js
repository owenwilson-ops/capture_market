#!/usr/bin/env node
/**
 * Builds per-team season stat leaders from the Inside Lacrosse API (parse.bot)
 * and writes them to src/data/statsLeaders.js, so recruits can see who is
 * leading each program in scoring and pull up their film.
 *
 * Requires an API key:  PARSE_API_KEY=... node scripts/fetchStats.js [--season 2026]
 *
 * It walks every date in the season window, collects games involving our
 * tracked schools, fetches each game's box score, and aggregates player totals.
 * This costs roughly one API credit per game-day plus one per game, so a full
 * season needs a paid parse.bot tier.
 */

import { writeFileSync as write } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SCHOOLS } from '../src/data/schools.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../src/data/statsLeaders.js')

const BASE_URL = 'https://api.parse.bot/scraper/049edb8d-0c6b-4474-a41e-6b72c8e36273'
const API_KEY = process.env.PARSE_API_KEY

if (!API_KEY) {
  console.error('PARSE_API_KEY is not set. Get a key at parse.bot and re-run:')
  console.error('  PARSE_API_KEY=your-key node scripts/fetchStats.js --season 2026')
  process.exit(1)
}

const args = process.argv.slice(2)
const SEASON = Number(args[args.indexOf('--season') + 1]) || new Date().getUTCFullYear()
const TOP_N = 6
const GENDER = 'w'
const DIVISION = '1'

// Map API team names to our school ids. Names come back as the school's common
// name; add aliases here as needed.
const NAME_TO_ID = {}
for (const s of SCHOOLS) {
  if (s.id === 'undecided') continue
  NAME_TO_ID[s.name.toLowerCase()] = s.id
  NAME_TO_ID[s.shortName.toLowerCase()] = s.id
}
Object.assign(NAME_TO_ID, {
  'north carolina': 'unc',
  'unc': 'unc',
  'notre dame': 'notre-dame',
  'loyola maryland': 'loyola-maryland',
  'loyola (md)': 'loyola-maryland',
  'boston college': 'boston-college',
  'penn state': 'penn-state',
  'ohio state': 'ohio-state',
  'nc state': 'nc-state',
  'james madison': 'james-madison',
  'stony brook': 'stony-brook',
  'johns hopkins': 'johns-hopkins',
})

const matchSchool = (name) => (name ? NAME_TO_ID[name.toLowerCase().trim()] : undefined)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function call(endpoint, params) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  )
  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`, {
    headers: { 'X-API-Key': API_KEY },
  })
  if (res.status === 429) { await sleep(4000); return call(endpoint, params) }
  if (!res.ok) throw new Error(`${endpoint}: HTTP ${res.status}`)
  return res.json()
}

function* seasonDates(season) {
  // NCAA women's lacrosse regular season roughly Feb 1 – May 31.
  for (const month of [1, 2, 3, 4]) { // 0-indexed: Feb–May
    const days = new Date(Date.UTC(season, month + 1, 0)).getUTCDate()
    for (let d = 1; d <= days; d++) {
      yield `${season}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }
}

// player key -> { name, schoolId, position, goals, assists, points, games }
const tally = new Map()

function record(schoolId, player) {
  const name = player.name || player.player_name
  if (!name) return
  const key = `${schoolId}:${name}`
  const e = tally.get(key) || {
    name, schoolId, position: player.position || '', goals: 0, assists: 0, points: 0, games: 0,
  }
  const g = Number(player.goals || 0)
  const a = Number(player.assists || 0)
  e.goals += g
  e.assists += a
  e.points += Number(player.points || g + a)
  e.games += 1
  if (!e.position && player.position) e.position = player.position
  tally.set(key, e)
}

async function run() {
  console.log(`Fetching ${SEASON} D1 women's lacrosse stats for tracked schools...`)
  const gameIds = new Set()

  for (const date of seasonDates(SEASON)) {
    let scores
    try { scores = await call('get_scores', { date, gender: GENDER, division: DIVISION, season: SEASON }) }
    catch (e) { console.warn(`  ${date}: ${e.message}`); continue }
    const games = scores?.games || scores?.data?.games || []
    for (const g of games) {
      if (matchSchool(g.home_team_name) || matchSchool(g.away_team_name)) {
        if (g.game_id) gameIds.add(g.game_id)
      }
    }
    await sleep(300)
  }

  console.log(`  ${gameIds.size} relevant games found. Fetching box scores...`)
  for (const id of gameIds) {
    let details
    try { details = await call('get_game_details', { game_id: id }) }
    catch (e) { console.warn(`  game ${id}: ${e.message}`); continue }
    for (const team of details?.teams || details?.data?.teams || []) {
      const schoolId = matchSchool(team.team_name || team.name)
      if (!schoolId) continue
      for (const pl of team.players || team.player_stats || []) record(schoolId, pl)
    }
    await sleep(300)
  }

  const leaders = {}
  for (const e of tally.values()) {
    ;(leaders[e.schoolId] ||= []).push(e)
  }
  for (const id of Object.keys(leaders)) {
    leaders[id] = leaders[id]
      .sort((a, b) => b.points - a.points || b.goals - a.goals)
      .slice(0, TOP_N)
  }

  const file = `// Per-team season stat leaders, generated by scripts/fetchStats.js.
// Source: Inside Lacrosse API (parse.bot). Re-run \`npm run fetch-stats\` to refresh.
export const STATS_SEASON = ${SEASON};
export const STATS_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};
export const STATS_LEADERS = ${JSON.stringify(leaders, null, 2)};

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
  write(OUT_PATH, file)
  const total = Object.values(leaders).reduce((n, a) => n + a.length, 0)
  console.log(`\nWrote ${OUT_PATH}: ${Object.keys(leaders).length} teams, ${total} leaders.`)
}

run().catch((e) => { console.error('fetchStats failed:', e); process.exit(1) })
