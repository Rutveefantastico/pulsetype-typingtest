import { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api/client";
import LeaderboardTable from "../components/LeaderboardTable";
import { useAuth } from "../context/AuthContext";

function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  useEffect(() => {
    loadLeaderboard();
  }, [difficultyFilter]);

  async function loadLeaderboard() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchLeaderboard(10, difficultyFilter);
      setEntries(response.entries);
    } catch (requestError) {
      setError(requestError.message || "Unable to fetch leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact">
        <div>
          <span className="eyebrow">Rankings</span>
          <h1>See who owns the fastest runs.</h1>
          <p>
            Signed-in runs are ranked by WPM, then accuracy, and tied back to
            authenticated profiles from Google or GitHub.
          </p>
        </div>
        <button type="button" className="button primary" onClick={loadLeaderboard}>
          Refresh
        </button>
      </section>

      <section className="panel compact-banner filter-row">
        <label>
          Filter difficulty
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
            <option value="">all</option>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
      </section>

      <section className="panel compact-banner">
        Viewing the secured leaderboard as <strong>{user?.name}</strong>.
      </section>

      <LeaderboardTable entries={entries} isLoading={isLoading} error={error} />
    </div>
  );
}

export default LeaderboardPage;
