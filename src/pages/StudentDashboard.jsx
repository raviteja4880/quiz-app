import React, { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { format, parseISO } from "date-fns";
import Loader from "../components/Loader";
import { dashboardAPI } from "../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { FiBarChart2, FiTrendingUp, FiAward, FiArrowDown, FiCalendar, FiStar } from "react-icons/fi";
import "react-calendar-heatmap/dist/styles.css";

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await dashboardAPI.getStudentDashboard();

        const { heatmap = [], trend = [], summary = {} } = res.data;

        // Process heatmap data - ensure dates are Date objects
        const processedHeatmap = heatmap.map((d) => {
          const dateObj = new Date(d.date);
          return {
            date: dateObj,
            count: d.count || 0
          };
        });

        // Process trend data
        const processedTrend = trend
          .map((d) => ({
            date: d.date, // Keep as string for formatting
            percentage: d.percentage || 0
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setHeatmapData(processedHeatmap);
        setTrendData(processedTrend);
        setSummary(summary);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch dashboard data";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-title">Student Dashboard</h2>
        <div style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
          padding: "20px",
          borderRadius: "5px",
          marginTop: "20px"
        }}>
          <strong>Error loading dashboard:</strong> {error}
        </div>
      </div>
    );
  }

  // Calculate date range: 12 months (365 days) from today
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 365);

  const tooltipFn = (value) => {
    if (!value || !value.date) return "No activity";
    try {
      const dateObj = value.date instanceof Date ? value.date : new Date(value.date);
      const dateLabel = format(dateObj, "MMM d, yyyy");
      return `${dateLabel} — ${value.count || 0} quiz(es)`;
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Student Dashboard</h2>

      <div className="dashboard-grid">
        {/* Activity Heatmap */}
        <div className="card heatmap-card">
          <h3 className="card-title heatmap-title">
            <FiCalendar className="icon" /> Activity Heatmap
          </h3>
          {heatmapData.length === 0 ? (
            <div className="py-10 text-center text-muted">No activity data yet</div>
          ) : (
            <>
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
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-scale">
                  <div className="legend-item color-empty"></div>
                  <div className="legend-item color-github-1"></div>
                  <div className="legend-item color-github-2"></div>
                  <div className="legend-item color-github-3"></div>
                  <div className="legend-item color-github-4"></div>
                </div>
                <span>More</span>
              </div>
            </>
          )}
        </div>

        {/* Performance Trend */}
        <div className="card trend-card">
          <h3 className="card-title trend-title">
            <FiTrendingUp className="icon" /> Performance Trend
          </h3>
          {trendData.length === 0 ? (
            <div className="py-10 text-center text-muted">No score data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => format(parseISO(d), "MM/dd")}
                  interval="preserveStartEnd"
                  stroke="#888"
                  style={{ fontSize: "12px" }}
                />
                <YAxis domain={[0, 100]} stroke="#888" style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #0b74de",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  labelFormatter={(label) => format(parseISO(label), "PPP")}
                  formatter={(value) => [`${value.toFixed(2)}%`, "Score"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#0b74de" 
                  strokeWidth={3}
                  dot={{ fill: "#0b74de", r: 5 }}
                  activeDot={{ r: 7, fill: "#0861ae" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="summary">
            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <FiBarChart2 className="summary-icon" />
              </div>
              <span className="summary-label">Total Quizzes</span>
              <span className="summary-value">{summary.totalQuizzes}</span>
            </div>
            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <FiStar className="summary-icon" />
              </div>
              <span className="summary-label">Average Score</span>
              <span className="summary-value">{summary.avgPercentage?.toFixed(2)}%</span>
            </div>
            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <FiAward className="summary-icon" />
              </div>
              <span className="summary-label">Best Quiz</span>
              <span className="summary-value">{summary.bestQuiz ? `${summary.bestQuiz.quizTitle} (${summary.bestQuiz.percentage}%)` : "—"}</span>
            </div>
            <div className="summary-item">
              <div className="summary-icon-wrapper">
                <FiArrowDown className="summary-icon" />
              </div>
              <span className="summary-label">Worst Quiz</span>
              <span className="summary-value">{summary.worstQuiz ? `${summary.worstQuiz.quizTitle} (${summary.worstQuiz.percentage}%)` : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .dashboard-container {
          width: 100%;
          min-height: 100vh;
          padding: 40px 20px;
          margin-top: 80px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .dashboard-title {
          font-size: 3rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 50px;
          background: linear-gradient(135deg, #0b74de 0%, #0861ae 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 40px;
          width: 100%;
          flex: 1;
        }

        .card {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          padding: 35px;
          border-radius: 20px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.12);
          border: 1px solid rgba(255,255,255,0.8);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }

        .heatmap-card {
          background: linear-gradient(135deg, #ffffff 0%, #f0f5ff 100%);
        }

        .trend-card {
          background: linear-gradient(135deg, #ffffff 0%, #fff8f0 100%);
        }

        .card-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: #1a202c;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-title .icon {
          font-size: 1.8rem;
        }

        .heatmap-title {
          color: #0b74de;
          border-bottom: 3px solid #0b74de;
          padding-bottom: 15px;
        }

        .trend-title {
          color: #ff6b6b;
          border-bottom: 3px solid #ff6b6b;
          padding-bottom: 15px;
        }

        /* Heatmap Legend */
        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
          padding: 18px;
          background: #f8f9fa;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
        }

        .legend-scale {
          display: flex;
          gap: 8px;
        }

        .legend-item {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 2px solid rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .legend-item.color-empty { background-color: #ebedf0; }
        .legend-item.color-github-1 { background-color: #c6e48b; }
        .legend-item.color-github-2 { background-color: #7bc96f; }
        .legend-item.color-github-3 { background-color: #239a3b; }
        .legend-item.color-github-4 { background-color: #196127; }

        .legend-item:hover {
          transform: scale(1.2);
        }

        /* Summary Stats */
        .summary {
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .summary-item {
          background: linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid #e8eff7;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .summary-item:hover {
          transform: translateY(-4px);
          border-color: #0b74de;
          box-shadow: 0 8px 20px rgba(11, 116, 222, 0.2);
        }

        .summary-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #0b74de 0%, #0861ae 100%);
          border-radius: 12px;
          margin-bottom: 5px;
        }

        .summary-icon {
          font-size: 24px;
          color: #ffffff;
        }

        .summary-label {
          font-size: 12px;
          font-weight: 700;
          color: #0b74de;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 800;
          color: #1a202c;
          word-break: break-word;
        }

        /* Calendar Heatmap */
        .react-calendar-heatmap {
          padding: 15px 0;
          width: 100%;
          overflow-x: auto;
        }

        .react-calendar-heatmap text {
          font-size: 12px;
          font-weight: 600;
          fill: #666;
        }

        .react-calendar-heatmap rect {
          stroke: #fff;
          stroke-width: 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .react-calendar-heatmap rect:hover {
          stroke-width: 3px;
          filter: brightness(1.1);
        }

        .color-empty { background-color: #ebedf0; }
        .color-github-1 { background-color: #c6e48b; }
        .color-github-2 { background-color: #7bc96f; }
        .color-github-3 { background-color: #239a3b; }
        .color-github-4 { background-color: #196127; }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .card {
            padding: 30px;
          }

          .dashboard-title {
            font-size: 2.5rem;
            margin-bottom: 40px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            margin-top: 70px;
            padding: 20px 15px;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .dashboard-title {
            font-size: 2rem;
            margin-bottom: 30px;
          }

          .dashboard-grid {
            gap: 20px;
          }

          .card {
            padding: 20px;
            border-radius: 15px;
          }

          .card-title {
            font-size: 1.3rem;
            margin-bottom: 18px;
          }

          .card-title .icon {
            font-size: 1.5rem;
          }

          .summary {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .summary-item {
            padding: 15px;
            border-radius: 12px;
          }

          .summary-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .summary-icon {
            font-size: 20px;
          }

          .summary-value {
            font-size: 18px;
          }

          .heatmap-legend {
            gap: 10px;
            padding: 12px;
            font-size: 12px;
          }

          .legend-scale {
            gap: 6px;
          }

          .legend-item {
            width: 20px;
            height: 20px;
          }

          .react-calendar-heatmap text {
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            margin-top: 60px;
            padding: 15px 10px;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .dashboard-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
          }

          .dashboard-grid {
            gap: 15px;
          }

          .card {
            padding: 15px;
            border-radius: 12px;
          }

          .card-title {
            font-size: 1.1rem;
            margin-bottom: 15px;
            gap: 8px;
          }

          .card-title .icon {
            font-size: 1.3rem;
          }

          .summary {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .summary-item {
            padding: 12px;
          }

          .summary-icon-wrapper {
            width: 36px;
            height: 36px;
          }

          .summary-icon {
            font-size: 18px;
          }

          .summary-label {
            font-size: 11px;
          }

          .summary-value {
            font-size: 16px;
          }

          .heatmap-legend {
            flex-direction: column;
            gap: 8px;
            padding: 10px;
          }

          .legend-scale {
            gap: 4px;
          }

          .legend-item {
            width: 18px;
            height: 18px;
          }

          .react-calendar-heatmap text {
            font-size: 8px;
          }
        }

        @media (max-width: 360px) {
          .dashboard-title {
            font-size: 1.2rem;
          }

          .card-title {
            font-size: 1rem;
          }

          .summary-label {
            font-size: 10px;
          }

          .summary-value {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default StudentDashboard;
