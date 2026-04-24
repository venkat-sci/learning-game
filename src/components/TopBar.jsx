export default function TopBar({ soundOn, onToggleSound, onShowProgress }) {
  return (
    <header className="top-bar">
      <h1>Spark Garden</h1>
      <div className="top-bar-actions">
        <button
          className="toggle toggle-progress"
          type="button"
          onClick={onShowProgress}
        >
          📊 Progress
        </button>
        <button className="toggle" type="button" onClick={onToggleSound}>
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>
    </header>
  );
}
