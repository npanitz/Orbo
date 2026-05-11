import type { QuizQuestion } from "../ShellFilling/quizQuestions";

/**
 * "Predict, don't recall." Each question tests whether the student can
 * apply the nuclear-pull-vs-distance mechanism, not whether they memorized
 * a fact. Wrong-answer explanations always re-state the mechanism.
 */

export const QUIZ: QuizQuestion[] = [
  {
    id: "radius-li-vs-f",
    prompt: "Which atom is larger: lithium (Li) or fluorine (F)?",
    choices: [
      {
        text: "Fluorine — it has more electrons.",
        correct: false,
        explanation:
          "More electrons doesn't automatically mean a bigger atom. F has more protons too, and they pull on the same shell as Li's — so F's electrons are held tighter, making it smaller, not larger.",
      },
      {
        text: "Lithium — fewer protons in the same shell means a weaker pull.",
        correct: true,
        explanation:
          "Right. Both Li and F live in row 2 (same shell). F has 9 protons pulling on those electrons; Li has only 3. Stronger pull → tighter hold → smaller atom. Lithium is roughly 4× larger than fluorine.",
      },
      {
        text: "They're about the same size — same row, same shell.",
        correct: false,
        explanation:
          "Same row means same shell being filled, but the number of protons matters enormously. Going from Li (3 protons) to F (9 protons) more than doubles the nuclear pull on the same shell, shrinking the atom dramatically.",
      },
    ],
  },
  {
    id: "en-o-vs-s",
    prompt: "Which has higher electronegativity: oxygen (O) or sulfur (S)?",
    choices: [
      {
        text: "Sulfur — it's heavier.",
        correct: false,
        explanation:
          "Mass doesn't drive electronegativity. Distance does. Sulfur is one row below oxygen, so its valence electrons are in a more distant shell — the nucleus can't tug on bonding electrons as effectively.",
      },
      {
        text: "Both equally — same column.",
        correct: false,
        explanation:
          "Same column means same valence count, but valence electrons sit in different shells. O's shared electrons are closer to its nucleus than S's are to its own. Closer = stronger pull = more electronegative.",
      },
      {
        text: "Oxygen — its valence electrons are closer to the nucleus.",
        correct: true,
        explanation:
          "Yes. Both have 6 valence electrons, but O's are in shell 2 — much closer to the nucleus than S's shell-3 electrons. Same logic that makes F more electronegative than Cl: down a group, electronegativity falls.",
      },
    ],
  },
  {
    id: "ie-na-vs-ne",
    prompt: "Which takes more energy to ionize: sodium (Na) or neon (Ne)?",
    choices: [
      {
        text: "Neon — its outer shell is full, so its electrons are bound tightly.",
        correct: true,
        explanation:
          "Right. Ne's full shell is the most stable electron configuration in row 2; pulling an electron out of it is very expensive. Na, just one element later, has a lonely 3s electron that's easy to remove — that's why sodium is so eager to form Na⁺.",
      },
      {
        text: "Sodium — it has more protons.",
        correct: false,
        explanation:
          "Slightly more protons (11 vs 10), but Na's outermost electron lives in shell 3, one shell farther from the nucleus. Distance trumps the small proton-count advantage — Na's outer electron is held more loosely than any in Ne.",
      },
      {
        text: "About the same — they're next to each other.",
        correct: false,
        explanation:
          "Adjacency on the table doesn't mean similar ionization energy. Ne ends a shell (very stable); Na starts a new one (very unstable). The energy needed to ionize them differs by more than a factor of two.",
      },
    ],
  },
  {
    id: "ie-k-vs-br",
    prompt:
      "Between potassium (K) and bromine (Br) — both in row 4 — which holds onto its outermost electron more tightly?",
    choices: [
      {
        text: "Bromine — more protons pulling on the same shell.",
        correct: true,
        explanation:
          "Correct. K and Br share row 4 (same outer shell), but Br has 35 protons to K's 19. Vastly more nuclear pull on the same shell → Br's outermost electron is held far more tightly. That's why Br readily gains an electron and K readily loses one.",
      },
      {
        text: "Potassium — alkali metals are more reactive.",
        correct: false,
        explanation:
          "Reactivity isn't the same as 'holding tightly' — actually it's the opposite. K is reactive *because* it loses its outermost electron easily. Br holds onto its electrons (and grabs more if it can).",
      },
      {
        text: "About the same — same row.",
        correct: false,
        explanation:
          "Same row, but 16 extra protons in Br dramatically strengthen the nuclear pull on the shared row-4 shell. The horizontal-trend effect (more protons in same shell → tighter hold) is in full force here.",
      },
    ],
  },
  {
    id: "synthesis-top-right",
    prompt:
      "An element sitting near the top-right of the table (excluding noble gases) should have which combination of properties?",
    choices: [
      {
        text: "Large radius and low electronegativity.",
        correct: false,
        explanation:
          "That's the bottom-left, not the top-right. Bottom-left elements have many shells (large radius) and weak nuclear pull on outer electrons (low EN).",
      },
      {
        text: "Small radius, low electronegativity.",
        correct: false,
        explanation:
          "These don't go together. Small radius comes from a tight hold on electrons — which is the same thing that drives high electronegativity. They move together, not opposite.",
      },
      {
        text: "Large radius, high electronegativity.",
        correct: false,
        explanation:
          "Opposite case from the right answer. Large radius means electrons are far from the nucleus — and a nucleus that can't hold its own electrons tightly can't pull on shared ones either. Radius and EN trends move oppositely across the table.",
      },
      {
        text: "Small radius and high electronegativity.",
        correct: true,
        explanation:
          "Exactly. The top-right is where you find lots of protons concentrated in a small shell — strong pull, tight hold, electron-greedy. Fluorine is the poster child: smallest among reactive nonmetals, and the most electronegative element on the table.",
      },
    ],
  },
];
