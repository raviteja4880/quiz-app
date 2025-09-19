import axios from "axios";

// Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach JWT token to all requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers = req.headers || {};
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth API
export const authAPI = {
  login: (payload) => API.post("/auth/login", payload),
  signup: (payload) => API.post("/auth/signup", payload),
};

  // Submit quiz
  export const quizAPI = {
    getAll: () => API.get("/quiz"),
    getById: (id) => API.get(`/quiz/${id}`),
    getFullById: (id) => API.get(`/quiz/admin/${id}`),  
    create: (payload) => API.post("/quiz/create", payload),
    update: (id, payload) => API.put(`/quiz/${id}`, payload), 
    deleteQuiz: (id) => API.delete(`/quiz/${id}`),
    submit: (id, answers) => API.post(`/quiz/${id}/submit`, { answers }),
    getResultById: (resultId) => API.get(`/quiz/results/${resultId}`),
  };


// Result API
export const resultAPI = {
  getMine: () => API.get("/quiz/myresults"),
  getByEmail: (email) => API.get(`/quiz/results/user/${email}`),
};

