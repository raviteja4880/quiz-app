import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../services/api";
import { setAuthSession } from "../App";
import { toast } from "react-toastify";
import {
  FaChartBar,
  FaClock,
  FaGraduationCap,
  FaStar,
  FaBrain,
  FaTrophy,
  FaRocket,
} from "react-icons/fa";

function LandingPage({ setIsLoggedIn }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminKey: "",
  });

  const navigate = useNavigate();
  const signupRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Celebration effect function
  const celebrateSuccess = () => {
    const emojis = ["🎉", "🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "💐", "🎊", "✨", "⭐", "🌟", "💫"];
    
    for (let i = 0; i < 50; i++) {
      const celebration = document.createElement("div");
      celebration.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
      celebration.style.position = "fixed";
      celebration.style.left = Math.random() * 100 + "%";
      celebration.style.top = "-20px";
      celebration.style.fontSize = Math.random() * 30 + 20 + "px";
      celebration.style.opacity = "1";
      celebration.style.pointerEvents = "none";
      celebration.style.zIndex = "9999";
      celebration.style.animation = `fall ${Math.random() * 3 + 4}s linear forwards`;
      
      document.body.appendChild(celebration);
      
      setTimeout(() => celebration.remove(), 4000);
    }
  };

  // CSS animation for falling emojis
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        ...(role === "admin" && formData.adminKey ? { adminKey: formData.adminKey } : {}),
      };
      const { data } = await authAPI.login(payload);
      
      // Set auth session with 7-day expiry
      setAuthSession(data.token, data.user);
      
      if (setIsLoggedIn) setIsLoggedIn(true);
      
      // Navigate based on role
      navigate(data.user.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === "admin" && formData.adminKey ? { adminKey: formData.adminKey } : {}),
      };
      const { data } = await authAPI.signup(payload);
      
      // Show success toast with icon
      toast.success(data.message || "Signup successful! Please login.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Celebrate only for new users after signup
      celebrateSuccess();
      
      // Reset form and flip back
      setFormData({ name: "", email: "", password: "", adminKey: "" });
      if (!isMobile) {
        setTimeout(() => setIsFlipped(false), 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setIsFlipped(true);
    if (isMobile && signupRef.current) {
      signupRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scrolling banner component
  const ScrollingBanner = ({ message }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          overflow: "hidden",
          background: "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
          color: "#fff",
          zIndex: 9999,
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          fontWeight: 600,
          letterSpacing: "0.5px",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          style={{ whiteSpace: "nowrap", fontSize: "0.95rem" }}
        >
          {message}
        </motion.div>
      </motion.div>
    );
  };

  // Floating background shapes
  const FloatingShapes = () => (
    <>
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -15, 0],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
          filter: "blur(35px)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "60%",
          left: "15%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
    </>
  );

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        color: "#fff",
        overflow: "hidden",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Floating background shapes */}
      <FloatingShapes />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(79, 70, 229, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 70, 229, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }}
      />

      {/* Banner appears when backend is waking up */}
      <AnimatePresence>
        {loading && (
          <ScrollingBanner message="We're getting things ready for you — please hold on for a few seconds. Thank you for waiting!" />
        )}
      </AnimatePresence>

      <div
        className="container d-flex flex-column flex-lg-row align-items-center justify-content-between landing-container"
        style={{ maxWidth: "1200px", gap: "3rem", position: "relative", zIndex: 1 }}
      >
        {/* LEFT CONTENT */}
        <motion.div
          className="text-center text-lg-start mb-5 mb-lg-0 px-2 landing-left landing-text"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          style={{ maxWidth: "580px" }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)",
              padding: "8px 16px",
              borderRadius: "50px",
              marginBottom: "20px",
              border: "1px solid rgba(79, 70, 229, 0.3)",
            }}
          >
            <FaRocket style={{ color: "#F59E0B", fontSize: "14px" }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#E0E7FF" }}>
              Unlock Your Potential
            </span>
          </motion.div>

          <h1 className="fw-bold display-6 display-md-5 mb-3 landing-heading" style={{ lineHeight: 1.2 }}>
            Welcome to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QuizApp
            </span>{" "}
            <FaGraduationCap
              style={{
                color: "#4F46E5",
                marginBottom: "4px",
              }}
            />
          </h1>
          <p
            className="fs-6 fs-md-5 mb-4"
            style={{ lineHeight: "1.7", color: "#94A3B8", fontWeight: 400 }}
          >
            A modern, engaging quiz platform to test your knowledge, challenge
            friends, and track your growth with{" "}
            <span style={{ color: "#10B981", fontWeight: 600 }}>real-time analytics</span>.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h5 className="fw-semibold mb-4" style={{ color: "#F1F5F9" }}>
              <FaStar style={{ color: "#F59E0B", marginRight: "8px", marginBottom: "2px" }} />
              Why Choose Us?
            </h5>
            <ul className="text-light list-unstyled fs-6 fs-md-5 landing-features">
              {[
                {
                  icon: <FaBrain style={{ color: "#4F46E5" }} />,
                  text: "AI-powered adaptive quizzes",
                },
                {
                  icon: <FaChartBar style={{ color: "#10B981" }} />,
                  text: "Detailed progress analytics",
                },
                {
                  icon: <FaTrophy style={{ color: "#F59E0B" }} />,
                  text: "Compete on leaderboards",
                },
                {
                  icon: <FaClock style={{ color: "#7C3AED" }} />,
                  text: "Timed challenges & categories",
                },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="mb-3 d-flex align-items-center gap-3 flex-wrap justify-content-lg-start justify-content-center"
                  style={{
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      minWidth: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ color: "#CBD5E1", fontWeight: 500, fontSize: "0.95rem" }}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <motion.button
              className="btn fw-bold px-5 py-3 mt-4"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGetStarted}
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3)",
              }}
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT CARD - Enhanced Glassmorphism */}
        <motion.div
          ref={signupRef}
          layout
          transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
          className="shadow-lg p-4 p-md-5 w-100"
          style={{
            maxWidth: "440px",
            borderRadius: "24px",
            background: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(20px)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Card gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "100px",
              background: "linear-gradient(180deg, rgba(79, 70, 229, 0.1) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -50, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                layout
                style={{ position: "relative", zIndex: 1 }}
              >
                <h3 className="text-center fw-bold mb-4" style={{ color: "#F1F5F9", fontSize: "1.75rem" }}>
                  Welcome Back
                </h3>
                <p style={{ textAlign: "center", color: "#94A3B8", marginBottom: "24px", fontSize: "0.9rem" }}>
                  Sign in to continue your learning journey
                </p>
                
                <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn ${
                      role === "user" ? "" : ""
                    }`}
                    onClick={() => setRole("user")}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      background: role === "user" 
                        ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" 
                        : "rgba(255, 255, 255, 0.05)",
                      color: role === "user" ? "#fff" : "#94A3B8",
                      border: role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      role === "admin" ? "" : ""
                    }`}
                    onClick={() => setRole("admin")}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      background: role === "admin" 
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" 
                        : "rgba(255, 255, 255, 0.05)",
                      color: role === "admin" ? "#fff" : "#94A3B8",
                      border: role === "admin" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Admin
                  </button>
                </div>
                
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  {role === "admin" && (
                    <div className="mb-4">
                      <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                        Admin Key
                      </label>
                      <input
                        type="password"
                        name="adminKey"
                        className="form-control"
                        value={formData.adminKey}
                        onChange={handleChange}
                        required
                        placeholder="Enter admin key"
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#fff",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          fontSize: "0.95rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </div>
                  )}
                  <motion.button
                    type="submit"
                    className="btn w-100 mt-2"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(79, 70, 229, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "14px",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner-border spinner-border-sm" /> Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>
                </form>
                {role === "user" && (
                  <p className="mt-4 text-center" style={{ color: "#94A3B8" }}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setIsFlipped(true)}
                      style={{
                        color: "#4F46E5",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Create one
                    </button>
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 50, rotateY: 15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -50, rotateY: -15 }}
                transition={{ duration: 0.5 }}
                layout
                style={{ position: "relative", zIndex: 1 }}
              >
                <h3 className="text-center fw-bold mb-4" style={{ color: "#F1F5F9", fontSize: "1.75rem" }}>
                  Join QuizApp
                </h3>
                <p style={{ textAlign: "center", color: "#94A3B8", marginBottom: "24px", fontSize: "0.9rem" }}>
                  Start your learning journey today
                </p>
                
                <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn`}
                    onClick={() => setRole("user")}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      background: role === "user" 
                        ? "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" 
                        : "rgba(255, 255, 255, 0.05)",
                      color: role === "user" ? "#fff" : "#94A3B8",
                      border: role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className={`btn`}
                    onClick={() => setRole("admin")}
                    style={{
                      flex: 1,
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      background: role === "admin" 
                        ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" 
                        : "rgba(255, 255, 255, 0.05)",
                      color: role === "admin" ? "#fff" : "#94A3B8",
                      border: role === "admin" ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Admin
                  </button>
                </div>
                
                <form onSubmit={handleSignup}>
                  <div className="mb-4">
                    <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                      }}
                    />
                  </div>
                  {role === "admin" && (
                    <div className="mb-4">
                      <label style={{ display: "block", marginBottom: "8px", color: "#CBD5E1", fontSize: "0.9rem", fontWeight: 500 }}>
                        Admin Key
                      </label>
                      <input
                        type="password"
                        name="adminKey"
                        className="form-control"
                        value={formData.adminKey}
                        onChange={handleChange}
                        required
                        placeholder="Enter admin key"
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "#fff",
                          padding: "14px 16px",
                          borderRadius: "12px",
                          fontSize: "0.95rem",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </div>
                  )}
                  <motion.button
                    type="submit"
                    className="btn w-100 mt-2"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(79, 70, 229, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "14px",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner-border spinner-border-sm" /> Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </form>
                <p className="mt-4 text-center" style={{ color: "#94A3B8" }}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setIsFlipped(false)}
                    style={{
                      color: "#4F46E5",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Inline responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .landing-text {
            text-align: center !important;
          }
          .landing-container {
            flex-direction: column !important;
            align-items: center;
            gap: 2rem;
          }
          .landing-heading {
            font-size: 1.75rem !important;
            line-height: 1.3;
          }
          .landing-features {
            max-width: 350px;
            margin: 0 auto;
            text-align: left;
          }
          .landing-features li {
            justify-content: flex-start !important;
            text-align: left;
            gap: 10px;
          }
          .landing-left {
            padding: 10px;
          }
        }
        
        /* Focus states for form inputs */
        .form-control:focus {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2) !important;
          color: #fff !important;
        }
        
        .form-control::placeholder {
          color: rgba(148, 163, 184, 0.6) !important;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
