// src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./components/Home";
import QuizList from "./components/QuizList";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import AdminPanel from "./components/AdminPanel";
import MyResults from "./components/MyResults";
import NavBar from "./components/NavBar";
import SearchResults from "./components/SearchResults";
import EditQuiz from "./components/EditQuiz";
import Loader from "./components/Loader"; 

// ProtectedRoute wrapper
const ProtectedRoute = ({ isLoggedIn, children }) =>
  isLoggedIn ? children : <Navigate to="/" replace />;

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Simulate checking login from localStorage
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setLoading(false);
  }, []);

  // Keep localStorage in sync with state
  useEffect(() => {
    if (isLoggedIn !== null) {
      localStorage.setItem("isLoggedIn", isLoggedIn);
    }
  }, [isLoggedIn]);

  // ✅ Show loader until login state is known
  if (loading) {
    return <Loader />;
  }

  return <App isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />;
}

function App({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();

  // Hide navbar on quiz pages (live quiz or review)
  const hideNavbar = location.pathname.startsWith("/quiz/");

  const protectedRoutes = [
    { path: "/home", element: <Home /> },
    { path: "/quizlist", element: <QuizList /> },
    { path: "/quiz/:id", element: <Quiz /> },
    { path: "/quiz/:id/review/:resultId", element: <Quiz /> },
    { path: "/result/:id", element: <Result /> },
    { path: "/results", element: <Result /> },
    { path: "/admin", element: <AdminPanel /> },
    { path: "/myresults", element: <MyResults /> },
    { path: "/quiz/edit/:id", element: <EditQuiz /> },
    { path: "/search-results", element: <SearchResults /> },
  ];

  return (
    <>
      {!hideNavbar && isLoggedIn && (
        <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
