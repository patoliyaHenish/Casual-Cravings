import React from 'react';
import { Button } from '@mui/material';

const PageHeader = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4 ${className}`}>
      <h2 className="text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
        {title}
      </h2>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
};

export default PageHeader; 