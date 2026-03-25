import { useEffect, useState } from "react";
import { db } from "../../db/db";
import type { CourtAssignment, PlayerProfile, Zone } from "../../domain/types";

type Props = {
  playerIds: string[];
  rotation: 1 | 6;
  onPositionsConfirmed: (assignments: CourtAssignment[]) => void;
};

const ZONES: Zone[] = [1, 2, 3, 4, 5, 6];

function getRoleHint(zone: Zone, rotation: 1 | 6) {
  if (rotation === 6) {
    const map: Record<number, string> = {
      1: "Libero",
      2: "Setter",
      3: "Outside",
      4: "Middle",
      5: "Opposite",
      6: "Outside",
    };
    return map[zone];
  }

  const map: Record<number, string> = {
    1: "Setter",
    2: "Outside",
    3: "Middle",
    4: "Opposite",
    5: "Outside",
    6: "Libero",
  };

  return map[zone];
}

export default function CourtPositionSelection({
  playerIds,
  rotation,
  onPositionsConfirmed,
}: Props) {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [assignments, setAssignments] = useState<Record<number, string>>({
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
  });

  useEffect(() => {
    async function load() {
      const p = await db.players.bulkGet(playerIds);
      setPlayers(p.filter(Boolean) as PlayerProfile[]);
    }
    void load();
  }, [playerIds]);

  function setZone(zone: Zone, playerId: string) {
    setAssignments((prev) => ({
      ...prev,
      [zone]: playerId,
    }));
  }

  function isValid() {
    const vals = Object.values(assignments);
    if (vals.some((v) => !v)) return false;
    return new Set(vals).size === 6;
  }

  function confirm() {
    if (!isValid()) return;

    const result: CourtAssignment[] = ZONES.map((z) => ({
      zone: z,
      playerId: assignments[z],
    }));

    onPositionsConfirmed(result);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Assign Court Positions</h1>
      <p>Rotation: {rotation}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 700,
        }}
      >
        {/* Front row */}
        <ZoneCard zone={4} />
        <ZoneCard zone={3} />
        <ZoneCard zone={2} />

        {/* Back row */}
        <ZoneCard zone={5} />
        <ZoneCard zone={6} />
        <ZoneCard zone={1} />
      </div>

      <button onClick={confirm} disabled={!isValid()} style={{ marginTop: 16 }}>
        Confirm Positions
      </button>
    </div>
  );

  function ZoneCard({ zone }: { zone: Zone }) {
    return (
      <div
        style={{
          border: "1px solid #ccc",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <h3>Zone {zone}</h3>

        <p style={{ fontSize: 12, opacity: 0.7 }}>
          {getRoleHint(zone, rotation)} should go here
        </p>

        <select
          value={assignments[zone]}
          onChange={(e) => setZone(zone, e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="">Select player</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
