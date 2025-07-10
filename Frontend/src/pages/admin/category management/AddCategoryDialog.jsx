import React, { useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be at most 500 characters'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileSize', 'File size is too large', (value) => {
      if (!value) return true;
      return value.size <= 2 * 1024 * 1024;
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      return allowedTypes.includes(value.type);
    }),
});

const AddCategoryDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  highlight,
  setHighlight,
}) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      image: null,
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      onSubmit(values);
      resetForm();
      setImagePreview(null);
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue('image', file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      formik.setFieldValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          setHighlight(true);
          return;
        }
        onClose();
        setHighlight(false);
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add Recipe Category</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <div className="space-y-4">
            <TextField
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              fullWidth
              required
              autoFocus
              sx={{ marginBottom: 2 }}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              onBlur={formik.handleBlur}
            />
            <TextField
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              fullWidth
              multiline
              rows={3}
              sx={{ marginBottom: 2 }}
              required
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              onBlur={formik.handleBlur}
            />
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed #f59e42' : '2px dashed #ccc',
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                background: dragActive ? '#fff7ed' : '#fafafa',
                marginBottom: 8,
                marginTop: 16,
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <Button
                variant="outlined"
                component="span"
              >
                {formik.values.image ? "Change Image" : "Upload Image"}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <div style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
                or drag and drop image here
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded mt-2"
                  style={{ display: 'block', margin: '12px auto 0' }}
                />
              )}
              {formik.touched.image && formik.errors.image && (
                <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>
                  {formik.errors.image}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onClose();
              setHighlight(false);
              formik.resetForm();
              setImagePreview(null);
            }}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="warning"
            variant="contained"
            disabled={
              isLoading ||
              !formik.isValid ||
              !formik.dirty
            }
            sx={highlight ? { boxShadow: '0 0 0 3px #f59e42', border: '2px solid #f59e42' } : {}}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCategoryDialog;