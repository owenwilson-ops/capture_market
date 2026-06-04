/**
 * Shared parsing helpers for college athletics roster pages.
 *
 * The NCAA athletics sites in our school list are built on two platforms, both
 * of which ship a Nuxt app whose payload is serialized into a single
 * `<script id="__NUXT_DATA__">` tag using devalue's flattened, index-referenced
 * format: the script body is one big JSON array, and every value inside an
 * object or array is an integer index pointing back into that array.
 *
 *   - WMT Digital  (e.g. Clemson): snake_case fields, staff under `rosterStaffs`,
 *                   players under `players` with `player_position`/`class_level`.
 *   - Sidearm Sports (e.g. UNC):    camelCase fields, staff under `coaches`,
 *                   players under `players` with `positionShort`/`academicYearShort`.
 *
 * `extractNuxtData` parses the array, `makeHydrator` resolves an index back into
 * a real value, and `findStaff` / `findPlayers` locate the collections on either
 * platform. Sites that are neither return null from `extractNuxtData`.
 */

const REACTIVE_WRAPPERS = new Set([
  'Reactive', 'ShallowReactive', 'Ref', 'ShallowRef', 'EmptyRef', 'EmptyShallowRef',
])

export function extractNuxtData(html) {
  const m = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try {
    const arr = JSON.parse(m[1])
    return Array.isArray(arr) ? arr : null
  } catch {
    return null
  }
}

/** Resolve a devalue index reference into its real value. Memoized per array. */
export function makeHydrator(arr) {
  const memo = new Map()
  function hydrate(index, depth = 0) {
    if (typeof index !== 'number' || index < 0 || index >= arr.length) return null
    if (depth > 90) return null
    if (memo.has(index)) return memo.get(index)
    const v = arr[index]
    if (v === null || typeof v !== 'object') {
      memo.set(index, v)
      return v
    }
    let out
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'string' && REACTIVE_WRAPPERS.has(v[0])) {
        memo.set(index, null)
        out = hydrate(v[1], depth + 1)
      } else {
        out = []
        memo.set(index, out)
        for (const ref of v) out.push(hydrate(ref, depth + 1))
      }
    } else {
      out = {}
      memo.set(index, out)
      for (const [k, ref] of Object.entries(v)) out[k] = hydrate(ref, depth + 1)
    }
    memo.set(index, out)
    return out
  }
  return hydrate
}

const get = (obj, ...keys) => {
  for (const k of keys) if (obj && obj[k] != null && obj[k] !== '') return obj[k]
  return undefined
}

const hasName = (x) =>
  x && typeof x === 'object' && (x.first_name || x.firstName || x.name)

/** Find the coaching staff collection on either platform. */
export function findStaff(arr, hydrate) {
  let best = []
  for (const v of arr) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    for (const key of ['rosterStaffs', 'coaches', 'staff']) {
      if (!(key in v)) continue
      const list = hydrate(v[key])
      if (Array.isArray(list)) {
        const good = list.filter(hasName)
        if (good.length > best.length) best = good
      }
    }
  }
  return best
}

const looksLikePlayer = (x) => {
  if (!x || typeof x !== 'object') return false
  const hasPosOrClass =
    x.player_position || x.position || x.positionShort || x.positionLong ||
    x.class_level || x.academicYearShort || x.academicYear
  // WMT nests the athlete's name under `.player`; Sidearm puts it at top level.
  const named = hasName(x) || hasName(x.player) || x.jersey_number != null || x.jerseyNumber != null
  return Boolean(hasPosOrClass && named)
}

/** Find the player roster collection on either platform. */
export function findPlayers(arr, hydrate) {
  let best = []
  for (const v of arr) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    for (const key of ['players', 'rosterPlayers', 'roster']) {
      if (!(key in v)) continue
      const list = hydrate(v[key])
      if (!Array.isArray(list)) continue
      const good = list.filter(looksLikePlayer)
      if (good.length > best.length) best = good
    }
  }
  return best
}

const POSITION_MAP = [
  [/goal|keeper|\bgk\b/i, 'Goalie'],
  [/attack/i, 'Attack'],
  [/defen|\blsm\b|long ?stick/i, 'Defense'],
  [/mid|draw|fogo|face ?off/i, 'Midfielder'],
]

