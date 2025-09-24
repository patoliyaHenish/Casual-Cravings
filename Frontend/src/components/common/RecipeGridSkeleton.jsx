import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const RecipeGridSkeleton = ({ count = 8 }) => {
  const { isDarkMode } = useTheme();

  const DesktopSkeleton = () => (
    <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse flex flex-col rounded-lg overflow-hidden shadow-sm"
          style={{
            backgroundColor: isDarkMode ? 'var(--card-bg)' : '#ffffff',
            border: isDarkMode ? '1px solid var(--border-color)' : 'none',
            minHeight: 280
          }}
        >
          <div className="relative">
            <div 
              className="w-full bg-gray-200"
              style={{ height: '160px' }}
            />
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <div 
                className="bg-gray-300 rounded-full"
                style={{ width: '32px', height: '32px' }}
              />
            </div>
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            
            <div className="flex items-center mb-2 mt-3">
              <div className="h-3 bg-gray-100 rounded w-4 mr-2" />
              <div className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
            
            <div className="flex-grow" />
            <div className="flex items-center justify-end mt-3">
              <div className="w-4 h-4 bg-gray-200 rounded mr-1" />
              <div className="h-3 bg-gray-200 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const MobileSkeleton = () => (
    <div className="block sm:hidden">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="mb-4">
          <div
            className="flex rounded-lg shadow-sm overflow-hidden animate-pulse"
            style={{
              backgroundColor: isDarkMode ? 'var(--card-bg)' : '#ffffff',
              border: isDarkMode ? '1px solid var(--border-color)' : '1px solid #f3f4f6'
            }}
          >
            <div className="w-24 h-24 flex-shrink-0 bg-gray-200" />
            
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                
                <div className="flex items-center mb-2">
                  <div className="h-3 bg-gray-100 rounded w-3 mr-2" />
                  <div className="w-5 h-5 bg-gray-200 rounded-full mr-2" />
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              </div>
              <div className="flex items-center justify-end mt-3">
                <div className="w-3 h-3 bg-gray-200 rounded mr-1" />
                <div className="h-3 bg-gray-200 rounded w-6" />
              </div>
            </div>
          </div>
          {idx < count - 1 && (
            <div className="h-px bg-gray-100 my-4" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <DesktopSkeleton />
      <MobileSkeleton />
    </>
  );
};

export default RecipeGridSkeleton;