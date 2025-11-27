import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";
import {
  FaTrashAlt,
  FaEdit,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";

function AdminPanel() {
  const navigate = useNavigate();

  // Quiz form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  // App states
  const [questionsList, setQuestionsList] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  // Toast
  const showAlert = (type, message) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warn(message);
        break;
      default:
        toast.info(message);
    }
  };

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await quizAPI.getAll();
      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      showAlert("error", "Failed to load quizzes. Please try again.");
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/login");
    } else {
      fetchQuizzes();
    }
  }, [navigate, fetchQuizzes]);

  const addOrUpdateQuestion = () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      showAlert("warning", "Please fill in the question and all options.");
      return;
    }

    const newQuestion = { question, options, correctAnswer };

    if (editingQuestionIndex !== null) {
      const updatedList = [...questionsList];
      updatedList[editingQuestionIndex] = newQuestion;
      setQuestionsList(updatedList);
      showAlert("success", "Question updated successfully!");
      setEditingQuestionIndex(null);
    } else {
      setQuestionsList([...questionsList, newQuestion]);
      showAlert("success", "Question added successfully!");
    }

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const createOrUpdateQuiz = async () => {
    if (!title.trim() || !description.trim() || !timeLimit) {
      showAlert("warning", "Please fill in all quiz details.");
      return;
    }
    if (questionsList.length === 0) {
      showAlert("warning", "Please add at least one question before saving.");
      return;
    }

    const quizData = {
      title,
      description,
      timeLimit: Number(timeLimit),
      questions: questionsList,
    };

    try {
      if (editingQuiz) {
        await quizAPI.update(editingQuiz._id, quizData);
        showAlert("success", "Quiz updated successfully!");
      } else {
        await quizAPI.create(quizData);
        showAlert("success", "Quiz created successfully!");
      }
      resetForm();
      fetchQuizzes();
    } catch (err) {
      console.error("Quiz save failed:", err);
      showAlert("error", "Failed to save quiz. Check the data or try again.");
    }
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await quizAPI.deleteQuiz(id);
      showAlert("success", "Quiz deleted successfully!");
      fetchQuizzes();
    } catch (err) {
      console.error("Error deleting quiz:", err);
      showAlert("error", "Failed to delete quiz.");
    }
  };

  const editQuestion = (index) => {
    const q = questionsList[index];
    setQuestion(q.question);
    setOptions(q.options);
    setCorrectAnswer(q.correctAnswer);
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index) => {
    if (!window.confirm("Delete this question?")) return;
    setQuestionsList(questionsList.filter((_, i) => i !== index));
    showAlert("success", "Question deleted.");
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTimeLimit("");
    setQuestionsList([]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setEditingQuiz(null);
    setEditingQuestionIndex(null);
    setShowQuestions(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{editingQuiz ? "Edit Quiz" : "Admin Panel - Create Quiz"}</h2>
      </div>

      {/* Quiz Form */}
      <div className="mb-4">
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="form-control mb-3"
          type="number"
          placeholder="Time Limit (minutes)"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
        />
      </div>

      <h5>{editingQuestionIndex !== null ? "Edit Question" : "Add Question"}</h5>
      <input
        className="form-control mb-2"
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {options.map((opt, idx) => (
        <input
          key={idx}
          className="form-control mb-2"
          type="text"
          placeholder={`Option ${idx + 1}`}
          value={opt}
          onChange={(e) => {
            const updated = [...options];
            updated[idx] = e.target.value;
            setOptions(updated);
          }}
        />
      ))}

      <select
        className="form-select mb-3"
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
      >
        <option value={0}>Option 1</option>
        <option value={1}>Option 2</option>
        <option value={2}>Option 3</option>
        <option value={3}>Option 4</option>
      </select>

      <button className="btn btn-secondary mb-3" onClick={addOrUpdateQuestion}>
        {editingQuestionIndex !== null ? "Update Question" : "Add Question"}
      </button>

      <h6>{questionsList.length} Questions Added</h6>

      <button className="btn btn-primary" onClick={createOrUpdateQuiz}>
        {editingQuiz ? "Update Quiz" : "Create Quiz"}
      </button>

      {editingQuiz && (
        <button className="btn btn-warning ms-2" onClick={resetForm}>
          Cancel Edit
        </button>
      )}

      {questionsList.length > 0 && (
        <button
          className="btn btn-info ms-2"
          onClick={() => setShowQuestions(!showQuestions)}
        >
          {showQuestions ? (
            <>
              <FaEyeSlash className="me-1" /> Hide Questions
            </>
          ) : (
            <>
              <FaEye className="me-1" /> View Questions
            </>
          )}
        </button>
      )}

      {showQuestions && (
        <div className="mt-3">
          <h5>Questions</h5>
          <ul className="list-group">
            {questionsList.map((q, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>Q{idx + 1}:</strong> {q.question}
                  <br />
                  <em>Options:</em> {q.options.join(", ")} <br />
                  <em>Correct:</em> {q.options[q.correctAnswer]}
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => editQuestion(idx)}
                  >
                    <FaEdit className="me-1" /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteQuestion(idx)}
                  >
                    <FaTrashAlt className="me-1" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr />
      <h3 className="mt-4">Existing Quizzes</h3>
      <ul className="list-group mt-3">
        {quizzes.map((quiz) => (
          <li
          key={quiz._id}
          className="list-group-item p-3 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center rounded-3 mb-3 shadow-sm"
        >
          {/* Quiz Info */}
          <div className="mb-3 mb-lg-0 flex-grow-1">
            <strong>{quiz.title}</strong> — {quiz.description} ({quiz.timeLimit} mins)
          </div>

          {/* Buttons */}
          <div
            className="d-flex flex-row gap-2 justify-content-start justify-content-lg-end"
            style={{ flexShrink: 0 }}
          >
            <button
              className="btn btn-info btn-sm px-3"
              style={{ width: "100px" }}
              onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
            >
              <FaEdit className="me-1" /> Edit
            </button>
            <button
              className="btn btn-danger btn-sm px-3"
              style={{ width: "100px" }}
              onClick={() => deleteQuiz(quiz._id)}
            >
              <FaTrashAlt className="me-1" /> Delete
            </button>
          </div>
        </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
