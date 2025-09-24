import React from "react";
import { useTheme } from "../context/ThemeContext";

const Loader = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center h-screen min-h-screen w-screen"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="relative">
        <div 
          className="w-32 h-32 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: isDarkMode ? '#3b82f6' : '#2563eb',
            borderRightColor: isDarkMode ? '#8b5cf6' : '#7c3aed',
            animationDuration: '1.5s'
          }}
        ></div>
        <div 
          className="absolute top-2 left-2 w-28 h-28 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderBottomColor: isDarkMode ? '#06b6d4' : '#0891b2',
            borderLeftColor: isDarkMode ? '#10b981' : '#059669',
            animationDuration: '1s',
            animationDirection: 'reverse'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full animate-pulse"
          style={{
            backgroundColor: isDarkMode ? '#f59e0b' : '#d97706',
            transform: 'translate(-50%, -50%)',
            animationDuration: '0.8s',
            boxShadow: isDarkMode 
              ? '0 0 20px rgba(245, 158, 11, 0.5)' 
              : '0 0 15px rgba(217, 119, 6, 0.4)'
          }}
        ></div>
      </div>

      <div className="mt-8 text-center">
        <p 
          className="text-xl font-semibold animate-pulse"
          style={{
            color: isDarkMode ? '#e5e7eb' : '#1f2937',
            transition: 'color 0.3s ease',
            textShadow: isDarkMode 
              ? '0 0 10px rgba(59, 130, 246, 0.3)' 
              : '0 0 8px rgba(37, 99, 235, 0.2)'
          }}
        >
          Loading delicious recipes...
        </p>
        
      </div>
    </div>
  );
};

export default Loader;