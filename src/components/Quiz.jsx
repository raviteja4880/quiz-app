import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "./Loader";

function Quiz() {
  const { id, resultId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [exitLocked, setExitLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);

  const [timerId, setTimerId] = useState(null);
  const reviewMode = !!resultId;

  // ===================== Fetch Quiz =====================
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        let data;
        if (reviewMode) {
          const res = await quizAPI.getResultById(resultId);
          data = res.data;
          setAnswers(data.questions.map((q) => q.userAnswer ?? null));
          setResult(data.result);
        } else {
          const res = await quizAPI.getById(id);
          data = res.data;
          setTimeLeft(data.timeLimit * 60);
          setAnswers(new Array(data.questions.length).fill(null));
        }
        setQuiz(data);
      } catch (err) {
        alert("Failed to load quiz: " + (err.response?.data?.message || err.message));
      }
    };
    fetchQuiz();
  }, [id, resultId, reviewMode]);

  // ===================== Timer =====================
  useEffect(() => {
    if (!started || reviewMode || result) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    setTimerId(id);

    return () => clearInterval(id);
  }, [started, reviewMode, result]);

  // ===================== handleSubmit =====================
  const handleSubmit = useCallback(async () => {
    if (submitting || reviewMode || result) return;

    if (timerId) clearInterval(timerId);

    setSubmitting(true);
    try {
      const res = await quizAPI.submit(quiz._id, answers);
      if (document.fullscreenElement) await document.exitFullscreen();

      setResult({
        score: res.data.score,
        correctCount: res.data.correctCount,
        wrongCount: res.data.wrongCount,
        total: res.data.total,
        percentage: res.data.percentage,
        status: res.data.status,
        userAnswers: answers,
      });

      alert("✅ Quiz submitted successfully!");
    } catch (err) {
      alert(`❌ Failed to submit quiz: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [answers, submitting, reviewMode, result, quiz?._id, timerId]);

  // ===================== Auto-submit on timeout =====================
  useEffect(() => {
    if (timeLeft === 0 && started && !result && !reviewMode) handleSubmit();
  }, [timeLeft, started, result, reviewMode, handleSubmit]);

  // ===================== Fullscreen Exit Tracking =====================
  useEffect(() => {
    const handleExit = () => {
      if (!document.fullscreenElement && started && !reviewMode && !result) {
        setExitCount((prev) => prev + 1);
        setShowWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleExit);
    return () => document.removeEventListener("fullscreenchange", handleExit);
  }, [started, reviewMode, result]);

  useEffect(() => {
    if (exitCount >= 3 && started && !result && !reviewMode && !exitLocked) {
      setExitLocked(true);
      alert("❌ You exited fullscreen too many times. Exam ended.");
      handleSubmit();
    }
  }, [exitCount, started, result, reviewMode, exitLocked, handleSubmit]);

  // ===================== Handlers =====================
  const handleStart = async () => {
    if (!agree) return;
    if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    setStarted(true);
  };

  const handleReEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    setShowWarning(false);
  };

  const handleOptionChange = (qIndex, optionIndex) => {
    if (reviewMode) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleClearResponse = (qIndex) => {
    if (reviewMode) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = null;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < quiz.questions.length - 1) setCurrentQ(currentQ + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  if (!quiz) return <Loader />;

  // ===================== UI =====================

  // ---------- RESULT / REVIEW ----------
  if (result) {
    if (reviewMode) {
      return (
        <div className="container my-5 quiz-container">
          <h2 className="text-center mb-4">📘 Quiz Review</h2>
          <h4 className="text-center mb-3">
            Score: {result.score} / {result.total}
          </h4>
          <p className="text-center mb-4">
            ✔ Correct: {result.correctCount} | ❌ Wrong: {result.wrongCount} | ⚪
            Not Answered:{" "}
            {quiz.questions.length -
              (result.correctCount + result.wrongCount)}
          </p>

          <div className="card p-4 mb-4">
            {quiz.questions.map((q, index) => {
              const userAnswer = answers[index];
              return (
                <div key={index} className="mb-4">
                  <h5>
                    Q{index + 1}: {q.question}
                  </h5>
                  {q.options.map((option, i) => {
                    const isCorrect = i === q.correctAnswer;
                    const isUser = i === userAnswer;
                    let bgClass = "bg-light";
                    if (isCorrect) bgClass = "bg-success text-white";
                    else if (isUser && !isCorrect)
                      bgClass = "bg-danger text-white";
                    else if (userAnswer === null)
                      bgClass = "bg-secondary text-white";
                    return (
                      <div key={i} className={`p-2 rounded mb-1 ${bgClass}`}>
                        {option}
                      </div>
                    );
                  })}
                  {userAnswer === null && (
                    <div className="p-2 rounded mb-1 bg-secondary text-white">
                      (Not Answered)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/myResults" className="btn btn-primary btn-lg">
              Back to My Results
            </Link>
          </div>
        </div>
      );
    }
  }

  // ---------- BEFORE START ----------
  if (!started) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 px-3">
        <div className="card shadow-lg p-4 text-start start-card">
          <h3 className="text-center mb-3">{quiz.title}</h3>
          <p>{quiz.description}</p>
          <ul className="mb-4 instruction-list">
            <li>Read all questions carefully before answering.</li>
            <li>You must stay in fullscreen mode during the exam.</li>
            <li>
              If you exit fullscreen 3 times, your exam will be automatically
              submitted.
            </li>
            <li>
              Each question must be answered sequentially. You can revisit
              previous questions.
            </li>
            <li>
              Time limit: <b>{quiz.timeLimit} minutes</b>
            </li>
          </ul>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input me-2"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label className="form-check-label fw-bold" htmlFor="agree">
              I have read and understood all instructions.
            </label>
          </div>

          <div className="text-center">
            <button
              className="btn btn-success btn-lg"
              onClick={handleStart}
              disabled={!agree}
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- LIVE QUIZ ----------
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const q = quiz.questions[currentQ];
  const progressColor =
    timeLeft <= 3 * 60
      ? "text-danger"
      : timeLeft <= 5 * 60
      ? "text-warning"
      : "text-success";

  return (
    <div className="quiz-wrapper p-3">
      {showWarning && exitCount < 3 && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-warning shadow" style={{ zIndex: 9999 }}>
          ⚠ Fullscreen exited — Please re-enter to start
          <button
            className="btn btn-sm btn-warning ms-2"
            onClick={handleReEnterFullscreen}
          >
            Re-enter Fullscreen
          </button>
        </div>
      )}

      <div className="quiz-layout">
        <div className="quiz-sidebar">
          <div className="card p-3 shadow-sm bg-white flex-grow-1 d-flex flex-column">
            <h5 className="text-center mb-3">Exam Progress</h5>
            <div className="d-flex justify-content-between mb-3">
              <b>Time Left:</b>{" "}
              <span className={progressColor}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
            <div className="d-grid gap-2 flex-grow-1">
              {quiz.questions.map((_, index) => {
                let btnClass = "btn btn-secondary";
                if (answers[index] !== null) btnClass = "btn btn-success";
                if (currentQ === index) btnClass = "btn btn-danger text-white";
                return (
                  <button
                    key={index}
                    className={btnClass}
                    onClick={() => setCurrentQ(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="quiz-content">
          <div className="card p-4 shadow bg-light text-dark flex-grow-1 quiz-card">
            <h5 className="mb-4">{q.question}</h5>
            {q.options.map((option, i) => (
              <div key={i} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  id={`q${currentQ}-opt${i}`}
                  name={`q-${currentQ}`}
                  value={i}
                  checked={answers[currentQ] === i}
                  onChange={() => handleOptionChange(currentQ, i)}
                />
                <label
                  className="form-check-label"
                  htmlFor={`q${currentQ}-opt${i}`}
                >
                  {option}
                </label>
              </div>
            ))}

            <button
              className="btn btn-outline-danger btn-sm mt-3"
              onClick={() => handleClearResponse(currentQ)}
              disabled={answers[currentQ] === null}
            >
              Clear Response
            </button>

            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-outline-secondary"
                disabled={currentQ === 0}
                onClick={handlePrev}
              >
                Previous
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={answers[currentQ] === null}
              >
                {currentQ < quiz.questions.length - 1 ? "Next" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        .quiz-wrapper {
          background: linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .quiz-layout {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          flex: 1;
        }

        .quiz-sidebar {
          width: 200px;
        }

        .quiz-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .start-card {
          width: 50%;
          background: linear-gradient(135deg, #e9f9f6 0%, #e9f9f6 100%);
        }

        @media (max-width: 992px) {
          .start-card {
            width: 80%;
          }
        }

        @media (max-width: 768px) {
          .quiz-layout {
            flex-direction: column;
          }
          .quiz-sidebar {
            width: 100%;
            order: 2;
          }
          .quiz-content {
            order: 1;
          }
          .quiz-card {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .quiz-wrapper {
            padding: 1rem;
          }
          .start-card {
            width: 100%;
            padding: 1.5rem;
          }
          .quiz-card {
            padding: 1.5rem;
          }
          h5 {
            font-size: 1rem;
          }
          button {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Quiz;
