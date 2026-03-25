type Props = {
  onSelect: (rotation: 1 | 6) => void;
};

export default function RotationSelection({ onSelect }: Props) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Choose Rotation</h1>

      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={() => onSelect(1)}>Rotation 1</button>
        <button onClick={() => onSelect(6)}>Rotation 6</button>
      </div>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        Choose based on your serve receive rotation.
      </p>
    </div>
  );
}
