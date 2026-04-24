import { SIGHT_WORDS } from "../data/sightWords";

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
  const target = randomFrom(SIGHT_WORDS);
  const pool = SIGHT_WORDS.filter((word) => word !== target);
  const optionsCount = level === 3 ? 6 : 4;
  const decoys = shuffled(pool).slice(0, optionsCount - 1);
  return { target, options: shuffled([target, ...decoys]) };
}

export function buildMathRound(level) {
  const max = level === 1 ? 5 : level === 2 ? 10 : 15;
  const useSubtract = level >= 2 && Math.random() > 0.45;
  let a = Math.ceil(Math.random() * max);
  let b = Math.ceil(Math.random() * max);

  if (useSubtract && b > a) {
    [a, b] = [b, a];
  }

  const answer = useSubtract ? a - b : a + b;
  const prompt = `${a} ${useSubtract ? "-" : "+"} ${b} = ?`;

  const choices = new Set([answer]);
  while (choices.size < 4) {
    const drift = Math.ceil(Math.random() * 3);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(0, answer + drift * sign);
    choices.add(next);
  }

  return { prompt, answer, options: shuffled(Array.from(choices)) };
}
