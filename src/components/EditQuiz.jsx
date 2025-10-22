import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import Loader from "./Loader";
import { FaCheckCircle, FaExclamationCircle, FaTrash, FaPlusCircle } from "react-icons/fa";
import { toast } from "react-toastify";

function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    timeLimit: "",
    questions: [],
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { data } = await quizAPI.getFullById(id);
        setQuiz(data);
        setError("");
        toast.success("Quiz loaded successfully"); 
      } catch (err) {
        console.error("Failed to load quiz:", err.response?.data || err.message);
        setError("Failed to load quiz for editing");
        toast.error("Failed to load quiz for editing");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) return <Loader />;

  const handleChange = (e) => {
    setQuiz({ ...quiz, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quiz.questions];
    updated[index][field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...quiz.questions];
    updated[qIndex].options[optIndex] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const updated = [...quiz.questions];
    updated[qIndex].correctAnswer = parseInt(value);
    setQuiz({ ...quiz, questions: updated });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
    toast.info("New question added"); 
  };

  const deleteQuestion = (index) => {
    // Replacing window.confirm with a toast message
    toast.warn("Click again to confirm deletion ⚠️");
    setTimeout(() => {
      const updated = quiz.questions.filter((_, i) => i !== index);
      setQuiz({ ...quiz, questions: updated });
      toast.success("Question deleted successfully");
    }, 1000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await quizAPI.update(id, quiz);
      toast.success("Quiz updated successfully");
      navigate("/admin");
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      setError("Failed to update quiz");
      toast.error("Failed to update quiz");
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <p style={{ color: "red" }}>
        <FaExclamationCircle className="me-2" />
        {error}
      </p>
    );

  return (
    <div className="container mt-4">
      <h2>Edit Quiz</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label>Title:</label>
          <input
            className="form-control"
            type="text"
            name="title"
            value={quiz.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Description:</label>
          <textarea
            className="form-control"
            name="description"
            value={quiz.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Time Limit (minutes):</label>
          <input
            className="form-control"
            type="number"
            name="timeLimit"
            value={quiz.timeLimit}
            onChange={handleChange}
            required
          />
        </div>

        <h3>Questions</h3>
        {quiz.questions.map((q, i) => (
          <div key={i} className="card p-3 mb-3">
            <label>Question {i + 1}:</label>
            <input
              className="form-control mb-2"
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
              required
            />

            <div className="mb-2">
              <label>Options:</label>
              {q.options.map((opt, j) => (
                <input
                  key={j}
                  className="form-control mb-2"
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, j, e.target.value)}
                  required
                />
              ))}
            </div>

            <div className="mb-2">
              <label>Correct Answer:</label>
              <select
                className="form-select"
                value={q.correctAnswer}
                onChange={(e) => handleCorrectAnswerChange(i, e.target.value)}
              >
                {q.options.map((opt, j) => (
                  <option key={j} value={j}>
                    {`Option ${j + 1}: ${opt}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => deleteQuestion(i)}
            >
              <FaTrash className="me-2" />
              Delete Question
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={addQuestion}
        >
          <FaPlusCircle className="me-2" />
          Add Question
        </button>

        <br />

        <button type="submit" className="btn btn-success">
          <FaCheckCircle className="me-2" />
          Update Quiz
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/admin")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditQuiz;
