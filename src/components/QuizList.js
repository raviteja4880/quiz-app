import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api'; // ✅ use quizAPI instead of API

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await quizAPI.getAll(); // ✅ use quizAPI.getAll()
        setQuizzes(res.data);
      } catch (err) {
        console.error('Failed to load quizzes', err);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Quizzes</h2>
      <div className="row">
        {quizzes.length === 0 ? (
          <p>No quizzes found</p>
        ) : (
          quizzes.map((quiz) => (
            <div className="col-md-4 mb-3" key={quiz._id}>
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{quiz.title}</h5>
                  <p className="card-text">{quiz.description}</p>
                  <button
                    className="btn btn-primary"
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
