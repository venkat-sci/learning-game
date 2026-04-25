// Joyful ascending arpeggio played on letter/number completion
export function playCelebration(enabled = true) {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  // C5 → E5 → G5 → C6 rising arpeggio, then a final chord shimmer
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i === notes.length - 1 ? "sine" : "triangle";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = ctx.currentTime + i * 0.13;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.start(start);
    osc.stop(start + 0.32);
  });
  setTimeout(() => ctx.close(), 1400);
}

export function makeSound(type, enabled = true) {
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
