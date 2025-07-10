import React from 'react';
import { TextField } from '@mui/material';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  size = 'small',
  variant = 'outlined',
  className = 'bg-white rounded w-full sm:w-auto',
  sx = { minWidth: { xs: '100%', sm: 220 } },
  fullWidth = false,
  disabled = false,
}) => {
  return (
    <TextField
      label={label}
      variant={variant}
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      sx={sx}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
};

export default SearchBar; 