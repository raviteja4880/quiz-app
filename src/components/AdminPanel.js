import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizAPI } from "../services/api";

function AdminPanel() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [questionsList, setQuestionsList] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
    fetchQuizzes();
  }, [navigate]); // ✅ include navigate

  const fetchQuizzes = async () => {
    try {
      const res = await quizAPI.getAll();
      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      alert("Please fill in the question and all options.");
      return;
    }

    const newQuestion = { question, options, correctAnswer };

    if (editingQuestionIndex !== null) {
      const updatedList = [...questionsList];
      updatedList[editingQuestionIndex] = newQuestion;
      setQuestionsList(updatedList);
      setEditingQuestionIndex(null);
    } else {
      setQuestionsList([...questionsList, newQuestion]);
    }

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  };

  const createOrUpdateQuiz = async () => {
    if (!title.trim() || !description.trim() || !timeLimit) {
      alert("Please fill in all quiz details.");
      return;
    }
    if (questionsList.length === 0) {
      alert("Please add at least one question before saving.");
      return;
    }

    try {
      const quizData = {
        title,
        description,
        timeLimit: Number(timeLimit),
        questions: questionsList,
      };

      if (editingQuiz) {
        await quizAPI.update(editingQuiz._id, quizData);
        alert("✅ Quiz updated successfully");
        setEditingQuiz(null);
      } else {
        await quizAPI.create(quizData);
        alert("✅ Quiz created successfully");
      }

      resetForm();
      fetchQuizzes();
    } catch (err) {
      console.error("Quiz save failed", err);
      alert("❌ Failed to save quiz");
    }
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

  const deleteQuiz = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await quizAPI.deleteQuiz(id);
      alert("Quiz deleted");
      fetchQuizzes();
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("❌ Failed to delete quiz");
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
          {showQuestions ? "Hide Questions" : "View Questions"}
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
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteQuestion(idx)}
                  >
                    Delete
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
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{quiz.title}</strong> — {quiz.description} ({quiz.timeLimit} mins)
            </div>
            <div>
              <button
                className="btn btn-sm btn-info me-2"
                onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteQuiz(quiz._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
