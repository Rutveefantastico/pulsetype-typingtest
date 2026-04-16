function RecommendationPanel({ recommendations }) {
  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Recommendations</span>
          <h2>Suggested next steps</h2>
        </div>
      </div>
      <div className="recommendation-list">
        {recommendations.length ? (
          recommendations.map((item) => (
            <article key={item} className="recommendation-card">
              {item}
            </article>
          ))
        ) : (
          <div className="empty-state">No recommendations yet. Complete more sessions first.</div>
        )}
      </div>
    </section>
  );
}

export default RecommendationPanel;
