import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';

const ViewIngredientDialog = ({ open, onClose, isLoading, data }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Ingredient Details</DialogTitle>
    <DialogContent dividers>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <CircularProgress color="warning" />
        </div>
      ) : !data ? (
        <div className="text-gray-500 text-center">No data found.</div>
      ) : (
        <div className="flex flex-col gap-2">
          <div><strong>Name:</strong> {data.name}</div>
          <div><strong>Description:</strong> {data.description}</div>
          <div><strong>Uses:</strong> {data.uses}</div>
          <div><strong>Substitutes:</strong> {data.substitutes}</div>
        </div>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="warning" variant="contained">Close</Button>
    </DialogActions>
  </Dialog>
);

export default ViewIngredientDialog;