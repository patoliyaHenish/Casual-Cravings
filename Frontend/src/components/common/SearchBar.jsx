import React from 'react';
import { TextField } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  size = 'small',
  variant = 'outlined',
  className = 'rounded w-full sm:w-auto',
  sx = { minWidth: { xs: '100%', sm: 220 } },
  fullWidth = false,
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  return (
    <TextField
      label={label}
      variant={variant}
      size={size}
      value={value}
      onChange={onChange}
      placeholder=""
      className={className}
      sx={{
        ...sx,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-primary)',
          border: `1px solid var(--border-color)`,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--btn-primary)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--btn-primary)',
          }
        },
        '& .MuiInputLabel-root': {
          color: 'var(--text-secondary)',
          '&.Mui-focused': {
            color: 'var(--btn-primary)',
          }
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--border-color)',
        },
        transition: 'all 0.3s ease'
      }}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
};

export default SearchBar; 