import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { buildSightRound, buildMathRound } from "./utils/rounds";
import { makeSound } from "./utils/sound";
import { speakEncouragement, speakWordAndSpell } from "./utils/speech";
import TopBar from "./components/TopBar";
import HomeScreen from "./components/HomeScreen";
import GameScreen from "./components/GameScreen";
import RewardScreen from "./components/RewardScreen";
import ProgressScreen from "./components/ProgressScreen";
import DotGame from "./components/DotGame";
import WriteGame from "./components/WriteGame";
import { getPuzzlesForLevel } from "./data/dotPuzzles";

const DEFAULT_PROGRESS = {
  stars: 0,
  sessions: 0,
  sight: { correct: 0, total: 0, bestStreak: 0, masteredWords: [] },
  math: { correct: 0, total: 0, bestStreak: 0 },
  dot: { unlockedLevel: 1, completedPuzzles: [] },
  write: { completedChars: [] },
};

function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("sight");
  const [level, setLevel] = useState(1);
  const [roundIndex, setRoundIndex] = useState(1);
  const [gameId, setGameId] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [pulse, setPulse] = useState("");
  const [round, setRound] = useState(() => buildSightRound(1));
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem("learning-game-progress");
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  const totalRounds = 10;

  useEffect(() => {
    localStorage.setItem("learning-game-progress", JSON.stringify(progress));
  }, [progress]);

  const accuracy = useMemo(() => {
    const { correct, total } =
      mode === "sight" ? progress.sight : progress.math;
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }, [mode, progress]);

  function startGame(nextMode) {
    if (nextMode === "dot") {
      setScreen("dot");
      return;
    }
    if (nextMode === "write") {
      setScreen("write");
      return;
    }
    setMode(nextMode);
    setLevel(1);
    setRoundIndex(1);
    setGameId((g) => g + 1);
    setStreak(0);
    setFeedback("");
    setRound(nextMode === "sight" ? buildSightRound(1) : buildMathRound(1));
    setScreen("game");
  }

  function completeWriteChar(charId) {
    setProgress((prev) => {
      const write = prev.write ?? { completedChars: [] };
      const alreadyDone = write.completedChars.includes(charId);
      return {
        ...prev,
        stars: prev.stars + (alreadyDone ? 0 : 1),
        write: {
          completedChars: alreadyDone
            ? write.completedChars
            : [...write.completedChars, charId],
        },
      };
    });
  }

  function completeDotPuzzle(puzzleId, level) {
    setProgress((prev) => {
      const dot = prev.dot ?? { unlockedLevel: 1, completedPuzzles: [] };
      const alreadyDone = dot.completedPuzzles.includes(puzzleId);
      const completedPuzzles = alreadyDone
        ? dot.completedPuzzles
        : [...dot.completedPuzzles, puzzleId];
      // Unlock next level if all puzzles in current level are done
      const levelPuzzles = getPuzzlesForLevel(level);
      const allLevelDone = levelPuzzles.every((p) =>
        completedPuzzles.includes(p.id),
      );
      const unlockedLevel = allLevelDone
        ? Math.min(4, Math.max(dot.unlockedLevel, level + 1))
        : dot.unlockedLevel;
      return {
        ...prev,
        stars: prev.stars + (alreadyDone ? 0 : 2),
        dot: { unlockedLevel, completedPuzzles },
      };
    });
  }

  function nextRound(nextLevel) {
    if (roundIndex >= totalRounds) {
      setProgress((prev) => ({ ...prev, sessions: prev.sessions + 1 }));
      speakEncouragement();
      setScreen("reward");
      return;
    }
    setRoundIndex((prev) => prev + 1);
    const resolvedLevel = Math.max(1, Math.min(3, nextLevel));
    setLevel(resolvedLevel);
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
      if (mode === "sight") {
        // Spell the word aloud, then advance only when speech finishes
        speakWordAndSpell(round.target, () => {
          setPulse("");
          nextRound(nextLevel);
        });
      } else {
        setTimeout(() => {
          setPulse("");
          nextRound(nextLevel);
        }, 700);
      }
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
      setTimeout(() => {
        setPulse("");
        nextRound(nextLevel);
      }, 700);
    }
  }

  function resetProgress() {
    setProgress(DEFAULT_PROGRESS);
    setScreen("home");
  }

  return (
    <main className="app-shell">
      <div className="bg-blob bg-blob-1" aria-hidden="true"></div>
      <div className="bg-blob bg-blob-2" aria-hidden="true"></div>

      <TopBar
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((p) => !p)}
        onShowProgress={() => setScreen("progress")}
      />

      {screen === "home" && (
        <HomeScreen progress={progress} onStartGame={startGame} />
      )}

      {screen === "game" && (
        <GameScreen
          key={`${gameId}-${roundIndex}`}
          mode={mode}
          level={level}
          roundIndex={roundIndex}
          totalRounds={totalRounds}
          round={round}
          pulse={pulse}
          feedback={feedback}
          streak={streak}
          accuracy={accuracy}
          stars={progress.stars}
          onAnswer={resolveAnswer}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "reward" && (
        <RewardScreen
          progress={progress}
          streak={streak}
          onPlayAgain={() => startGame(mode)}
          onViewProgress={() => setScreen("progress")}
        />
      )}

      {screen === "progress" && (
        <ProgressScreen
          progress={progress}
          onHome={() => setScreen("home")}
          onReset={resetProgress}
        />
      )}

      {screen === "dot" && (
        <DotGame
          soundOn={soundOn}
          dotUnlockedLevel={progress.dot?.unlockedLevel ?? 1}
          completedPuzzles={progress.dot?.completedPuzzles ?? []}
          onComplete={completeDotPuzzle}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "write" && (
        <WriteGame
          soundOn={soundOn}
          completedChars={progress.write?.completedChars ?? []}
          onComplete={completeWriteChar}
          onBack={() => setScreen("home")}
        />
      )}
    </main>
  );
}

export default App;
