import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef();

  // Sync user from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Lock scroll when dropdown is open
  useEffect(() => {
    document.body.style.overflow = showProfileDropdown ? "hidden" : "auto";
  }, [showProfileDropdown]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      setShowProfileDropdown(false);
      navigate("/");
    }
  };

  if (!isLoggedIn) return null;

  return (
    <nav
      className="navbar navbar-expand-lg px-4 shadow-sm"
      style={{
        background: "#fff",
        borderBottom: "1px solid #eaeaea",
        position: "sticky",
        top: 0,
        zIndex: 1050,
      }}
    >
      <Link className="navbar-brand fw-bold fs-4 text-dark" to="/home">
        Quiz App
      </Link>

      <div className="ms-auto d-flex align-items-center">
        <Link
          className={`btn nav-btn mx-1 ${location.pathname === "/home" ? "active" : ""}`}
          to="/home"
        >
          Home
        </Link>

        <Link
          className={`btn nav-btn mx-1 ${location.pathname === "/quizlist" ? "active" : ""}`}
          to="/quizlist"
        >
          Quiz List
        </Link>

        {user?.role === "user" && (
          <Link
            className={`btn nav-btn mx-1 ${location.pathname === "/myresults" ? "active" : ""}`}
            to="/myresults"
          >
            My Results
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link
              className={`btn nav-btn mx-1 ${location.pathname === "/admin" ? "active" : ""}`}
              to="/admin"
            >
              Admin Panel
            </Link>
            <Link
              className={`btn nav-btn mx-1 ${location.pathname === "/search-results" ? "active" : ""}`}
              to="/search-results"
            >
              Search Results
            </Link>
          </>
        )}

        {/* Profile Dropdown */}
        <div className="position-relative" ref={profileDropdownRef}>
          <button
            className="profile-btn d-flex align-items-center"
            onClick={() => setShowProfileDropdown((prev) => !prev)}
          >
            <div className="avatar-circle me-2">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="fw-semibold text-dark">{user?.name}</span>
          </button>

          {showProfileDropdown && (
            <div
              className="dropdown-card"
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                width: "260px",
                zIndex: 2000,
                borderRadius: "10px",
                background: "#fff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              {/* Profile Section */}
              <div className="d-flex align-items-center px-3 py-3 border-bottom">
                <div className="avatar-circle me-2">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-semibold">{user?.name}</div>
                  <small className="text-muted">{user?.email}</small>
                </div>
              </div>

              {/* Menu Items */}
              <div className="d-flex flex-column">
                <div
                  className="dropdown-role px-3 py-2"
                  style={{
                    fontSize: "14px",
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="bi bi-shield-lock me-2"></i> Role: {user?.role}
                </div>
                <button
                  className="dropdown-item-btn text-danger fw-semibold"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2 text-danger"></i> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styling */}
      <style>{`
        .nav-btn {
          background: #f5f5f5;
          color: #333;
          border: none;
          border-radius: 50px;
          font-weight: 500;
          padding: 6px 18px;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          background: #eaeaea;
          color: #000;
        }
        .nav-btn.active {
          background: #333;
          color: #fff;
        }
        .profile-btn {
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .profile-btn:hover {
          background: #f5f5f5;
        }
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 15px;
          color: #333;
        }
        .dropdown-item-btn {
          background: none;
          border: none;
          text-align: left;
          padding: 10px 16px;
          font-size: 14px;
          color: #333;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dropdown-item-btn:hover {
          background: #f5f5f5;
        }
        .dropdown-card {
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}

export default NavBar;
