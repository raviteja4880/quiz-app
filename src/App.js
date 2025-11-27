import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Home from "./components/Home";
import QuizList from "./components/QuizList";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import AdminPanel from "./components/AdminPanel";
import MyResults from "./components/MyResults";
import NavBar from "./components/NavBar";
import SearchResults from "./components/SearchResults";
import EditQuiz from "./components/EditQuiz";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./components/StudentDashboard";

function GlobalSEO() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "IDP Quiz App",
    "url": "https://idpquizapp.netlify.app",
    "description": "Engaging quiz platform offering a variety of topics to test your knowledge.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "publisher": {
      "@type": "Organization",
      "name": "IDP Quiz App",
      "logo": {
        "@type": "ImageObject",
        "url": "https://idpquizapp.netlify.app/assets/quiz.png"
      }
    },
    "image": "https://idpquizapp.netlify.app/assets/quiz.png"
  };

  return (
    <Helmet>
      <title>Quiz App - Learn, practice & Grow</title>
      <meta name="description" content="Engaging quiz platform offering a variety of topics to test your knowledge."/>
      <meta name="keywords" content="QuizApp, IDP Quiz, Online Learning, MCQ, Educational App" />

      <meta property="og:title" content="Quiz App - Test Your Knowledge" />
      <meta property="og:description" content="Interactive quizzes across AI, DBMS, and web Development — built for learners."/>
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://idpquizapp.netlify.app" />
      <meta property="og:image" content="https://idpquizapp.netlify.app/assets/quiz.png" />

      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ProtectedRoute wrapper
const ProtectedRoute = ({ isLoggedIn, children }) =>
  isLoggedIn ? children : <Navigate to="/" replace />;

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return <App isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />;
}

function App({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/quiz/");

  const protectedRoutes = [
    { path: "/home", element: <Home /> },
    { path: "/quizlist", element: <QuizList /> },
    { path: "/quiz/:id", element: <Quiz /> },
    { path: "/quiz/:id/review/:resultId", element: <Quiz /> },
    { path: "/result/:id", element: <Result /> },
    { path: "/results", element: <Result /> },
    { path: "/admin", element: <AdminPanel /> },
    { path: "/student-dashboard", element: <StudentDashboard /> },
    { path: "/myresults", element: <MyResults /> },
    { path: "/quiz/edit/:id", element: <EditQuiz /> },
    { path: "/search-results", element: <SearchResults /> },
  ];

  return (
    <>
      <GlobalSEO />

      {!hideNavbar && isLoggedIn && (
        <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage setIsLoggedIn={setIsLoggedIn} />} />

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

export default App;