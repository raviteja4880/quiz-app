import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "./Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaBook,
  FaClock,
  FaSmileBeam,
  FaFrown,
  FaExclamationTriangle,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Quiz() {
  const { id, resultId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [visited, setVisited] = useState([]); // NEW: track visited questions
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
          setVisited(new Array(data.questions.length).fill(false)); // Initialize visited
        }
        setQuiz(data);
      } catch (err) {
        toast.error("Failed to load quiz: " + (err.response?.data?.message || err.message));
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

      toast.success("Quiz submitted successfully!");
    } catch (err) {
      toast.error(`Failed to submit quiz: ${err.response?.data?.message || err.message}`);
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
      alert("You exited fullscreen too many times. Exam ended.");
      handleSubmit();
    }
  }, [exitCount, started, result, reviewMode, exitLocked, handleSubmit]);

  // ===================== Handlers =====================
  const handleStart = async () => {
    if (!agree) return;
    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    setStarted(true);
  };

  const handleReEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
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
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[currentQ] = true;
      return newVisited;
    });
    if (currentQ < quiz.questions.length - 1) setCurrentQ(currentQ + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[currentQ] = true;
      return newVisited;
    });
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  // ===================== UI =====================
  if (!quiz) return <Loader />;

  // ---------- RESULT / REVIEW ----------
  if (result) {
    if (reviewMode) {
      return (
        <div className="container my-5">
          <h2 className="text-center mb-4">
            <FaBook className="text-primary me-2" />
            Quiz Review
          </h2>
          <h4 className="text-center mb-3">
            Score: {result.score} / {result.total}
          </h4>
          <p className="text-center mb-4">
            <FaCheckCircle className="text-success me-1" /> Correct: {result.correctCount} |{" "}
            <FaTimesCircle className="text-danger me-1" /> Wrong: {result.wrongCount} |{" "}
            <FaInfoCircle className="text-secondary me-1" /> Not Answered:{" "}
            {quiz.questions.length - (result.correctCount + result.wrongCount)}
          </p>

          <div className="card p-4 mb-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[index];
              return (
                <div key={index} className="mb-4">
                  <h5>
                    Q{index + 1}: {question.question}
                  </h5>
                  {question.options.map((option, i) => {
                    const isCorrect = i === question.correctAnswer;
                    const isUser = i === userAnswer;
                    let bgClass = "bg-light";
                    if (isCorrect) bgClass = "bg-success text-white";
                    else if (isUser && !isCorrect) bgClass = "bg-danger text-white";
                    else if (userAnswer === null) bgClass = "bg-secondary text-white";
                    return (
                      <div key={i} className={`p-2 rounded mb-1 ${bgClass}`}>
                        {option}
                      </div>
                    );
                  })}
                  {userAnswer === null && (
                    <div className="p-2 rounded mb-1 bg-secondary text-white">(Not Answered)</div>
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
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      );
    } else {
      const submittedAt = new Date().toLocaleString();
      const percentage = result.percentage || (result.score / result.total) * 100;
      const isGood = percentage >= 70;
      const greeting = isGood ? (
        <>
          <FaSmileBeam className="text-success me-2" />
          Great job! You performed very well!
        </>
      ) : (
        <>
          <FaFrown className="text-warning me-2" />
          Keep trying! You’ll do better next time.
        </>
      );

      return (
        <div
          className="container my-5 d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "80vh" }}
        >
          <h2 className="text-center mb-3 fw-bold text-success">
            <FaCheckCircle className="me-2" />
            Exam Submitted Successfully!
          </h2>
          <div className="card shadow p-4 text-center" style={{ maxWidth: "500px", width: "100%" }}>
            <h4 className="mb-3">{greeting}</h4>
            <p>
              <FaCheckCircle className="text-success me-1" /> Correct:{" "}
              <b className="text-success">{result.correctCount}</b>
            </p>
            <p>
              <FaTimesCircle className="text-danger me-1" /> Wrong:{" "}
              <b className="text-danger">{result.wrongCount}</b>
            </p>
            <p>
              <FaInfoCircle className="text-secondary me-1" /> Not Answered:{" "}
              <b>{quiz.questions.length - (result.correctCount + result.wrongCount)}</b>
            </p>
            <p className="text-muted">
              <FaClock className="me-1" /> Submitted at: <b>{submittedAt}</b>
            </p>
            <Link to="/myResults" className="btn btn-primary btn-lg">
              Back to My Results
            </Link>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      );
    }
  }

  // ---------- BEFORE START ----------
  if (!started) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 p-3">
        <div
          className="card shadow-lg p-4 text-start w-100"
          style={{
            maxWidth: "600px",
            background: "linear-gradient(135deg, #e9f9f6 0%, #e9f9f6 100%)",
          }}
        >
          <h3 className="text-center mb-3">{quiz.title}</h3>
          <p>{quiz.description}</p>

          <ul className="mb-4" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            <li>Read all questions carefully before answering.</li>
            <li>You must stay in fullscreen mode during the exam.</li>
            <li>If you exit fullscreen 3 times, your exam will be automatically submitted.</li>
            <li>Each question must be answered sequentially. You can revisit previous questions.</li>
            <li>
              Question Palette Legend:
              <ul className="mt-2" style={{ listStyle: "none", paddingLeft: "0" }}>
                <li className="d-flex align-items-center mb-1">
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#6c757d",
                      marginRight: "8px",
                      borderRadius: "4px",
                    }}
                  ></span>
                  Not Visited
                </li>
                <li className="d-flex align-items-center mb-1">
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#dc3545",
                      marginRight: "8px",
                      borderRadius: "4px",
                    }}
                  ></span>
                  Currently Viewing / Visited
                </li>
                <li className="d-flex align-items-center mb-1">
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#28a745",
                      marginRight: "8px",
                      borderRadius: "4px",
                    }}
                  ></span>
                  Answered
                </li>
              </ul>
            </li>
            <li>
              Time limit: <b>{quiz.timeLimit} minutes</b>
            </li>
            <li>Submit before time runs out; otherwise, it will auto-submit.</li>
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
            <button className="btn btn-success btn-lg" onClick={handleStart} disabled={!agree}>
              Start Exam
            </button>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    );
  }

  // ---------- LIVE QUIZ ----------
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const question = quiz.questions[currentQ];
  const progressColor =
    timeLeft <= 3 * 60 ? "text-danger" : timeLeft <= 5 * 60 ? "text-warning" : "text-success";

  return (
    <div
      className="vh-100 vw-100 p-3 d-flex flex-column"
      style={{ background: "linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%)" }}
    >
      {showWarning && exitCount < 3 && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-warning shadow"
          style={{ zIndex: 9999 }}
        >
          <FaExclamationTriangle className="me-2" />
          Fullscreen exited — Please re-enter to start
          <button className="btn btn-sm btn-warning ms-2" onClick={handleReEnterFullscreen}>
            Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* ---------- Question Palette (Multi-row Grid) ---------- */}
      <div className="d-flex justify-content-center mb-3 mt-4">
        <div
          className="card p-3 shadow-sm bg-white"
          style={{
            maxWidth: "600px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(45px, 1fr))",
            gap: "10px",
          }}
        >
          {quiz.questions.map((_, index) => {
            let btnClass = "btn btn-secondary btn-sm"; // default
            if (answers[index] !== null) btnClass = "btn btn-success btn-sm"; // answered
            else if (visited[index]) btnClass = "btn btn-danger btn-sm text-white"; // visited but not answered
            else if (currentQ === index) btnClass = "btn btn-danger btn-sm text-white"; // current
            return (
              <button
                key={index}
                className={btnClass}
                style={{
                  height: "45px",
                  fontWeight: "600",
                  borderRadius: "8px",
                }}
                onClick={() => {
                  setCurrentQ(index);
                  setVisited((prev) => {
                    const newVisited = [...prev];
                    newVisited[index] = true;
                    return newVisited;
                  });
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Question Section ---------- */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div
          className="card p-4 shadow bg-light text-dark w-100"
          style={{ maxHeight: "100%", overflowY: "auto" }}
        >
          <div className="d-flex justify-content-between mb-3">
            <b>Time Left:</b>{" "}
            <span className={progressColor}>
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          </div>

          <h5 className="mb-4">{question.question}</h5>
          {question.options.map((option, i) => (
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
              <label className="form-check-label" htmlFor={`q${currentQ}-opt${i}`}>
                {option}
              </label>
            </div>
          ))}

          {/* Button alignment fix */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={currentQ === 0}
              onClick={handlePrev}
            >
              Previous
            </button>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleClearResponse(currentQ)}
                disabled={answers[currentQ] === null}
              >
                Clear Response
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Quiz;
