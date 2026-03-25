import { useEffect, useState } from "react";
import { db } from "../../db/db";
import type { PlayerProfile } from "../../domain/types";

type Props = {
  playerIds: string[];
  onCourtConfirmed: (players: string[]) => void;
};

export default function CourtSelection({ playerIds, onCourtConfirmed }: Props) {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadPlayers() {
      const loaded = await db.players.bulkGet(playerIds);
      setPlayers(loaded.filter(Boolean) as PlayerProfile[]);
    }

    void loadPlayers();
  }, [playerIds]);

  function toggle(playerId: string) {
    const next = new Set(selected);

    if (next.has(playerId)) {
      next.delete(playerId);
    } else {
      if (next.size >= 6) return;
      next.add(playerId);
    }

    setSelected(next);
  }

  function confirm() {
    if (selected.size !== 6) return;
    onCourtConfirmed(Array.from(selected));
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Select Players On Court</h1>

      <ul style={{ paddingLeft: 18 }}>
        {players.map((p) => {
          const isSelected = selected.has(p.id);

          return (
            <li
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>{p.name}</span>

              <button onClick={() => toggle(p.id)}>
                {isSelected ? "Remove" : "On Court"}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={confirm}
        disabled={selected.size !== 6}
        style={{ marginTop: 16 }}
      >
        Confirm Court ({selected.size}/6)
      </button>
    </div>
  );
}
