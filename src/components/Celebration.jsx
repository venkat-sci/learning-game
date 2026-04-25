const CELEBRATE_EMOJIS = ["🌟", "🎉", "⭐", "✨", "🎊", "💫", "🌈", "🎈"];
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * 360;
  const rad = (angle * Math.PI) / 180;
  const d = 55 + (i % 4) * 18;
  return {
    emoji: CELEBRATE_EMOJIS[i % CELEBRATE_EMOJIS.length],
    tx: Math.cos(rad) * d,
    ty: Math.sin(rad) * d,
    delay: (i % 5) * 0.06,
    size: 1.1 + (i % 3) * 0.25,
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
