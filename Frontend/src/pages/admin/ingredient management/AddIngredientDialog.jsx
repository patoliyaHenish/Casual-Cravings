import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const AddIngredientSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(100),
  description: Yup.string().required('Description is required').min(10).max(500),
  uses: Yup.string().required('Uses are required').min(10).max(500),
  substitutes: Yup.string().required('Substitutes are required').min(10).max(500),
});

const AddIngredientDialog = ({ open, onClose, form, onFormChange, onSubmit, isLoading }) => (
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
  >
    <DialogTitle>Add Ingredient</DialogTitle>
    <Formik
      initialValues={form}
      validationSchema={AddIngredientSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ values, handleChange, handleBlur, errors, touched, isValid, dirty }) => (
        <Form>
          <DialogContent dividers>
            <TextField
              label="Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              margin="normal"
              required
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
            />
            <TextField
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={2}
              error={touched.description && Boolean(errors.description)}
              helperText={touched.description && errors.description}
            />
            <TextField
              label="Uses"
              name="uses"
              value={values.uses}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={2}
              error={touched.uses && Boolean(errors.uses)}
              helperText={touched.uses && errors.uses}
            />
            <TextField
              label="Substitutes"
              name="substitutes"
              value={values.substitutes}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={2}
              error={touched.substitutes && Boolean(errors.substitutes)}
              helperText={touched.substitutes && errors.substitutes}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={isLoading || !isValid || !dirty}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Add'}
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
);

export default AddIngredientDialog;