import { motion } from "framer-motion";
import DashboardStats from "../components/DashboardStats";
import PerformanceChart from "../components/PerformanceChart";
import RecommendationPanel from "../components/RecommendationPanel";
import { fetchRecommendations } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

function DashboardPage() {
  const { dashboard, user, isLoading } = useAuth();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchRecommendations()
      .then((data) => setRecommendations(data.recommendations))
      .catch(() => setRecommendations([]));
  }, []);

  if (isLoading || !dashboard) {
    return <div className="panel table-state">Loading dashboard...</div>;
  }

  return (
    <div className="page-stack">
      <motion.section
        className="hero-panel compact"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-summary">
          {user?.profile_pic ? (
            <img className="profile-avatar large" src={user.profile_pic} alt={user.name} />
          ) : (
            <div className="profile-avatar large fallback-avatar">
              {user?.name?.slice(0, 1) || "U"}
            </div>
          )}
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>{user?.name}'s typing analytics</h1>
            <p>Track consistency, compare your recent sessions, and improve over time.</p>
          </div>
        </div>
      </motion.section>

      <DashboardStats dashboard={dashboard} />
      <PerformanceChart points={dashboard.history_points} />
      <RecommendationPanel recommendations={recommendations} />

      <section className="panel leaderboard-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Achievements</span>
            <h2>Badges you've unlocked</h2>
          </div>
        </div>
        <div className="badge-grid">
          {dashboard.achievements.length ? (
            dashboard.achievements.map((badge) => (
              <article key={badge} className="badge-card">
                <strong>{badge}</strong>
              </article>
            ))
          ) : (
            <div className="empty-state">Complete a few runs to unlock achievements.</div>
          )}
        </div>
      </section>

      <section className="panel leaderboard-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Recent sessions</span>
            <h2>Your latest runs</h2>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Difficulty</th>
                <th>Timer</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recent_results.length ? (
                dashboard.recent_results.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.created_at).toLocaleString()}</td>
                    <td>{entry.difficulty}</td>
                    <td>{entry.time_limit}s</td>
                    <td>{entry.wpm}</td>
                    <td>{entry.accuracy}%</td>
                    <td>{entry.errors}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No saved sessions yet. Complete a test to populate your dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
