import { motion } from "framer-motion";

function DashboardStats({ dashboard }) {
  const cards = [
    { label: "Tests Taken", value: dashboard.tests_taken, hint: "Completed sessions" },
    { label: "Best WPM", value: dashboard.best_wpm, hint: "Top recorded speed" },
    { label: "Avg WPM", value: dashboard.average_wpm, hint: "Steady pace" },
    {
      label: "Avg Accuracy",
      value: `${dashboard.average_accuracy}%`,
      hint: "Typing precision",
    },
    { label: "Streak", value: dashboard.current_streak, hint: "Current daily run" },
    { label: "Longest", value: dashboard.longest_streak, hint: "Best streak yet" },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <motion.article
          key={card.label}
          className="stat-card"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.hint}</small>
        </motion.article>
      ))}
    </section>
  );
}

export default DashboardStats;