// Single-/short-code position abbreviations used by some sites (e.g. Maryland: "A", "M", "D", "G").
const POSITION_CODES = [
  [/^(g|gk|gl)$/i, 'Goalie'],
  [/^(a|at|att|atk)$/i, 'Attack'],
  [/^(d|df|def|lsm)$/i, 'Defense'],
  [/^(m|mf|md|mid)$/i, 'Midfielder'],
]

/** Normalize a raw position label to one of the four tracked positions, or null. */
export function normalizePosition(raw) {
  if (!raw) return null
  const text = (typeof raw === 'object' ? (raw.name || raw.title || raw.shortName || '') : String(raw)).trim()
  if (!text) return null
  for (const [re, pos] of POSITION_MAP) if (re.test(text)) return pos
  // Fall back to short codes, trying the first token of combos like "A/M".
  const token = text.split(/[/,&\s]+/)[0]
  for (const [re, pos] of POSITION_CODES) if (re.test(token)) return pos
  return null
}

/** Normalize a raw class label (e.g. "R-Senior", "So.", "Graduate") to FR/SO/JR/SR/GR. */
export function normalizeClass(raw) {
  if (!raw) return null
  const text = typeof raw === 'object' ? (raw.name || raw.title || '') : String(raw)
  if (/grad/i.test(text)) return 'GR'
  if (/\bfr|first|fresh/i.test(text)) return 'FR'
  if (/\bso|second|soph/i.test(text)) return 'SO'
  if (/\bjr|third|junior/i.test(text)) return 'JR'
  if (/\bsr|fourth|fifth|senior/i.test(text)) return 'SR'
  return null
}

/**
 * Map a class to an expected graduation year relative to the active season.
 * Seniors and graduate students graduate in the active season year.
 */
export function classToGradYear(cls, seasonYear) {
  switch (cls) {
    case 'GR':
    case 'SR': return seasonYear
    case 'JR': return seasonYear + 1
    case 'SO': return seasonYear + 2
    case 'FR': return seasonYear + 3
    default: return seasonYear + 1
  }
}

/** Active NCAA lacrosse season year given a date (season runs Feb–May). */
export function activeSeasonYear(date = new Date()) {
  const y = date.getUTCFullYear()
  return date.getUTCMonth() >= 6 ? y + 1 : y
}

function absolutize(url, origin) {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url
  return origin ? `${origin.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}` : url
}

/** Pick an avatar URL from either a WMT photo object or a Sidearm image object. */
export function photoUrl(photo, origin) {
  if (!photo) return undefined
  if (typeof photo === 'string') return absolutize(photo, origin)
  if (typeof photo !== 'object') return undefined
  if (typeof photo.srcset === 'string' && photo.srcset.length) {
    const first = photo.srcset.split(',')[0].trim().split(' ')[0]
    if (first) return absolutize(first, origin)
  }
  return absolutize(photo.absoluteUrl || photo.url, origin)
}

const fullName = (o) =>
  [get(o, 'first_name', 'firstName'), get(o, 'last_name', 'lastName')]
    .filter(Boolean).join(' ').trim() || get(o, 'name') || ''

/** Normalize a raw staff record from either platform. */
export function normalizeStaff(raw, origin) {
  return {
    name: fullName(raw),
    title: (get(raw, 'position', 'title', 'staff_title', 'positionShort') || '').toString().trim(),
    email: (get(raw, 'email', 'staff_email') || '').toString().trim(),
    phone: (get(raw, 'phone', 'staff_phone') || '').toString().trim(),
    photo: photoUrl(get(raw, 'master_photo', 'image', 'photo'), origin),
  }
}

/** Normalize a raw player record from either platform; null if no tracked position. */
export function normalizePlayer(raw, seasonYear) {
  const sub = raw?.player && typeof raw.player === 'object' ? raw.player : raw
  const name = fullName(sub) || fullName(raw)
  const position = normalizePosition(
    get(raw, 'player_position', 'position', 'positionShort', 'positionLong')
  )
  const cls = normalizeClass(
    get(raw, 'class_level', 'academicYearLong', 'academicYearShort', 'academicYear', 'class', 'year')
  )
  if (!name || !position) return null
  const year = cls === 'GR' ? 'SR' : cls
  return {
    name,
    position,
    year: year || 'SO',
    gradYear: classToGradYear(cls, seasonYear),
    jersey: get(raw, 'jersey_number', 'jerseyNumber') ?? null,
  }
}
