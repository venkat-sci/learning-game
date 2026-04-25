import { useState, useRef } from "react";
import { makeSound } from "../utils/sound";
import { speakPhrase } from "../utils/speech";
import { LETTERS, NUMBERS } from "../data/writeData";

const HIT_RADIUS = 28; // SVG units — generous for small fingers

function svgPoint(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Flatten all strokes into a single sequence of waypoints with stroke boundary info
function buildWaypoints(strokes) {
  const points = [];
  strokes.forEach((stroke, si) => {
    stroke.forEach((pt, pi) => {
      points.push({ ...pt, strokeIdx: si, ptIdx: pi, isStrokeStart: pi === 0 });
    });
  });
  return points;
}

export default function WriteGame({
  soundOn,
  completedChars,
  onComplete,
  onBack,
}) {
  const [tab, setTab] = useState("letters"); // "letters" | "numbers"
  const [view, setView] = useState("select"); // "select" | "trace"
  const [activeChar, setActiveChar] = useState(null);

  // Tracing state
  const [connected, setConnected] = useState(0); // # waypoints visited
  const [dragging, setDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const [done, setDone] = useState(false);

  const svgRef = useRef(null);
  // Refs to avoid stale closures in pointer handlers
  const connectedRef = useRef(0);
  const waypointsRef = useRef([]);
  const charRef = useRef(null);

  function startChar(ch) {
    const waypoints = buildWaypoints(ch.strokes);
    charRef.current = ch;
    waypointsRef.current = waypoints;
    connectedRef.current = 0;
    setActiveChar(ch);
    setConnected(0);
    setDragging(false);
    setCursorPos(null);
    setDone(false);
    setView("trace");
  }

  function backToSelect() {
    setView("select");
    setActiveChar(null);
    connectedRef.current = 0;
    setConnected(0);
    setDragging(false);
    setCursorPos(null);
    setDone(false);
  }

  function handlePointerDown(e) {
    if (done) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    e.preventDefault();
    const pos = svgPoint(svgEl, e.clientX, e.clientY);
    const c = connectedRef.current;
    const waypoints = waypointsRef.current;
    // Must start near: waypoint[0] if nothing yet, or waypoint[c-1] to continue
    const anchorIdx = c === 0 ? 0 : c - 1;
    if (dist(pos, waypoints[anchorIdx]) <= HIT_RADIUS) {
      svgEl.setPointerCapture(e.pointerId);
      setDragging(true);
      setCursorPos(pos);
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
    const waypoints = waypointsRef.current;
    if (c >= waypoints.length) return;
    if (dist(pos, waypoints[c]) <= HIT_RADIUS) {
      const next = c + 1;
      connectedRef.current = next;
      setConnected(next);
      if (next === waypoints.length) {
        // All waypoints done!
        setDone(true);
        setDragging(false);
        setCursorPos(null);
        makeSound("great", soundOn);
        const ch = charRef.current;
        const phrase =
          ch.type === "letter"
            ? `You wrote the letter ${ch.label}!`
            : `You wrote the number ${ch.label}!`;
        speakPhrase(phrase);
        onComplete(ch.id);
      } else {
        makeSound("good", soundOn);
      }
    }
  }

  function handlePointerUp(e) {
    e.preventDefault();
    setDragging(false);
    setCursorPos(null);
  }

  // ── Select view ──────────────────────────────────────────
  if (view === "select") {
    const list = tab === "letters" ? LETTERS : NUMBERS;
    return (
      <section className="panel write-panel">
        <h2 className="write-title">✏️ Write Game</h2>
        <p className="sub">Trace the dotted letters and numbers!</p>

        <div className="write-tab-bar">
          <button
            type="button"
            className={`write-tab${tab === "letters" ? " active" : ""}`}
            onClick={() => setTab("letters")}
          >
            🔤 Letters
          </button>
          <button
            type="button"
            className={`write-tab${tab === "numbers" ? " active" : ""}`}
            onClick={() => setTab("numbers")}
          >
            🔢 Numbers
          </button>
        </div>

        <div className="write-char-grid">
          {list.map((ch) => {
            const done = completedChars.includes(ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                className={`write-char-card${done ? " completed" : ""}`}
                style={{ "--char-color": ch.color }}
                onClick={() => startChar(ch)}
              >
                <span className="write-char-label" style={{ color: ch.color }}>
                  {ch.label}
                </span>
                {done && <span className="write-done-badge">✅</span>}
              </button>
            );
          })}
        </div>

        <button type="button" className="back-link" onClick={onBack}>
          ← Back Home
        </button>
      </section>
    );
  }

  // ── Trace view ───────────────────────────────────────────
  const waypoints = waypointsRef.current;
  const color = activeChar.color;
  const totalStrokes = activeChar.strokes.length;

  // Build per-stroke polyline points from connected waypoints
  const strokePolylines = [];
  let wi = 0;
  activeChar.strokes.forEach((stroke, si) => {
    const pts = [];
    stroke.forEach(() => {
      if (wi < connected) {
        pts.push(waypoints[wi]);
      }
      wi++;
    });
    if (pts.length > 1) {
      strokePolylines.push({ si, pts });
    }
  });

  const lastSnapped = connected > 0 ? waypoints[connected - 1] : null;
  // Show trailing line from last snapped point to cursor whenever dragging
  const showTrail = dragging && lastSnapped && cursorPos && !done;

  // Hint text
  let hintText;
  if (connected === 0) {
    hintText = "Press and drag the arrow to start!";
  } else if (done) {
    hintText = "";
  } else if (dragging) {
    hintText = "Great! Keep following the dotted path!";
  } else {
    const nextWpIdx = connected < waypoints.length ? connected : connected - 1;
    const nextStrokeStart = waypoints[nextWpIdx]?.isStrokeStart;
    if (nextStrokeStart) {
      hintText = "Lift ✓ — Tap the arrow to start the next part!";
    } else {
      hintText = "Tap and drag the arrow to keep going!";
    }
  }

  return (
    <section className="panel write-panel">
      <div className="write-game-head">
        <span className="write-game-mode">
          ✏️ Write Game &nbsp;·&nbsp;{" "}
          {activeChar.type === "letter" ? "Letter" : "Number"}
        </span>
        <span className="write-char-big" style={{ color }}>
          {activeChar.label}
        </span>
      </div>

      <div className="write-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="write-svg"
          role="img"
          aria-label={`Trace the ${activeChar.type === "letter" ? "letter" : "number"} ${activeChar.label}`}
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background guide letter — faint while tracing, reveals on completion */}
          <text
            x="100"
            y="160"
            textAnchor="middle"
            fontSize="170"
            fontWeight="900"
            fontFamily="'Baloo 2', 'Nunito', sans-serif"
            fill={color}
            opacity={done ? "0.82" : "0.07"}
            className={done ? "write-letter-reveal" : ""}
            style={{ pointerEvents: "none", transition: "opacity 0.9s ease" }}
          >
            {activeChar.label}
          </text>

          {/* Dotted guide lines along all strokes (show all waypoints as dashed path) */}
          {activeChar.strokes.map((stroke, si) => {
            const pts = stroke.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <polyline
                key={`guide-${si}`}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
                opacity="0.2"
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* Completed stroke polylines */}
          {strokePolylines.map(({ si, pts }) => (
            <polyline
              key={`stroke-${si}`}
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Live trailing line from last snapped point to current finger */}
          {showTrail && (
            <line
              x1={lastSnapped.x}
              y1={lastSnapped.y}
              x2={cursorPos.x}
              y2={cursorPos.y}
              stroke={color}
              strokeWidth="3"
              strokeDasharray="6 4"
              strokeLinecap="round"
              opacity="0.65"
            />
          )}

          {/* Future waypoints — tiny dots marking the path */}
          {waypoints.map((wp, i) => {
            if (i < connected) return null; // completed — stroke line covers it
            const isNext = i === connected && !done;
            if (isNext) return null; // rendered below separately
            // Stroke restart marker
            if (wp.isStrokeStart && wp.strokeIdx > 0) {
              return (
                <g key={i} style={{ pointerEvents: "none" }}>
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={7}
                    fill="#fff"
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.75}
                  />
                  <text
                    x={wp.x}
                    y={wp.y + 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill={color}
                    opacity={0.85}
                  >
                    ▶
                  </text>
                </g>
              );
            }
            // Generic future waypoint — tiny dot so the path is visible
            return (
              <circle
                key={i}
                cx={wp.x}
                cy={wp.y}
                r={3}
                fill="#d1d5db"
                stroke="#9ca3af"
                strokeWidth={1}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* Directional arrow — follows cursor while dragging, sits at next waypoint otherwise */}
          {!done &&
            connected < waypoints.length &&
            (() => {
              const targetWp = waypoints[connected];
              let ax, ay, angle;

              if (dragging && cursorPos) {
                // Arrow travels with the finger, pointing toward next waypoint
                ax = cursorPos.x;
                ay = cursorPos.y;
                const dx = targetWp.x - cursorPos.x;
                const dy = targetWp.y - cursorPos.y;
                // If very close to target, keep last angle stable
                const d = Math.sqrt(dx * dx + dy * dy);
                angle = d < 4 ? 0 : Math.atan2(dy, dx) * (180 / Math.PI);
              } else {
                // Arrow sits at next waypoint, points along the path
                ax = targetWp.x;
                ay = targetWp.y;
                const after = waypoints[connected + 1];
                const before = connected > 0 ? waypoints[connected - 1] : null;
                const dx = after
                  ? after.x - targetWp.x
                  : before
                    ? targetWp.x - before.x
                    : 1;
                const dy = after
                  ? after.y - targetWp.y
                  : before
                    ? targetWp.y - before.y
                    : 0;
                angle = Math.atan2(dy, dx) * (180 / Math.PI);
              }

              const isStart = connected === 0 && !dragging;
              const isMoving = dragging && cursorPos;

              return (
                <g style={{ pointerEvents: "none" }}>
                  <circle
                    cx={ax}
                    cy={ay}
                    r={isStart ? 16 : 13}
                    fill={isMoving ? color : isStart ? color : "#fff"}
                    stroke={color}
                    strokeWidth={isStart || isMoving ? 0 : 2.5}
                    className={isMoving ? "" : "write-next-pulse"}
                    opacity={isMoving ? 0.85 : 1}
                  />
                  <g transform={`translate(${ax},${ay}) rotate(${angle})`}>
                    <line
                      x1="-6"
                      y1="0"
                      x2="5"
                      y2="0"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="2,-3.5 5,0 2,3.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              );
            })()}
        </svg>
      </div>

      {done ? (
        <div className="write-reveal-banner">
          <div className="confetti" aria-hidden="true" />
          <p className="write-reveal-text">
            🎉 You wrote <strong style={{ color }}>{activeChar.label}</strong>!
          </p>
          <div className="action-grid">
            <button
              type="button"
              className="action action-sight"
              onClick={backToSelect}
            >
              More Letters
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
        <p className="write-hint">{hintText}</p>
      )}

      <button
        type="button"
        className="back-link"
        style={{ marginTop: "0.5rem" }}
        onClick={backToSelect}
      >
        ← Back to {activeChar.type === "letter" ? "Letters" : "Numbers"}
      </button>
    </section>
  );
}
