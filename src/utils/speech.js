import { ENCOURAGEMENTS } from "../data/encouragements";
import { randomFrom } from "./rounds";

export function speakWord(word) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();

  // Say the whole word first
  const wordUtter = new SpeechSynthesisUtterance(word);
  wordUtter.rate = 0.8;
  wordUtter.pitch = 1.25;

  // Then spell it letter by letter
  const letters = word.split("").join("   "); // extra spaces = natural pause
  const spellUtter = new SpeechSynthesisUtterance(letters);
  spellUtter.rate = 0.4;
  spellUtter.pitch = 1.2;

  // Then say the whole word once more
  const repeatUtter = new SpeechSynthesisUtterance(word);
  repeatUtter.rate = 0.8;
  repeatUtter.pitch = 1.25;

  speechSynthesis.speak(wordUtter);
  speechSynthesis.speak(spellUtter);
  speechSynthesis.speak(repeatUtter);
}

// Speak word → spell letters → repeat word, then call onDone when finished
export function speakWordAndSpell(word, onDone) {
  if (!("speechSynthesis" in window)) {
    onDone?.();
    return;
  }
  speechSynthesis.cancel();

  const wordUtter = new SpeechSynthesisUtterance(word);
  wordUtter.rate = 0.8;
  wordUtter.pitch = 1.25;

  const letters = word.split("").join("   ");
  const spellUtter = new SpeechSynthesisUtterance(letters);
  spellUtter.rate = 0.4;
  spellUtter.pitch = 1.2;

  const repeatUtter = new SpeechSynthesisUtterance(word);
  repeatUtter.rate = 0.8;
  repeatUtter.pitch = 1.25;
  repeatUtter.onend = () => onDone?.();

  speechSynthesis.speak(wordUtter);
  speechSynthesis.speak(spellUtter);
  speechSynthesis.speak(repeatUtter);
}

export function speakPhrase(phrase) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.rate = 0.9;
  utter.pitch = 1.3;
  utter.volume = 1.0;
  speechSynthesis.speak(utter);
}

export function speakEncouragement() {
  if (!("speechSynthesis" in window)) return;
  const phrase = randomFrom(ENCOURAGEMENTS);
  const utter = new SpeechSynthesisUtterance(phrase);
  utter.rate = 1.0;
  utter.pitch = 1.4;
  utter.volume = 1.0;
  speechSynthesis.speak(utter);
}
