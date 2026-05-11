import type { View } from "../App";

interface Props {
  onPick: (view: View) => void;
}

interface Tile {
  view: View;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  status?: "available" | "coming-soon";
}

const TILES: Tile[] = [
  {
    view: "modules",
    title: "Learning Modules",
    subtitle: "Guided lessons",
    description:
      "Step-by-step lessons that walk you through chemistry concepts using interactive molecules.",
    accent: "#7398ff",
    status: "coming-soon",
  },
  {
    view: "sandbox",
    title: "Sandbox",
    subtitle: "Open-ended play",
    description:
      "Spawn atoms, slingshot them together, and explore molecular geometry in 3D — or flip to 2D Lewis structures.",
    accent: "#ff8cd9",
    status: "available",
  },
];

export function Home({ onPick }: Props) {
  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">Orbo</h1>
        <p className="home-tagline">A chemistry playground for the curious.</p>
      </header>
      <div className="home-menu">
        {TILES.map((t) => (
          <button
            key={t.view}
            className="home-tile"
            style={{ ["--accent" as string]: t.accent }}
            onClick={() => onPick(t.view)}
          >
            <div className="home-tile-sub">{t.subtitle}</div>
            <div className="home-tile-title">{t.title}</div>
            <div className="home-tile-desc">{t.description}</div>
            {t.status === "coming-soon" && (
              <div className="home-tile-tag">Coming soon</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
