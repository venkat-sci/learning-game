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
