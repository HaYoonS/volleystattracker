import { useEffect, useState } from "react";
import { db } from "../../db/db";
import { createId } from "../../domain/id";
import type { Match, Team } from "../../domain/types";

type Props = {
  onMatchCreated: (matchId: string, teamId: string) => void;
};

export default function NewGame({ onMatchCreated }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    async function loadTeams() {
      const all = await db.teams.orderBy("createdAt").toArray();
      setTeams(all);
    }
    loadTeams();
  }, []);

  async function start() {
    if (!teamId) return;

    const match: Match = {
      id: createId(),
      teamId,
      title: title.trim() || "Untitled Match",
      createdAt: Date.now(),
      status: "DRAFT",
      usScore: 0,
      themScore: 0,
    };

    await db.matches.add(match);
    onMatchCreated(match.id, teamId);
  }

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1 style={{ marginTop: 0 }}>New Game</h1>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Team to track
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Match title (optional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="vs UGA Club • Spring League"
          />
        </label>

        <button onClick={start} disabled={!teamId || teams.length === 0}>
          Start
        </button>

        {teams.length === 0 && (
          <p style={{ opacity: 0.7 }}>
            You need to create a team first (Main Menu → Teams).
          </p>
        )}
      </div>
    </div>
  );
}
