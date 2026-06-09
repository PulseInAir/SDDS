/**
 * Calculates the current relevant Assessment Year (AY) based on the calendar date.
 * Tax filings happening from April 1st onwards represent the previous FY,
 * which is assessed in the current AY.
 * Format: "YYYY-(YY+1)" (e.g., "2026-27")
 */
export function getCurrentAssessmentYear(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed (0 is Jan, 3 is Apr)

  let startYear = year;
  if (month < 3) {
    // January, February, March represent filings of the previous year's season
    startYear = year - 1;
  }

  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
}

/**
 * Returns a list of Assessment Years for dropdown selectors.
 */
export function getAssessmentYears(): string[] {
  const currentAY = getCurrentAssessmentYear();
  const currentStartYear = parseInt(currentAY.split('-')[0]);
  const start = currentStartYear - 3; // 3 years back
  const list: string[] = [];

  for (let y = start; y <= currentStartYear; y++) {
    const nextYShort = String(y + 1).slice(-2);
    list.push(`${y}-${nextYShort}`);
  }

  return list.reverse(); // Newest first
}
