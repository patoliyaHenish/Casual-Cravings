import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '../../context/ThemeContext';

const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  viewTooltip = 'View',
  editTooltip = 'Edit',
  deleteTooltip = 'Delete',
  disabled = false,
  showView = true,
  showEdit = true,
  showDelete = true,
  size = 'small',
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {showView && onView && (
        <Tooltip title={viewTooltip}>
          <IconButton
            color="warning"
            onClick={onView}
            disabled={disabled}
            size={size}
            sx={{
              color: 'var(--btn-primary)',
              '&:hover': {
                backgroundColor: 'var(--btn-primary)',
                color: '#ffffff'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      )}
      
      {showEdit && onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton
            color="primary"
            onClick={onEdit}
            disabled={disabled}
            size={size}
            sx={{
              color: isDarkMode ? '#64b5f6' : '#1976d2',
              '&:hover': {
                backgroundColor: isDarkMode ? '#1976d2' : '#1565c0',
                color: '#ffffff'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
      
      {showDelete && onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton
            color="error"
            onClick={onDelete}
            disabled={disabled}
            size={size}
            sx={{
              color: isDarkMode ? '#f48fb1' : '#d32f2f',
              '&:hover': {
                backgroundColor: isDarkMode ? '#d32f2f' : '#c62828',
                color: '#ffffff'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons; 