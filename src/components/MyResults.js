import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resultAPI } from "../services/api";
import Loader from "./Loader"; 

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

  // ✅ 1. Show loader while fetching
  if (loading) return <Loader />;

  // ✅ 2. Show error message if fetch fails
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to="/home" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );

  // ✅ 3. Normal render (no errors, no loading)
  return (
    <div
      className="vh-100 vw-100 p-4"
      style={{
        background: "#f5f5f5",
        overflowY: "auto",
      }}
    >
      <h2 className="text-center mb-4">My Quiz Results</h2>

      {results.length === 0 ? (
        <p className="text-center">You haven’t taken any quizzes yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover bg-white text-dark">
            <thead className="table-primary">
              <tr>
                <th>Quiz Title</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.resultId}>
                  <td>{r.quizTitle}</td>
                  <td>
                    {r.score} / {r.total}
                  </td>
                  <td>{Number(r.percentage).toFixed(2)}%</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status.toLowerCase() === "pass"
                          ? "bg-success"
                          : r.status.toLowerCase() === "fail"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(r.submittedAt).toLocaleString()}</td>
                  <td>
                    <Link
                      to={`/quiz/${r.quizId}/review/${r.resultId}`}
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
        <Link to="/home" className="btn btn-secondary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default MyResults;
