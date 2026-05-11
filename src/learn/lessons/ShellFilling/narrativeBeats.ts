/**
 * Narrative pacing for the "How Electrons Fill Shells" guided build.
 *
 * Pedagogically the lesson runs Z=1 through Z=18. At specific Z values we
 * pause and surface a card the student has to dismiss before continuing.
 * Pauses are sparse on purpose — clicks between beats should feel quick.
 */

export interface NarrativeBeat {
  /** Atomic number at which this beat fires. */
  z: number;
  title: string;
  body: string;
  /** Optional tag rendered on the card (e.g. "Noble gas", "New row"). */
  tag?: string;
}

export const BEATS: NarrativeBeat[] = [
  {
    z: 1,
    title: "Meet shell 1.",
    body: "Every electron has to live in a shell, starting with the innermost one. Shell 1 can hold at most 2 electrons.",
    tag: "Shell 1",
  },
  {
    z: 2,
    title: "Helium: a full shell.",
    body: "Shell 1 is now full. Helium has nowhere to put another electron — and nothing it wants to lose. It won't react with anything. This is a noble gas.",
    tag: "Noble gas",
  },
  {
    z: 3,
    title: "Lithium starts a new row.",
    body: "Shell 1 was full, so this electron had to start shell 2. That's why lithium begins row 2 on the periodic table. Every time we fill a shell, a new row starts.",
    tag: "New row",
  },
  {
    z: 9,
    title: "Fluorine: one short.",
    body: "Shell 2 is one electron short of full. Fluorine desperately wants one more electron — that's why it's the most reactive element in nature. Almost-full shells are unstable.",
    tag: "Reactive",
  },
  {
    z: 10,
    title: "Neon: full again.",
    body: "Shell 2 is full (8 electrons). Neon is another noble gas. Look where we are on the table — same right-hand column as helium. Full shells line up.",
    tag: "Noble gas",
  },
  {
    z: 11,
    title: "Sodium: same column as lithium.",
    body: "New shell, new row. Sodium has one electron in shell 3 — exactly like lithium had one electron in shell 2. They're in the same column for a reason: same outer-shell setup means same chemistry.",
    tag: "Pattern",
  },
  {
    z: 18,
    title: "Argon completes the pattern.",
    body: "Shell 3 fills with 8 electrons (the octet rule). Argon is unreactive. The periodic table's shape — its rows and columns — comes directly from how shells fill.",
    tag: "The pattern",
  },
];

export function beatFor(z: number): NarrativeBeat | null {
  return BEATS.find((b) => b.z === z) ?? null;
}
