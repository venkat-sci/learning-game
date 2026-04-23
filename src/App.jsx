import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const SIGHT_WORDS = [
  "the",
  "and",
  "is",
  "it",
  "you",
  "we",
  "can",
  "go",
  "see",
  "play",
  "look",
  "little",
  "big",
  "come",
  "here",
  "jump",
  "run",
  "like",
  "my",
  "to",
];

const DEFAULT_PROGRESS = {
  stars: 0,
  sessions: 0,
  sight: { correct: 0, total: 0, bestStreak: 0, masteredWords: [] },
  math: { correct: 0, total: 0, bestStreak: 0 },
};

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function makeSound(type, enabled = true) {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  if (type === "good") osc.frequency.value = 700;
  if (type === "great") osc.frequency.value = 900;
  if (type === "oops") osc.frequency.value = 240;

  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.start(now);
  osc.stop(now + 0.2);
  setTimeout(() => ctx.close(), 260);
}

function buildSightRound(level) {
  const target = randomFrom(SIGHT_WORDS);
  const pool = SIGHT_WORDS.filter((word) => word !== target);
  const optionsCount = level === 3 ? 6 : 4;
  const decoys = shuffled(pool).slice(0, optionsCount - 1);
  return { target, options: shuffled([target, ...decoys]) };
}

function buildMathRound(level) {
  const max = level === 1 ? 5 : level === 2 ? 10 : 15;
  const useSubtract = level >= 2 && Math.random() > 0.45;
  let a = Math.ceil(Math.random() * max);
  let b = Math.ceil(Math.random() * max);

  if (useSubtract && b > a) {
    [a, b] = [b, a];
  }

  const answer = useSubtract ? a - b : a + b;
  const prompt = `${a} ${useSubtract ? "-" : "+"} ${b} = ?`;

  const choices = new Set([answer]);
  while (choices.size < 4) {
    const drift = Math.ceil(Math.random() * 3);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(0, answer + drift * sign);
    choices.add(next);
  }

  return { prompt, answer, options: shuffled(Array.from(choices)) };
}

