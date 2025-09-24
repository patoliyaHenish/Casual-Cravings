import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'inherit',
          '&:hover': {
            bgcolor: 'var(--navbar-hover)',
            color: 'var(--navbar-text)',
          },
          transition: 'all 0.3s ease',
        }}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <LightMode sx={{ fontSize: 24 }} />
        ) : (
          <DarkMode sx={{ fontSize: 24 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
