interface Props {
  onExit: () => void;
}

/**
 * Placeholder for the guided-lessons experience. Coming-soon stub for now —
 * future work will wire up scripted scenes that drive the Sandbox engine
 * through pedagogical sequences.
 */
export function LearningModules({ onExit }: Props) {
  return (
    <div className="modules-page">
      <button className="back-button back-button-static" onClick={onExit} aria-label="Back to home">
        ← Home
      </button>
      <div className="modules-content">
        <h1>Learning Modules</h1>
        <p className="modules-lede">
          Guided lessons are on the way. Each module will walk you through a
          chemistry concept by driving the simulator: spawning atoms, forming
          bonds, and asking you questions as you go.
        </p>
        <div className="modules-roadmap">
          <h3>Planned tracks</h3>
          <ul>
            <li>Atomic structure &amp; the periodic table</li>
            <li>Covalent bonding &amp; VSEPR geometry</li>
            <li>Lewis structures &amp; resonance</li>
            <li>Functional groups in organic chemistry</li>
            <li>Acid–base &amp; equilibrium</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
