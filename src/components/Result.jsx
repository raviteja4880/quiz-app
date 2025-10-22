import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "./Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";

function Result() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      try {
        const { data } = await quizAPI.getResultById(resultId);
        setQuizData(data);
      } catch (err) {
        console.error("Error fetching result:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [resultId]);

  if (loading) return <Loader />;
  if (!quizData)
    return (
      <p className="text-center mt-5 text-danger">
        <FaTimesCircle className="me-2" /> No result found
      </p>
    );

  const { title, questions, result } = quizData;

  return (
    <div
      className="container py-5 result-container"
      style={{ backgroundColor: "#f7f8fc", minHeight: "100vh" }}
    >
      {/* ---------- Summary Card ---------- */}
      <div
        className="card shadow-lg text-white text-center mx-auto mb-5 summary-card"
        style={{
          background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          maxWidth: "600px",
          borderRadius: "20px",
        }}
      >
        <div className="card-body p-5">
          <h2 className="fw-bold mb-3">{title || "Quiz Result"}</h2>
          <h4 className="mb-3">
            Score: {result?.score} / {result?.total}
          </h4>
          <p className="mb-2">Percentage: {result?.percentage?.toFixed(2)}%</p>
          <p className="mb-3">
            <FaCheckCircle className="text-success me-2" /> Correct:{" "}
            {result?.correctCount} &nbsp; | &nbsp;
            <FaTimesCircle className="text-danger me-2" /> Wrong:{" "}
            {result?.wrongCount}
          </p>
          <p className="small">
            <FaCalendarAlt className="me-2" /> Submitted:{" "}
            {result?.submittedAt
              ? new Date(result.submittedAt).toLocaleString()
              : "—"}
          </p>
        </div>
      </div>

      {/* ---------- Questions Review ---------- */}
      <div className="bg-white rounded shadow-sm p-4 mb-4 question-review">
        <h4 className="mb-4 text-center text-primary">Question Review</h4>

        {questions?.map((q, idx) => {
          const correctIndex = Number(q.correctAnswer);
          const userIndex = Number(q.userAnswer);

          return (
            <div key={idx} className="mb-4 border-bottom pb-3">
              <h5 className="fw-semibold question-text">
                Q{idx + 1}: {q.question}
              </h5>

              {q.options.map((opt, j) => {
                const isCorrect = j === correctIndex;
                const isUser = j === userIndex;

                let bgClass = "bg-light";
                let icon = null;

                if (isCorrect && isUser) {
                  bgClass = "bg-success text-white";
                  icon = <FaCheckCircle />;
                } else if (isCorrect) {
                  bgClass = "bg-success text-white";
                  icon = <FaCheckCircle />;
                } else if (isUser && !isCorrect) {
                  bgClass = "bg-danger text-white";
                  icon = <FaTimesCircle />;
                }

                return (
                  <div
                    key={j}
                    className={`p-2 rounded mb-1 d-flex justify-content-between align-items-center ${bgClass}`}
                  >
                    <span>{opt}</span>
                    {icon && <b>{icon}</b>}
                  </div>
                );
              })}

              {userIndex === null || userIndex === undefined ? (
                <div className="p-2 rounded bg-secondary text-white mt-2 d-flex align-items-center">
                  <FaExclamationCircle className="me-2" /> (Not Answered)
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary btn-lg px-4"
          onClick={() => navigate("/myresults")}
        >
          Back to My Results
        </button>
      </div>

      {/* Responsive Styles */}
      <style>{`
        /* General container adjustments */
        .result-container {
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .summary-card {
          width: 100%;
        }

        .question-review {
          border-radius: 16px;
        }

        .question-text {
          font-size: 1.1rem;
        }

        /* Tablet screens */
        @media (max-width: 768px) {
          .summary-card {
            max-width: 90%;
          }

          .card-body {
            padding: 2rem;
          }

          .question-text {
            font-size: 1rem;
          }

          .question-review {
            padding: 1.25rem;
          }

          .btn {
            font-size: 1rem;
            padding: 10px 20px;
          }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .summary-card {
            border-radius: 14px;
            padding: 1rem !important;
          }

          .card-body h2 {
            font-size: 1.3rem;
          }

          .card-body h4 {
            font-size: 1.1rem;
          }

          .question-text {
            font-size: 0.95rem;
          }

          .p-2 {
            padding: 0.75rem !important;
          }

          .btn {
            width: 100%;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Result;
