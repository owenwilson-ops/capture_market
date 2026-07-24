// Shared "fit" assessment engine. Pure functions, no React or data fetching —
// they take a school id plus the player's profile and return an honest read on
// how the player fits a program athletically and academically.
//
// Used by:
//   - MySchools  (per-school Fit tab)        — athletic + academic detail
//   - ParentHome (School Fit Read digest)    — reach/target/likely summary
//
// Data sources already in the repo:
//   ROSTER_DATA[schoolId].roster   — current roster by position + class year
//   SCHOOL_ACADEMICS[schoolId]     — College Scorecard acceptance rate + SAT/ACT
//
// We deliberately do NOT fabricate a player-vs-team "production gap": the app
// has no game stats for the player, so any such number would be invented. The
// UI instead shows the team's actual scoring leaders as context.

import { ROSTER_DATA, getPositionNeed } from '../data/rosterData';
import { SCHOOL_ACADEMICS } from '../data/schoolAcademics';

/**
 * Roster turnover and depth at the player's position relative to when they
 * would arrive on campus (fall of their HS grad year).
 *
 * @returns {{
 *   hasData: boolean,
 *   need: 'high'|'medium'|'low',
 *   atPosition: number,        // current players at the position
 *   graduatingBefore: number,  // gone before the player would arrive
 *   stayingThrough: number,    // still rostered when the player arrives
 *   depthByClass: {SR:number, JR:number, SO:number, FR:number},
 * }}
 */
export function getRosterFit(schoolId, position, gradYear) {
  const school = ROSTER_DATA[schoolId];
  if (!school || !Array.isArray(school.roster) || !position) {
    return { hasData: false, need: 'medium', atPosition: 0, graduatingBefore: 0, stayingThrough: 0, depthByClass: { SR: 0, JR: 0, SO: 0, FR: 0 } };
  }

  const players = school.roster.filter(p => p.position === position);
  const entryYear = gradYear || new Date().getFullYear() + 2;
  // A college player whose gradYear <= the recruit's HS gradYear has graduated
  // (spring) before the recruit arrives (fall of the same year).
  const graduatingBefore = players.filter(p => p.gradYear && p.gradYear <= entryYear).length;

  const depthByClass = { SR: 0, JR: 0, SO: 0, FR: 0 };
  players.forEach(p => { if (depthByClass[p.year] != null) depthByClass[p.year] += 1; });

  return {
    hasData: true,
    need: getPositionNeed(schoolId, position, entryYear),
    atPosition: players.length,
    graduatingBefore,
    stayingThrough: players.length - graduatingBefore,
    depthByClass,
  };
}

/**
 * Academic admissibility tier from the player's test scores against the
 * school's Scorecard middle-50% ranges. GPA is stored on the profile for the
 * player's reference but Scorecard does not publish a GPA range, so it is not
 * used to compute the tier.
 *
 * tier: 'likely'  — at/above the 75th-percentile score (upper half of admits)
 *       'target'  — within the middle-50% range
 *       'reach'   — below the 25th-percentile score, or a very selective school
 *
 * @returns {{ hasData: boolean, hasScores: boolean, tier: ('reach'|'target'|'likely'|null),
 *             acceptanceRate: (number|null), satLow, satHigh, actLow, actHigh, detail: string }}
 */
export function getAcademicFit(schoolId, { sat, act } = {}) {
  const a = SCHOOL_ACADEMICS[schoolId];
  if (!a) {
    return { hasData: false, hasScores: false, tier: null, acceptanceRate: null, satLow: null, satHigh: null, actLow: null, actHigh: null, detail: 'No admissions data on file for this school.' };
  }

  const base = {
    hasData: true,
    acceptanceRate: a.acceptanceRate ?? null,
    satLow: a.satLow ?? null,
    satHigh: a.satHigh ?? null,
    actLow: a.actLow ?? null,
    actHigh: a.actHigh ?? null,
  };

  const tierFromRange = (score, low, high) => {
    if (!score || low == null || high == null) return null;
    if (score >= high) return 'likely';
    if (score >= low) return 'target';
    return 'reach';
  };

  const tiers = [
    tierFromRange(sat, a.satLow, a.satHigh),
    tierFromRange(act, a.actLow, a.actHigh),
  ].filter(Boolean);

  if (tiers.length === 0) {
    // No scores entered: fall back to school selectivity as rough context.
    let tier = 'target';
    if (a.acceptanceRate != null) {
      if (a.acceptanceRate < 0.15) tier = 'reach';
      else if (a.acceptanceRate > 0.5) tier = 'likely';
    }
    return {
      ...base,
      hasScores: false,
      tier,
      detail: 'Add your SAT or ACT in your profile for a personalized read. This estimate is based only on the school\'s overall selectivity.',
    };
  }

  // Best (most favorable) of the available score tiers.
  const rank = { reach: 0, target: 1, likely: 2 };
  const tier = tiers.reduce((best, t) => (rank[t] > rank[best] ? t : best), tiers[0]);

  const detailByTier = {
    likely: 'Your test score is at or above this school\'s 75th-percentile range.',
    target: 'Your test score sits within this school\'s middle-50% range.',
    reach: 'Your test score is below this school\'s middle-50% range.',
  };

  return { ...base, hasScores: true, tier, detail: detailByTier[tier] };
}

const OVERALL_LABELS = {
  reach: 'Reach',
  target: 'Target',
  likely: 'Likely',
};

/**
 * Combined read for the school. Academic tier drives the overall reach/target/
 * likely label (it gates admission); roster need is surfaced separately as the
 * athletic opportunity, since a recruit can be a great athletic fit at a school
 * that is still an academic reach.
 */
export function getOverallFit(schoolId, profile = {}) {
  const academic = getAcademicFit(schoolId, { sat: profile.satScore, act: profile.actScore });
  const roster = getRosterFit(schoolId, profile.position, profile.gradYear);

  const overall = academic.tier || 'target';
  const opportunityLabel = { high: 'Strong roster opening', medium: 'Some roster need', low: 'Limited roster need' }[roster.need];

  return {
    academic,
    roster,
    tier: overall,
    label: OVERALL_LABELS[overall],
    opportunity: roster.need,
    opportunityLabel,
  };
}

export { OVERALL_LABELS };
