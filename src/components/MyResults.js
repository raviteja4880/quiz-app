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
      className="vh-100 vw-100 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #c7f253ff 0%, #3eeb9dff 100%)",
        color: "white",
        padding: "40px",
        overflowY: "auto",
      }}
    >
      <h2 className="text-center mb-4">My Quiz Results</h2>

      {loading ? (
        <p className="text-center">Loading results...</p>
      ) : results.length === 0 ? (
        <p className="text-center">You haven’t taken any quizzes yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center bg-white text-dark">
            <thead className="table-dark">
              <tr>
                <th>Quiz</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
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
                  <td>{r.percentage.toFixed(2)}%</td>
                  <td>{r.status}</td>
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
        <Link to="/home" className="btn btn-light">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default MyResults;
