import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

function Login({ setIsLoggedIn }) {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email, password };
      if (role === "admin") payload.adminKey = adminKey;

      console.log("📩 Login payload:", payload);

      const { data } = await authAPI.login(payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");
      if (typeof setIsLoggedIn === "function") setIsLoggedIn(true);

      navigate(data.user.role === "admin" ? "/admin" : "/home");
      console.log("✅ Login success:", data);
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        <h2 className="text-center mb-4 text-primary fw-bold">Login</h2>

        {/* Role selector */}
        <div className="d-flex justify-content-center mb-4">
          <button
            type="button"
            className={`btn me-2 ${role === "user" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setRole("user")}
          >
            User Login
          </button>
          <button
            type="button"
            className={`btn ${role === "admin" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setRole("admin")}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="fw-semibold">Password</label>
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
              <label className="fw-semibold">Admin Key</label>
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
            className={`btn w-100 ${role === "admin" ? "btn-success" : "btn-primary"}`}
            disabled={loading}
            style={{ borderRadius: "8px" }}
          >
            {loading ? "Logging in..." : role === "admin" ? "Admin Login" : "User Login"}
          </button>
        </form>

        <p className="mt-3 text-center">
          {role === "user" ? (
            <>
              Don't have an account? <Link to="/signup">Signup</Link>
            </>
          ) : (
            <span className="text-muted small">Only authorized admins can login here.</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
