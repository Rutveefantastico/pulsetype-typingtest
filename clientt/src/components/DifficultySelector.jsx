const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];
const TIME_OPTIONS = [30, 60, 120];

function DifficultySelector({
  difficulty,
  onDifficultyChange,
  timeLimit,
  onTimeLimitChange,
  customTime,
  onCustomTimeChange,
  disabled,
}) {
  return (
    <section className="panel controls-panel">
      <div className="control-group">
        <span className="eyebrow">Difficulty</span>
        <div className="chip-row">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${difficulty === option ? "active" : ""}`}
              onClick={() => onDifficultyChange(option)}
              disabled={disabled}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="eyebrow">Timer</span>
        <div className="chip-row">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`chip ${timeLimit === option ? "active" : ""}`}
              onClick={() => onTimeLimitChange(option)}
              disabled={disabled}
            >
              {option}s
            </button>
          ))}
        </div>
        <div className="custom-time">
          <label htmlFor="custom-time">Custom seconds</label>
          <input
            id="custom-time"
            type="number"
            min="15"
            max="1000"
            step="5"
            value={customTime}
            onChange={(event) => onCustomTimeChange(event.target.value)}
            onBlur={() => onTimeLimitChange(Number(customTime))}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}

export default DifficultySelector;
