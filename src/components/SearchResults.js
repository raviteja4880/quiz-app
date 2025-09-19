import React, { useState, useEffect } from "react";
import { resultAPI } from "../services/api";
import { Link } from "react-router-dom";

function SearchResults() {
  const [email, setEmail] = useState(localStorage.getItem("lastEmail") || "");
  const [results, setResults] = useState(
    JSON.parse(localStorage.getItem("lastResults")) || []
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(localStorage.getItem("lastMessage") || "");

  useEffect(() => {
    // Persist values into localStorage
    localStorage.setItem("lastEmail", email);
    localStorage.setItem("lastResults", JSON.stringify(results));
    localStorage.setItem("lastMessage", message);
  }, [email, results, message]);

  const handleSearch = async () => {
    if (!email.trim()) {
      setMessage("⚠️ Please enter a user email");
      setResults([]);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data } = await resultAPI.getByEmail(email);

      if (!data || data.length === 0) {
        setMessage("✅ User exists but has no quiz results yet.");
        setResults([]);
      } else {
        setResults(data);
        setMessage("");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("❌ User not found");
      } else {
        setMessage("⚠️ Could not fetch results. Please try again later.");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-3">🔎 Search User Results</h2>

      {/* Search Bar */}
      <div className="input-group mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-info" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-center">Loading results...</p>}

      {/* Message */}
      {!loading && message && (
        <div className="alert alert-warning text-center">{message}</div>
      )}

      {/* Results Table */}
      {!loading && results.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered text-center mt-3">
            <thead className="table-light">
              <tr>
                <th>Quiz</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.resultId || idx}>
                  <td>{r.quizTitle}</td>
                  <td>
                    {r.score} / {r.total}
                  </td>
                  <td>{r.percentage?.toFixed(2)}%</td>
                  <td
                    className={
                      r.percentage >= 50
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {r.status}
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
    </div>
  );
}

export default SearchResults;
