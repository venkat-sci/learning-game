import { useCallback, useEffect, useRef, useState } from "react";

// Rainbow hue cycle — shifts as the user draws
let globalHue = 0;

const PALETTE = [
  { id: "rainbow", label: "🌈", color: null }, // special: hue-cycles
  { id: "pink", label: "🩷", color: "#f472b6" },
  { id: "sky", label: "🩵", color: "#38bdf8" },
  { id: "lime", label: "💚", color: "#86efac" },
  { id: "gold", label: "💛", color: "#fde047" },
  { id: "purple", label: "💜", color: "#c084fc" },
  { id: "white", label: "🤍", color: "#ffffff" },
];

const BRUSHES = [
  { id: "sm", label: "S", size: 4 },
  { id: "md", label: "M", size: 10 },
  { id: "lg", label: "L", size: 20 },
];

function hsl(h) {
  return `hsl(${h % 360}, 100%, 60%)`;
}

// Spawn a batch of sparkle particles at (x, y)
function spawnParticles(canvas, x, y, color) {
  const ctx = canvas.getContext("2d");
  const count = 7;
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      r: 1.5 + Math.random() * 2,
      color,
    });
  }

  let frame;
  function animate() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.09; // gravity
      p.alpha -= 0.038;
      if (p.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      // tiny cross sparkle
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(p.x - p.r * 2, p.y);
      ctx.lineTo(p.x + p.r * 2, p.y);
      ctx.moveTo(p.x, p.y - p.r * 2);
      ctx.lineTo(p.x, p.y + p.r * 2);
      ctx.stroke();
      ctx.restore();
    });

    if (particles.some((p) => p.alpha > 0)) {
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
    }
  }
  frame = requestAnimationFrame(animate);
}

export default function GlitterSlate({ onBack }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [colorId, setColorId] = useState("rainbow");
  const [brushId, setBrushId] = useState("md");

  const selectedColor = PALETTE.find((p) => p.id === colorId) ?? PALETTE[0];
  const selectedBrush = BRUSHES.find((b) => b.id === brushId) ?? BRUSHES[1];

  // Resize canvas to match its CSS display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      const saved = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").putImageData(saved, 0, 0);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] ?? e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  function currentColor() {
    if (selectedColor.id === "rainbow") {
      globalHue = (globalHue + 3) % 360;
      return hsl(globalHue);
    }
    return selectedColor.color;
  }

  const drawSegment = useCallback(
    (from, to) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const color = currentColor();
      const size = selectedBrush.size;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();

      // Glitter dots along the line
      const steps = Math.ceil(
        Math.hypot(to.x - from.x, to.y - from.y) / (size * 1.8),
      );
      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const gx =
          from.x + (to.x - from.x) * t + (Math.random() - 0.5) * size * 1.6;
        const gy =
          from.y + (to.y - from.y) * t + (Math.random() - 0.5) * size * 1.6;
        const glitterColor = hsl((globalHue + i * 18) % 360);
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        ctx.fillStyle = glitterColor;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.8 + Math.random() * 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Occasional sparkle burst every ~30px of movement
      if (Math.hypot(to.x - from.x, to.y - from.y) > 28) {
        spawnParticles(canvas, to.x, to.y, color);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedBrush, colorId],
  );

  function startDraw(e) {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e, canvasRef.current);
    lastPos.current = pos;
    // Draw a dot immediately
    drawSegment(pos, pos);
    // Always spawn a burst on first touch
    spawnParticles(canvasRef.current, pos.x, pos.y, currentColor());
  }

  function draw(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getPos(e, canvasRef.current);
    drawSegment(lastPos.current, pos);
    lastPos.current = pos;
  }

  function stopDraw(e) {
    e?.preventDefault();
    isDrawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <section className="glitter-slate-panel panel">
      {/* Header */}
      <div className="glitter-header">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back
        </button>
        <h2 className="glitter-title">✨ Magic Glitter Slate</h2>
        <button
          type="button"
          className="glitter-clear-btn"
          onClick={clearCanvas}
        >
          🗑 Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="glitter-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="glitter-canvas"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={stopDraw}
          onPointerCancel={stopDraw}
          onPointerLeave={stopDraw}
          style={{ touchAction: "none", cursor: "crosshair" }}
        />
      </div>

      {/* Controls */}
      <div className="glitter-controls">
        {/* Color palette */}
        <div className="glitter-palette">
          {PALETTE.map((p) => (
            <button
              key={p.id}
              type="button"
              title={p.id}
              aria-label={p.id}
              className={`glitter-color-btn${colorId === p.id ? " selected" : ""}`}
              style={
                p.color
                  ? { background: p.color }
                  : {
                      background:
                        "conic-gradient(red, orange, yellow, lime, cyan, blue, violet, red)",
                    }
              }
              onClick={() => setColorId(p.id)}
            >
              {colorId === p.id && (
                <span className="glitter-color-check">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Brush sizes */}
        <div className="glitter-brushes">
          {BRUSHES.map((b) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Brush size ${b.label}`}
              className={`glitter-brush-btn${brushId === b.id ? " selected" : ""}`}
              onClick={() => setBrushId(b.id)}
            >
              <span
                className="glitter-brush-dot"
                style={{ width: b.size + 4, height: b.size + 4 }}
              />
              <span className="glitter-brush-label">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
