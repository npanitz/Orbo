export interface QuizChoice {
  text: string;
  correct: boolean;
  /** Shown after the student picks this choice — explains why right or wrong. */
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "valence-k",
    prompt:
      "Potassium (K) sits in column 1, row 4 of the periodic table. How many electrons does it have in its outermost shell?",
    choices: [
      {
        text: "19",
        correct: false,
        explanation:
          "19 is potassium's total electron count, not its outer-shell count. Outer-shell electrons (valence) drive chemistry; total electrons rarely matter directly.",
      },
      {
        text: "4",
        correct: false,
        explanation:
          "The row tells you which shell is being filled, not how many electrons are in it. Look at lithium and sodium — also in column 1, also one valence electron.",
      },
      {
        text: "1",
        correct: true,
        explanation:
          "Right. Column 1 means one electron in the outermost shell. That's what lithium and sodium had too — same column, same valence, same chemistry.",
      },
      {
        text: "8",
        correct: false,
        explanation:
          "Full shell with 8 belongs to noble gases (column 18). Potassium has only just started a new shell.",
      },
    ],
  },
  {
    id: "reactive-mg-ar",
    prompt: "Which is more reactive — magnesium (Mg, column 2) or argon (Ar, column 18)?",
    choices: [
      {
        text: "Argon",
        correct: false,
        explanation:
          "Argon is a noble gas — full outer shell, completely satisfied. It almost never reacts. Magnesium, with 2 valence electrons to give away, is far more reactive.",
      },
      {
        text: "Magnesium",
        correct: true,
        explanation:
          "Yes. Mg has 2 valence electrons it would happily lose to reach a full shell beneath. Ar already has a full outer shell — it has no incentive to react.",
      },
      {
        text: "Equally reactive",
        correct: false,
        explanation:
          "Far from equal. Full-shell elements (noble gases) are the least reactive; elements with electrons to lose or gain are much more so.",
      },
    ],
  },
  {
    id: "chlorine-ion",
    prompt:
      "Chlorine (Cl) needs one more electron to complete its outer shell. What ion does it tend to form?",
    choices: [
      {
        text: "Cl⁺ (loses one electron)",
        correct: false,
        explanation:
          "That would move it farther from a full shell, not closer. Atoms move toward a full outer shell, not away from one.",
      },
      {
        text: "It stays neutral",
        correct: false,
        explanation:
          "Almost-full shells are unstable — chlorine readily gains one electron when given the chance, which is why it's so reactive.",
      },
      {
        text: "Cl⁻ (gains one electron)",
        correct: true,
        explanation:
          "Right. It's so close to a full shell that grabbing one extra electron is energetically irresistible. That's why salt is NaCl — sodium gives up its lone valence electron, chlorine takes it.",
      },
      {
        text: "Cl⁷⁺ (loses seven)",
        correct: false,
        explanation:
          "Stripping seven electrons takes enormous energy. Cl gains one electron — much easier than losing seven.",
      },
    ],
  },
  {
    id: "most-stable-column",
    prompt: "Which column of the periodic table contains the most chemically stable elements?",
    choices: [
      {
        text: "Column 1 (alkali metals)",
        correct: false,
        explanation:
          "Opposite, actually. Column 1 elements have a single valence electron they're eager to give up — that makes them among the most reactive elements on the table.",
      },
      {
        text: "Column 14 (carbon group)",
        correct: false,
        explanation:
          "Half-full shells aren't particularly stable. Column 14 elements form lots of bonds, which is great for life — but not the same as being unreactive.",
      },
      {
        text: "Column 17 (halogens)",
        correct: false,
        explanation:
          "Halogens are one electron short of full. That makes them very reactive (great at grabbing electrons), not stable.",
      },
      {
        text: "Column 18 (noble gases)",
        correct: true,
        explanation:
          "Correct. Every element in column 18 has a full outer shell — no incentive to gain, lose, or share electrons. Helium, neon, argon… all famously unreactive.",
      },
    ],
  },
  {
    id: "rows-mean",
    prompt: "Why does the periodic table have rows?",
    choices: [
      {
        text: "Rows group elements by atomic mass.",
        correct: false,
        explanation:
          "Mass increases roughly with row, but that's a side effect of adding more protons and neutrons. The deeper reason for rows is shell filling.",
      },
      {
        text: "Each row corresponds to a shell being filled.",
        correct: true,
        explanation:
          "Exactly. Every time we fill a shell, the next electron starts a new shell — and the table starts a new row. The row number is which shell is currently being populated.",
      },
      {
        text: "Rows group elements by how they bond.",
        correct: false,
        explanation:
          "That's actually what columns do (same valence count → similar bonding). Rows track shell number.",
      },
      {
        text: "Rows are just visual — they don't mean anything chemical.",
        correct: false,
        explanation:
          "They mean a lot. Each row reflects a new shell being filled. That's why elements in different rows have systematically different sizes and energies.",
      },
    ],
  },
];
