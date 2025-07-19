import React, { useState, useEffect } from 'react';
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
import { useGetRecipeSubCategoryByIdMutation, useUpdateRecipeSubCategoryMutation } from '../../../features/api/subCategoryApi';
import { toast } from 'sonner';

const EditSubCategoryDialog = ({
  open,
  onClose,
  subCategoryId,
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: null,
    imagePreview: null,
    removeImage: false,
  });

  const [getSubCategoryById, { isLoading }] = useGetRecipeSubCategoryByIdMutation();
  const [updateRecipeSubCategory, { isLoading: isUpdating }] = useUpdateRecipeSubCategoryMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetRecipeCategoriesQuery({ search: '', page: 1, limit: 100 });
  
  const categories = categoriesData?.data || [];

  useEffect(() => {
    const fetchData = async () => {
      if (subCategoryId && open) {
        try {
          const result = await getSubCategoryById({ subCategoryId }).unwrap();
          const data = result.data;
          setForm({
            name: data.name || '',
            description: data.description || '',
            categoryId: data.category_id || '',
            image: null,
            imagePreview: data.image || null,
            removeImage: false,
          });
        } catch (error) {
          console.error('Failed to fetch sub-category:', error);
          toast.error('Failed to load sub-category data');
        }
      }
    };

    fetchData();
  }, [subCategoryId, open, getSubCategoryById]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        removeImage: false,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Name is required');
      return;
    }
    if (!form.description) {
      toast.error('Description is required');
      return;
    }
    if (!form.categoryId) {
      toast.error('Category is required');
      return;
    }

    const formData = new FormData();
    formData.append('subCategoryId', subCategoryId);
    formData.append('categoryId', form.categoryId);
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image instanceof File) {
      formData.append('recipeSubCategoryProfileImage', form.image);
    }
    if (form.removeImage) {
      formData.append('removeImage', 'true');
    }

    try {
      await updateRecipeSubCategory(formData).unwrap();
      toast.success('Sub-category updated successfully');
      onClose();
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        'Failed to update sub-category';
      toast.error(errMsg);
    }
  };

  if (!form) return null;
  
  const isNameValid = !!form.name;
  const isDescriptionValid = !!form.description && form.description.length >= 10;
  const isCategoryValid = !!form.categoryId;
  const isImageValid = !!(form.imagePreview || form.image);
  const isFormValid = isNameValid && isDescriptionValid && isCategoryValid;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
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
                value={form.name ?? ''}
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
                value={form.description ?? ''}
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
                value={form.categoryId ?? ''}
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
                      src={(form.imagePreview ?? (typeof form.image === 'string' ? form.image : undefined)) || ''}
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