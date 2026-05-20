import type { QuizQuestion } from "../ShellFilling/quizQuestions";

/**
 * The question pattern here is: predict whether atoms bond, then justify by
 * what the energy curve would look like. Wrong-answer explanations always
 * route back to the "well or no well" logic from the explore phase.
 */

export const QUIZ: QuizQuestion[] = [
  {
    id: "ne-bond",
    prompt: "Will two neon (Ne) atoms form a covalent bond?",
    choices: [
      {
        text: "Yes — all atoms attract each other.",
        correct: false,
        explanation:
          "Attraction isn't enough. Bonding requires a well in the energy curve — a distance at which the system is at lower energy than apart. Neon has a full outer shell; bringing two Ne atoms close offers no energetic payoff.",
      },
      {
        text: "Yes, but the bond is very weak.",
        correct: false,
        explanation:
          "There's an extremely faint van der Waals attraction at long range, but at the temperatures and pressures we care about, no bond forms. The energy curve is essentially flat — like He–He in the explore phase.",
      },
      {
        text: "No — their shells are already full.",
        correct: true,
        explanation:
          "Exactly. With full outer shells, neither atom gains anything by sharing electrons. The energy curve has no well, so there's no bonded state to settle into. Neon is a noble gas for exactly this reason.",
      },
      {
        text: "No — neon is a metal.",
        correct: false,
        explanation:
          "Neon is a noble gas, not a metal. But you got the right answer for the wrong reason: it doesn't bond because its outer shell is already full, not because of its metallic / non-metallic identity.",
      },
    ],
  },
  {
    id: "well-depth-meaning",
    prompt: "What does the *depth* of the energy well tell you about the bond?",
    choices: [
      {
        text: "How long the bond is.",
        correct: false,
        explanation:
          "Bond length corresponds to the *position* of the well's minimum along the distance axis, not its depth. Depth is energy — it tells you something different.",
      },
      {
        text: "How strong the bond is — how much energy it takes to break.",
        correct: true,
        explanation:
          "Right. To break a bond, you have to climb out of the well from the bottom (E = -D) back up to zero (separated atoms). Deeper well → more energy required → stronger bond. That's why ionic bonds are usually stronger than covalent ones.",
      },
      {
        text: "How many electrons are shared.",
        correct: false,
        explanation:
          "Bond order (single, double, triple) does affect depth — more shared electron pairs means a deeper well — but the depth doesn't *uniquely* tell you bond order. Different elements with the same bond order have different depths.",
      },
      {
        text: "Nothing physical — it's just a math artifact.",
        correct: false,
        explanation:
          "It's quite physical. The well depth is the *bond dissociation energy* — exactly the energy you'd need to supply (in kJ/mol or eV) to break the bond and pull the atoms apart.",
      },
    ],
  },
  {
    id: "fluorine-bonds",
    prompt: "Predict: do two fluorine (F) atoms form a bond?",
    choices: [
      {
        text: "No — fluorine has 9 protons, too many to bond.",
        correct: false,
        explanation:
          "Proton count doesn't prevent bonding. What matters is whether the outer shell is full. Fluorine has 7 valence electrons — one short of a full shell. That makes it eager to share.",
      },
      {
        text: "Yes — each F needs one more electron, and sharing gives both atoms a full shell.",
        correct: true,
        explanation:
          "Correct. Each fluorine needs exactly 1 more electron. Sharing a pair fills both atoms' shells — same logic as H₂ and Cl₂. F₂ is how fluorine occurs in nature.",
      },
      {
        text: "No — fluorine is a noble gas.",
        correct: false,
        explanation:
          "Fluorine is *next to* neon, but it's not the noble gas. It's one electron short of having a full shell — and that 'almost-full' makes it extremely reactive, not unreactive.",
      },
      {
        text: "Yes, but only because of mass attraction.",
        correct: false,
        explanation:
          "Mass-driven gravitational attraction between atoms is incomprehensibly weak compared to the chemistry forces. F₂ forms because of electron sharing dropping the system into an energy well.",
      },
    ],
  },
  {
    id: "ionic-vs-covalent-depth",
    prompt:
      "In the explore phase, the Na–Cl curve had a deeper well than the Cl–Cl curve. What does that tell you?",
    choices: [
      {
        text: "Na–Cl is held together more strongly than Cl–Cl.",
        correct: true,
        explanation:
          "Right. A deeper well means more energy is required to break the bond. The full charge separation in ionic bonds (Na⁺ Cl⁻) creates strong Coulomb attraction — usually stronger than the partial-charge attraction of pure covalent bonds.",
      },
      {
        text: "Na–Cl is held together less strongly than Cl–Cl.",
        correct: false,
        explanation:
          "Opposite. Deeper well = harder to break = stronger bond. Ionic bonds are often deeper than covalent ones because full electron transfer creates full charges, and full charges attract more strongly than shared electrons.",
      },
      {
        text: "Na–Cl bonds form faster than Cl–Cl bonds.",
        correct: false,
        explanation:
          "Well depth tells you about thermodynamic stability (how tightly bound), not kinetic speed (how quickly the bond forms). Those are different questions.",
      },
      {
        text: "Nothing — well depth depends on graph scaling.",
        correct: false,
        explanation:
          "Well depth is a real physical quantity: the bond dissociation energy. The graph faithfully reflects this. A deeper well genuinely means a stronger bond.",
      },
    ],
  },
  {
    id: "synthesis-curve-shape",
    prompt:
      "If you knew nothing else about a pair of atoms but you saw their energy-vs-distance curve, what could you predict about them?",
    choices: [
      {
        text: "Just whether they're in the same group on the periodic table.",
        correct: false,
        explanation:
          "Periodic group placement isn't directly readable from an energy curve. But the curve does tell you something more useful: whether and how strongly they'll bond.",
      },
      {
        text: "Their atomic mass.",
        correct: false,
        explanation:
          "Mass doesn't show up in an interaction energy curve — that's about the system's potential energy as a function of distance, which is electrostatic + quantum, not gravitational.",
      },
      {
        text: "Whether they bond, the bond length, and the bond strength.",
        correct: true,
        explanation:
          "Exactly. The presence of a well tells you they bond. The position of the well's minimum tells you the bond length. The depth of the well tells you the bond strength. Three of the most important facts about a bond, all visible on one graph.",
      },
      {
        text: "Their color.",
        correct: false,
        explanation:
          "Color comes from electronic transitions inside individual atoms, not from inter-atom potential curves. Different question entirely.",
      },
    ],
  },
];
