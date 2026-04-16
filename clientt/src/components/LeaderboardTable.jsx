import { motion } from "framer-motion";

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function LeaderboardTable({ entries, isLoading, error }) {
  if (isLoading) {
    return <div className="panel table-state">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="panel error-text">{error}</div>;
  }

  return (
    <motion.section
      className="panel leaderboard-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Hall of speed</span>
          <h2>Top performers</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>WPM</th>
              <th>Accuracy</th>
              <th>Recorded</th>
            </tr>
          </thead>
          <tbody>
            {entries.length ? (
              entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>#{index + 1}</td>
                  <td>{entry.user?.name || "Anonymous"}</td>
                  <td>{entry.wpm}</td>
                  <td>{entry.accuracy}%</td>
                  <td>{formatDate(entry.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No scores yet. Complete a test and claim the top spot.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export default LeaderboardTable;
