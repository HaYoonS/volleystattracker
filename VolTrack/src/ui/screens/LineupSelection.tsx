import { useEffect, useState } from "react";
import { db } from "../../db/db";
import type { PlayerProfile, TeamRosterEntry } from "../../domain/types";

type Props = {
  teamId: string;
  onLineupConfirmed: (playerIds: string[]) => void;
};

type Row = {
  roster: TeamRosterEntry;
  player: PlayerProfile | null;
};

export default function LineupSelection({ teamId, onLineupConfirmed }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const roster = await db.rosterEntries
        .where("teamId")
        .equals(teamId)
        .toArray();

      const playerIds = roster.map((r) => r.playerId);
      const players = await db.players.bulkGet(playerIds);

      const combined: Row[] = roster.map((r, i) => ({
        roster: r,
        player: players[i] ?? null,
      }));

      setRows(combined);
    }

    load();
  }, [teamId]);

  function toggle(playerId: string) {
    const newSet = new Set(selected);

    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }

    setSelected(newSet);
  }

  function confirm() {
    if (selected.size < 6) return;
    onLineupConfirmed(Array.from(selected));
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Select Lineup</h1>

      <ul style={{ paddingLeft: 18 }}>
        {rows.map(({ roster, player }) => {
          const isSelected = selected.has(roster.playerId);

          return (
            <li
              key={roster.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>
                #{roster.number} {player?.name}
              </span>

              <button onClick={() => toggle(roster.playerId)}>
                {isSelected ? "Remove" : "Select"}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={confirm}
        disabled={selected.size < 6}
        style={{ marginTop: 16 }}
      >
        Continue ({selected.size} selected)
      </button>
    </div>
  );
}
