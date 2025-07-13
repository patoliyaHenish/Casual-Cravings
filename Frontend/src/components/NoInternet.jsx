import React from 'react';

const NoInternet = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 text-amber-700">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01M4.93 19.07a10 10 0 0114.14 0M1.42 15.58a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0" />
    </svg>
    <h1 className="text-3xl font-bold mb-2">No Internet Connection</h1>
    <p className="text-lg mb-4">It looks like you're offline. Please check your internet connection.</p>
    <button
      className="px-6 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700 transition"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
);

export default NoInternet; 