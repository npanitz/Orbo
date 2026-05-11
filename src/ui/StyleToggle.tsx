import type { LewisStyle } from "./LewisView";

interface Props {
  style: LewisStyle;
  onChange: (s: LewisStyle) => void;
}

export function StyleToggle({ style, onChange }: Props) {
  return (
    <div className="style-toggle">
      <button
        className={style === "skeletal" ? "active" : ""}
        onClick={() => onChange("skeletal")}
        title="Line-angle / textbook organic chemistry style"
      >
        Skeletal
      </button>
      <button
        className={style === "lewis" ? "active" : ""}
        onClick={() => onChange("lewis")}
        title="Explicit Lewis structure — every bond drawn"
      >
        Lewis
      </button>
    </div>
  );
}
