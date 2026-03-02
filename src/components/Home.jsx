import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaPlayCircle,
  FaUserGraduate,
  FaRocket,
  FaTrophy,
  FaBrain,
  FaClock,
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
      icon: <FaBrain size={32} />,
      title: "Expert Questions",
      desc: "Curated quizzes to enhance your learning experience with AI-powered adaptive testing.",
      color: "#4F46E5",
      link: "/quizlist",
    },
    {
      icon: <FaChartLine size={32} />,
      title: "Track Performance",
      desc: "View your results and monitor improvement over time with detailed analytics.",
      color: "#10B981",
      link: "/myresults",
    },
    {
      icon: <FaTrophy size={32} />,
      title: "Instant Feedback",
      desc: "Get immediate results with correct and wrong answers highlighted for better learning.",
      color: "#F59E0B",
      link: null,
    },
    {
      icon: <FaClock size={32} />,
      title: "Timed Challenges",
      desc: "Test your knowledge under pressure with timed quiz challenges.",
      color: "#7C3AED",
      link: "/quizlist",
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        color: "#fff",
        overflowX: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HERO SECTION */}
      <section
        className="flex-grow-1 d-flex align-items-center justify-content-center text-center px-3"
        style={{
          paddingTop: "100px",
          paddingBottom: "60px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container"
          style={{ maxWidth: "1100px" }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(79,70,229,0.2)",
              padding: "8px 18px",
              borderRadius: "50px",
              marginBottom: "25px",
              border: "1px solid rgba(79,70,229,0.4)",
            }}
          >
            <FaRocket style={{ color: "#F59E0B", fontSize: "14px" }} />
            <span style={{ fontSize: "0.9rem" }}>Welcome back</span>
          </div>

          {/* Title */}
          <h1 className="fw-bold mb-4">
            Hello {user?.name || "Guest"}{" "}
            <FaUserGraduate style={{ color: "#4F46E5" }} />
          </h1>

          {/* Subtitle */}
          <p
            className="lead mb-5"
            style={{
              maxWidth: "650px",
              margin: "0 auto",
              color: "#94A3B8",
            }}
          >
            Ready to challenge your mind? Explore quizzes, track your progress,
            and become a{" "}
            <span style={{ color: "#10B981", fontWeight: 600 }}>
              knowledge champion
            </span>
            !
          </p>

          {/* CTA Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-5">
            <Link
              to="/quizlist"
              className="btn btn-lg px-4 py-3"
              style={{
                background: "#4F46E5",
                color: "#fff",
                borderRadius: "12px",
                minWidth: "180px",
              }}
            >
              <FaPlayCircle className="me-2" />
              Start Quiz
            </Link>

            <Link
              to="/myresults"
              className="btn btn-lg px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#E0E7FF",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                minWidth: "180px",
              }}
            >
              <FaChartLine className="me-2" />
              My Results
            </Link>
          </div>

          {/* Features */}
          <h5 className="mb-4">Why Choose QuizApp?</h5>

          <div className="row g-4 justify-content-center">
            {features.map((f, idx) => {
              const Wrapper = f.link ? Link : "div";
              return (
                <div className="col-12 col-sm-6 col-lg-3" key={idx}>
                  <Wrapper
                    to={f.link || "#"}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="p-4 h-100 text-center"
                      style={{
                        background: "rgba(30,41,59,0.6)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "15px",
                          color: f.color,
                        }}
                      >
                        {f.icon}
                      </div>

                      <h6 className="fw-bold">{f.title}</h6>
                      <p style={{ fontSize: "0.9rem", color: "#94A3B8" }}>
                        {f.desc}
                      </p>
                    </div>
                  </Wrapper>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer
        className="text-center py-4"
        style={{
          background: "rgba(15,23,42,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h5>QuizApp</h5>
        <p style={{ color: "#94A3B8" }}>
          © {new Date().getFullYear()} QuizApp. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;