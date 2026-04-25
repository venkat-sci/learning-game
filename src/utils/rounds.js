import { SIGHT_WORDS_BY_LEVEL } from "../data/sightWords";

export function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function buildOffsets(round) {
  const offsets = {};
  round.options.forEach((option, index) => {
    offsets[`${option}-${index}`] = 0;
  });
  return offsets;
}

export function buildSightRound(level) {
  const wordPool = SIGHT_WORDS_BY_LEVEL[level] ?? SIGHT_WORDS_BY_LEVEL[1];
  const target = randomFrom(wordPool);
  // Decoys: first pull from same level, then from other levels to fill gaps
  const sameLevel = wordPool.filter((w) => w !== target);
  const otherLevels = Object.entries(SIGHT_WORDS_BY_LEVEL)
    .filter(([l]) => Number(l) !== level)
    .flatMap(([, words]) => words);
  const decoyPool = [...sameLevel, ...otherLevels];
  const optionsCount = level === 3 ? 6 : level === 2 ? 5 : 4;
  const decoys = shuffled(decoyPool).slice(0, optionsCount - 1);
  return { target, options: shuffled([target, ...decoys]) };
}

export function buildMathRound(level) {
  let prompt, answer;

  if (level === 3 && Math.random() > 0.4) {
    // Level 3: simple multiplication (×2 through ×5)
    const multiplier = Math.ceil(Math.random() * 4) + 1; // 2–5
    const multiplicand = Math.ceil(Math.random() * 10); // 1–10
    answer = multiplier * multiplicand;
    prompt = `${multiplicand} × ${multiplier} = ?`;
  } else {
    const max = level === 1 ? 5 : level === 2 ? 10 : 20;
    const useSubtract = level >= 2 && Math.random() > 0.45;
    let a = Math.ceil(Math.random() * max);
    let b = Math.ceil(Math.random() * max);
    if (useSubtract && b > a) {
      [a, b] = [b, a];
    }
    answer = useSubtract ? a - b : a + b;
    prompt = `${a} ${useSubtract ? "-" : "+"} ${b} = ?`;
  }

  const optionsCount = level === 3 ? 5 : 4;
  const choices = new Set([answer]);
  while (choices.size < optionsCount) {
    const drift = Math.ceil(Math.random() * 4);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(0, answer + drift * sign);
    choices.add(next);
  }

  return { prompt, answer, options: shuffled(Array.from(choices)) };
}
