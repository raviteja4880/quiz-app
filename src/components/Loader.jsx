import React from "react";

export default function Loader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      style={{ flexDirection: "column" }}
    >
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-secondary">Please wait...</p>
    </div>
  );
}
