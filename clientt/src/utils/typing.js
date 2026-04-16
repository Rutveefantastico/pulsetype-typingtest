export function calculateResults(correctChars, totalTypedChars, elapsedSeconds) {
  const minutes = elapsedSeconds / 60;
  const safeTypedChars = Math.max(totalTypedChars, 1);
  const accuracy = (correctChars / safeTypedChars) * 100;
  const wpm = minutes > 0 ? (correctChars / 5) / minutes : 0;
  const errors = Math.max(totalTypedChars - correctChars, 0);

  return {
    wpm: Number.isFinite(wpm) ? Math.round(wpm) : 0,
    accuracy: Number.isFinite(accuracy) ? Number(accuracy.toFixed(1)) : 0,
    errors,
  };
}

export function getProgress(typedLength, targetLength) {
  if (!targetLength) {
    return 0;
  }

  return Math.min((typedLength / targetLength) * 100, 100);
}

export function buildHighlightedCharacters(sourceText, typedText) {
  return sourceText.split("").map((character, index) => {
    let status = "pending";

    if (index < typedText.length) {
      status = typedText[index] === character ? "correct" : "incorrect";
    } else if (index === typedText.length) {
      status = "current";
    }

    return {
      id: `${character}-${index}`,
      character,
      status,
    };
  });
}
