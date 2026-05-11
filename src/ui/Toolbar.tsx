import { ELEMENTS, ELEMENT_SYMBOLS } from "../chem/elements";

interface Props {
  onPick: (element: string) => void;
}

export function Toolbar({ onPick }: Props) {
  return (
    <div className="toolbar">
      {ELEMENT_SYMBOLS.map((sym) => {
        const col = `#${ELEMENTS[sym].color.toString(16).padStart(6, "0")}`;
        return (
          <button
            key={sym}
            style={{ ["--col" as string]: col }}
            onClick={() => onPick(sym)}
          >
            {sym}
          </button>
        );
      })}
    </div>
  );
}
