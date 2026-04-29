// Level configuration — emoji, label, and gradient per level for each mode
const LEVEL_CONFIG = {
  sight: [
    {
      level: 1,
      emoji: "🌱",
      label: "Baby Steps",
      bg: "linear-gradient(135deg, #86efac, #22c55e)",
    },
    {
      level: 2,
      emoji: "🌟",
      label: "Star Reader",
      bg: "linear-gradient(135deg, #fde68a, #f59e0b)",
    },
    {
      level: 3,
      emoji: "🚀",
      label: "Blast Off!",
      bg: "linear-gradient(135deg, #93c5fd, #3b82f6)",
    },
    {
      level: 4,
      emoji: "🦁",
      label: "Word Lion",
      bg: "linear-gradient(135deg, #fdba74, #f97316)",
    },
    {
      level: 5,
      emoji: "🏆",
      label: "Champion!",
      bg: "linear-gradient(135deg, #d8b4fe, #9333ea)",
    },
  ],
  math: [
    {
      level: 1,
      emoji: "🍎",
      label: "Apple Math",
      bg: "linear-gradient(135deg, #86efac, #22c55e)",
    },
    {
      level: 2,
      emoji: "🐢",
      label: "Count Up!",
      bg: "linear-gradient(135deg, #fde68a, #f59e0b)",
    },
    {
      level: 3,
      emoji: "🦊",
      label: "Smart Fox",
      bg: "linear-gradient(135deg, #93c5fd, #3b82f6)",
    },
    {
      level: 4,
      emoji: "🦁",
      label: "Math Lion",
      bg: "linear-gradient(135deg, #fdba74, #f97316)",
    },
    {
      level: 5,
      emoji: "🏆",
      label: "Math Champ",
      bg: "linear-gradient(135deg, #d8b4fe, #9333ea)",
    },
  ],
};

export default function LevelSelectScreen({
  mode,
  unlockedLevel,
  completedLevels,
  onSelectLevel,
  onBack,
}) {
  const configs = LEVEL_CONFIG[mode] ?? LEVEL_CONFIG.sight;
  const title = mode === "sight" ? "Sight Words" : "Math Fun";
  const icon = mode === "sight" ? "📖" : "🔢";

  return (
    <section className="panel level-select-panel">
      <button
        type="button"
        className="back-link level-back-btn"
        onClick={onBack}
      >
        ← Back
      </button>

      <h2 className="level-select-title">
        {icon} {title}
      </h2>
      <p className="level-select-sub">Pick your level! 🎯</p>

      <div className="level-grid">
        {configs.map(({ level, emoji, label, bg }) => {
          const isCompleted = (completedLevels ?? []).includes(level);
          const isUnlocked = level <= (unlockedLevel ?? 1);
          const isLocked = !isUnlocked;

          return (
            <button
              key={level}
              type="button"
              className={[
                "level-bubble",
                isCompleted ? "level-completed" : "",
                isLocked ? "level-locked" : "level-open",
              ]
                .filter(Boolean)
                .join(" ")}
              style={isLocked ? undefined : { background: bg }}
              onClick={() => !isLocked && onSelectLevel(level)}
              disabled={isLocked}
              aria-label={
                isLocked
                  ? `Level ${level} is locked`
                  : `Level ${level}: ${label}${isCompleted ? " — completed" : ""}`
              }
            >
              {isLocked ? (
                /* ── Locked state ── */
                <>
                  <span className="level-lock-icon">🔒</span>
                  <span className="level-num level-num-locked">{level}</span>
                  <span className="level-locked-label">Locked</span>
                </>
              ) : (
                /* ── Unlocked / completed state ── */
                <>
                  {isCompleted && <span className="level-done-badge">✅</span>}
                  <span className="level-emoji">{emoji}</span>
                  <span className="level-num">{level}</span>
                  <span className="level-label">{label}</span>
                  {isCompleted && (
                    <span className="level-stars" aria-hidden="true">
                      ⭐⭐⭐
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
