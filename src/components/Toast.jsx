import React from "react";

const Toast = ({ visible, message, type = "success" }) => {
  if (!visible) return null;

  // choose background color based on type
  const bgClass = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2
        ${bgClass} text-white px-6 py-3 rounded shadow-lg z-50
      `}
    >
      {message}
    </div>
  );
};

export default Toast;
