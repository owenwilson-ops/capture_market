// NCAA initial-eligibility standards.
//
// Verified 2026-06-05 against the NCAA's current academic-standards pages
// (ncaa.org/student-athletes/future/academic-standards-initial-eligibility and
// ncaa.org/division-ii-initial-eligibility). As of the 2023 rule change,
// standardized test scores are NOT used for D1/D2 initial-eligibility
// certification — the old SAT/ACT sliding scale no longer applies. Eligibility
// is core courses + core-course GPA + graduation.
//
// IMPORTANT: the NCAA uses CORE-COURSE GPA (the 16 approved core classes on the
// NCAA scale), which differs from a student's overall/weighted GPA. We surface
// the athlete's entered GPA as an estimate and say so.

export type Division = 'D1' | 'D2' | 'D3';

export type DivisionStandard = {
  coreCourses: number;
  coreGpaMin: number;
  note: string;
  testsUsed: false;
};

export const NCAA_ELIGIBILITY = {
  asOf: '2025-26',
  source: 'https://www.ncaa.org/student-athletes/future/academic-standards-initial-eligibility',
  eligibilityCenterUrl: 'https://web3.ncaa.org/ecwr3/',
  divisions: {
    D1: {
      coreCourses: 16,
      coreGpaMin: 2.3,
      note: '10 core courses must be completed before senior year (7 in English, math, or science).',
      testsUsed: false,
    } as DivisionStandard,
    D2: {
      coreCourses: 16,
      coreGpaMin: 2.2,
      note: 'All 16 core courses completed by high school graduation.',
      testsUsed: false,
    } as DivisionStandard,
    // D3 has no NCAA-wide academic initial-eligibility standard; admission and
    // academic progress are set by each institution.
    D3: null,
  },
} as const;

export type EligibilityResult =
  | { status: 'unknown'; min: number }
  | { status: 'onTrack'; min: number }
  | { status: 'below'; min: number; gap: number };

/** Compare an estimated GPA to a division's core-GPA minimum. */
export function eligibilityStatus(gpa: number | null, division: 'D1' | 'D2'): EligibilityResult {
  const min = NCAA_ELIGIBILITY.divisions[division].coreGpaMin;
  if (gpa == null || Number.isNaN(gpa)) return { status: 'unknown', min };
  if (gpa >= min) return { status: 'onTrack', min };
  return { status: 'below', min, gap: Math.round((min - gpa) * 100) / 100 };
}
