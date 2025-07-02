import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
} from '@mui/material';
import { useGetRecipeCategoriesQuery } from '../../../features/api/categoryApi';

const EditSubCategoryDialog = ({
  open,
  onClose,
  isLoading,
  isUpdating,
  form,
  onFormChange,
  onImageChange,
  onSubmit,
}) => {
  
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetRecipeCategoriesQuery({ search: '', page: 1, limit: 100 });
  const categories = categoriesData?.data || [];

  const isNameValid = !!form.name;
  const isDescriptionValid = !!form.description && form.description.length >= 10;
  const isCategoryValid = !!form.categoryId;
  const isImageValid = !!(form.imagePreview || form.image);
  const isFormValid = isNameValid && isDescriptionValid && isCategoryValid;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'rounded-lg',
      }}
    >
      <DialogTitle className="font-bold text-lg">Edit Sub-Category</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent dividers>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <CircularProgress color="primary" />
            </div>
          ) : (
            <>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={onFormChange}
                fullWidth
                required
                margin="normal"
                error={!isNameValid}
                helperText={!isNameValid ? "Name is required" : ""}
                className="mb-2"
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={onFormChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                required
                error={!isDescriptionValid}
                helperText={!isDescriptionValid ? "Description must be at least 10 characters" : ""}
                className="mb-2"
              />
              <TextField
                select
                label="Category"
                name="categoryId"
                value={form.categoryId}
                onChange={onFormChange}
                fullWidth
                required
                margin="normal"
                error={!isCategoryValid}
                helperText={!isCategoryValid ? "Category is required" : ""}
                className="mb-2"
                disabled={isCategoriesLoading}
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              <div className="my-4">
                {isImageValid ? (
                  <div className="flex flex-col items-start gap-0">
                    <img
                      src={form.imagePreview || (typeof form.image === 'string' ? form.image : undefined)}
                      alt="SubCategory"
                      className="h-20 w-20 object-cover rounded mb-4 border"
                    />
                  </div>
                ) : (
                  <div className="text-red-500 mb-2">Image is required</div>
                )}
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  size="small"
                  className="mt-2"
                >
                  {isImageValid ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onImageChange}
                    required={!isImageValid}
                  />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="inherit"
            variant="outlined"
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isUpdating || !isFormValid}
          >
            {isUpdating ? <CircularProgress size={24} color="inherit" /> : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditSubCategoryDialog;