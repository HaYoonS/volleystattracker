import { useState } from "react";
import MainMenu from "./ui/screens/MainMenu";
import Teams from "./ui/screens/Teams";
import TeamDetail from "./ui/screens/TeamDetail";
import NewGame from "./ui/screens/NewGame";
import LineupSelection from "./ui/screens/LineupSelection";
import CourtSelection from "./ui/screens/CourtSelection";
import RotationSelection from "./ui/screens/RotationSelection";
import CourtPositionSelection from "./ui/screens/CourtPositionSelection";
import type { CourtAssignment } from "./domain/types";

type Screen =
  | "MENU"
  | "NEW_GAME"
  | "LINEUP"
  | "COURT"
  | "ROTATION"
  | "POSITIONS"
  | "TRACKER"
  | "TEAMS"
  | "TEAM_DETAIL"
  | "GAMES";

export default function App() {
  const [screen, setScreen] = useState<Screen>("MENU");

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const [matchRoster, setMatchRoster] = useState<string[]>([]);
  const [courtPlayers, setCourtPlayers] = useState<string[]>([]);
  const [rotation, setRotation] = useState<1 | 6 | null>(null);
  const [courtAssignments, setCourtAssignments] = useState<CourtAssignment[]>(
    [],
  );

  if (screen === "MENU") {
    return (
      <MainMenu
        onNewGame={() => setScreen("NEW_GAME")}
        onTeams={() => setScreen("TEAMS")}
        onGames={() => setScreen("GAMES")}
      />
    );
  }

  if (screen === "NEW_GAME") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("MENU")}>← Back</button>
        <NewGame
          onMatchCreated={(matchId, teamId) => {
            setSelectedMatchId(matchId);
            setSelectedTeamId(teamId);
            setMatchRoster([]);
            setCourtPlayers([]);
            setRotation(null);
            setCourtAssignments([]);
            setScreen("LINEUP");
          }}
        />
      </div>
    );
  }

  if (screen === "LINEUP") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("NEW_GAME")}>← Back</button>

        {selectedTeamId ? (
          <LineupSelection
            teamId={selectedTeamId}
            onLineupConfirmed={(players: string[]) => {
              setMatchRoster(players);
              setScreen("COURT");
            }}
          />
        ) : (
          <p style={{ opacity: 0.7 }}>No team selected.</p>
        )}
      </div>
    );
  }

  if (screen === "COURT") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("LINEUP")}>← Back</button>

        <CourtSelection
          playerIds={matchRoster}
          onCourtConfirmed={(players: string[]) => {
            setCourtPlayers(players);
            setScreen("ROTATION");
          }}
        />
      </div>
    );
  }

  if (screen === "ROTATION") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("COURT")}>← Back</button>

        <RotationSelection
          onSelect={(r) => {
            setRotation(r);
            setScreen("POSITIONS");
          }}
        />
      </div>
    );
  }

  if (screen === "POSITIONS") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("ROTATION")}>← Back</button>

        {rotation ? (
          <CourtPositionSelection
            playerIds={courtPlayers}
            rotation={rotation}
            onPositionsConfirmed={(assignments: CourtAssignment[]) => {
              setCourtAssignments(assignments);
              setScreen("TRACKER");
            }}
          />
        ) : (
          <p style={{ opacity: 0.7 }}>No rotation selected.</p>
        )}
      </div>
    );
  }

  if (screen === "TRACKER") {
    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => {
            setSelectedMatchId(null);
            setMatchRoster([]);
            setCourtPlayers([]);
            setRotation(null);
            setCourtAssignments([]);
            setScreen("MENU");
          }}
        >
          ← Back
        </button>

        <h1>Tracker (stub)</h1>
        <p style={{ opacity: 0.7 }}>
          Match created: {selectedMatchId ?? "none"}
        </p>
        <p style={{ opacity: 0.7 }}>Rotation: {rotation ?? "none"}</p>

        <h2>Court Assignments</h2>
        <ul>
          {courtAssignments.map((a) => (
            <li key={a.zone}>
              Zone {a.zone}: {a.playerId}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (screen === "TEAMS") {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => setScreen("MENU")}>← Back</button>
        <Teams
          onOpenTeam={(teamId) => {
            setSelectedTeamId(teamId);
            setScreen("TEAM_DETAIL");
          }}
        />
      </div>
    );
  }

  if (screen === "TEAM_DETAIL") {
    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => {
            setSelectedTeamId(null);
            setScreen("TEAMS");
          }}
        >
          ← Back
        </button>

        {selectedTeamId ? (
          <TeamDetail teamId={selectedTeamId} />
        ) : (
          <p style={{ opacity: 0.7 }}>No team selected.</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => setScreen("MENU")}>← Back</button>
      <h1>Games</h1>
      <p>Later: view saved games.</p>
    </div>
  );
}
