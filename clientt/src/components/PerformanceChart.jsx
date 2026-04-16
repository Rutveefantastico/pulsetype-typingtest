import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PerformanceChart({ points }) {
  const chartData = points.map((point) => ({
    label: new Date(point.date).toLocaleDateString(),
    wpm: point.wpm,
    accuracy: Number(point.accuracy.toFixed ? point.accuracy.toFixed(1) : point.accuracy),
  }));

  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
          <XAxis dataKey="label" stroke="var(--muted)" />
          <YAxis stroke="var(--muted)" />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.94)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "16px",
            }}
          />
          <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="accuracy" stroke="#f97316" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceChart;
