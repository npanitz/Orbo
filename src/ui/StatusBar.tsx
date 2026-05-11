interface Props {
  text: string;
  openSlots: number;
}

export function StatusBar({ text, openSlots }: Props) {
  return (
    <div className="status-bar">
      {text}
      {openSlots > 0 && (
        <span style={{ marginLeft: 24, opacity: 0.7, fontSize: 14 }}>
          ({openSlots} open slot{openSlots === 1 ? "" : "s"})
        </span>
      )}
    </div>
  );
}
