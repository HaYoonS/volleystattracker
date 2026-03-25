import Dexie, { type Table } from "dexie";
import type {
  Team,
  PlayerProfile,
  TeamRosterEntry,
  Match,
} from "../domain/types";

export class VolTrackDB extends Dexie {
  teams!: Table<Team, string>;
  players!: Table<PlayerProfile, string>;
  rosterEntries!: Table<TeamRosterEntry, string>;
  matches!: Table<Match, string>;

  constructor() {
    super("voltrack_db");

    this.version(2).stores({
      teams: "id, name, createdAt",
      players: "id, name, createdAt",
      rosterEntries: "id, teamId, playerId, number, role",
      matches: "id, teamId, createdAt, status",
    });
  }
}

export const db = new VolTrackDB();
