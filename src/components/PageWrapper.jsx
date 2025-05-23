import React from "react";

const PageWrapper = ({ isDrawerOpen, children }) => {
  return (
    <div
      className={`flex-grow transition-all duration-300 ease-in-out px-[50px] mt-28 ${
        isDrawerOpen ? "ml-[420px]" : "ml-0"
      }`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
};

export default PageWrapper;
