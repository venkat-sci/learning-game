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
  const nextLevel = sessionResult?.nextLevel ?? 1;

  return (
    <section className="panel reward-panel">
      <Celebration />
      <h2>{passed ? "Level Up! 🎉" : "Awesome Work!"}</h2>
      <p>
        {passed
          ? `Great job! Moving to Level ${nextLevel}!`
          : score >= 5
            ? `Almost there! ${score}/${total} — keep practicing Level ${nextLevel}!`
            : `You got ${score}/${total} — let's try Level ${nextLevel} again!`}
      </p>
      <div className="summary-bar">
        <span>
          Score: {score}/{total}
        </span>
        <span>Total Stars: {progress.stars}</span>
        <span>Streak: {streak}</span>
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
