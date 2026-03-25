type MainMenuProps = {
  onNewGame: () => void;
  onTeams: () => void;
  onGames: () => void;
};

export default function MainMenu(props: MainMenuProps) {
  return (
    <div style={{ padding: 24, display: "grid", gap: 12, maxWidth: 360 }}>
      <h1 style={{ margin: 0 }}>VolTrack</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Choose what you want to do.</p>

      <button onClick={props.onNewGame} style={{ padding: 12 }}>
        New Game
      </button>

      <button onClick={props.onTeams} style={{ padding: 12 }}>
        Teams
      </button>

      <button onClick={props.onGames} style={{ padding: 12 }}>
        Games
      </button>
    </div>
  );
}
