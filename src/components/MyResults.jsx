import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resultAPI } from "../services/api";
import Loader from "./Loader";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // ✅ Added Font Awesome icons

function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await resultAPI.getMine();
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err.response?.data || err.message);
        setError("Failed to fetch your results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{error}</div>
        <div className="text-center mt-3">
          <Link to="/home" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );

  return (
    <div className="p-4" style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 className="text-center mb-4 fw-bold text-primary">My Quiz Results</h2>

      {results.length === 0 ? (
        <p className="text-center text-muted">You haven’t taken any quizzes yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover bg-white text-dark shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Quiz Title</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>
                  <FaCheckCircle className="text-success me-1" />
                  Correct
                </th>
                <th>
                  <FaTimesCircle className="text-danger me-1" />
                  Wrong
                </th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.resultId || r._id}>
                  <td>{r.quizTitle || "Untitled Quiz"}</td>
                  <td>
                    {r.score} / {r.total}
                  </td>
                  <td>{Number(r.percentage).toFixed(2)}%</td>
                  <td className="text-success fw-semibold">{r.correctCount}</td>
                  <td className="text-danger fw-semibold">{r.wrongCount}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status?.toLowerCase() === "completed"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {r.status
                        ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
                        : "—"}
                    </span>
                  </td>
                  <td>
                    {r.submittedAt
                      ? new Date(r.submittedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <Link
                      to={`/quiz/${r.quizId}/review/${r.resultId || r._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/student-dashboard" className="btn btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

export default MyResults;
