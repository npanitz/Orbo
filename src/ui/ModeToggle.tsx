interface Props {
  mode: "3d" | "2d";
  onChange: (m: "3d" | "2d") => void;
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode-toggle">
      <button
        className={mode === "3d" ? "active" : ""}
        onClick={() => onChange("3d")}
      >
        3D
      </button>
      <button
        className={mode === "2d" ? "active" : ""}
        onClick={() => onChange("2d")}
      >
        2D
      </button>
    </div>
  );
}
