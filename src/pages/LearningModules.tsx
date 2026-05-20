import { useState } from "react";
import { AtomicStructureModule } from "../learn/modules/AtomicStructureModule";
import { BondingModule } from "../learn/modules/BondingModule";

interface Props {
  onExit: () => void;
}

type Track = "index" | "atomic-structure" | "bonding";

interface TrackDef {
  id: Track;
  title: string;
  blurb: string;
  status: "available";
}

const TRACKS: TrackDef[] = [
  {
    id: "atomic-structure",
    title: "Atomic Structure & the Periodic Table",
    blurb:
      "Meet the elements. Build atoms from scratch and learn how their structure determines where they live on the chart.",
    status: "available",
  },
  {
    id: "bonding",
    title: "Covalent Bonding & VSEPR Geometry",
    blurb:
      "Why atoms bond, how electrons get shared or transferred, and the 3D shapes that result.",
    status: "available",
  },
];

const SOON: { title: string; blurb: string }[] = [
  {
    title: "Functional Groups in Organic Chemistry",
    blurb: "The reactive vocabulary of carbon.",
  },
  {
    title: "Acid–Base & Equilibrium",
    blurb: "Reactions that go both ways.",
  },
];

export function LearningModules({ onExit }: Props) {
  const [track, setTrack] = useState<Track>("index");

  if (track === "atomic-structure") {
    return <AtomicStructureModule onExit={() => setTrack("index")} />;
  }
  if (track === "bonding") {
    return <BondingModule onExit={() => setTrack("index")} />;
  }

  return (
    <div className="modules-page">
      <button className="back-button back-button-static" onClick={onExit}>
        ← Home
      </button>
      <div className="modules-content">
        <h1>Learning Modules</h1>
        <p className="modules-lede">
          Guided tracks that walk you through chemistry concepts. Each one drives
          the simulator with the same atoms and bonds you use in the sandbox.
        </p>

        <div className="track-grid">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              className="track-card available"
              onClick={() => setTrack(t.id)}
            >
              <div className="track-card-title">{t.title}</div>
              <div className="track-card-blurb">{t.blurb}</div>
              <div className="track-card-cta">Open →</div>
            </button>
          ))}
          {SOON.map((s) => (
            <div key={s.title} className="track-card disabled">
              <div className="track-card-title">{s.title}</div>
              <div className="track-card-blurb">{s.blurb}</div>
              <div className="track-card-tag">Coming soon</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
