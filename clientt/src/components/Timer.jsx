import { motion } from "framer-motion";

function Timer({ totalTime, timeLeft, isActive, progress }) {
  return (
    <section className="panel timer-panel">
      <div className="timer-topline">
        <div>
          <span className="eyebrow">Session timer</span>
          <h3>{timeLeft}s remaining</h3>
        </div>
        <span className={`status-pill ${isActive ? "running" : "idle"}`}>
          {isActive ? "Running" : "Ready"}
        </span>
      </div>

      <div className="timer-meta">
        <span>Total duration: {totalTime}s</span>
        <span>Progress: {Math.round(progress)}%</span>
      </div>

      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(timeLeft / totalTime) * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>
    </section>
  );
}

export default Timer;
