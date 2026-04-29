import { useState, useRef, useEffect, useCallback } from "react";
import { makeSound, playCelebration } from "../utils/sound";
import { speakPhrase } from "../utils/speech";
import { getPuzzlesForLevel } from "../data/dotPuzzles";
import Celebration from "./Celebration";
import LevelSelectScreen from "./LevelSelectScreen";

const HIT_RADIUS = 24; // SVG units — generous for small fingers

function svgPoint(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export default function DotGame({
  soundOn,
  dotUnlockedLevel,
  completedPuzzles,
  completedLevels,
  onComplete,
  onBack,
}) {
  const [view, setView] = useState("levels"); // "levels" | "puzzles" | "play"
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [activePuzzle, setActivePuzzle] = useState(null);
  const [connected, setConnected] = useState(0); // how many dots visited
  const [dragging, setDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null); // live finger position in SVG coords
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const svgRef = useRef(null);
  // Refs keep pointer handlers free of stale closure values
  const connectedRef = useRef(0);
  const dotsRef = useRef([]);
  const puzzleRef = useRef(null);
  const hintTimerRef = useRef(null);

  // Start/restart the 3-second idle timer — hint appears only if kid is stuck
  const resetHintTimer = useCallback(() => {
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(true), 3000);
  }, []);

  // Clean up timer when puzzle ends or component unmounts
  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  function startPuzzle(puzzle) {
    setActivePuzzle(puzzle);
    puzzleRef.current = puzzle;
    dotsRef.current = puzzle.dots;
    connectedRef.current = 0;
    setConnected(0);
    setDragging(false);
    setCursorPos(null);
    setDone(false);
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    // Give kid a moment to look at the puzzle before first hint
    hintTimerRef.current = setTimeout(() => setShowHint(true), 3000);
    setView("play");
  }

  function backToLevels() {
    setView("levels");
    setSelectedLevel(null);
    setActivePuzzle(null);
    connectedRef.current = 0;
    setConnected(0);
    setDragging(false);
    setCursorPos(null);
    setDone(false);
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }

  function backToPuzzles() {
    setView("puzzles");
    setActivePuzzle(null);
    connectedRef.current = 0;
    setConnected(0);
    setDragging(false);
    setCursorPos(null);
    setDone(false);
    setShowHint(false);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
  }

  function handlePointerDown(e) {
    if (done) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    e.preventDefault();
    const pos = svgPoint(svgEl, e.clientX, e.clientY);
    const c = connectedRef.current;
    const dots = dotsRef.current;
    // Must start drag near: dot[0] if nothing connected yet, or last connected dot to continue
    const anchorIdx = c === 0 ? 0 : c - 1;
    if (dist(pos, dots[anchorIdx]) <= HIT_RADIUS) {
      svgEl.setPointerCapture(e.pointerId);
      setDragging(true);
      setCursorPos(pos);
      // Snap dot[0] on first touch
      if (c === 0) {
        connectedRef.current = 1;
        setConnected(1);
        makeSound("good", soundOn);
      }
    }
  }

  function handlePointerMove(e) {
    if (!dragging || done) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    e.preventDefault();
    const pos = svgPoint(svgEl, e.clientX, e.clientY);
    setCursorPos(pos);
    const c = connectedRef.current;
    const dots = dotsRef.current;
    if (c >= dots.length) return;
    // Snap the next dot when finger passes over it
    if (dist(pos, dots[c]) <= HIT_RADIUS) {
      const next = c + 1;
      connectedRef.current = next;
      setConnected(next);
      if (next === dots.length) {
        setDone(true);
        setDragging(false);
        setCursorPos(null);
        setShowHint(false);
        if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
        makeSound("great", soundOn);
        playCelebration(soundOn);
        speakPhrase(`You drew a ${puzzleRef.current.name}!`);
        onComplete(puzzleRef.current.id, puzzleRef.current.level);
      } else {
        makeSound("good", soundOn);
        resetHintTimer();
      }
    }
  }

  function handlePointerUp(e) {
    e.preventDefault();
    setDragging(false);
    setCursorPos(null);
  }

  // ── Level select view ──────────────────────────────────
  if (view === "levels") {
    return (
      <LevelSelectScreen
        mode="dot"
        unlockedLevel={dotUnlockedLevel}
        completedLevels={completedLevels ?? []}
        onSelectLevel={(lvl) => {
          setSelectedLevel(lvl);
          setView("puzzles");
        }}
        onBack={onBack}
      />
    );
  }

  // ── Puzzle picker view ─────────────────────────────────
  if (view === "puzzles") {
    const puzzles = getPuzzlesForLevel(selectedLevel);
    return (
      <section className="panel dot-panel">
        <button type="button" className="back-link" onClick={backToLevels}>
          ← Back to Levels
        </button>
        <h2 className="dot-title">🔵 Level {selectedLevel} Puzzles</h2>
        <p className="sub">Pick a picture to draw!</p>
        <div className="dot-puzzle-grid dot-puzzle-grid-lg">
          {puzzles.map((puzzle) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            return (
              <button
                key={puzzle.id}
                type="button"
                className={`dot-puzzle-card${isCompleted ? " completed" : ""}`}
                onClick={() => startPuzzle(puzzle)}
              >
                <span className="dot-puzzle-emoji">{puzzle.emoji}</span>
                <span className="dot-puzzle-name">{puzzle.name}</span>
                {isCompleted && <span className="dot-done-badge">⭐</span>}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  // ── Puzzle play view ───────────────────────────────────
  const { dots, fillColor, name, emoji } = activePuzzle;
  const snappedPoints = dots
    .slice(0, connected)
    .map((d) => `${d.x},${d.y}`)
    .join(" ");
  const polygonPoints = dots.map((d) => `${d.x},${d.y}`).join(" ");
  const lastSnapped = connected > 0 ? dots[connected - 1] : null;

  return (
    <section className="panel dot-panel">
      <div className="dot-game-head">
        <span className="dot-game-mode">
          Dot Game · Level {activePuzzle.level}
        </span>
        <span className="dot-dots-count">
          {connected}/{dots.length} dots
        </span>
      </div>

      <div className="dot-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="dot-svg"
          role="img"
          aria-label={`Draw a line through the dots to draw a ${name}`}
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Filled shape — only visible when done */}
          {done && (
            <polygon
              points={polygonPoints}
              fill={fillColor}
              opacity="0.35"
              className="dot-reveal-fill"
            />
          )}

          {/* Snapped lines so far */}
          {connected > 1 && (
            <polyline
              points={snappedPoints}
              fill="none"
              stroke={fillColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Live trailing line from last snapped dot to finger */}
          {dragging && lastSnapped && cursorPos && !done && (
            <line
              x1={lastSnapped.x}
              y1={lastSnapped.y}
              x2={cursorPos.x}
              y2={cursorPos.y}
              stroke={fillColor}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              opacity="0.6"
            />
          )}

          {/* Close shape when done */}
          {done && (
            <line
              x1={dots[dots.length - 1].x}
              y1={dots[dots.length - 1].y}
              x2={dots[0].x}
              y2={dots[0].y}
              stroke={fillColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Dot circles — pointer-events none so SVG handles them */}
          {dots.map((dot, i) => {
            const isSnapped = i < connected;
            // Only highlight the next dot after the kid has been idle (struggling)
            const isNext = i === connected && !done && showHint;
            return (
              <g key={i} style={{ pointerEvents: "none" }}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isNext ? 14 : 10}
                  fill={isSnapped ? fillColor : isNext ? "#fff" : "#e2e8f0"}
                  stroke={
                    isSnapped ? fillColor : isNext ? fillColor : "#94a3b8"
                  }
                  strokeWidth={isNext ? 3 : 2}
                  className={isNext ? "dot-next-pulse" : ""}
                />
                <text
                  x={dot.x}
                  y={dot.y + 5}
                  textAnchor="middle"
                  fontSize={isNext ? "9" : "8"}
                  fontWeight="bold"
                  fill={isSnapped ? "#fff" : isNext ? fillColor : "#64748b"}
                  style={{ userSelect: "none" }}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {done ? (
        <div className="dot-reveal-banner">
          <Celebration />
          <p className="dot-reveal-text">
            🎉 You drew a <strong>{name}</strong>! {emoji}
          </p>
          <div className="action-grid">
            <button
              type="button"
              className="action action-sight"
              onClick={backToPuzzles}
            >
              More Puzzles
            </button>
            <button
              type="button"
              className="action action-mix"
              onClick={onBack}
            >
              Back Home
            </button>
          </div>
        </div>
      ) : (
        <p className="dot-hint">
          {connected === 0
            ? "Press and drag from dot 1!"
            : dragging
              ? `Keep going… dot ${connected + 1}!`
              : `Lift detected — drag again from dot ${connected}!`}
        </p>
      )}

      <button
        type="button"
        className="back-link"
        style={{ marginTop: "0.5rem" }}
        onClick={backToPuzzles}
      >
        ← Back to Puzzles
      </button>
    </section>
  );
}
