import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';

const DeleteSubCategoryDialog = ({
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
        setHighlight?.(true);
      } else {
        onClose();
        setHighlight?.(false);
      }
    }}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      className: 'rounded-lg',
    }}
  >
    <DialogTitle className="font-bold text-lg">Delete Sub-Category</DialogTitle>
    <DialogContent dividers className="py-4">
      Are you sure you want to delete this sub-category?
    </DialogContent>
    <DialogActions className="flex justify-end gap-2 px-4 pb-4">
      <Button
        onClick={() => {
          onClose();
          setHighlight?.(false);
        }}
        color="inherit"
        variant="outlined"
        sx={highlight ? { boxShadow: '0 0 0 3px #f59e42', border: '2px solid #f59e42' } : {}}
        className="min-w-[90px]"
      >
        Cancel
      </Button>
      <Button
        onClick={onDelete}
        color="error"
        variant="contained"
        disabled={isDeleting}
        className="min-w-[90px]"
      >
        {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteSubCategoryDialog;