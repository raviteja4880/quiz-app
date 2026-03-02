import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaList, FaChartBar, FaUser, FaSignOutAlt, FaTachometerAlt, FaSearch } from "react-icons/fa";

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef();

  useEffect(() => {
    const handleStorageChange = () => setUser(JSON.parse(localStorage.getItem("user")));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu when clicking on overlay (outside the menu)
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Only close if clicking on the overlay (not on toggle button)
        const toggleBtn = document.querySelector('.mobile-toggle');
        if (toggleBtn && !toggleBtn.contains(event.target)) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  if (!isLoggedIn) return null;

  const navLinks = [
    { path: "/home", label: "Home", icon: <FaHome /> },
    { path: "/quizlist", label: "Quiz List", icon: <FaList /> },
    ...(user?.role === "user" ? [{ path: "/myresults", label: "My Results", icon: <FaChartBar /> }] : []),
    ...(user?.role === "admin" ? [
      { path: "/admin", label: "Admin Panel", icon: <FaUser /> },
      { path: "/search-results", label: "Search Results", icon: <FaSearch /> },
    ] : []),
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo - Left */}
          <Link className="navbar-brand" to="/home">
            Quiz App
          </Link>

          {/* Right Side - Toggle & Nav */}
          <div className="navbar-right">
            {/* Mobile Toggle - Right */}
            <button 
              className="mobile-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop Nav */}
            <div className="desktop-nav">
              <div className="nav-links">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
                    to={link.path}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Profile Link - navigates to profile page */}
              <button
                className="profile-btn"
                onClick={() => navigate("/profile")}
              >
                <div className="avatar-circle">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="fw-semibold">{user?.name}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu - Slides from left */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} ref={mobileMenuRef}>
        <div className="mobile-menu-header">
          <div className="user-info">
            <div className="avatar-circle large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="fw-semibold">{user?.name}</div>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>
        </div>

        <div className="mobile-menu-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              className={`mobile-link ${location.pathname === link.path ? "active" : ""}`}
              to={link.path}
            >
              <span className="link-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {/* Profile Link in Mobile Menu */}
          <Link
            className={`mobile-link ${location.pathname === "/profile" ? "active" : ""}`}
            to="/profile"
          >
            <span className="link-icon"><FaUser /></span>
            My Profile
          </Link>

          {user?.role === "user" && (
            <Link
              className="mobile-link"
              to="/student-dashboard"
            >
              <span className="link-icon"><FaTachometerAlt /></span>
              Dashboard
            </Link>
          )}

          <button
            className="mobile-link text-danger"
            onClick={handleLogout}
          >
            <span className="link-icon"><FaSignOutAlt /></span>
            Logout
          </button>
        </div>

        <div className="mobile-menu-footer">
          <small className="text-muted">Role: {user?.role}</small>
        </div>
      </div>

      <style>{`
        .navbar {
          background: #fff;
          border-bottom: 1px solid #eaeaea;
          position: sticky;
          top: 0;
          z-index: 1050;
          width: 100%;
        }

        .navbar-inner {
          width: 100%;
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 auto;
          max-width: 100%;
        }

        .navbar-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          text-decoration: none;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #333;
          padding: 5px;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-links {
          display: flex;
          gap: 10px;
        }

        .nav-link {
          padding: 8px 18px;
          border-radius: 50px;
          font-weight: 500;
          color: #333;
          text-decoration: none;
          transition: all 0.3s ease;
          background: #f5f5f5;
        }

        .nav-link:hover {
          background: #eaeaea;
        }

        .nav-link.active {
          background: #333;
          color: #fff;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.2s ease;
          font-size: 1rem;
        }

        .profile-btn:hover {
          background: #f5f5f5;
        }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #667eea;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 15px;
          color: #fff;
        }

        .avatar-circle.large {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        /* Mobile Overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1098;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .mobile-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Menu - Left slide */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 70%;
          max-width: 300px;
          background: #fff;
          z-index: 1100;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-links {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 10px;
          color: #333;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s ease;
          background: none;
          border: none;
          width: 100%;
          cursor: pointer;
          margin-bottom: 5px;
        }

        .mobile-link:hover {
          background: #f5f5f5;
        }

        .mobile-link.active {
          background: #667eea;
          color: #fff;
        }

        .link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          font-size: 18px;
        }

        .mobile-menu-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}

export default NavBar;
