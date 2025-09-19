import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SiGmail } from "react-icons/si";
import {
  FaChalkboardTeacher,
  FaChartLine,
  FaPlayCircle,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

function Home() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || {};
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user")) || {};
    setUser(savedUser);
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
      className="min-vh-100 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        color: "#333",
      }}
    >
      {/* 🔹 Hero Section */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-75"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="display-4 mb-3 fw-bold text-dark"
          >
            🎓 Welcome {user?.name ? user.name : "Guest"}!
          </motion.h1>

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
          <div className="row mb-5">
            {features.map((f, idx) => {
              const Wrapper = f.link ? Link : "div";
              return (
                <div className="col-md-4 mb-3" key={idx}>
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
                      }}
                    >
                      <div className="mb-3" aria-hidden="true">{f.icon}</div>
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
            className="d-flex justify-content-center gap-3"
          >
            <Link
              to="/quizlist"
              className="btn btn-dark btn-lg px-5 py-3 shadow-sm rounded-pill"
            >
              View All Quizzes
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* 🔹 Footer */}
      <footer className="text-dark text-center py-3 mt-auto">
        <p className="mb-1">
          © {new Date().getFullYear()} QuizApp. All rights reserved.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a
            href="https://github.com/raviteja4880"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-dark"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/ravi-teja-kandula-5a41ab2a0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-dark"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="mailto:ravitejakandul@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Email"
            className="text-dark"
          >
            <SiGmail size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
