import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaUserTag, FaSignOutAlt, FaTachometerAlt, FaArrowLeft, FaPlay, FaCog, FaEdit, FaTimes, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";
import { userAPI } from "../services/api";

function Profile({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        navigate("/");
        return;
      }
      setUser(userData);
      setEditingUser({ name: userData.name, email: userData.email });
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Listen for both mouse and touch events
    setTimeout(() => {
      if (showDropdown) {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      }
    }, 0);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("tokenExpiry");
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    navigate("/");
  };

  const handleDashboard = () => {
    navigate("/student-dashboard");
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handlePasswordClick = () => {
    setShowPasswordModal(true);
    setShowDropdown(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingUser({ name: user.name, email: user.email });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!editingUser.name?.trim() || !editingUser.email?.trim()) {
      toast.error("Name and email are required");
      return;
    }

    // Check if anything changed
    if (
      editingUser.name === user.name &&
      editingUser.email === user.email
    ) {
      toast.info("No changes made");
      return;
    }

    setUpdating(true);
    try {
      const response = await userAPI.updateProfile({
        name: editingUser.name,
        email: editingUser.email,
      });

      // Update localStorage with new user data
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile updated successfully");
      setShowEditModal(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword?.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword?.trim()) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setUpdatingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="text-center text-white">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={handleGoBack}>
            <FaArrowLeft /> Back
          </button>
          <h2>My Profile</h2>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="profile-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            
            {/* Settings Dropdown */}
            <div className="settings-dropdown" ref={dropdownRef}>
              <button 
                className="settings-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDropdown(prev => !prev);
                }}
                type="button"
                title="Settings"
              >
                <FaCog />
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className="dropdown-item" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditClick();
                    }} 
                    type="button"
                  >
                    <FaEdit /> Update Personal Info
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePasswordClick();
                    }} 
                    type="button"
                  >
                    <FaLock /> Change Password
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-info">
            <div className="info-item">
              <FaUser className="info-icon" />
              <div>
                <label>Full Name</label>
                <p>{user.name || "N/A"}</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <label>Email Address</label>
                <p>{user.email || "N/A"}</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaUserTag className="info-icon" />
              <div>
                <label>Role</label>
                <p className="role-badge">{user.role || "user"}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {user.role === "user" && (
              <button className="action-btn dashboard-btn" onClick={handleDashboard}>
                <FaTachometerAlt /> View Dashboard
              </button>
            )}
            <button className="action-btn logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <h4>Quick Links</h4>
          <div className="links-grid">
            <button type="button" onClick={() => navigate("/home")}>
              <FaUser /> Home
            </button>
            <button type="button" onClick={() => navigate("/quizlist")}>
              <FaPlay /> Take Quiz
            </button>
            {user.role === "user" && (
              <button type="button" onClick={() => navigate("/myresults")}>
                <FaTachometerAlt /> My Results
              </button>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button className="modal-close-btn" onClick={handleCancelEdit}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editingUser?.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editingUser?.email || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleCancelEdit}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={handleCancelPasswordChange}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Change Password</h3>
                <button className="modal-close-btn" onClick={handleCancelPasswordChange}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSavePassword}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password *</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your current password"
                    required
                    disabled={updatingPassword}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your new password (min 6 characters)"
                    required
                    disabled={updatingPassword}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm your new password"
                    required
                    disabled={updatingPassword}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={handleCancelPasswordChange}
                    disabled={updatingPassword}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 20px 40px;
        }

        .profile-container {
          max-width: 500px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .profile-header h2 {
          color: white;
          margin: 0;
          font-size: 1.8rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .profile-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          animation: slideUp 0.4s ease-out;
          position: relative;
          overflow: visible;
        }

        .settings-dropdown {
          position: relative;
          z-index: 100;
          display: inline-block;
        }

        .settings-btn {
          background: #f0f0f0;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          color: #667eea;
          transition: all 0.3s ease;
          padding: 0;
          flex-shrink: 0;
          outline: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        .settings-btn:active,
        .settings-btn:focus {
          background: #e0e0e0;
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        .settings-btn:hover {
          background: #667eea;
          color: white;
          transform: rotate(90deg);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .dropdown-menu {
          position: absolute;
          top: 52px;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1005;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
          border: 1px solid #e0e0e0;
        }

        .dropdown-item {
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: transparent;
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.15s ease;
          text-align: left;
          font-family: inherit;
          outline: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        .dropdown-item:first-child {
          border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
          color: #667eea;
          padding-left: 20px;
        }

        .dropdown-item:active {
          background: #efefef;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: white;
          margin: 0 auto 25px;
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .profile-info {
          margin-bottom: 25px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-icon {
          font-size: 1.2rem;
          color: #667eea;
          margin-top: 3px;
        }

        .info-item label {
          font-size: 0.85rem;
          color: #888;
          display: block;
          margin-bottom: 4px;
        }

        .info-item p {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 500;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #667eea;
          color: white;
          border-radius: 20px;
          font-size: 0.9rem;
          text-transform: capitalize;
        }

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .dashboard-btn {
          background: #667eea;
          color: white;
        }

        .dashboard-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .logout-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .logout-btn:hover {
          background: #fecaca;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(220, 38, 38, 0.2);
        }

        .quick-links {
          margin-top: 25px;
          background: rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 20px;
        }

        .quick-links h4 {
          color: white;
          margin: 0 0 15px;
          font-size: 1.1rem;
        }

        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 10px;
        }

        .links-grid button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 15px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .links-grid button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          transition: color 0.2s ease;
        }

        .modal-close-btn:hover {
          color: #333;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }

        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .cancel-btn, .submit-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #333;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .submit-btn {
          background: #667eea;
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled, .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
            pointer-events: none;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .settings-btn {
            width: 48px;
            height: 48px;
            font-size: 1.3rem;
          }

          .dropdown-menu {
            top: 56px;
            min-width: 210px;
          }

          .dropdown-item {
            padding: 16px 18px;
            font-size: 1rem;
          }

          .dropdown-item:hover {
            padding-left: 18px;
          }
        }

        @media (max-width: 480px) {
          .profile-card {
            padding: 20px;
          }
          
          .profile-avatar {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }

          .settings-btn {
            width: 48px;
            height: 48px;
            font-size: 1.3rem;
          }

          .dropdown-menu {
            top: 56px;
            right: 0;
            min-width: 180px;
          }

          .dropdown-item {
            padding: 16px;
            font-size: 0.95rem;
          }

          .modal-content {
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn, .submit-btn {
            width: 100%;
          }
        }

        @media (hover: none) {
          .dropdown-item:hover {
            padding-left: 16px;
            background: transparent;
          }

          .dropdown-item:active {
            background: #f5f5f5;
            color: #667eea;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
