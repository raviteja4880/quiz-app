import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { quizAPI } from "../services/api";

function Quiz() {
  const { id, resultId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reviewMode = !!resultId;

  const handleSubmit = async () => {
    if (submitting || reviewMode || result) return;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.values(answers);
      const res = await quizAPI.submit(quiz._id, formattedAnswers);

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
      console.error("Failed to submit quiz:", err);
      alert(`❌ Failed to submit quiz: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch quiz or result
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        let data;
        if (reviewMode) {
          const res = await quizAPI.getResultById(resultId);
          data = res.data;
          setAnswers(
            Object.fromEntries(data.questions.map((q, i) => [i, q.userAnswer]))
          );
          setResult(data.result);
        } else {
          const res = await quizAPI.getById(id);
          data = res.data;
          setTimeLeft(data.timeLimit * 60);
        }
        setQuiz(data);
      } catch (err) {
        console.error("Failed to load quiz", err);
        alert("Failed to load quiz: " + (err.response?.data?.message || err.message));
      }
    };
    fetchQuiz();
  }, [id, resultId, reviewMode]);

// timeout
useEffect(() => {
  if (timeLeft === 0 && started && !result && !reviewMode) handleSubmit();
}, [timeLeft, started, result, reviewMode, handleSubmit]);

// exitCount >= 3
useEffect(() => {
  if (exitCount >= 3 && started && !result && !reviewMode) {
    alert("❌ You exited fullscreen too many times. Exam ended.");
    handleSubmit();
  }
}, [exitCount, started, result, reviewMode, handleSubmit]);


  // Auto-submit on timeout 
  useEffect(() => {
    if (timeLeft === 0 && started && !result && !reviewMode) handleSubmit();
  }, [timeLeft, started, result, reviewMode, handleSubmit]);

  // Track fullscreen exit
  useEffect(() => {
    const handleExit = () => {
      if (!document.fullscreenElement && started && !reviewMode && !result) {
        setExitCount(prev => prev + 1);
        setShowWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleExit);
    return () => document.removeEventListener("fullscreenchange", handleExit);
  }, [started, reviewMode, result]);

  // Auto-submit when exitCount reaches 3
  useEffect(() => {
    if (exitCount >= 3 && started && !result && !reviewMode) {
      alert("❌ You exited fullscreen too many times. Exam ended.");
      handleSubmit();
    }
  }, [exitCount, started, result, reviewMode, handleSubmit]);

  const handleStart = async () => {
    if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    setStarted(true);
  };

  const reEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    setShowWarning(false);
  };

  const handleOptionChange = (qIndex, optionIndex) => {
    if (reviewMode) return;
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const handleClearResponse = (qIndex) => {
    if (reviewMode) return;
    const newAnswers = { ...answers };
    delete newAnswers[qIndex];
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < quiz.questions.length - 1) setCurrentQ(currentQ + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  if (!quiz) return <p className="text-center mt-5">Loading Exam...</p>;

  // ---------- RESULT / REVIEW ----------
  if (result) {
    return (
      <div className="container my-5">
        <h2 className="text-center mb-4">
          ✅ {reviewMode ? "Quiz Review" : "Exam Submitted Successfully!"}
        </h2>
        <h4 className="text-center mb-3">
          Score: {result.score} / {result.total}
        </h4>
        <p className="text-center mb-4">
          ✔ Correct: {result.correctCount} | ❌ Wrong: {result.wrongCount}
        </p>

        <div className="card p-4 mb-4">
          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            return (
              <div key={index} className="mb-3">
                <h5>Q{index + 1}: {q.question}</h5>
                {q.options.map((option, i) => {
                  let bgClass = "";
                  if (i === q.correctAnswer) bgClass = "bg-success text-white";
                  else if (i === userAnswer && i !== q.correctAnswer)
                    bgClass = "bg-danger text-white";
                  return (
                    <div key={i} className={`p-2 rounded mb-1 ${bgClass}`}>
                      {option}
                    </div>
                  );
                })}
                {userAnswer === undefined && (
                  <div className="p-2 rounded mb-1 bg-secondary text-white">
                    (Not Answered)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/quizlist" className="btn btn-primary btn-lg">
            ⬅ Back to quizlist
          </Link>
        </div>
      </div>
    );
  }

  // ---------- BEFORE START ----------
  if (!started) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-gradient"
        style={{ background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)" }}>
        <div className="card shadow-lg p-4 text-center w-50">
          <h3 className="mb-3">{quiz.title}</h3>
          <p>{quiz.description}</p>
          <p>⏳ Time Limit: {quiz.timeLimit} minutes</p>
          <button className="btn btn-success btn-lg" onClick={handleStart}>
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ---------- LIVE QUIZ ----------
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const q = quiz.questions[currentQ];
  let progressColor =
    timeLeft <= 3 * 60
      ? "bg-danger"
      : timeLeft <= 5 * 60
        ? "bg-warning"
        : "bg-success";

  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className="vh-100 vw-100 p-4"
      style={{
        background: "linear-gradient(135deg, #9aa8e9ff 0%, #c098e9ff 100%)",
        color: "#fff",
        overflowY: "auto"
      }}
    >
      {showWarning && (
        <div className="alert alert-danger text-center">
          ⚠️ You exited fullscreen! Click below to continue.
          <br />
          <button className="btn btn-warning mt-2" onClick={reEnterFullscreen}>
            Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* Exam Details + Palette */}
      <div className="d-flex justify-content-end mb-4">
        <div className="card p-3 shadow-lg bg-white text-dark w-100" style={{ maxWidth: "600px" }}>
          <h5 className="text-center mb-2">Exam Details</h5>
          <div className="d-flex justify-content-between">
            <p><b>Title:</b> {quiz.title}</p>
            <p><b>Total Questions:</b> {quiz.questions.length}</p>
            <p>
              <b>⏳ Time Left:</b>{" "}
              <span className={
                progressColor === "bg-success"
                  ? "text-success"
                  : progressColor === "bg-warning"
                    ? "text-warning"
                    : "text-danger"
              }>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </p>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Question Palette</h6>
            <span><b>Answered:</b> {answeredCount}/{quiz.questions.length}</span>
          </div>

          <div
            className="d-grid gap-2"
            style={{
              gridTemplateColumns: "repeat(5, 1fr)",
              display: "grid",
              gap:"10px",
            }}
          >
            {quiz.questions.map((_, index) => {
              let btnClass = "btn btn-outline-secondary";
              if (answers[index] !== undefined) btnClass = "btn btn-success";
              if (currentQ === index) btnClass += " border border-dark";

              return (
                <button
                  key={index}
                  className={btnClass}
                  style={{ minWidth: "50px", minHeight: "50px" }}
                  onClick={() => setCurrentQ(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Full Width */}
      <div className="p-4 rounded shadow bg-light text-dark">
        <h5 className="mb-3">{q.question}</h5>
        {q.options.map((option, i) => (
          <div key={i} className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              id={`question-${currentQ}-option-${i}`}
              name={`question-${currentQ}`}
              value={i}
              checked={answers[currentQ] === i}
              onChange={() => handleOptionChange(currentQ, i)}
              disabled={reviewMode}
            />
            <label
              className="form-check-label"
              htmlFor={`question-${currentQ}-option-${i}`}
              style={{ cursor: reviewMode ? "default" : "pointer" }}
            >
              {option}
            </label>
          </div>
        ))}

        {/* Clear Response Button */}
        <button
          className="btn btn-sm btn-outline-danger mt-3"
          onClick={() => handleClearResponse(currentQ)}
          disabled={answers[currentQ] === undefined}
        >
          Clear Response
        </button>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-outline-light"
          disabled={currentQ === 0}
          onClick={handlePrev}
        >
          Previous
        </button>
        <button
          className="btn btn-light btn-lg"
          onClick={handleNext}
          disabled={answers[currentQ] === undefined}
        >
          {currentQ < quiz.questions.length - 1 ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
