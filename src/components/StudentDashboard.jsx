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
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    async function fetchDashboard() {
      if (!token) {
        console.error("No token found. User might not be logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/api/dashboard/student`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
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
        console.error(err.response?.data?.message || err.message);
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
    <div className="dashboard-container">
      <h2 className="dashboard-title">Student Dashboard</h2>

      <div className="dashboard-grid">
        {/* Activity Heatmap */}
        <div className="card">
          <h3 className="card-title">Activity Heatmap (Last 90 days)</h3>
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
          <h3 className="card-title">Performance Trend</h3>
          {trendData.length === 0 ? (
            <div className="py-10 text-center text-muted">No score data yet</div>
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
          <div className="summary">
            <div><strong>Total quizzes:</strong> {summary.totalQuizzes}</div>
            <div><strong>Average %:</strong> {summary.avgPercentage?.toFixed(2)}%</div>
            <div><strong>Best:</strong> {summary.bestQuiz ? `${summary.bestQuiz.quizTitle} — ${summary.bestQuiz.percentage}%` : "—"}</div>
            <div><strong>Worst:</strong> {summary.worstQuiz ? `${summary.worstQuiz.quizTitle} — ${summary.worstQuiz.percentage}%` : "—"}</div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          margin-top: 80px;
        }

        .dashboard-title {
          font-size: 2.2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 30px;
          color: #0b74de;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
        }

        .card {
          background: #ffffff;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }

        .card-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }

        .summary {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.95rem;
          color: #555;
        }

        /* Calendar Heatmap */
        .react-calendar-heatmap text {
          font-size: 10px;
        }

        .color-empty { fill: #ebedf0; }
        .color-github-1 { fill: #c6e48b; }
        .color-github-2 { fill: #7bc96f; }
        .color-github-3 { fill: #239a3b; }
        .color-github-4 { fill: #196127; }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-container {
            margin-top: 60px;
            padding: 15px;
          }

          .dashboard-title {
            font-size: 1.8rem;
          }

          .card {
            padding: 20px;
          }

          .react-calendar-heatmap text {
            font-size: 8px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-title {
            font-size: 1.6rem;
          }

          .card-title {
            font-size: 1.1rem;
          }

          .summary {
            font-size: 0.9rem;
          }

          .recharts-wrapper {
            height: 180px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
