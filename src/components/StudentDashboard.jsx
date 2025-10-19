import React, { useEffect, useState } from "react";
import axios from "axios";
import CalendarHeatmap from "react-calendar-heatmap";
import { format, parseISO } from "date-fns";
import Loader from "./Loader";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "react-calendar-heatmap/dist/styles.css";

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({
    totalQuizzes: 0,
    avgPercentage: 0,
    bestQuiz: null,
    worstQuiz: null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await axios.get("/api/dashboard/student", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        const { heatmap = [], trend = [], summary = {} } = res.data;

        setHeatmapData(heatmap.map((d) => ({ date: d.date, count: d.count })));
        setTrendData(
          trend
            .map((d) => ({ date: d.date, percentage: d.percentage }))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        );
        setSummary(summary);
      } catch (err) {
        console.error("Failed fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) return <Loader />;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 89);

  const tooltipFn = (value) => {
    if (!value || !value.date) return "No activity";
    const dateLabel = format(parseISO(value.date), "MMM d, yyyy");
    return `${dateLabel} — ${value.count} quiz(es)`;
  };

  return (
    <div className="container py-6 px-3">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Student Dashboard</h2>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Activity Heatmap */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-3">Activity Heatmap (last 90 days)</h3>
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || !value.count) return "color-empty";
              if (value.count >= 4) return "color-github-4";
              if (value.count === 3) return "color-github-3";
              if (value.count === 2) return "color-github-2";
              return "color-github-1";
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return {};
              return { "data-tip": tooltipFn(value) };
            }}
            showWeekdayLabels={true}
          />
          <small className="text-muted">Darker = more quizzes taken</small>
        </div>

        {/* Performance Trend */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-3">Performance Trend</h3>
          {trendData.length === 0 ? (
            <div className="py-10 text-center">No score data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(parseISO(d), "MM/dd")}
                  interval="preserveStartEnd"
                />
                <YAxis domain={[0, 100]} />
                <Tooltip labelFormatter={(label) => format(parseISO(label), "PPP")} />
                <Line type="monotone" dataKey="percentage" stroke="#0b74de" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ marginTop: 12 }}>
            <div><strong>Total quizzes:</strong> {summary.totalQuizzes}</div>
            <div><strong>Average %:</strong> {summary.avgPercentage?.toFixed(2)}%</div>
            <div><strong>Best:</strong> {summary.bestQuiz ? `${summary.bestQuiz.quizTitle} — ${summary.bestQuiz.percentage}%` : "—"}</div>
            <div><strong>Worst:</strong> {summary.worstQuiz ? `${summary.worstQuiz.quizTitle} — ${summary.worstQuiz.percentage}%` : "—"}</div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        .card {
          background: #fff;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .react-calendar-heatmap text { font-size: 9px; }
        .color-empty { fill: #ebedf0; }
        .color-github-1 { fill: #c6e48b; }
        .color-github-2 { fill: #7bc96f; }
        .color-github-3 { fill: #239a3b; }
        .color-github-4 { fill: #196127; }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .card {
            padding: 12px;
          }

          .dashboard-grid {
            gap: 12px;
          }

          h2 {
            font-size: 1.5rem;
          }

          h3 {
            font-size: 1.1rem;
          }

          .recharts-wrapper {
            height: 180px !important;
          }

          .react-calendar-heatmap text {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
