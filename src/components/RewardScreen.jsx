import Celebration from "./Celebration";

export default function RewardScreen({
  progress,
  streak,
  onPlayAgain,
  onViewProgress,
}) {
  return (
    <section className="panel reward-panel">
      <Celebration />
      <h2>Awesome Work!</h2>
      <p>You completed today&apos;s challenge set.</p>
      <div className="summary-bar">
        <span>Total Stars: {progress.stars}</span>
        <span>Current Streak: {streak}</span>
        <span>Next Goal: Reach Level 3</span>
      </div>
      <div className="action-grid">
        <button
          type="button"
          className="action action-sight"
          onClick={onPlayAgain}
        >
          Play Again
        </button>
        <button
          type="button"
          className="action action-mix"
          onClick={onViewProgress}
        >
          View Progress
        </button>
      </div>
    </section>
  );
}
