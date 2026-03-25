export type PlayerId = string;
export type TeamId = string;
export type MatchId = string;

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  createdAt: number;
}

export interface Team {
  id: TeamId;
  name: string;
  createdAt: number;
}

export interface TeamRosterEntry {
  id: string;
  teamId: TeamId;
  playerId: PlayerId;
  number: number;
  role: string;
}

export type MatchStatus = "DRAFT" | "SAVED";

export interface Match {
  id: MatchId;
  teamId: TeamId;
  title: string;
  createdAt: number;
  endedAt?: number;
  status: MatchStatus;
  usScore: number;
  themScore: number;
}

export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

export interface CourtAssignment {
  zone: Zone;
  playerId: string;
}
