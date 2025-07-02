import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, TextField } from '@mui/material';

const EditCategoryDialog = ({
  open,
  onClose,
  highlight,
  setHighlight,
  isLoading,
  isUpdating,
  form,
  onFormChange,
  onImageChange,
  onSubmit,
}) => {
  const isNameValid = !!form.name;
  const isDescriptionValid = !!form.description;
  const isImageValid = !!(form.imagePreview || form.image);
  const isFormValid = isNameValid && isDescriptionValid && isImageValid;

  return (
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
                value={form.name}
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
                value={form.description}
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
      src={form.imagePreview || form.image}
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
              setHighlight(false);
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