import React from "react";
import loaderSvg from "../assets/loader.svg";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center h-screen min-h-screen w-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <img
        src={loaderSvg}
        alt="Loading..."
        className="w-40 h-40 animate-spin-slow drop-shadow-lg"
      />

      <div className="mt-2 text-center">
        <p className="mt-2 text-amber-700 animate-pulse">Loading delicious recipes...</p>
      </div>
    </div>
  );
};

export default Loader;