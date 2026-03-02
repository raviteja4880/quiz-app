import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "../components/Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaBook,
  FaClock,
  FaSmileBeam,
  FaFrown,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaTrophy,
  FaChartLine,
  FaQuestionCircle,
  FaMobileAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mobile detection hook
const useIsMobile = (breakpoint = 992) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

function Quiz() {
  const { id, resultId } = useParams();
  const isMobile = useIsMobile(992);

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
  
  // State for tracking visible questions (used for question preloading)
  const [, setVisibleQuestions] = useState(new Set([0]));
  const [loadedQuestions, setLoadedQuestions] = useState(new Set());
  const questionRefs = useRef({});

  const [timerId, setTimerId] = useState(null);
  const reviewMode = !!resultId;

  const [recentReentry, setRecentReentry] = useState(false);
  const reentryTimeout = useRef(null);

  // Ref to track if fullscreen was previously active
  const wasInFullscreen = useRef(false);
  // Ref to debounce fullscreen exit detection
  const exitTimeoutRef = useRef(null);

  useEffect(() => {
    if (!reviewMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.questionIndex);
            setLoadedQuestions((prev) => new Set([...prev, index]));
          }
        });
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    Object.values(questionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reviewMode, quiz?.questions.length]);

  useEffect(() => {
    if (!started || reviewMode) return;
    
    const preloadSet = new Set([currentQ]);
    if (currentQ > 0) preloadSet.add(currentQ - 1);
    if (currentQ < quiz?.questions.length - 1) preloadSet.add(currentQ + 1);
    
    setVisibleQuestions(preloadSet);
  }, [currentQ, started, reviewMode, quiz?.questions.length]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        let data;
        if (reviewMode) {
          const res = await quizAPI.getResultById(resultId);
          data = res.data;
          setAnswers(data.questions.map((q) => q.userAnswer ?? null));
          setResult(data.result);
          setLoadedQuestions(new Set([0, 1, 2, 3, 4]));
        } else {
          const res = await quizAPI.getById(id);
          data = res.data;
          setTimeLeft(data.timeLimit * 60);
          setAnswers(new Array(data.questions.length).fill(null));
          setVisited(new Array(data.questions.length).fill(false));
          setVisibleQuestions(new Set([0, 1, 2]));
        }
        setQuiz(data);
      } catch (err) {
        toast.error("Failed to load quiz: " + (err.response?.data?.message || err.message));
      }
    };
    fetchQuiz();
  }, [id, resultId, reviewMode]);

  useEffect(() => {
    if (!started || reviewMode || result) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    setTimerId(id);

    return () => {
      if (id) clearInterval(id);
    };
  }, [started, reviewMode, result]);

  const handleSubmit = useCallback(async () => {
    if (submitting || reviewMode || result) return;

    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
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
  }, [answers, submitting, reviewMode, result, quiz, timerId]);

  // Memoized handleSubmit for useEffect dependencies
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (timeLeft === 0 && started && !result && !reviewMode) {
      handleSubmitRef.current();
    }
  }, [timeLeft, started, result, reviewMode]);

  useEffect(() => {
    const handleExit = () => {
      // Clear any pending timeout
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }

      // Debounce the fullscreen check
      exitTimeoutRef.current = setTimeout(() => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        
        // Only trigger if we were in fullscreen and now we're not
        // This prevents triggering when clicking options inside fullscreen
        if (wasInFullscreen.current && !isCurrentlyFullscreen && !recentReentry && started && !reviewMode && !result) {
          setExitCount((prev) => prev + 1);
          setShowWarning(true);
          setBlockInteraction(true);
        }
        
        // Update the ref
        wasInFullscreen.current = isCurrentlyFullscreen;
      }, 100);
    };

    // Set initial fullscreen state
    wasInFullscreen.current = !!document.fullscreenElement;

    document.addEventListener("fullscreenchange", handleExit);
    return () => {
      document.removeEventListener("fullscreenchange", handleExit);
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [started, reviewMode, result, recentReentry]);

  useEffect(() => {
    if (started && !result && !reviewMode && !exitLocked) {
      if (exitCount === 1 || exitCount === 2) {
        toast.warning(`You exited fullscreen ${exitCount} time${exitCount > 1 ? "s" : ""}. Please stay in fullscreen!`);
      } else if (exitCount >= 3) {
        setExitLocked(true);
        alert("You exited fullscreen too many times. Exam ended.");
        handleSubmitRef.current();
      }
    }
  }, [exitCount, started, result, reviewMode, exitLocked]);

  const handleStart = async () => {
    setAttemptedStart(true);
    if (!agree) {
      toast.warning("Please agree the checkbox before starting!");
      return;
    }

    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        wasInFullscreen.current = true;
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    }

    setStarted(true);
  };

  const handleReEnterFullscreen = async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        wasInFullscreen.current = true;
      } catch (err) {
        console.warn("Fullscreen re-entry failed:", err);
      }
    }

    setShowWarning(false);
    setBlockInteraction(false);

    setRecentReentry(true);
    clearTimeout(reentryTimeout.current);
    reentryTimeout.current = setTimeout(() => setRecentReentry(false), 1500);
  };

  const handleOptionChange = useCallback((qIndex, optionIndex) => {
    if (reviewMode || blockInteraction) return;
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[qIndex] = optionIndex;
      return newAnswers;
    });
  }, [reviewMode, blockInteraction]);

  const handleClearResponse = useCallback((qIndex) => {
    if (reviewMode || blockInteraction) return;
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[qIndex] = null;
      return newAnswers;
    });
  }, [reviewMode, blockInteraction]);

  const handleNext = useCallback(() => {
    if (blockInteraction) return;
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[currentQ] = true;
      return newVisited;
    });
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setVisibleQuestions((prev) => {
        const newSet = new Set(prev);
        if (currentQ + 2 < quiz.questions.length) newSet.add(currentQ + 2);
        return newSet;
      });
    } else {
      handleSubmitRef.current();
    }
  }, [blockInteraction, currentQ, quiz?.questions.length]);

  const handlePrev = useCallback(() => {
    if (blockInteraction) return;
    setVisited((prev) => {
      const newVisited = [...prev];
      newVisited[currentQ] = true;
      return newVisited;
    });
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
      setVisibleQuestions((prev) => {
        const newSet = new Set(prev);
        if (currentQ - 2 >= 0) newSet.add(currentQ - 2);
        return newSet;
      });
    }
  }, [blockInteraction, currentQ]);

  // Refs for keyboard handler
  const currentQRef = useRef(currentQ);
  const quizRef = useRef(quiz);
  const startedRef = useRef(started);
  const resultRef = useRef(result);
  const reviewModeRef = useRef(reviewMode);
  const blockInteractionRef = useRef(blockInteraction);
  const handleNextRef = useRef(handleNext);
  const handlePrevRef = useRef(handlePrev);
  const handleOptionChangeRef = useRef(handleOptionChange);
  
  useEffect(() => {
    currentQRef.current = currentQ;
    quizRef.current = quiz;
    startedRef.current = started;
    resultRef.current = result;
    reviewModeRef.current = reviewMode;
    blockInteractionRef.current = blockInteraction;
  }, [currentQ, quiz, started, result, reviewMode, blockInteraction]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  useEffect(() => {
    handlePrevRef.current = handlePrev;
  }, [handlePrev]);

  useEffect(() => {
    handleOptionChangeRef.current = handleOptionChange;
  }, [handleOptionChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!quizRef.current || !startedRef.current || resultRef.current || reviewModeRef.current || blockInteractionRef.current) return;
      
      const currentQuestion = quizRef.current.questions[currentQRef.current];
      if (!currentQuestion) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNextRef.current();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevRef.current();
      } else if (e.key >= "1" && e.key <= "4") {
        const optionIndex = parseInt(e.key) - 1;
        if (currentQuestion.options && optionIndex < currentQuestion.options.length) {
          handleOptionChangeRef.current(currentQRef.current, optionIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobile blocking popup - show before quiz loads
  if (isMobile && !reviewMode) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 p-3 mobile-block-container">
        <div className="card shadow-lg p-5 text-center mobile-block-card">
          <div className="mobile-icon mb-4">
            <FaMobileAlt size={80} className="text-primary" />
          </div>
          <h2 className="mb-4 mobile-title">Desktop Required</h2>
          <p className="mobile-message mb-4">
            This exam can only be taken on a desktop or laptop computer.
            <br />
            <strong>Please access this quiz from a computer with a minimum screen width of 992px.</strong>
          </p>
          <div className="mobile-requirements">
            <h5 className="mb-3">Requirements:</h5>
            <ul className="text-start">
              <li>Desktop or Laptop Computer</li>
              <li>Screen width: 992px or more</li>
              <li>Fullscreen mode required</li>
              <li>Keyboard navigation</li>
            </ul>
          </div>
          <Link to="/quizlist" className="btn btn-primary btn-lg mt-4">
            Back to Quiz List
          </Link>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
        <style>{`
          .mobile-block-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .mobile-block-card {
            max-width: 500px;
            border-radius: 20px;
            animation: slideIn 0.5s ease-out;
          }
          .mobile-icon {
            animation: pulse 2s infinite;
          }
          .mobile-title {
            color: #333;
            font-weight: 700;
          }
          .mobile-message {
            color: #666;
            font-size: 1.1rem;
            line-height: 1.6;
          }
          .mobile-requirements {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
          }
          .mobile-requirements ul {
            list-style: none;
            padding-left: 0;
          }
          .mobile-requirements li {
            padding: 8px 0;
            color: #555;
          }
          .mobile-requirements li::before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
            margin-right: 8px;
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  if (!quiz) return <Loader />;

  if (result) {
    const submittedAt = new Date().toLocaleString();
    const percentage = result.percentage || (result.score / result.total) * 100;
    const isGood = percentage >= 70;
    const isExcellent = percentage >= 90;
    const isGoodScore = percentage >= 50;

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
              const isLoaded = loadedQuestions.has(index);
              
              return (
                <div 
                  key={index} 
                  className="mb-4 question-review-item"
                  data-question-index={index}
                  ref={(el) => (questionRefs.current[index] = el)}
                  style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  <h5>
                    <span className="question-number">{index + 1}</span>
                    {question.question}
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
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      );
    } else {
      const greeting = isExcellent ? (
        <>
          <FaTrophy className="text-warning me-2" />
          Outstanding! You aced it!
        </>
      ) : isGood ? (
        <>
          <FaSmileBeam className="text-success me-2" />
          Great job! You performed very well!
        </>
      ) : isGoodScore ? (
        <>
          <FaChartLine className="text-info me-2" />
          Good effort! Keep improving!
        </>
      ) : (
        <>
          <FaFrown className="text-warning me-2" />
          Keep trying! You'll do better next time.
        </>
      );

      const accuracy = result.total > 0 ? ((result.correctCount / result.total) * 100).toFixed(1) : 0;
      const scoreColor = isExcellent ? "#28a745" : isGood ? "#17a2b8" : isGoodScore ? "#ffc107" : "#dc3545";

      return (
        <div
          className="result-container my-5 d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "80vh", padding: "20px" }}
        >
          <div className="result-card shadow-lg p-4 text-center" style={{ maxWidth: "600px", width: "100%", borderRadius: "20px" }}>
            <div className="result-icon mb-3">
              {isExcellent ? (
                <FaTrophy size={60} className="text-warning animate-bounce" />
              ) : isGood ? (
                <FaSmileBeam size={60} className="text-success" />
              ) : isGoodScore ? (
                <FaChartLine size={60} className="text-info" />
              ) : (
                <FaFrown size={60} className="text-warning" />
              )}
            </div>

            <h2 className="text-center mb-3 fw-bold" style={{ color: scoreColor }}>
              <FaCheckCircle className="me-2" />
              Exam Submitted Successfully!
            </h2>
            
            <h4 className="mb-4 result-greeting">{greeting}</h4>

            <div className="score-circle mx-auto mb-4" style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: `conic-gradient(${scoreColor} ${percentage * 3.6}deg, #e9ecef 0deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}>
                <span style={{ fontSize: "2rem", fontWeight: "bold", color: scoreColor }}>{percentage.toFixed(0)}%</span>
                <small className="text-muted">Score</small>
              </div>
            </div>

            <div className="stats-grid mb-4">
              <div className="stat-item">
                <FaCheckCircle className="text-success me-2" />
                <span>Correct: <b className="text-success">{result.correctCount}</b></span>
              </div>
              <div className="stat-item">
                <FaTimesCircle className="text-danger me-2" />
                <span>Wrong: <b className="text-danger">{result.wrongCount}</b></span>
              </div>
              <div className="stat-item">
                <FaInfoCircle className="text-secondary me-2" />
                <span>Not Answered: <b>{result.notAnswered ?? quiz.questions.length - (result.correctCount + result.wrongCount)}</b></span>
              </div>
              <div className="stat-item">
                <FaQuestionCircle className="text-info me-2" />
                <span>Accuracy: <b className="text-info">{accuracy}%</b></span>
              </div>
            </div>

            <p className="text-muted">
              <FaClock className="me-1" /> Submitted at: <b>{submittedAt}</b>
            </p>

            <div className="result-actions mt-4">
              <Link to="/myResults" className="btn btn-primary btn-lg mx-2">
                View Results
              </Link>
              <Link to="/quizlist" className="btn btn-outline-primary btn-lg mx-2">
                Take Another Quiz
              </Link>
            </div>
          </div>

          <ToastContainer position="top-right" autoClose={3000} />

          <style>{`
            .result-container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .result-card {
              background: white;
              animation: slideUp 0.5s ease-out;
            }
            .result-icon {
              animation: popIn 0.5s ease-out;
            }
            .score-circle {
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .stat-item {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 12px;
              background: #f8f9fa;
              border-radius: 10px;
              font-size: 0.95rem;
            }
            .result-greeting {
              color: #555;
              font-weight: 500;
            }
            .result-actions {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes popIn {
              0% { transform: scale(0); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .animate-bounce { animation: bounce 1s infinite; }
            @media (max-width: 576px) {
              .stats-grid { grid-template-columns: 1fr; }
              .result-actions .btn { width: 100%; margin: 5px 0; }
              .score-circle { width: 120px; height: 120px; }
              .score-circle div { width: 100px; height: 100px; }
            }
          `}</style>
        </div>
      );
    }
  }

  if (!started) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 p-3 quiz-start-container">
        <div
          className="card shadow-lg p-4 text-start w-100 quiz-start-card"
          style={{ maxWidth: "600px", background: "linear-gradient(135deg, #e9f9f6 0%, #e9f9f6 100%)", borderRadius: "20px" }}
        >
          <div className="quiz-header text-center mb-4">
            <h3 className="quiz-title">{quiz.title}</h3>
            <p className="quiz-description">{quiz.description}</p>
          </div>

          <div className="quiz-info mb-4">
            <div className="info-item">
              <FaQuestionCircle className="me-2 text-primary" />
              <span><b>{quiz.questions.length}</b> Questions</span>
            </div>
            <div className="info-item">
              <FaClock className="me-2 text-warning" />
              <span><b>{quiz.timeLimit}</b> Minutes</span>
            </div>
          </div>

          <ul className="instructions mb-4">
            <li>Read all questions carefully before answering.</li>
            <li>You must stay in fullscreen mode during the exam.</li>
            <li>If you exit fullscreen 3 times, your exam will be automatically submitted.</li>
            <li>Each question must be answered sequentially. You can revisit previous questions.</li>
            <li>
              Question Palette Legend:
              <ul className="mt-2 legend-list">
                <li className="d-flex align-items-center mb-1"><span className="legend-dot" style={{backgroundColor: "#6c757d"}}></span> Not Visited</li>
                <li className="d-flex align-items-center mb-1"><span className="legend-dot" style={{backgroundColor: "#dc3545"}}></span> Currently Viewing / Visited</li>
                <li className="d-flex align-items-center mb-1"><span className="legend-dot" style={{backgroundColor: "#28a745"}}></span> Answered</li>
              </ul>
            </li>
            <li>Submit before time runs out; otherwise, it will <b>auto-submit.</b></li>
          </ul>
          
          <div className="form-check mt-3">
            <input
              type="checkbox"
              id="agree"
              className={`form-check-input me-2 ${!agree && attemptedStart ? "highlight-warning" : ""}`}
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="agree" className="form-check-label">
              <b>I carefully Read all instructions</b>
            </label>
          </div>
          
          <div className="text-center mt-4">
            <button className="btn btn-success btn-lg start-btn" onClick={handleStart}>
              Start Exam
            </button>
          </div>
          
          <ToastContainer position="top-right" autoClose={3000} />

          <style>{`
            .quiz-start-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .quiz-start-card { animation: slideIn 0.5s ease-out; }
            .quiz-title { color: #333; font-weight: 700; }
            .quiz-description { color: #666; }
            .quiz-info { display: flex; gap: 20px; justify-content: center; }
            .info-item { display: flex; align-items: center; padding: 10px 20px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .legend-dot { display: inline-block; width: 20px; height: 20px; margin-right: 8px; border-radius: 4px; }
            .legend-list { list-style: none; padding-left: 0; }
            .start-btn { padding: 15px 50px; border-radius: 30px; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; }
            .start-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(40, 167, 69, 0.4); }
            @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 576px) { .quiz-info { flex-direction: column; gap: 10px; } .info-item { justify-content: center; } }
          `}</style>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const question = quiz.questions[currentQ];
  const progressColor = timeLeft <= 3 * 60 ? "text-danger" : timeLeft <= 5 * 60 ? "text-warning" : "text-success";
  
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="vh-100 vw-100 p-3 d-flex flex-column live-quiz-container" style={{ background: "linear-gradient(135deg, #6a85b6 0%, #bac8e0 100%)", overflow: "hidden" }}>
      {blockInteraction && <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)", cursor: "not-allowed", zIndex: 9998 }} />}

      {showWarning && exitCount < 3 && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-warning shadow" style={{ zIndex: 9999, pointerEvents: "auto" }}>
          <FaExclamationTriangle className="me-2" />
          Fullscreen exited — Please re-enter to start
          <button className="btn btn-sm btn-warning ms-2" onClick={handleReEnterFullscreen}>Re-enter Fullscreen</button>
        </div>
      )}

      <div className="quiz-header-section mb-3 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="quiz-timer">
            <FaClock className="me-2" />
            Time Left: <span className={progressColor} style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>
          <div className="quiz-progress-text">Question {currentQ + 1} of {quiz.questions.length}</div>
        </div>
        
        <div className="progress-container">
          <div className="progress" style={{ height: "8px", borderRadius: "10px" }}>
            <div className={`progress-bar ${progressColor.replace('text-', 'bg-')}`} role="progressbar" style={{ width: `${progress}%`, borderRadius: "10px", transition: "width 0.3s ease" }} />
          </div>
          <small className="text-muted mt-1 d-block">{answeredCount} answered ({progress.toFixed(0)}%)</small>
        </div>
      </div>

      <div className="d-flex justify-content-center mb-3">
        <div className="card p-2 shadow-sm bg-white question-palette" style={{ maxWidth: "700px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(40px, 1fr))", gap: "8px" }}>
          {quiz.questions.map((_, index) => {
            let btnClass = "btn btn-secondary btn-sm";
            if (answers[index] !== null) btnClass = "btn btn-success btn-sm";
            else if (visited[index] || currentQ === index) btnClass = "btn btn-danger btn-sm text-white";
            return (
              <button key={index} className={`${btnClass} question-btn ${currentQ === index ? 'current' : ''}`} style={{ height: "40px", fontWeight: "600", borderRadius: "8px", transition: "transform 0.2s, box-shadow 0.2s" }} onClick={() => { if (blockInteraction) return; setCurrentQ(index); setVisited((prev) => { const newVisited = [...prev]; newVisited[index] = true; return newVisited; }); }}>
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="card shadow bg-white text-dark p-4 question-card" style={{ maxWidth: "850px", width: "100%", borderRadius: "20px", border: "none" }}>
          <div className="question-header mb-3"><span className="question-badge">Question {currentQ + 1}</span></div>
          <h5 className="fw-bold mb-4 question-text">{question.question}</h5>

          <div className="d-flex flex-column gap-3">
            {question.options.map((option, i) => (
              <div key={i} className={`p-3 rounded shadow-sm border option-item ${answers[currentQ] === i ? "selected" : ""}`} style={{ cursor: blockInteraction ? "not-allowed" : "pointer", transition: "all 0.2s ease-in-out", background: answers[currentQ] === i ? "#e7f3ff" : "#f8f9fa", borderColor: answers[currentQ] === i ? "#0d6efd" : "#dee2e6" }} onClick={() => handleOptionChange(currentQ, i)}>
                <div className="form-check d-flex align-items-center">
                  <input className="form-check-input me-3" style={{ width: "20px", height: "20px" }} type="radio" id={`q${currentQ}-opt${i}`} name={`q-${currentQ}`} value={i} checked={answers[currentQ] === i} onChange={() => handleOptionChange(currentQ, i)} disabled={blockInteraction} />
                  <label className="form-check-label w-100" htmlFor={`q${currentQ}-opt${i}`}><span className="option-letter">{String.fromCharCode(65 + i)}.</span> {option}</label>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2 nav-buttons">
            <button className="btn btn-outline-secondary nav-btn" disabled={currentQ === 0 || submitting || blockInteraction} onClick={handlePrev} style={{ minWidth: "120px", borderRadius: "10px" }}><FaChevronLeft className="me-1" /> Previous</button>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <button className="btn btn-outline-danger clear-btn" onClick={() => handleClearResponse(currentQ)} disabled={answers[currentQ] === null || submitting || blockInteraction} style={{ minWidth: "120px", borderRadius: "10px" }}>Clear Response</button>
              <button className="btn btn-primary submit-btn" onClick={handleNext} disabled={submitting || blockInteraction} style={{ minWidth: "120px", borderRadius: "10px" }}>
                {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...</> : currentQ < quiz.questions.length - 1 ? <>Next <FaChevronRight className="ms-1" /></> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .question-btn.current { transform: scale(1.1); box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.5); }
        .question-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
        .option-item:hover:not(.selected) { transform: translateX(5px); border-color: #0d6efd !important; }
        .option-letter { font-weight: bold; color: #0d6efd; margin-right: 5px; }
        .nav-btn, .clear-btn, .submit-btn { transition: all 0.2s ease; }
        .nav-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .submit-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }
        .question-card { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .question-palette { max-width: 100% !important; padding: 10px !important; }
          .question-btn { height: 35px !important; font-size: 0.8rem !important; }
          .nav-buttons { flex-direction: column; width: 100%; }
          .nav-buttons > div { width: 100%; justify-content: center !important; }
          .nav-btn, .clear-btn, .submit-btn { width: 100%; }
          .option-item { padding: 12px !important; }
        }
      `}</style>
    </div>
  );
}

export default Quiz;
