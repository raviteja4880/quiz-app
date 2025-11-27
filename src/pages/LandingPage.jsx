import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../services/api";
import {
  FaBullseye,
  FaChartBar,
  FaUserShield,
  FaClock,
  FaGraduationCap,
  FaStar,
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");
      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate(data.user.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
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
      alert(data.message || "Signup successful! Please login.");
      setFormData({ name: "", email: "", password: "", adminKey: "" });
      if (!isMobile) setIsFlipped(false);
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.message || err.message));
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

  // 🔹 Scrolling banner component
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
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
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

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Banner appears when backend is waking up */}
      <AnimatePresence>
        {loading && (
          <ScrollingBanner message="We’re getting things ready for you — please hold on for a few seconds. Thank you for waiting!" />
        )}
      </AnimatePresence>

      <div
        className="container d-flex flex-column flex-lg-row align-items-center justify-content-between landing-container"
        style={{ maxWidth: "1200px", gap: "2rem" }}
      >
        {/* LEFT CONTENT */}
        <motion.div
          className="text-center text-lg-start mb-5 mb-lg-0 px-2 landing-left landing-text"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          style={{ maxWidth: "550px" }}
        >
          <h1 className="fw-bold display-6 display-md-5 mb-3 landing-heading">
            Welcome to <span style={{ color: "#ffe082" }}>QuizApp</span>{" "}
            <FaGraduationCap className="text-warning mb-1" />
          </h1>
          <p className="fs-6 fs-md-5 mb-4" style={{ lineHeight: "1.6" }}>
            A fun, engaging, and smart quiz platform where you can test your
            skills, challenge your friends, and explore your knowledge!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h5 className="fw-semibold mb-3">
              <FaStar className="text-warning me-2 mb-1" /> Key Features
            </h5>
            <ul className="text-light list-unstyled fs-6 fs-md-5 landing-features">
              {[
                {
                  icon: <FaBullseye className="text-warning" />,
                  text: "Interactive quizzes with instant feedback",
                },
                {
                  icon: <FaChartBar className="text-warning" />,
                  text: "Track your progress and scores",
                },
                {
                  icon: <FaUserShield className="text-warning" />,
                  text: "Role-based access",
                },
                {
                  icon: <FaClock className="text-warning" />,
                  text: "Timed challenges and topic-wise quizzes",
                },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="mb-2 d-flex align-items-center gap-2 flex-wrap justify-content-lg-start justify-content-center"
                >
                  <span style={{ minWidth: "24px" }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>

            <motion.button
              className="btn btn-warning fw-bold px-4 py-2 mt-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
            >
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          ref={signupRef}
          layout
          transition={{ layout: { duration: 0.5, ease: "easeInOut" } }}
          className="shadow-lg p-4 p-md-5 w-100"
          style={{
            maxWidth: "420px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            color: "#fff",
          }}
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -50, rotateY: 15 }}
                transition={{ duration: 0.5 }}
                layout
              >
                <h3 className="text-center fw-bold mb-4">Login</h3>
                <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn ${
                      role === "user" ? "btn-primary" : "btn-outline-light"
                    }`}
                    onClick={() => setRole("user")}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      role === "admin" ? "btn-success" : "btn-outline-light"
                    }`}
                    onClick={() => setRole("admin")}
                  >
                    Admin
                  </button>
                </div>
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-white border-light"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-white border-light"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {role === "admin" && (
                    <div className="mb-3">
                      <label>Admin Key</label>
                      <input
                        type="password"
                        name="adminKey"
                        className="form-control bg-transparent text-white border-light"
                        value={formData.adminKey}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <motion.button
                    type="submit"
                    className="btn btn-warning w-100 fw-bold mt-2"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </motion.button>
                </form>
                {role === "user" && (
                  <p className="mt-3 text-center">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      className="btn btn-link text-warning fw-bold p-0"
                      onClick={() => setIsFlipped(true)}
                    >
                      Sign up
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
              >
                <h3 className="text-center fw-bold mb-4">Signup</h3>
                <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn ${
                      role === "user" ? "btn-primary" : "btn-outline-light"
                    }`}
                    onClick={() => setRole("user")}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      role === "admin" ? "btn-success" : "btn-outline-light"
                    }`}
                    onClick={() => setRole("admin")}
                  >
                    Admin
                  </button>
                </div>
                <form onSubmit={handleSignup}>
                  <div className="mb-3">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control bg-transparent text-white border-light"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-transparent text-white border-light"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-transparent text-white border-light"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {role === "admin" && (
                    <div className="mb-3">
                      <label>Admin Key</label>
                      <input
                        type="password"
                        name="adminKey"
                        className="form-control bg-transparent text-white border-light"
                        value={formData.adminKey}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <motion.button
                    type="submit"
                    className="btn btn-warning w-100 fw-bold mt-2"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? "Signing up..." : "Signup"}
                  </motion.button>
                </form>
                <p className="mt-3 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link text-warning fw-bold p-0"
                    onClick={() => setIsFlipped(false)}
                  >
                    Login
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
      `}</style>
    </div>
  );
}

export default LandingPage;
