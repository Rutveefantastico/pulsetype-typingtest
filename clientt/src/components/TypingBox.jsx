import { motion } from "framer-motion";

function TypingBox({
  text,
  highlightedCharacters,
  typedText,
  onChange,
  isDisabled,
  isLoading,
  error,
}) {
  return (
    <section className="typing-layout">
      <motion.div
        className="panel text-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Prompt</span>
            <h2>Type with focus and rhythm</h2>
          </div>
          {isLoading ? <span className="loader-badge">Loading text...</span> : null}
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="typing-preview" aria-live="polite">
          {highlightedCharacters.map(({ id, character, status }) => (
            <span key={id} className={`char ${status}`}>
              {character}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="panel input-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <label className="typing-label" htmlFor="typing-input">
          Start typing below
        </label>
        <textarea
          id="typing-input"
          className="typing-input"
          value={typedText}
          onChange={onChange}
          disabled={isDisabled || isLoading || !text}
          placeholder="The timer starts with your first keystroke."
          rows={5}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </motion.div>
    </section>
  );
}

export default TypingBox;
