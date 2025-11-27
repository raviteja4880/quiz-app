import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SiGmail } from "react-icons/si";
import {
  FaChalkboardTeacher,
  FaChartLine,
  FaPlayCircle,
  FaGithub,
  FaLinkedin,
  FaUserGraduate,
  FaBolt,
  FaLaptopCode,
  FaEnvelope,
} from "react-icons/fa";

function Home() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  });

  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const aboutRef = useRef();
  const contactRef = useRef();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || {};
    setUser(savedUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setShowAbout(false);
      }
      if (contactRef.current && !contactRef.current.contains(e.target)) {
        setShowContact(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const features = [
    {
      icon: <FaChalkboardTeacher size={40} className="text-primary" />,
      title: "Expert Questions",
      desc: "Curated quizzes to enhance your learning experience.",
    },
    {
      icon: <FaChartLine size={40} className="text-success" />,
      title: "Track Performance",
      desc: "View your results and monitor improvement over time.",
      link: "/myresults",
    },
    {
      icon: <FaPlayCircle size={40} className="text-danger" />,
      title: "Instant Feedback",
      desc: "Get immediate results with correct and wrong answers highlighted.",
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffd6b8 0%, #ffbfa0 100%)",
        color: "#333",
        overflowX: "hidden",
      }}
    >
      {/* 🔹 Fullscreen Hero Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center px-3"
        style={{ minHeight: "100vh", paddingBottom: "3rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-100"
          style={{ maxWidth: "960px" }}
        >
          {/* Hero Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="display-4 mb-3 fw-bold text-dark"
          >
            <FaUserGraduate className="me-2 text-warning" />
            Welcome {user?.name ? user.name : "Guest"}!
          </motion.h1>

          {/* Hero Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lead mb-5 text-muted"
          >
            Test your knowledge, track progress, and challenge yourself with our
            interactive quizzes.
          </motion.p>

          {/* 🔹 Features */}
          <div className="row mb-5 g-3">
            {features.map((f, idx) => {
              const Wrapper = f.link ? Link : "div";
              return (
                <div className="col-12 col-sm-6 col-md-4" key={idx}>
                  <Wrapper
                    to={f.link || "#"}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 + idx * 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-4"
                      style={{
                        background: "rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="mb-3">{f.icon}</div>
                      <h5 className="fw-bold">{f.title}</h5>
                      <p className="text-muted">{f.desc}</p>
                    </motion.div>
                  </Wrapper>
                </div>
              );
            })}
          </div>

          {/* 🔹 CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="d-flex justify-content-center gap-3 flex-wrap mb-5"
          >
            <Link
              to="/quizlist"
              className="btn btn-dark btn-lg px-5 py-3 shadow-sm rounded-pill"
              style={{ minWidth: "220px" }}
            >
              View All Quizzes
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 🔹 Footer Section */}
      <footer
        className="text-dark py-5"
        style={{
          background: "linear-gradient(135deg, #fbb583ff 0%, #bb8c75ff 100%)",
        }}
      >
        <div className="container text-center pt-4">
          <h5 className="fw-bold mb-2">QuizApp</h5>
          <p className="mb-4 text-muted">
            Interactive quizzes to test knowledge, track progress, and improve
            skills.
          </p>

          {/* Social Links */}
          <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
            <a
              href="https://github.com/raviteja4880"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
            >
              <FaGithub size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/RaviTejaKandula"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="mailto:ravitejakandul@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark"
            >
              <SiGmail size={24} />
            </a>
          </div>

          {/* Footer Links */}
          <div
            className="d-flex justify-content-center align-items-center gap-4 flex-wrap"
            style={{ marginTop: "1rem" }}
          >
            <button
              className="btn btn-link text-dark fw-semibold text-decoration-none p-0"
              onClick={() => {
                setShowAbout(true);
                setShowContact(false);
              }}
            >
              About
            </button>
            <button
              className="btn btn-link text-dark fw-semibold text-decoration-none p-0"
              onClick={() => {
                setShowContact(true);
                setShowAbout(false);
              }}
            >
              Contact
            </button>
          </div>

          <p className="text-muted mt-4 mb-0 small">
            © {new Date().getFullYear()} QuizApp. All rights reserved.
          </p>
        </div>
      </footer>

      {/* 🔹 Overlay Modals */}
      <AnimatePresence>
        {(showAbout || showContact) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              zIndex: 2000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1rem",
            }}
          >
            {showAbout && (
              <motion.div
                ref={aboutRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-4 text-start"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  maxWidth: "480px",
                  width: "100%",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <h4 className="fw-bold mb-3 text-center">About QuizApp</h4>
                <p className="text-muted small">
                  QuizApp is an interactive platform designed to make learning
                  fun and engaging. Whether you're a student or a professional,
                  test your skills with expert-curated quizzes.
                </p>
                <ul className="text-muted small mb-3">
                  <li><FaUserGraduate className="me-1" /> Roles: User & Admin</li>
                  <li><FaChartLine className="me-1" /> Features: Quizzes, Results, Performance Tracking</li>
                  <li><FaLaptopCode className="me-1" /> Tech: React, Node.js, MongoDB</li>
                  <li><FaBolt className="me-1" /> Developer: Ravi Teja Kandula</li>
                </ul>
                <button
                  className="btn btn-dark w-100"
                  onClick={() => setShowAbout(false)}
                >
                  Close
                </button>
              </motion.div>
            )}

            {showContact && (
              <motion.div
                ref={contactRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="p-4 rounded-4"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  maxWidth: "500px",
                  width: "100%",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <h4 className="fw-bold mb-3 text-center">Contact Me</h4>
                <form
                  id="contact-form"
                  action="https://formspree.io/f/mwpnevjj"
                  method="POST"
                >
                  <div className="input-group mb-2">
                    <span className="input-group-text"><FaUserGraduate /></span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="input-group mb-2">
                    <span className="input-group-text"><FaEnvelope /></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      required
                      className="form-control"
                    />
                  </div>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your Message"
                    required
                    className="form-control mb-2"
                  ></textarea>
                  <button type="submit" className="btn btn-dark w-100">
                    Send
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 mt-2"
                    onClick={() => setShowContact(false)}
                  >
                    Cancel
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
