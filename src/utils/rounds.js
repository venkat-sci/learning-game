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
  const sameLevel = wordPool.filter((w) => w !== target);
  const otherLevels = Object.entries(SIGHT_WORDS_BY_LEVEL)
    .filter(([l]) => Number(l) !== level)
    .flatMap(([, words]) => words);
  const decoyPool = [...sameLevel, ...otherLevels];
  // Options count scales with difficulty
  const optionsCount =
    level >= 5 ? 6 : level >= 4 ? 5 : level >= 3 ? 5 : level >= 2 ? 4 : 3;
  const decoys = shuffled(decoyPool).slice(0, optionsCount - 1);
  return { target, options: shuffled([target, ...decoys]) };
}

export function buildMathRound(level) {
  let prompt, answer;

  if (level >= 5) {
    // Level 5: multiplication ×2–×10 + hard addition/subtraction up to 30
    if (Math.random() > 0.35) {
      const multiplier = Math.ceil(Math.random() * 9) + 1; // 2–10
      const multiplicand = Math.ceil(Math.random() * 10);
      answer = multiplier * multiplicand;
      prompt = `${multiplicand} × ${multiplier} = ?`;
    } else {
      const a = Math.ceil(Math.random() * 30);
      const b = Math.ceil(Math.random() * 15);
      const useSubtract = b <= a;
      answer = useSubtract ? a - b : a + b;
      prompt = `${useSubtract ? a : a} ${useSubtract ? "-" : "+"} ${b} = ?`;
    }
  } else if (level === 4) {
    // Level 4: addition/subtraction up to 20
    const useSubtract = Math.random() > 0.45;
    let a = Math.ceil(Math.random() * 20);
    let b = Math.ceil(Math.random() * 20);
    if (useSubtract && b > a) [a, b] = [b, a];
    answer = useSubtract ? a - b : a + b;
    prompt = `${a} ${useSubtract ? "-" : "+"} ${b} = ?`;
  } else if (level === 3) {
    // Level 3: addition/subtraction up to 10
    const useSubtract = Math.random() > 0.45;
    let a = Math.ceil(Math.random() * 10);
    let b = Math.ceil(Math.random() * 10);
    if (useSubtract && b > a) [a, b] = [b, a];
    answer = useSubtract ? a - b : a + b;
    prompt = `${a} ${useSubtract ? "-" : "+"} ${b} = ?`;
  } else if (level === 2) {
    // Level 2: addition up to 10
    const a = Math.ceil(Math.random() * 10);
    const b = Math.ceil(Math.random() * 10);
    answer = a + b;
    prompt = `${a} + ${b} = ?`;
  } else {
    // Level 1: addition up to 5, very easy
    const a = Math.ceil(Math.random() * 5);
    const b = Math.ceil(Math.random() * 5);
    answer = a + b;
    prompt = `${a} + ${b} = ?`;
  }

  // Options count scales with level
  const optionsCount = level >= 5 ? 6 : level >= 4 ? 5 : level >= 2 ? 4 : 3;
  const choices = new Set([answer]);
  while (choices.size < optionsCount) {
    const drift = Math.ceil(Math.random() * 4);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(0, answer + drift * sign);
    choices.add(next);
  }

  return { prompt, answer, options: shuffled(Array.from(choices)) };
}
