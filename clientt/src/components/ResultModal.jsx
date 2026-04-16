import { AnimatePresence, motion } from "framer-motion";

function ResultModal({
  isOpen,
  results,
  onRestart,
  onClose,
  saveError,
  isAuthenticated,
  user,
  onShare,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="modal-card"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <span className="eyebrow">Session complete</span>
            <h2>Your typing report</h2>

            <div className="modal-stats">
              <article>
                <span>WPM</span>
                <strong>{results.wpm}</strong>
              </article>
              <article>
                <span>Accuracy</span>
                <strong>{results.accuracy}%</strong>
              </article>
              <article>
                <span>Errors</span>
                <strong>{results.errors}</strong>
              </article>
            </div>

            {isAuthenticated ? (
              <p className="auth-hint">
                This run is linked to <strong>{user?.name}</strong> and will appear in your
                authenticated history once saved.
              </p>
            ) : (
              <p className="auth-hint">
                Sign in to save this run to the leaderboard and unlock your dashboard history.
              </p>
            )}
            {saveError ? <p className="error-text">{saveError}</p> : null}

            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={onShare}>
                Share result
              </button>
              <button type="button" className="button secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" className="button primary" onClick={onRestart}>
                Restart test
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ResultModal;
