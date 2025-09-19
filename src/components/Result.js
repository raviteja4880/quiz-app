import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";

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

  if (loading) return <p className="text-center">⏳ Loading result...</p>;
  if (!quizData) return <p className="text-center">❌ No result found</p>;

  const { title, questions, result } = quizData;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">✅ Quiz Review</h2>
      <h3 className="mb-3">{title}</h3>

      <p className="mb-2">
        Score: <b>{result.score}</b> / {result.total}
      </p>
      <p className="mb-4">
        ✔ Correct: {result.correctCount} | ❌ Wrong: {result.wrongCount} | 📊{" "}
        {result.percentage.toFixed(2)}%
      </p>

      {questions.map((q, idx) => (
        <div key={idx} className="mb-4 p-3 border rounded bg-white">
          <p className="fw-bold">
            Q{idx + 1}: {q.question}
          </p>

          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {q.options.map((opt, j) => {
              const isCorrect = j === q.correctAnswer;
              const isUserAnswer = j === q.userAnswer;

              let optionClass = "p-2 mt-1 rounded";
              let icon = "";

              if (isCorrect) {
                optionClass += " bg-success text-white"; // ✅ Correct option
                icon = "✔";
              } else if (isUserAnswer && !isCorrect) {
                optionClass += " bg-danger text-white"; // ❌ Wrong user choice
                icon = "❌";
              } else {
                optionClass += " bg-light"; // Neutral
              }

              return (
                <li key={j} className={optionClass}>
                  {opt} {icon && <b className="ms-2">{icon}</b>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate("/myresults")}
      >
        ⬅ Back to My Results
      </button>
    </div>
  );
}

export default Result;
