import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Home from "./components/Home";
import QuizList from "./components/QuizList";
import Quiz from "./pages/Quiz";
import Result from "./components/Result";
import AdminPanel from "./pages/admin/AdminPanel";
import MyResults from "./components/MyResults";
import NavBar from "./components/NavBar";
import SearchResults from "./pages/admin/SearchResults";
import EditQuiz from "./pages/admin/EditQuiz";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";

// Auth utility functions
const AUTH_CONFIG = {
  SESSION_DURATION_DAYS: 7,
};

const setAuthSession = (token, user) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + AUTH_CONFIG.SESSION_DURATION_DAYS);
  
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("tokenExpiry", expiryDate.toISOString());
};

const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("tokenExpiry");
};

const isAuthValid = () => {
  const tokenExpiry = localStorage.getItem("tokenExpiry");
  if (!tokenExpiry) return false;
  
  const expiryDate = new Date(tokenExpiry);
  return expiryDate > new Date();
};

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
      <title>Quiz App - Learn, Practice & Grow</title>
      <meta
        name="description"
        content="Engaging quiz platform offering a variety of topics to test your knowledge."
      />
      <meta
        name="keywords"
        content="QuizApp, IDP Quiz, Online Learning, MCQ, Educational App"
      />
      <meta property="og:title" content="Quiz App - Test Your Knowledge" />
      <meta
        property="og:description"
        content="Interactive quizzes across AI, DBMS, and Web Development — built for learners."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://idpquizapp.netlify.app" />
      <meta
        property="og:image"
        content="https://idpquizapp.netlify.app/assets/quiz.png"
      />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ProtectedRoute Wrapper
const ProtectedRoute = ({ isLoggedIn, children }) => {
  // Check if auth is still valid
  if (!isLoggedIn || !isAuthValid()) {
    clearAuthSession();
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize auth state with expiry check
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return isAuthValid() && localStorage.getItem("isLoggedIn") === "true";
  });

  // Check for session expiry on app load and periodically
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthValid()) {
        clearAuthSession();
        setIsLoggedIn(false);
        // Only redirect if not already on landing page
        if (location.pathname !== "/") {
          navigate("/");
        }
      }
    };

    // Check immediately
    checkAuth();

    // Check every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  // Update isLoggedIn in localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  // Redirect logged-in users away from landing page
  useEffect(() => {
    if (isLoggedIn && location.pathname === "/") {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const redirectPath = user.role === "admin" ? "/admin" : "/home";
          navigate(redirectPath);
        }
      } catch (e) {
        console.error("Error parsing user:", e);
        clearAuthSession();
        setIsLoggedIn(false);
      }
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // Handle logout
  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    navigate("/");
  };

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
    { path: "/profile", element: <Profile setIsLoggedIn={setIsLoggedIn} /> },
  ];

  return (
    <>
      <GlobalSEO />

      {!hideNavbar && isLoggedIn && (
        <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} onLogout={handleLogout} />
      )}

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<LandingPage setIsLoggedIn={setIsLoggedIn} />}
        />

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

export { setAuthSession, clearAuthSession };
export default App;
