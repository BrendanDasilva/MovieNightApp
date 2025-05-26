import React from "react";

const PageWrapper = ({ isDrawerOpen, children }) => {
  return (
    <div
      className={`flex-grow transition-all duration-300 ease-in-out mt-28 ${
        isDrawerOpen
          ? "ml-[420px] px-[50px]"
          : "ml-[48px] pr-[50px] pl-[24px] sm:pl-[50px]"
      }`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
};

export default PageWrapper;
