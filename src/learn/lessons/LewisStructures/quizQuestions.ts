import type { QuizQuestion } from "../ShellFilling/quizQuestions";

/**
 * Questions test the *algorithm*, not memorization. Wrong-answer explanations
 * always trace back to a step in the build sequence.
 */

export const QUIZ: QuizQuestion[] = [
  {
    id: "valence-co2",
    prompt: "How many valence electrons does a CO₂ molecule have in total?",
    choices: [
      {
        text: "10",
        correct: false,
        explanation:
          "You may have forgotten one of the oxygens — there are two, not one. 4 (C) + 6 (O) + 6 (O) = 16.",
      },
      {
        text: "16",
        correct: true,
        explanation:
          "Right. Carbon brings 4 (group 14), each oxygen brings 6 (group 16). 4 + 6 + 6 = 16.",
      },
      {
        text: "22",
        correct: false,
        explanation:
          "You may have used core electrons by mistake. We count only valence (outer shell) electrons for Lewis structures. C has 4 valence, O has 6 valence — not the full 6 and 8.",
      },
      {
        text: "8",
        correct: false,
        explanation:
          "That's the count for a single oxygen plus carbon, not the full molecule. Don't forget the second oxygen — CO₂ has two of them.",
      },
    ],
  },
  {
    id: "central-atom-nh3",
    prompt: "Which atom is the central atom in NH₃ (ammonia)?",
    choices: [
      {
        text: "One of the hydrogens.",
        correct: false,
        explanation:
          "Hydrogen is almost never the central atom — it can only form one bond. Whenever H appears in a Lewis structure, it sits on the outside.",
      },
      {
        text: "Nitrogen.",
        correct: true,
        explanation:
          "Yes. The convention is: the central atom is the least electronegative non-hydrogen atom. Nitrogen is the only non-H here, so it goes in the middle.",
      },
      {
        text: "It doesn't matter — Lewis structures are symmetric.",
        correct: false,
        explanation:
          "It very much matters. The central atom forms multiple bonds; the outer atoms each form one. Pick wrong and the structure won't work.",
      },
    ],
  },
  {
    id: "lone-pairs-water",
    prompt: "After drawing the Lewis structure of water, how many lone pairs are on the oxygen?",
    choices: [
      {
        text: "0",
        correct: false,
        explanation:
          "Oxygen needs 8 electrons total. With 2 bonds (4 electrons) it only has 4 — so it needs 4 more, which is 2 lone pairs.",
      },
      {
        text: "1",
        correct: false,
        explanation:
          "Just one lone pair would give oxygen 6 electrons (4 from bonds + 2 from the pair). Short of an octet by 2 — we need one more lone pair.",
      },
      {
        text: "2",
        correct: true,
        explanation:
          "Right. Oxygen has 6 valence electrons; it shares 2 with each hydrogen (4 in bonds), leaving 4 more that sit as 2 lone pairs. That gives it a full octet.",
      },
      {
        text: "3",
        correct: false,
        explanation:
          "Three lone pairs would mean 6 lone-pair electrons + 4 bonding = 10 total. Octet is 8. Oxygen would be over-stuffed.",
      },
    ],
  },
  {
    id: "when-double-bond",
    prompt: "How do you know a molecule needs a double or triple bond?",
    choices: [
      {
        text: "Whenever a molecule has more than two atoms.",
        correct: false,
        explanation:
          "Plenty of three-atom molecules have only single bonds — water and ammonia, for instance. Multi-bonds are about electron count, not atom count.",
      },
      {
        text: "When you run out of electrons before satisfying all octets.",
        correct: false,
        explanation:
          "Close but not quite. By the time we promote bonds, all electrons are already placed. What's wrong is that they're in the wrong *spots* — too many on the outer atoms, not enough at the center.",
      },
      {
        text: "When the central atom is short of an octet after lone pairs have been placed.",
        correct: true,
        explanation:
          "Exactly. In CO₂, after distributing all 16 electrons, the central carbon only has 4 (just from the two single bonds). We re-use a lone pair from each oxygen as a second bonding pair, promoting the bonds to doubles. Carbon now has 8.",
      },
      {
        text: "When two atoms have the same electronegativity.",
        correct: false,
        explanation:
          "That affects polarity, not bond order. Bond order comes from how many electron pairs are needed to satisfy octets.",
      },
    ],
  },
  {
    id: "synthesis-algorithm",
    prompt:
      "You see a Lewis structure where the central atom has only 6 electrons but every outer atom has a full octet. What step was skipped?",
    choices: [
      {
        text: "Counting valence electrons.",
        correct: false,
        explanation:
          "Valence-counting tells you the total to distribute — if it was wrong, the structure would have too many or too few electrons. Here the count is right; what's wrong is where they sit.",
      },
      {
        text: "Promoting bonds to satisfy the central atom's octet.",
        correct: true,
        explanation:
          "Right. After distributing lone pairs to outer atoms, the algorithm says: check the central atom. If it's short of 8, take a lone pair from an outer atom and turn it into a bonding pair (promote the bond). The structure you saw is a step-4 partial — a half-done CO₂, for example.",
      },
      {
        text: "Choosing the right central atom.",
        correct: false,
        explanation:
          "Wrong central atom would produce a different connectivity altogether, not a short-octet center. Here the skeleton is correct — it's just missing the bond-promotion step.",
      },
      {
        text: "Drawing the skeleton bonds.",
        correct: false,
        explanation:
          "If the skeleton were missing, atoms wouldn't be connected at all. Here the connections exist; the problem is bond *order* (single where it should be double).",
      },
    ],
  },
];
