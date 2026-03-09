import React from "react";

export default function AlertBar({ notice, onClose, onView }) {
  if (!notice) return null;

  const sevClass =
    {
      LOW: "text-bg-secondary",
      MEDIUM: "text-bg-warning",
      HIGH: "text-bg-danger",
      CRITICAL: "text-bg-dark",
    }[notice.severity] || "text-bg-secondary";

  return (
    <div className="rsq-ticker shadow">
      <div className={`badge ${sevClass} me-2`}>{notice.severity || "NEW"}</div>
      <div className="rsq-ticker-text flex-grow-1">
        <strong>New incident:</strong> {notice.title}
      </div>
      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-outline-light" onClick={onView}>View</button>
        <button className="btn btn-sm btn-outline-light" onClick={onClose}>Dismiss</button>
      </div>
    </div>
  );
}
