import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import { useGetRecipeCategoryByIdQuery } from '../../../features/api/categoryApi';

const ViewCategoryDialog = ({
  open,
  onClose,
  categoryId,
  highlight,
  setHighlight,
}) => {
  const { data: categoryData, isLoading } = useGetRecipeCategoryByIdQuery(categoryId, {
    skip: !categoryId || !open
  });

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          setHighlight && setHighlight(true);
        } else {
          onClose();
          setHighlight && setHighlight(false);
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
        ) : categoryData?.data ? (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Name:</span> {categoryData.data.name}
            </div>
            <div>
              <span className="font-semibold">Description:</span> {categoryData.data.description}
            </div>
            <div>
              <span className="font-semibold">Image:</span><br />
              {categoryData.data.image ? (
                <img src={categoryData.data.image} alt={categoryData.data.name} className="h-32 w-32 object-cover rounded mt-2" />
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
            setHighlight && setHighlight(false);
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
};

export default ViewCategoryDialog;