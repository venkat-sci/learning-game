const CELEBRATE_EMOJIS = ["🌟", "🎉", "⭐", "✨", "🎊", "💫", "🌈", "🎈"];
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * 360;
  const rad = (angle * Math.PI) / 180;
  const d = 80 + (i % 4) * 25;
  return {
    emoji: CELEBRATE_EMOJIS[i % CELEBRATE_EMOJIS.length],
    tx: Math.cos(rad) * d,
    ty: Math.sin(rad) * d,
    delay: (i % 5) * 0.04,
    size: 1.3 + (i % 3) * 0.3,
    spin: (i % 2 === 0 ? 1 : -1) * (90 + (i % 3) * 60),
  };
});

export default function Celebration() {
  return (
    <div className="celebrate-wrap" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="celebrate-piece"
          style={{
            "--tx": `${p.tx.toFixed(1)}px`,
            "--ty": `${p.ty.toFixed(1)}px`,
            "--spin": `${p.spin}deg`,
            "--delay": `${p.delay}s`,
            fontSize: `${p.size}rem`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
