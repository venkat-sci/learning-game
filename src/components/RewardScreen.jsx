import Celebration from "./Celebration";

export default function RewardScreen({
  progress,
  streak,
  sessionResult,
  onPlayAgain,
  onViewProgress,
}) {
  const passed = sessionResult?.leveledUp;
  const score = sessionResult?.score ?? 0;
  const total = sessionResult?.total ?? 10;
  const nextUnlocked = sessionResult?.nextUnlocked ?? 1;

  return (
    <section className="panel reward-panel">
      <Celebration />
      <h2>{passed ? "Level Up! 🎉" : "Awesome Work! 🌟"}</h2>
      <p>
        {passed
          ? `Amazing! Level ${nextUnlocked} is now unlocked! 🔓`
          : score >= 5
            ? `So close! ${score}/${total} correct — try again to unlock the next level!`
            : `You got ${score}/${total} — practice more to unlock the next level!`}
      </p>
      <div className="summary-bar">
        <span>
          Score: {score}/{total}
        </span>
        <span>Stars: {progress.stars}</span>
        <span>Streak: {streak}</span>
      </div>
      <div className="action-grid">
        <button
          type="button"
          className="action action-sight"
          onClick={onPlayAgain}
        >
          Choose Level 🗺️
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
