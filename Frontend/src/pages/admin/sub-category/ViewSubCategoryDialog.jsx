import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useGetRecipeSubCategoryByIdMutation } from '../../../features/api/subCategoryApi';
import { useState, useEffect } from 'react';

const ViewSubCategoryDialog = ({ open, onClose, subCategoryId }) => {
  const [getSubCategoryById, { isLoading }] = useGetRecipeSubCategoryByIdMutation();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (subCategoryId && open) {
        try {
          const result = await getSubCategoryById({ subCategoryId }).unwrap();
          setData(result.data);
        } catch (error) {
          setData(null);
        }
      }
    };

    fetchData();
  }, [subCategoryId, open, getSubCategoryById]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sub-Category Details</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress color="warning" />
          </div>
        ) : !data ? (
          <div className="text-gray-500">No details found.</div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Name:</span> {data.name}
            </div>
            <div>
              <span className="font-semibold">Category:</span> {data.category_name}
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="warning" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSubCategoryDialog;