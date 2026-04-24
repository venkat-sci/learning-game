import { useRef, useState } from "react";
import { buildOffsets } from "../utils/rounds";
import { speakWord } from "../utils/speech";

export default function GameScreen({
  mode,
  level,
  roundIndex,
  totalRounds,
  round,
  pulse,
  feedback,
  streak,
  accuracy,
  stars,
  onAnswer,
  onBack,
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedResult, setSelectedResult] = useState("");
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [optionOffsets, setOptionOffsets] = useState(() => buildOffsets(round));
  const [dragState, setDragState] = useState(null);
  const optionRefs = useRef({});

  function submitAnswer(optionId, value) {
    if (isAnswerLocked) return;
    setSelectedOptionId(optionId);
    setSelectedResult("");
    setIsAnswerLocked(true);
    setDragState(null);
    window.setTimeout(() => {
      const isCorrect =
        mode === "sight" ? value === round.target : value === round.answer;
      setSelectedResult(isCorrect ? "correct" : "wrong");
      onAnswer(value);
    }, 450);
  }

  function getMaxSlide(optionId) {
    const optionEl = optionRefs.current[optionId];
    if (!optionEl) return 0;
    return Math.max(0, optionEl.offsetWidth - 70);
  }

  function handleDragStart(optionId, event) {
    if (isAnswerLocked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      optionId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: optionOffsets[optionId] || 0,
    });
  }

  function handleDragMove(optionId, optionValue, event) {
    if (!dragState || dragState.optionId !== optionId || isAnswerLocked) return;
    const maxSlide = getMaxSlide(optionId);
    if (maxSlide <= 0) return;
    const deltaX = event.clientX - dragState.startX;
    const rawOffset = dragState.startOffset + deltaX;
    const clampedOffset = Math.max(0, Math.min(maxSlide, rawOffset));
    const slideProgress = clampedOffset / maxSlide;
    setOptionOffsets((prev) => ({ ...prev, [optionId]: clampedOffset }));
    if (slideProgress >= 0.92) {
      setOptionOffsets((prev) => ({ ...prev, [optionId]: maxSlide }));
      submitAnswer(optionId, optionValue);
    }
  }

  function handleDragEnd(optionId, event) {
    if (dragState?.optionId !== optionId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!isAnswerLocked) {
      setOptionOffsets((prev) => ({ ...prev, [optionId]: 0 }));
    }
    setDragState(null);
  }

  return (
    <section className={`panel game-panel ${pulse}`}>
      <div className="game-head">
        <p>
          {mode === "sight" ? "Sight Words" : "Math Challenge"} • Round{" "}
          {roundIndex}/{totalRounds}
        </p>
        <p>Level {level}</p>
      </div>

      {mode === "sight" ? (
        <button
          className="hear-btn"
          type="button"
          onClick={() => speakWord(round.target)}
        >
          {round.target}
        </button>
      ) : (
        <div className="hear-btn prompt-display">{round.prompt}</div>
      )}

      <div className={`options options-${mode}`}>
        {round.options.map((option, index) => {
          const optionId = `${option}-${index}`;
          const offset = optionOffsets[optionId] || 0;
          return (
            <button
              key={optionId}
              ref={(el) => {
                optionRefs.current[optionId] = el;
              }}
              type="button"
              className={[
                "option",
                selectedOptionId === optionId && selectedResult === "correct"
                  ? "option-correct"
                  : "",
                selectedOptionId === optionId && selectedResult === "wrong"
                  ? "option-wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ "--slide-x": `${offset}px` }}
              disabled={isAnswerLocked}
            >
              <span className="option-slider" aria-hidden="true"></span>
              <span
                className="option-handle"
                aria-hidden="true"
                onPointerDown={(event) => handleDragStart(optionId, event)}
                onPointerMove={(event) =>
                  handleDragMove(optionId, option, event)
                }
                onPointerUp={(event) => handleDragEnd(optionId, event)}
                onPointerCancel={(event) => handleDragEnd(optionId, event)}
              >
                ⇢
              </span>
              <span className="option-label">{option}</span>
            </button>
          );
        })}
      </div>

      <p className="feedback">{feedback || "Slide the side bar to answer!"}</p>

      <div className="summary-bar">
        <span>Streak: {streak}</span>
        <span>Accuracy: {accuracy}%</span>
        <span>Stars: {stars}</span>
      </div>

      <button type="button" className="back-link" onClick={onBack}>
        Back Home
      </button>
    </section>
  );
}
