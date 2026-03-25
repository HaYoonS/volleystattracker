import { useEffect, useMemo, useState } from "react";
import { db } from "../../db/db";
import { createId } from "../../domain/id";
import type { PlayerProfile, Team, TeamRosterEntry } from "../../domain/types";

type Props = {
  teamId: string;
};

type RosterRow = {
  roster: TeamRosterEntry;
  player: PlayerProfile | null;
};

export default function TeamDetail({ teamId }: Props) {
  const [team, setTeam] = useState<Team | null>(null);
  const [rows, setRows] = useState<RosterRow[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>([]);

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [existingNumber, setExistingNumber] = useState("");
  const [existingRole, setExistingRole] = useState("");

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newRole, setNewRole] = useState("");

  async function load() {
    const t = await db.teams.get(teamId);
    setTeam(t ?? null);

    const rosterEntries = await db.rosterEntries
      .where("teamId")
      .equals(teamId)
      .toArray();

    const playerIds = rosterEntries.map((r) => r.playerId);
    const players = playerIds.length ? await db.players.bulkGet(playerIds) : [];

    const map = new Map<string, PlayerProfile | null>();
    for (let i = 0; i < playerIds.length; i++) {
      map.set(playerIds[i], players[i] ?? null);
    }

    const combined: RosterRow[] = rosterEntries.map((r) => ({
      roster: r,
      player: map.get(r.playerId) ?? null,
    }));

    combined.sort((a, b) => a.roster.number - b.roster.number);

    setRows(combined);

    const all = await db.players.orderBy("name").toArray();
    setAllPlayers(all);
  }

  useEffect(() => {
    async function runLoad() {
      const t = await db.teams.get(teamId);
      setTeam(t ?? null);

      const rosterEntries = await db.rosterEntries
        .where("teamId")
        .equals(teamId)
        .toArray();

      const playerIds = rosterEntries.map((r) => r.playerId);
      const players = playerIds.length
        ? await db.players.bulkGet(playerIds)
        : [];

      const map = new Map<string, PlayerProfile | null>();
      for (let i = 0; i < playerIds.length; i++) {
        map.set(playerIds[i], players[i] ?? null);
      }

      const combined: RosterRow[] = rosterEntries.map((r) => ({
        roster: r,
        player: map.get(r.playerId) ?? null,
      }));

      combined.sort((a, b) => a.roster.number - b.roster.number);

      setRows(combined);

      const all = await db.players.orderBy("name").toArray();
      setAllPlayers(all);
    }

    void runLoad();
  }, [teamId]);

  const rosterPlayerIds = useMemo(
    () => new Set(rows.map((r) => r.roster.playerId)),
    [rows],
  );

  const availablePlayers = useMemo(
    () => allPlayers.filter((p) => !rosterPlayerIds.has(p.id)),
    [allPlayers, rosterPlayerIds],
  );

  async function addExistingPlayer() {
    if (!selectedPlayerId) return;

    const number = Number(existingNumber);
    if (!Number.isFinite(number) || number <= 0) return;

    const role = existingRole.trim() || "N/A";

    const entry: TeamRosterEntry = {
      id: createId(),
      teamId,
      playerId: selectedPlayerId,
      number,
      role,
    };

    await db.rosterEntries.add(entry);

    setSelectedPlayerId("");
    setExistingNumber("");
    setExistingRole("");

    await load();
  }

  async function createAndAddPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;

    const number = Number(newNumber);
    if (!Number.isFinite(number) || number <= 0) return;

    const role = newRole.trim() || "N/A";

    const player: PlayerProfile = {
      id: createId(),
      name,
      createdAt: Date.now(),
    };

    const entry: TeamRosterEntry = {
      id: createId(),
      teamId,
      playerId: player.id,
      number,
      role,
    };

    await db.transaction("rw", db.players, db.rosterEntries, async () => {
      await db.players.add(player);
      await db.rosterEntries.add(entry);
    });

    setNewPlayerName("");
    setNewNumber("");
    setNewRole("");

    await load();
  }

  async function removeFromTeam(rosterEntryId: string, playerName: string) {
    const ok = window.confirm(
      `Remove ${playerName} from this team?\n\n(Their global player card stays saved.)`,
    );
    if (!ok) return;

    await db.rosterEntries.delete(rosterEntryId);
    await load();
  }

  async function deletePlayerGlobally(playerId: string, playerName: string) {
    const ok = window.confirm(
      `DELETE PLAYER "${playerName}" globally?\n\nThis removes them from ALL teams.`,
    );
    if (!ok) return;

    await db.transaction("rw", db.players, db.rosterEntries, async () => {
      await db.players.delete(playerId);
      await db.rosterEntries.where("playerId").equals(playerId).delete();
    });

    await load();
  }

  async function saveRosterEdit(
    rosterEntryId: string,
    numberStr: string,
    roleStr: string,
  ) {
    const number = Number(numberStr);
    if (!Number.isFinite(number) || number <= 0) return;

    const role = roleStr.trim() || "N/A";

    await db.rosterEntries.update(rosterEntryId, { number, role });
    await load();
  }

  if (!team) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Team not found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>{team.name}</h1>

      <h2>Roster</h2>
      {rows.length === 0 ? (
        <p>No players yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {rows.map(({ roster, player }) => (
            <RosterItem
              key={`${roster.id}-${roster.number}-${roster.role}`}
              roster={roster}
              playerName={player?.name ?? "(missing player)"}
              onRemove={() =>
                removeFromTeam(roster.id, player?.name ?? "player")
              }
              onDeletePlayer={() =>
                deletePlayerGlobally(roster.playerId, player?.name ?? "player")
              }
              onSave={(num, role) => saveRosterEdit(roster.id, num, role)}
            />
          ))}
        </ul>
      )}

      <hr />

      <h2>Add existing player</h2>
      <select
        value={selectedPlayerId}
        onChange={(e) => setSelectedPlayerId(e.target.value)}
      >
        <option value="">Select a player</option>
        {availablePlayers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        value={existingNumber}
        onChange={(e) => setExistingNumber(e.target.value)}
        placeholder="Number"
      />
      <input
        value={existingRole}
        onChange={(e) => setExistingRole(e.target.value)}
        placeholder="Role"
      />

      <button onClick={addExistingPlayer}>Add</button>

      <hr />

      <h2>Create new player</h2>
      <input
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={newNumber}
        onChange={(e) => setNewNumber(e.target.value)}
        placeholder="Number"
      />
      <input
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        placeholder="Role"
      />

      <button onClick={createAndAddPlayer}>Create + Add</button>
    </div>
  );
}

function RosterItem(props: {
  roster: TeamRosterEntry;
  playerName: string;
  onRemove: () => void;
  onDeletePlayer: () => void;
  onSave: (num: string, role: string) => void;
}) {
  const [num, setNum] = useState(String(props.roster.number));
  const [role, setRole] = useState(props.roster.role);

  return (
    <li style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input value={num} onChange={(e) => setNum(e.target.value)} />
      <input value={role} onChange={(e) => setRole(e.target.value)} />
      <span>{props.playerName}</span>

      <button onClick={() => props.onSave(num, role)}>Save</button>
      <button onClick={props.onRemove}>Remove</button>
      <button onClick={props.onDeletePlayer}>Delete</button>
    </li>
  );
}
