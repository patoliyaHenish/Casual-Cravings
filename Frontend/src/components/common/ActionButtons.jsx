import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {showView && onView && (
        <Tooltip title={viewTooltip}>
          <IconButton
            color="warning"
            onClick={onView}
            disabled={disabled}
            size={size}
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
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons; 