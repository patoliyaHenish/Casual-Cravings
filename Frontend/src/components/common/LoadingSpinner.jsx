import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({
  size = 24,
  color = 'warning',
  message = 'Loading...',
  showMessage = false,
  fullScreen = false,
  className = '',
}) => {
  const spinner = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={className}
    >
      <CircularProgress size={size} color={color} />
      {showMessage && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 1 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {spinner}
      </Box>
    );
  }

  return spinner;
};

export default LoadingSpinner; 