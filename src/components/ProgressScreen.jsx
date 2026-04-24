export default function ProgressScreen({ progress, onHome, onReset }) {
  return (
    <section className="panel progress-panel">
      <h2>Parent Progress</h2>
      <div className="stats-grid">
        <article className="stat-card">
          <h4>Sight Words</h4>
          <p>Correct: {progress.sight.correct}</p>
          <p>Total: {progress.sight.total}</p>
          <p>Best Streak: {progress.sight.bestStreak}</p>
        </article>
        <article className="stat-card">
          <h4>Math</h4>
          <p>Correct: {progress.math.correct}</p>
          <p>Total: {progress.math.total}</p>
          <p>Best Streak: {progress.math.bestStreak}</p>
        </article>
        <article className="stat-card">
          <h4>Overall</h4>
          <p>Sessions: {progress.sessions}</p>
          <p>Stars: {progress.stars}</p>
          <p>Mastered Words: {progress.sight.masteredWords.length}</p>
        </article>
      </div>

      <div className="word-cloud">
        {progress.sight.masteredWords.length === 0 && (
          <p>No mastered words yet. Start with a game!</p>
        )}
        {progress.sight.masteredWords.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </div>

      <div className="action-grid">
        <button type="button" className="action action-math" onClick={onHome}>
          Home
        </button>
        <button type="button" className="action action-mix" onClick={onReset}>
          Reset Progress
        </button>
      </div>
    </section>
  );
}
