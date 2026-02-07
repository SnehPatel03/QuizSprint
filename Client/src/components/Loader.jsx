import React, { useState, useEffect } from "react";

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center max-w-md w-full px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-12">
          {/* QUIZ */}
          <span className="inline-block">
            {"QUIZ".split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block text-white animate-pulse"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              >
                {letter}
              </span>
            ))}
          </span>
          {/* Space */}
          <span className="inline-block w-3"></span>
          {/* SPRINT */}
          <span className="inline-block">
            {"SPRINT".split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block text-gray-500 animate-pulse"
                style={{
                  animationDelay: `${(index + 4) * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </h1>

        <div className="mb-4">
          <span className="text-4xl font-bold text-white">{progress}%</span>
        </div>

        {/* Loading bar container */}
        <div className="relative w-full h-2 bg-gray-900 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-white via-gray-300 to-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
          
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-sm font-medium text-gray-500">Loading</span>
          <div className="flex gap-1">
            <span
              className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></span>
            <span
              className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></span>
            <span
              className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></span>
          </div>
        </div>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;