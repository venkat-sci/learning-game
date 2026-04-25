export default function HomeScreen({ progress, onStartGame }) {
  return (
    <section className="panel home-panel">
      <p className="chip">Kindergarten • Sight Words + Math + Dot + Write</p>
      <h2>Play, Learn, and Grow Every Day</h2>
      <p className="sub">
        15-minute fun sessions with game challenges, friendly sounds, and rich
        animations.
      </p>

      <div className="game-card-grid">
        <button
          type="button"
          className="game-card game-card-sight"
          onClick={() => onStartGame("sight")}
        >
          <img
            src="/sight-game.png"
            alt="Sight Word Game"
            className="game-card-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="game-card-fallback game-card-fallback-sight"
            aria-hidden="true"
          >
            📖
          </div>
          <span className="game-card-label">Sight Word Game</span>
        </button>

        <button
          type="button"
          className="game-card game-card-math"
          onClick={() => onStartGame("math")}
        >
          <img
            src="/math-game.png"
            alt="Math Game"
            className="game-card-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="game-card-fallback game-card-fallback-math"
            aria-hidden="true"
          >
            🔢
          </div>
          <span className="game-card-label">Math Game</span>
        </button>

        <button
          type="button"
          className="game-card game-card-dot"
          onClick={() => onStartGame("dot")}
        >
          <img
            src="/dot-game.png"
            alt="Dot Game"
            className="game-card-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="game-card-fallback game-card-fallback-dot"
            aria-hidden="true"
          >
            🔵
          </div>
          <span className="game-card-label">Dot Game</span>
        </button>

        <button
          type="button"
          className="game-card game-card-write"
          onClick={() => onStartGame("write")}
        >
          <img
            src="/write-game.png"
            alt="Write Game"
            className="game-card-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div
            className="game-card-fallback game-card-fallback-write"
            aria-hidden="true"
          >
            ✏️
          </div>
          <span className="game-card-label">Write Game</span>
        </button>
      </div>

      <div className="summary-bar">
        <span>Stars: {progress.stars}</span>
        <span>Sessions: {progress.sessions}</span>
        <span>Sight Mastered: {progress.sight.masteredWords.length}</span>
      </div>
    </section>
  );
}
