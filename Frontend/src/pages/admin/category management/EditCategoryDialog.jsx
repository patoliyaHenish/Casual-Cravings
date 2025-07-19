import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, TextField } from '@mui/material';
import { useGetRecipeCategoryByIdQuery, useUpdateRecipeCategoryByIdMutation } from '../../../features/api/categoryApi';
import { toast } from 'sonner';

const EditCategoryDialog = ({
  open,
  onClose,
  categoryId,
  highlight,
  setHighlight,
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: null,
    removeImage: false,
  });

  const { data: categoryData, isLoading } = useGetRecipeCategoryByIdQuery(categoryId, {
    skip: !categoryId || !open
  });

  const [updateRecipeCategoryById, { isLoading: isUpdating }] = useUpdateRecipeCategoryByIdMutation();

  useEffect(() => {
    if (categoryData?.data) {
      setForm({
        name: categoryData.data.name || '',
        description: categoryData.data.description || '',
        image: null,
        imagePreview: categoryData.data.image || null,
        removeImage: false,
      });
    }
  }, [categoryData]);

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

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image instanceof File) {
      formData.append('recipeCategoryProfileImage', form.image);
    }
    if (form.removeImage) {
      formData.append('removeImage', 'true');
    }

    try {
      await updateRecipeCategoryById({ id: categoryId, inputData: formData }).unwrap();
      toast.success('Category updated successfully');
      onClose();
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        'Failed to update category';
      toast.error(errMsg);
    }
  };

  if (!form) return null;
  
  const isNameValid = !!form.name;
  const isDescriptionValid = !!form.description;
  const isImageValid = !!(form.imagePreview || form.image);
  const isFormValid = isNameValid && isDescriptionValid && isImageValid;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          setHighlight && setHighlight(true);
          return;
        }
        onClose();
        setHighlight && setHighlight(false);
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Category</DialogTitle>
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
                helperText={!isDescriptionValid ? "Description is required" : ""}
              />
              <div className="my-4">
                {isImageValid ? (
                  <div className="flex flex-col items-start gap-0">
                    <img
                      src={(form.imagePreview ?? form.image) || ''}
                      alt="Category"
                      className="h-20 w-20 object-cover rounded mb-4"
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
            onClick={() => {
              onClose();
              setHighlight && setHighlight(false);
            }}
            color="inherit"
            variant="outlined"
            sx={highlight ? { boxShadow: '0 0 0 3px #f59e42', border: '2px solid #f59e42' } : {}}
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

export default EditCategoryDialog;