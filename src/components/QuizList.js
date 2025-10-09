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

  // ✅ 1. Show loader while fetching
  if (loading) return <Loader />;

  // ✅ 2. Show error message if fetch fails
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      </div>
    );

  // ✅ 3. Show content if quizzes fetched successfully
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Quizzes</h2>
      <div className="row">
        {quizzes.length === 0 ? (
          <p>No quizzes found</p>
        ) : (
          quizzes.map((quiz) => (
            <div className="col-md-4 mb-3" key={quiz._id}>
              <div className="card h-100 shadow-sm">
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
    </div>
  );
}

export default QuizList;
