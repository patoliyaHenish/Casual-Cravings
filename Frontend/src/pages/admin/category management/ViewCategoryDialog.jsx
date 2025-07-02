import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';

const ViewCategoryDialog = ({
  open,
  onClose,
  highlight,
  setHighlight,
  isLoading,
  data,
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
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle>Category Details</DialogTitle>
    <DialogContent dividers>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <CircularProgress color="warning" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Name:</span> {data.name}
          </div>
          <div>
            <span className="font-semibold">Description:</span> {data.description}
          </div>
          <div>
            <span className="font-semibold">Image:</span><br />
            {data.image ? (
              <img src={data.image} alt={data.name} className="h-32 w-32 object-cover rounded mt-2" />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No details found.</div>
      )}
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onClose();
          setHighlight(false);
        }}
        color="warning"
        variant="contained"
        sx={highlight ? { boxShadow: '0 0 0 3px #f59e42', border: '2px solid #f59e42' } : {}}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default ViewCategoryDialog;