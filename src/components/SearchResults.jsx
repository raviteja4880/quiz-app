import React, { useState, useEffect } from "react";
import { resultAPI } from "../services/api";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import {
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";

function SearchResults() {
  const [email, setEmail] = useState(localStorage.getItem("lastEmail") || "");
  const [results, setResults] = useState(
    JSON.parse(localStorage.getItem("lastResults")) || []
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(localStorage.getItem("lastMessage") || "");

  useEffect(() => {
    localStorage.setItem("lastEmail", email);
    localStorage.setItem("lastResults", JSON.stringify(results));
    localStorage.setItem("lastMessage", message);
  }, [email, results, message]);

  const handleSearch = async () => {
    if (!email.trim()) {
      setMessage("warning_empty_email");
      setResults([]);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data } = await resultAPI.getByEmail(email);
      if (!data || data.length === 0) {
        setMessage("success_no_results");
        setResults([]);
      } else {
        setResults(data);
        setMessage("");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("error_user_not_found");
      } else {
        setMessage("warning_fetch_failed");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const renderMessage = () => {
    switch (message) {
      case "warning_empty_email":
        return (
          <div className="alert alert-warning text-center">
            <FaExclamationTriangle className="me-2" />
            Please enter a user email
          </div>
        );
      case "success_no_results":
        return (
          <div className="alert alert-success text-center">
            <FaCheckCircle className="me-2" />
            User exists but has no quiz results yet.
          </div>
        );
      case "error_user_not_found":
        return (
          <div className="alert alert-danger text-center">
            <FaTimesCircle className="me-2" />
            User not found
          </div>
        );
      case "warning_fetch_failed":
        return (
          <div className="alert alert-warning text-center">
            <FaInfoCircle className="me-2" />
            Could not fetch results. Please try again later.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-3">
        <FaSearch className="me-2" />
        Search User Results
      </h2>

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
          <FaSearch className="me-1" />
          Search
        </button>
      </div>

      {/* Message */}
      {renderMessage()}

      {/* Results Table */}
      {results.length > 0 && (
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
