/**
 * Empirical atomic radii in picometers, indexed by atomic number (Z).
 * Values are approximate and chosen to reproduce the standard trend
 * (decreases left→right across a period, increases top→bottom down a group).
 *
 * Sources: a blend of Slater empirical, Clementi calculated, and standard
 * pedagogical values. For our purposes (showing the *pattern*), exact
 * picometer values matter less than relative ordering.
 *
 * `null` for elements with no reliable measurement (most of the actinides
 * past uranium, and superheavy synthetics).
 */

// prettier-ignore
const RADII_PM_BY_Z: (number | null)[] = [
  null, // 0 placeholder
  // Row 1
  53, 31,
  // Row 2
  167, 112, 87, 67, 56, 48, 42, 38,
  // Row 3
  190, 145, 118, 111, 98, 88, 79, 71,
  // Row 4
  243, 194,
  // Row 4 d-block
  184, 176, 171, 166, 161, 156, 152, 149, 145, 142,
  // Row 4 p-block
  136, 125, 114, 103, 94, 88,
  // Row 5
  265, 219,
  // Row 5 d-block
  212, 206, 198, 190, 183, 178, 173, 169, 165, 161,
  // Row 5 p-block
  156, 145, 133, 123, 115, 108,
  // Row 6
  298, 253,
  // Lanthanides (57–71)
  195, 185, 247, 206, 205, 238, 231, 233, 225, 228, 226, 226, 222, 222, 217,
  // Row 6 d-block
  208, 200, 193, 188, 185, 180, 177, 174,
  // Row 6 p-block
  171, 156, 154, 143, 135, 127, 120,
  // Row 7
  null, null,
  // Actinides (89–103) — sparse data, mostly null
  195, null, null, 175, null, null, null, null, null, null, null, null, null, null, null,
  // Row 7 d-block + p-block — mostly null
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
];

export function atomicRadius(z: number): number | null {
  return RADII_PM_BY_Z[z] ?? null;
}
