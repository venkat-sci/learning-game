// --- Singleton AudioContext -------------------------------------------
// Mobile browsers (iOS Safari, Android Chrome) start a new AudioContext
// in "suspended" state. Re-creating the context on every sound call means
// the context never gets a chance to resume before audio is scheduled.
// Solution: one shared context, always resumed before use.

let _audioCtx = null;

function getAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  // Re-use existing context; recreate only if it was explicitly closed.
  if (!_audioCtx || _audioCtx.state === "closed") {
    _audioCtx = new AudioCtx();
  }
  return _audioCtx;
}

/**
 * Resume the shared context (required after user-gesture unlock on iOS)
 * then invoke `play(ctx)` once the context is actually running.
 */
function withCtx(play) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().then(() => play(ctx));
  } else {
    play(ctx);
  }
}

// Joyful ascending arpeggio played on letter/number completion
export function playCelebration(enabled = true) {
  if (!enabled) return;
  withCtx((ctx) => {
    // C5 → E5 → G5 → C6 rising arpeggio, then a final chord shimmer
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    // Small offset so audio starts after context is guaranteed running
    const offset = ctx.currentTime + 0.05;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === notes.length - 1 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = offset + i * 0.13;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.13, start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.start(start);
      osc.stop(start + 0.32);
    });
  });
}

export function makeSound(type, enabled = true) {
  if (!enabled) return;
  withCtx((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (type === "good") osc.frequency.value = 700;
    if (type === "great") osc.frequency.value = 900;
    if (type === "oops") osc.frequency.value = 240;

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Small offset to guarantee context is running on iOS
    const start = ctx.currentTime + 0.05;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.25);
  });
}
