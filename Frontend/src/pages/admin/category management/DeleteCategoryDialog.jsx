import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';

const DeleteCategoryDialog = ({
  open,
  onClose,
  highlight,
  setHighlight,
  onDelete,
  isDeleting,
}) => (
  <Dialog
    open={open}
    onClose={(event, reason) => {
      if (reason === 'backdropClick') {
        setHighlight(true);
      } else {
        onClose();
        setHighlight(false);
      }
    }}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>Delete Category</DialogTitle>
    <DialogContent dividers>
      Are you sure you want to delete this category?
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onClose();
          setHighlight(false);
        }}
        color="inherit"
        variant="outlined"
        sx={highlight ? { boxShadow: '0 0 0 3px #f59e42', border: '2px solid #f59e42' } : {}}
      >
        Cancel
      </Button>
      <Button
        onClick={onDelete}
        color="error"
        variant="contained"
        disabled={isDeleting}
      >
        {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteCategoryDialog;