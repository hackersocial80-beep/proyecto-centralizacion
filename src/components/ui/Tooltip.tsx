import React from "react";

const Tooltip = ({ children, content }) => {
  return (
    <div className="relative inline-block group">
      {children}

      <div className="absolute left-1/2 bottom-full mb-2 hidden w-64 -translate-x-1/2 rounded-md bg-gray-800 p-3 text-sm text-white shadow-lg group-hover:block z-50">
        {content}
      </div>
    </div>
  );
};

export default Tooltip;