// NCAA Division I women's lacrosse recruiting calendar.
//
// The evergreen rule: D1 coaches may NOT have recruiting contact (calls, texts,
// DMs, off-campus contact, verbal offers, official/unofficial visits) with a
// prospect until September 1 of the prospect's JUNIOR year of high school.
// Before that date coaches may only speak with the prospect's club/HS coach.
// Confirmed by the IWLCA (women's lacrosse coaches association) and NCSA.
//   https://www.iwlca.org/news_article/show/1014833
//   https://www.ncsasports.org/womens-lacrosse/recruiting-rules-calendar
//
// The dated periods below are the 2025-26 season. They are NOT evergreen — the
// NCAA republishes them annually. VERIFY against the official NCAA D1 women's
// lacrosse recruiting calendar before relying on them for a given class year.
// Source: NCSA 2025-26 calendar (third party; confirm against ncaa.org).
//
// To update for a new season, replace SEASON and PERIODS.

export const CALENDAR_SEASON = '2025-26';
export const CALENDAR_SOURCE = 'https://www.ncsasports.org/womens-lacrosse/recruiting-rules-calendar';
export const CALENDAR_VERIFIED = false; // flip to true once confirmed against ncaa.org

// Period types. "contact" = coaches may meet/evaluate in person and communicate.
// "quiet" / "dead" = no in-person contact (digital still allowed in quiet/dead
// per NCSA). "shutdown" = no recruiting of any kind.
export const PERIOD_LABELS = {
  contact: 'Contact Period',
  quiet: 'Quiet Period',
  dead: 'Dead Period',
  shutdown: 'Recruiting Shutdown',
};

// Ordered, non-overlapping where possible. Dates are inclusive [start, end].
export const PERIODS = [
  { type: 'dead', start: '2025-08-01', end: '2025-08-14' },
  { type: 'quiet', start: '2025-08-15', end: '2025-08-27' },
  { type: 'dead', start: '2025-08-28', end: '2025-09-03' },
  { type: 'contact', start: '2025-09-04', end: '2025-11-09' },
  { type: 'dead', start: '2025-11-10', end: '2025-11-13' },
  { type: 'contact', start: '2025-11-14', end: '2025-11-24' },
  { type: 'shutdown', start: '2025-11-25', end: '2025-11-30' },
  { type: 'contact', start: '2025-12-01', end: '2025-12-21' },
  { type: 'shutdown', start: '2025-12-22', end: '2025-12-26' },
  { type: 'contact', start: '2025-12-27', end: '2025-12-30' },
  { type: 'shutdown', start: '2025-12-31', end: '2026-01-02' },
  { type: 'contact', start: '2026-01-03', end: '2026-05-21' },
  { type: 'dead', start: '2026-05-22', end: '2026-05-24' },
  { type: 'contact', start: '2026-05-25', end: '2026-06-11' },
  { type: 'dead', start: '2026-07-02', end: '2026-07-06' },
];

function parse(d) {
  // Parse a YYYY-MM-DD as a local date (avoid UTC off-by-one).
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * September 1 of the prospect's junior year. A prospect graduating HS in
 * `gradYear` is a junior during the academic year that ends in `gradYear - 1`,
 * which starts in the fall of `gradYear - 2`.
 */
export function contactOpensDate(gradYear) {
  if (!gradYear) return null;
  return new Date(gradYear - 2, 8, 1); // month 8 = September
}

/** The recruiting period covering `date` (defaults to today), or null. */
export function getCurrentPeriod(date = new Date()) {
  const today = startOfDay(date);
  for (const p of PERIODS) {
    if (today >= parse(p.start) && today <= parse(p.end)) {
      return { ...p, label: PERIOD_LABELS[p.type] };
    }
  }
  return null;
}

/**
 * The next recruiting milestone relative to `date`. Returns the September 1
 * junior-year contact opening if it is still in the future; otherwise the next
 * upcoming period start in the calendar. Includes day/week countdowns.
 */
export function getNextWindow(gradYear, date = new Date()) {
  const today = startOfDay(date);
  const opens = contactOpensDate(gradYear);
  const current = getCurrentPeriod(today);

  if (opens && opens > today) {
    const days = Math.ceil((opens - today) / MS_PER_DAY);
    return {
      kind: 'contactOpens',
      date: opens,
      days,
      weeks: Math.ceil(days / 7),
      title: 'Coach contact opens',
      detail:
        'September 1 of your junior year is the first day D1 coaches can call, text, DM, make offers, and host visits. Before then they can only talk to your club or high school coach.',
      contactOpen: false,
      current,
    };
  }

  // Contact has already opened (or no grad year). Surface the next period edge.
  const upcoming = PERIODS
    .map(p => ({ ...p, startDate: parse(p.start) }))
    .filter(p => p.startDate > today)
    .sort((a, b) => a.startDate - b.startDate)[0];

  if (!upcoming) {
    return { kind: 'none', contactOpen: !!opens, current };
  }

  const days = Math.ceil((upcoming.startDate - today) / MS_PER_DAY);
  return {
    kind: 'period',
    date: upcoming.startDate,
    days,
    weeks: Math.ceil(days / 7),
    title: `${PERIOD_LABELS[upcoming.type]} begins`,
    detail: PERIOD_HINTS[upcoming.type],
    contactOpen: !!opens,
    current,
  };
}

const PERIOD_HINTS = {
  contact: 'Coaches can meet and evaluate in person and communicate freely.',
  quiet: 'No in-person contact off campus. Calls, texts, and DMs still allowed.',
  dead: 'No in-person contact. Digital communication still allowed.',
  shutdown: 'No recruiting activity of any kind during this window.',
};
