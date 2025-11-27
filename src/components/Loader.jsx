import React from "react";

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="loader-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loading-text">Loading, please wait...</p>

      <style>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #eef2ff, #dbe4ff);
        }

        /* Rotating 3D ring loader */
        .loader-ring {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }

        .loader-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 64px;
          height: 64px;
          margin: 8px;
          border: 8px solid #0b74de;
          border-radius: 50%;
          animation: ring-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #0b74de transparent transparent transparent;
        }

        .loader-ring div:nth-child(1) { animation-delay: -0.45s; }
        .loader-ring div:nth-child(2) { animation-delay: -0.3s; }
        .loader-ring div:nth-child(3) { animation-delay: -0.15s; }

        @keyframes ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 20px;
          font-size: 1.1rem;
          color: #0b74de;
          font-weight: 500;
          animation: text-fade 1.5s infinite;
        }

        @keyframes text-fade {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .loader-ring { width: 60px; height: 60px; }
          .loader-ring div { width: 48px; height: 48px; border-width: 6px; margin: 6px; }
          .loading-text { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
