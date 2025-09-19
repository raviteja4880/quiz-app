import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

function Signup() {
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, email, password, role };
      if (role === "admin") payload.adminKey = adminKey;

      console.log("📩 Signup payload:", payload);

      const { data } = await authAPI.signup(payload);
      console.log("✅ Signup success:", data);

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("❌ Signup error:", err.response?.data || err.message);
      alert("Signup failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          maxWidth: "400px",
          width: "100%",
          borderRadius: "15px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 className="text-center mb-4 text-primary fw-bold">Signup</h2>

        {/* Role Selector */}
        <div className="mb-3 d-flex justify-content-center">
          <button
            type="button"
            className={`btn me-2 ${
              role === "user" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setRole("user")}
          >
            User
          </button>
          <button
            type="button"
            className={`btn ${
              role === "admin" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {role === "admin" && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Admin Key</label>
              <input
                type="password"
                className="form-control"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`btn w-100 ${
              role === "admin" ? "btn-success" : "btn-primary"
            }`}
            disabled={loading}
            style={{ borderRadius: "8px" }}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
