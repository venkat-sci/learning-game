import { ENCOURAGEMENTS } from "../data/encouragements";
import { randomFrom } from "./rounds";

export function speakWord(word) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(word);
  utter.rate = 0.8;
  utter.pitch = 1.25;
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
