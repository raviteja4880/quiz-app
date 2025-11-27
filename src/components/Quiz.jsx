import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [visited, setVisited] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [exitLocked, setExitLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const [attemptedStart, setAttemptedStart] = useState(false);
  const [blockInteraction, setBlockInteraction] = useState(false);

  const [timerId, setTimerId] = useState(null);
  const reviewMode = !!resultId;

  const [recentReentry, setRecentReentry] = useState(false);
  const reentryTimeout = useRef(null);

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
          setVisited(new Array(data.questions.length).fill(false));
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

    const loadingToast = toast.loading("Submitting your quiz... please wait");

    try {
      const res = await quizAPI.submit(quiz._id, answers);
      if (document.fullscreenElement) await document.exitFullscreen();

      const correctCount = res.data.correctCount ?? 0;
      const wrongCount = res.data.wrongCount ?? 0;
      const total = res.data.total ?? quiz.questions.length;
      const notAnswered = total - (correctCount + wrongCount);

      setResult({
        score: res.data.score,
        correctCount,
        wrongCount,
        total,
        notAnswered,
        percentage: res.data.percentage,
        status: res.data.status,
        userAnswers: answers,
      });

      toast.update(loadingToast, {
        render: "Quiz submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true,
      });

      setTimeout(() => {
        toast.info("Your results are ready to view", {
          autoClose: 5000,
          closeOnClick: true,
        });
      }, 2200);
    } catch (err) {
      toast.update(loadingToast, {
        render: `Failed to submit quiz: ${err.response?.data?.message || err.message}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeOnClick: true,
      });
    } finally {
      setSubmitting(false);
    }
  }, [answers, submitting, reviewMode, result, quiz?._id, quiz?.questions?.length, timerId]);

  // ===================== Auto-submit on timeout =====================
  useEffect(() => {
    if (timeLeft === 0 && started && !result && !reviewMode) handleSubmit();
  }, [timeLeft, started, result, reviewMode, handleSubmit]);

  // ===================== Fullscreen Exit Tracking =====================
  useEffect(() => {
    const handleExit = () => {
      if (recentReentry) return;

      if (!document.fullscreenElement && started && !reviewMode && !result) {
        setExitCount((prev) => prev + 1);
        setShowWarning(true);
        setBlockInteraction(true); // block UI interactions (overlay will show)
      }
    };
    document.addEventListener("fullscreenchange", handleExit);
    return () => document.removeEventListener("fullscreenchange", handleExit);
  }, [started, reviewMode, result, recentReentry]);

  useEffect(() => {
    if (started && !result && !reviewMode && !exitLocked) {
      if (exitCount === 1 || exitCount === 2) {
        toast.warning(`You exited fullscreen ${exitCount} time${exitCount > 1 ? "s" : ""}. Please stay in fullscreen!`);
      } else if (exitCount >= 3) {
        setExitLocked(true);
        alert("You exited fullscreen too many times. Exam ended.");
        handleSubmit();
      }
    }
  }, [exitCount, started, result, reviewMode, exitLocked, handleSubmit]);

  // ===================== Handlers =====================
  const handleStart = async () => {
    setAttemptedStart(true);
    if (!agree) {
      toast.warning("Please agree the checkbox before starting!");
      return;
    }

    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();

    setStarted(true);
  };

  const handleReEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();

    // hide warning and restore interaction
    setShowWarning(false);
    setBlockInteraction(false);

    setRecentReentry(true);
    clearTimeout(reentryTimeout.current);
    reentryTimeout.current = setTimeout(() => setRecentReentry(false), 1500);
  };

  const handleOptionChange = (qIndex, optionIndex) => {
    if (reviewMode || blockInteraction) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleClearResponse = (qIndex) => {
    if (reviewMode || blockInteraction) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = null;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (blockInteraction) return;
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[currentQ] = true;
      return newVisited;
    });
    if (currentQ < quiz.questions.length - 1) setCurrentQ(currentQ + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (blockInteraction) return;
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
            {result.notAnswered ?? quiz.questions.length - (result.correctCount + result.wrongCount)}
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
              <FaCheckCircle className="text-success me-1" /> Correct: <b className="text-success">{result.correctCount}</b>
            </p>
            <p>
              <FaTimesCircle className="text-danger me-1" /> Wrong: <b className="text-danger">{result.wrongCount}</b>
            </p>
            <p>
              <FaInfoCircle className="text-secondary me-1" /> Not Answered:{" "}
              <b>{result.notAnswered ?? quiz.questions.length - (result.correctCount + result.wrongCount)}</b>
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
          <p>
            <b>{quiz.description}</b>
          </p>

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
            <li>Time limit: <b>{quiz.timeLimit} minutes</b></li>
            <li>Submit before time runs out; otherwise, it will <b>auto-submit.</b></li>
          </ul>
          <div className="form-check mt-3">
            <input
              type="checkbox"
              id="agree"
              className={`form-check-input me-2 agree-checkbox ${!agree && attemptedStart ? "highlight-warning" : ""}`}
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label
              htmlFor="agree"
              className="form-check-label"
              style={
                !agree && attemptedStart
                  ? {
                      color: "#ffc107",
                      fontWeight: 600,
                      border: "3px solid #ffc107",
                      boxShadow: "0 0 8px 2px #ffeb3b",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      transition: "box-shadow 0.3s ease, border 0.3s ease",
                    }
                  : {}
              }
            >
              <b>I carefully Read all instructions</b>
            </label>
          </div>
          <div className="text-center">
            <button className="btn btn-success btn-lg" onClick={handleStart}>
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
  const progressColor = timeLeft <= 3 * 60 ? "text-danger" : timeLeft <= 5 * 60 ? "text-warning" : "text-success";

  return (
    <div
      className="vh-100 vw-100 p-3 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%)",
        overflow: "hidden",
      }}
    >
      {/* Interaction overlay (shows cursor and blocks UI) */}
      {blockInteraction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            cursor: "not-allowed",
            zIndex: 9998,
          }}
        />
      )}

      {/* Warning box - zIndex above overlay so its button is clickable */}
      {showWarning && exitCount < 3 && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-warning shadow"
          style={{ zIndex: 9999, pointerEvents: "auto" }}
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
                  if (blockInteraction) return;
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
          className="card shadow bg-white text-dark p-4"
          style={{
            maxWidth: "850px",
            width: "100%",
            borderRadius: "16px",
            border: "none",
          }}
        >
          {/* Timer */}
          <div className="d-flex justify-content-end mb-3">
            <div className="fw-bold">
              Time Left:{" "}
              <span className={progressColor}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            </div>
          </div>

          {/* Question */}
          <h5 className="fw-bold mb-4">Question {currentQ + 1}</h5>
          <p className="fs-6 mb-4">{question.question}</p>

          {/* Options */}
          <div className="d-flex flex-column gap-3">
            {question.options.map((option, i) => (
              <div
                key={i}
                className={`p-3 rounded shadow-sm border ${answers[currentQ] === i ? "bg-info text-white" : "bg-light"}`}
                style={{
                  cursor: blockInteraction ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => handleOptionChange(currentQ, i)}
              >
                <div className="form-check">
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    id={`q${currentQ}-opt${i}`}
                    name={`q-${currentQ}`}
                    value={i}
                    checked={answers[currentQ] === i}
                    onChange={() => handleOptionChange(currentQ, i)}
                    disabled={blockInteraction}
                  />
                  <label className="form-check-label w-100" htmlFor={`q${currentQ}-opt${i}`}>
                    {option}
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={currentQ === 0 || submitting || blockInteraction}
              onClick={handlePrev}
              style={{ minWidth: "120px" }}
            >
              Previous
            </button>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                className="btn btn-outline-danger"
                onClick={() => handleClearResponse(currentQ)}
                disabled={answers[currentQ] === null || submitting || blockInteraction}
                style={{ minWidth: "120px" }}
              >
                Clear Response
              </button>

              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={submitting || blockInteraction}
                style={{ minWidth: "120px" }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : currentQ < quiz.questions.length - 1 ? (
                  "Next"
                ) : (
                  "Submit"
                )}
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
