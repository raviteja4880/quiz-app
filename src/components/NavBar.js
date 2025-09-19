import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Sync user from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    const handleEsc = (event) => {
      if (event.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };

  if (!isLoggedIn) return null;

  return (
    <nav
      className="navbar navbar-expand-lg px-4 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #9f64ddff 0%, #5d8fe7ff 100%)",
      }}
    >
      <Link className="navbar-brand fw-bold text-white fs-4" to="/home">
        Quiz App
      </Link>

      <div className="ms-auto d-flex align-items-center">
        <Link className="btn nav-btn mx-1" to="/home">
          Home
        </Link>
        <Link className="btn nav-btn mx-1" to="/quizlist">
          Quiz List
        </Link>

        {user?.role === "user" && (
          <Link className="btn nav-btn mx-1" to="/myresults">
            My Results
          </Link>
        )}

        {user?.role === "admin" && (
          <>
            <Link className="btn nav-btn mx-1" to="/admin">
              Admin Panel
            </Link>
            <Link className="btn nav-btn mx-1" to="/search-results">
              Search Results
            </Link>
          </>
        )}

        {/* Profile Dropdown */}
        <div className="position-relative" ref={dropdownRef}>
          <button
            className="profile-circle text-white d-flex align-items-center justify-content-center"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-label="Profile Menu"
          >
            <i className="bi bi-person fs-5" aria-hidden="true"></i>
          </button>

          {showDropdown && (
            <div
              className="dropdown-card shadow-lg"
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                width: "270px",
                zIndex: 1000,
                borderRadius: "14px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                color: "white",
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Profile Section */}
              <div className="text-center p-4">
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "26px",
                    fontWeight: "bold",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h6 className="mb-1">{user?.name}</h6>
                <small className="d-block">{user?.email}</small>
                <small
                  className="d-block mt-1"
                  style={{ fontStyle: "italic", opacity: 0.9 }}
                >
                  Role: {user?.role}
                </small>
              </div>

              {/* Logout Button */}
              <div className="px-4 pb-4">
                <button
                  className="btn w-100"
                  style={{
                    background: "#ff4b5c",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styling */}
      <style>{`
        .nav-btn {
          background: rgba(255,255,255,0.9);
          color: #2575fc;
          border: none;
          border-radius: 50px;
          font-weight: 500;
          padding: 6px 18px;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          background: #fff;
          color: #6a11cb;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .profile-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: background 0.3s ease;
          border: none;
        }
        .profile-circle:hover {
          background: rgba(255,255,255,0.6);
        }
      `}</style>
    </nav>
  );
}

export default NavBar;
