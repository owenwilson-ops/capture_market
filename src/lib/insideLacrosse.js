// Client for the Inside Lacrosse data API (via parse.bot).
//
// This API provides game SCORES and box-score STATS only. It does NOT provide
// coaching contacts or rosters — those come from each school's athletics site
// (see scripts/scrapeAthletics.js). Set VITE_PARSE_API_KEY to enable.
//
// Endpoints:
//   get_scores        — game results by date/gender/division/season
//   get_game_details  — box score: team + per-player stat lines for one game

const BASE_URL = 'https://api.parse.bot/scraper/049edb8d-0c6b-4474-a41e-6b72c8e36273'
const API_KEY = import.meta.env?.VITE_PARSE_API_KEY

export const hasInsideLacrosseKey = () => Boolean(API_KEY)

async function call(endpoint, params = {}) {
  if (!API_KEY) throw new Error('VITE_PARSE_API_KEY is not set')
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  )
  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`, {
    headers: { 'X-API-Key': API_KEY },
  })
  if (!res.ok) throw new Error(`Inside Lacrosse API ${endpoint}: HTTP ${res.status}`)
  return res.json()
}

/** Game scores for a date. gender 'm'|'w', division '1'|'2'|'3'. */
export function getScores({ date, gender = 'w', division = '1', season } = {}) {
  return call('get_scores', { date, gender, division, season })
}

/** Full box score (team + player stats) for one game. */
export function getGameDetails(gameId) {
  return call('get_game_details', { game_id: gameId })
}
