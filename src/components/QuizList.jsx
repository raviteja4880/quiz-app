import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "./Loader";

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizAPI.getAll();
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to load quizzes", err);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      </div>
    );

  return (
    <div className="container mt-4 quiz-list-container">
      <h2 className="mb-4 text-center text-md-start">Available Quizzes</h2>
      <div className="row g-3">
        {quizzes.length === 0 ? (
          <p className="text-center w-100">No quizzes found</p>
        ) : (
          quizzes.map((quiz) => (
            <div className="col-12 col-sm-6 col-md-4" key={quiz._id}>
              <div className="card h-100 shadow-sm quiz-card">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{quiz.title}</h5>
                  <p className="card-text flex-grow-1">{quiz.description}</p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Responsive Styling */}
      <style>{`
        .quiz-list-container {
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .quiz-card {
          border-radius: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .quiz-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          h2 {
            font-size: 1.5rem;
            text-align: center;
          }

          .quiz-card {
            margin: 0 auto;
            max-width: 100%;
          }

          .card-body {
            padding: 1rem;
          }

          .card-title {
            font-size: 1.1rem;
          }

          .card-text {
            font-size: 0.95rem;
          }

          .btn {
            font-size: 0.9rem;
            padding: 8px 14px;
          }
        }

        /* Small phones */
        @media (max-width: 480px) {
          .quiz-card {
            border-radius: 10px;
          }

          .card-title {
            font-size: 1rem;
          }

          .card-text {
            font-size: 0.9rem;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default QuizList;
