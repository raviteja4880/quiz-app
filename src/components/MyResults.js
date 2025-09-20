import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resultAPI } from "../services/api";

function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await resultAPI.getMine();
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div
      className="vh-100 vw-100 p-4"
      style={{
        background: "linear-gradient(135deg, #c7f253ff 0%, #3eeb9dff 100%)",
        color: "#fff",
        overflowY: "auto",
      }}
    >
      <h2 className="text-center mb-4">My Quiz Results</h2>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-light" role="status"></div>
        </div>
      ) : results.length === 0 ? (
        <p className="text-center">You haven’t taken any quizzes yet.</p>
      ) : (
        <div className="d-flex flex-wrap justify-content-center gap-4">
          {results.map((r) => (
            <div
              key={r.resultId}
              className="card text-dark"
              style={{
                width: "280px",
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{r.quizTitle}</h5>

                <p className="mb-1">
                  <strong>Score:</strong> {r.score} / {r.total}
                </p>
                <p className="mb-1">
                  <strong>Percentage:</strong> {Number(r.percentage).toFixed(2)}%
                </p>
                <p className="mb-3">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${
                      r.status.toLowerCase() === "passed" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </p>

                <Link
                  to={`/quiz/${r.quizId}/review/${r.resultId}`}
                  className="btn btn-primary mt-auto"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/home" className="btn btn-light">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default MyResults;
