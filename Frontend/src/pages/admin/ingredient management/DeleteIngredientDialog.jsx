import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';

const DeleteIngredientDialog = ({ open, onClose, onDelete, isLoading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Ingredient</DialogTitle>
    <DialogContent dividers>
      Are you sure you want to delete this ingredient?
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
      <Button onClick={onDelete} color="error" variant="contained" disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteIngredientDialog;