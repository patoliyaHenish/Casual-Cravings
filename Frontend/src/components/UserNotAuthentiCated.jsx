import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserNotAuthentiCated = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 to-yellow-50 animate-fade-in">
      <div className="relative mb-8">
        <div className="animate-bounce">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="10" rx="3" fill="#E06B00" />
            <rect x="8" y="6" width="8" height="8" rx="4" fill="#FFF3E0" />
            <rect x="10.5" y="15" width="3" height="4" rx="1.5" fill="#FFF3E0" />
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-full blur-2xl opacity-30 bg-orange-400 animate-pulse"></div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#E06B00] mb-2 tracking-wide animate-fade-in-down">
        Not Authenticated
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center max-w-md animate-fade-in-up">
        Oops! You need to be logged in to access this page.<br />
        Please login or sign up to continue.
      </p>
      <Button
        variant="contained"
        size="large"
        sx={{
          bgcolor: '#E06B00',
          color: '#FFF3E0',
          fontWeight: 'bold',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          px: 4,
          py: 1.5,
          boxShadow: 3,
          '&:hover': { bgcolor: '#F97C1B', color: '#2C1400' },
        }}
        onClick={() => navigate('/auth')}
        className="animate-fade-in"
      >
        Go to Login
      </Button>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </div>
  );
};

export default UserNotAuthentiCated;