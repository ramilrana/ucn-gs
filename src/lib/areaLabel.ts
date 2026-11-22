const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** The gold banner eyebrow for an area, from its order: 1 → "Area I". Undefined past X or for a bad order. */
export function areaEyebrow(order: number): string | undefined {
  const numeral = ROMAN[order - 1];
  return numeral ? `Area ${numeral}` : undefined;
}
