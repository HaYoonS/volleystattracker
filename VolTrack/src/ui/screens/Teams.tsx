import { useEffect, useState } from "react";
import { db } from "../../db/db";
import { createId } from "../../domain/id";
import type { Team } from "../../domain/types";

type Props = {
  onOpenTeam: (teamId: string) => void;
};

export default function Teams({ onOpenTeam }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    async function loadTeams() {
      const allTeams = await db.teams.orderBy("createdAt").toArray();
      setTeams(allTeams);
    }
    loadTeams();
  }, []);

  async function addTeam() {
    const name = newName.trim();
    if (!name) return;

    const newTeam: Team = {
      id: createId(),
      name,
      createdAt: Date.now(),
    };

    await db.teams.add(newTeam);
    setTeams((prev) => [...prev, newTeam]);
    setNewName("");
  }

  async function deleteTeam(team: Team) {
    const ok = window.confirm(`Delete team "${team.name}"?`);
    if (!ok) return;

    // Delete team + its roster entries (keeps global players)
    await db.transaction("rw", db.teams, db.rosterEntries, async () => {
      await db.teams.delete(team.id);
      await db.rosterEntries.where("teamId").equals(team.id).delete();
    });

    setTeams((prev) => prev.filter((t) => t.id !== team.id));
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>Teams</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Team name"
          style={{ flex: 1 }}
        />
        <button onClick={addTeam}>Add Team</button>
      </div>

      {teams.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No teams yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {teams.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <button
                onClick={() => onOpenTeam(t.id)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {t.name}
              </button>

              <button onClick={() => deleteTeam(t)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
