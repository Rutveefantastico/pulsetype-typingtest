import { motion } from "framer-motion";

function StatsCard({ label, value, hint }) {
  return (
    <motion.article
      className="stat-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </motion.article>
  );
}

function StatsDisplay({ wpm, accuracy, errors, bestWpm }) {
  return (
    <section className="stats-grid">
      <StatsCard label="WPM" value={wpm} hint="Live speed" />
      <StatsCard label="Accuracy" value={`${accuracy}%`} hint="Precision rate" />
      <StatsCard label="Errors" value={errors} hint="Mistyped chars" />
      <StatsCard label="Best" value={bestWpm} hint="Saved locally" />
    </section>
  );
}

export default StatsDisplay;