function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("sight");
  const [level, setLevel] = useState(1);
  const [roundIndex, setRoundIndex] = useState(1);
  const [streak, setStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [pulse, setPulse] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedResult, setSelectedResult] = useState("");
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [optionOffsets, setOptionOffsets] = useState({});
  const [dragState, setDragState] = useState(null);
  const [round, setRound] = useState(() => buildSightRound(1));
  const optionRefs = useRef({});
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("learning-game-progress");
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  const totalRounds = 10;

  useEffect(() => {
    localStorage.setItem("learning-game-progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const nextOffsets = {};
    round.options.forEach((option, index) => {
      nextOffsets[`${option}-${index}`] = 0;
    });
    setOptionOffsets(nextOffsets);
    setDragState(null);
  }, [round]);

  const accuracy = useMemo(() => {
    const { correct, total } =
      mode === "sight" ? progress.sight : progress.math;
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }, [mode, progress]);

  function startGame(nextMode) {
    setMode(nextMode);
    setLevel(1);
    setRoundIndex(1);
    setStreak(0);
    setFeedback("");
    setSelectedOptionId(null);
    setSelectedResult("");
    setIsAnswerLocked(false);
    setRound(nextMode === "sight" ? buildSightRound(1) : buildMathRound(1));
    setScreen("game");
  }

  function speakWord() {
    if (mode !== "sight" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(round.target);
    utter.rate = 0.8;
    utter.pitch = 1.25;
    speechSynthesis.speak(utter);
  }

  function nextRound(nextLevel) {
    if (roundIndex >= totalRounds) {
      setProgress((prev) => ({ ...prev, sessions: prev.sessions + 1 }));
      setScreen("reward");
      return;
    }

    setRoundIndex((prev) => prev + 1);
    const resolvedLevel = Math.max(1, Math.min(3, nextLevel));
    setLevel(resolvedLevel);
    setSelectedOptionId(null);
    setSelectedResult("");
    setIsAnswerLocked(false);
    setRound(
      mode === "sight"
        ? buildSightRound(resolvedLevel)
        : buildMathRound(resolvedLevel),
    );
    setFeedback("");
  }

  function resolveAnswer(value) {
    const isCorrect =
      mode === "sight" ? value === round.target : value === round.answer;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setStreak(nextStreak);

    const rise = nextStreak >= 3;
    const drop = !isCorrect && streak > 0;
    const nextLevel = rise ? level + 1 : drop ? level - 1 : level;

    if (isCorrect) {
      setPulse("win");
      setFeedback("Great job! Keep going!");
      makeSound(nextStreak >= 3 ? "great" : "good", soundOn);
      setProgress((prev) => {
        const base = {
          ...prev,
          stars: prev.stars + (nextStreak >= 3 ? 3 : 2),
        };

        if (mode === "sight") {
          const mastered = prev.sight.masteredWords.includes(round.target)
            ? prev.sight.masteredWords
            : [...prev.sight.masteredWords, round.target];
          return {
            ...base,
            sight: {
              ...prev.sight,
              correct: prev.sight.correct + 1,
              total: prev.sight.total + 1,
              bestStreak: Math.max(prev.sight.bestStreak, nextStreak),
              masteredWords: mastered,
            },
          };
        }

        return {
          ...base,
          math: {
            ...prev.math,
            correct: prev.math.correct + 1,
            total: prev.math.total + 1,
            bestStreak: Math.max(prev.math.bestStreak, nextStreak),
          },
        };
      });
    } else {
      setPulse("oops");
      setFeedback(
        mode === "sight"
          ? `Try again: ${round.target}`
          : `Answer is ${round.answer}`,
      );
      makeSound("oops", soundOn);
      setProgress((prev) => {
        if (mode === "sight") {
          return {
            ...prev,
            sight: { ...prev.sight, total: prev.sight.total + 1 },
          };
        }
        return {
          ...prev,
          math: { ...prev.math, total: prev.math.total + 1 },
        };
      });
    }

    setTimeout(() => {
      setPulse("");
      nextRound(nextLevel);
    }, 700);
  }

  function submitAnswer(optionId, value) {
    if (isAnswerLocked) return;

    setSelectedOptionId(optionId);
    setSelectedResult("");
    setIsAnswerLocked(true);
    setDragState(null);

    window.setTimeout(() => {
      const isCorrect =
        mode === "sight" ? value === round.target : value === round.answer;
      setSelectedResult(isCorrect ? "correct" : "wrong");
      resolveAnswer(value);
    }, 450);
  }

  function getMaxSlide(optionId) {
    const optionEl = optionRefs.current[optionId];
    if (!optionEl) return 0;
    return Math.max(0, optionEl.offsetWidth - 70);
  }

  function handleDragStart(optionId, event) {
    if (isAnswerLocked) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      optionId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: optionOffsets[optionId] || 0,
    });
  }

  function handleDragMove(optionId, optionValue, event) {
    if (!dragState || dragState.optionId !== optionId || isAnswerLocked) return;

    const maxSlide = getMaxSlide(optionId);
    if (maxSlide <= 0) return;

    const deltaX = event.clientX - dragState.startX;
    const rawOffset = dragState.startOffset + deltaX;
    const clampedOffset = Math.max(0, Math.min(maxSlide, rawOffset));
    const progress = clampedOffset / maxSlide;

    setOptionOffsets((prev) => ({ ...prev, [optionId]: clampedOffset }));

    if (progress >= 0.92) {
      setOptionOffsets((prev) => ({ ...prev, [optionId]: maxSlide }));
      submitAnswer(optionId, optionValue);
    }
  }

  function handleDragEnd(optionId, event) {
    if (dragState?.optionId !== optionId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!isAnswerLocked) {
      setOptionOffsets((prev) => ({ ...prev, [optionId]: 0 }));
    }
    setDragState(null);
  }

  function resetProgress() {
    setProgress(DEFAULT_PROGRESS);
    setScreen("home");
  }

  return (
    <main className="app-shell">
      <div className="bg-blob bg-blob-1" aria-hidden="true"></div>
      <div className="bg-blob bg-blob-2" aria-hidden="true"></div>

      <header className="top-bar">
        <h1>Spark Garden</h1>
        <div className="top-bar-actions">
          <button
            className="toggle toggle-progress"
            type="button"
            onClick={() => setScreen("progress")}
          >
            📊 Progress
          </button>
          <button
            className="toggle"
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      {screen === "home" && (
        <section className="panel home-panel">
          <p className="chip">Kindergarten • Sight Words + Math</p>
          <h2>Play, Learn, and Grow Every Day</h2>
          <p className="sub">
            15-minute fun sessions with game challenges, friendly sounds, and
            rich animations.
          </p>

          <div className="game-card-grid">
            <button
              type="button"
              className="game-card game-card-sight"
              onClick={() => startGame("sight")}
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
              onClick={() => startGame("math")}
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
          </div>

          <div className="summary-bar">
            <span>Stars: {progress.stars}</span>
            <span>Sessions: {progress.sessions}</span>
            <span>Sight Mastered: {progress.sight.masteredWords.length}</span>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className={`panel game-panel ${pulse}`}>
          <div className="game-head">
            <p>
              {mode === "sight" ? "Sight Words" : "Math Challenge"} • Round{" "}
              {roundIndex}/{totalRounds}
            </p>
            <p>Level {level}</p>
          </div>

          <h3 className="prompt">
            {mode === "sight" ? `Tap the word: ${round.target}` : round.prompt}
          </h3>

          {mode === "sight" && (
            <button className="hear-btn" type="button" onClick={speakWord}>
              Hear the word
            </button>
          )}

          <div className={`options options-${mode}`}>
            {round.options.map((option, index) => {
              const optionId = `${option}-${index}`;
              const offset = optionOffsets[optionId] || 0;

              return (
                <button
                  key={optionId}
                  ref={(el) => {
                    optionRefs.current[optionId] = el;
                  }}
                  type="button"
                  className={[
                    "option",
                    selectedOptionId === optionId &&
                    selectedResult === "correct"
                      ? "option-correct"
                      : "",
                    selectedOptionId === optionId && selectedResult === "wrong"
                      ? "option-wrong"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ "--slide-x": `${offset}px` }}
                  disabled={isAnswerLocked}
                >
                  <span className="option-slider" aria-hidden="true"></span>
                  <span
                    className="option-handle"
                    aria-hidden="true"
                    onPointerDown={(event) => handleDragStart(optionId, event)}
                    onPointerMove={(event) =>
                      handleDragMove(optionId, option, event)
                    }
                    onPointerUp={(event) => handleDragEnd(optionId, event)}
                    onPointerCancel={(event) => handleDragEnd(optionId, event)}
                  >
                    ⇢
                  </span>
                  <span className="option-label">{option}</span>
                </button>
              );
            })}
          </div>

          <p className="feedback">
            {feedback || "Slide the side bar to answer!"}
          </p>
          <div className="summary-bar">
            <span>Streak: {streak}</span>
            <span>Accuracy: {accuracy}%</span>
            <span>Stars: {progress.stars}</span>
          </div>
          <button
            type="button"
            className="back-link"
            onClick={() => setScreen("home")}
          >
            Back Home
          </button>
        </section>
      )}

      {screen === "reward" && (
        <section className="panel reward-panel">
          <div className="confetti" aria-hidden="true"></div>
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
              onClick={() => startGame(mode)}
            >
              Play Again
            </button>
            <button
              type="button"
              className="action action-mix"
              onClick={() => setScreen("progress")}
            >
              View Progress
            </button>
          </div>
        </section>
      )}

      {screen === "progress" && (
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
            <button
              type="button"
              className="action action-math"
              onClick={() => setScreen("home")}
            >
              Home
            </button>
            <button
              type="button"
              className="action action-mix"
              onClick={resetProgress}
            >
              Reset Progress
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
