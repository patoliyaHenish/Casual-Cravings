import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useGetRecipeCategoriesQuery } from '../../../features/api/categoryApi';
import { useGetAllIngredientsQuery } from '../../../features/api/ingredientApi';
import { useGetAllRecipeSubCategorieDetailsQuery } from '../../../features/api/subCategoryApi';
import * as Yup from 'yup';
import { Add, Remove, Edit, Save, Cancel } from '@mui/icons-material';
import { Formik, Form, useFormikContext } from 'formik';
import { getYouTubeThumbnail, isValidYouTubeVideo } from '../../../utils/helper';
import helper from '../../../utils/helper.json';

const InstructionItem = ({ instruction, index, onUpdate, onRemove, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(instruction);

  useEffect(() => {
    setEditValue(instruction);
  }, [instruction]);

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate(editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(instruction);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ minWidth: 30, fontWeight: 'bold' }}>{index + 1}.</span>
        <TextField
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          autoFocus
          multiline
          rows={2}
        />
        <IconButton
          size="small"
          color="primary"
          onClick={handleSave}
          disabled={disabled || !editValue.trim()}
        >
          <Save />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={handleCancel}
          disabled={disabled}
        >
          <Cancel />
        </IconButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{ minWidth: 30, fontWeight: 'bold', marginTop: 8 }}>{index + 1}.</span>
      <div style={{ flex: 1, padding: '8px 12px', backgroundColor: '#f5f5f5', borderRadius: 4, minHeight: 40, display: 'flex', alignItems: 'center' }}>
        {instruction}
      </div>
      <IconButton
        size="small"
        color="primary"
        onClick={() => setIsEditing(true)}
        disabled={disabled}
      >
        <Edit />
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={onRemove}
        disabled={disabled}
      >
        <Remove />
      </IconButton>
    </div>
  );
};

const AddRecipeSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').min(3).max(255),
  description: Yup.string()
    .required('Description is required')
    .test(
      'min-words',
      'Description must be at least 50 words',
      (value) => (value ? value.trim().split(/\s+/).filter(Boolean).length >= 50 : false)
    ),
  prep_time: Yup.number().required('Prep time is required').min(1),
  cook_time: Yup.number().required('Cook time is required').min(1),
  serving_size: Yup.number().required('Serving size is required').min(1),
  category_id: Yup.number().required('Category is required'),
  sub_category_id: Yup.mixed().nullable().transform((value) => {
    if (value === '' || value === 'null' || value === null || value === undefined || value === 0) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }),
  ingredients_id: Yup.array().min(1, 'At least one ingredient').required('Ingredients are required'),
  recipe_instructions: Yup.array().min(1, 'At least one instruction').required(),
  video_url: Yup.string()
    .url('Enter a valid URL')
    .test(
      'is-valid-youtube',
      'YouTube video not found or invalid URL',
      async function (value) {
        if (!value) return true;
        const valid = await isValidYouTubeVideo(value);
        return valid;
      }
    ),
  image_url: Yup.string().url().nullable(),
});

const RecipeDialog = ({
  open,
  onClose,
  form,
  onSubmit,
  isLoading,
  mode = 'add',
}) => {
  const [newInstruction, setNewInstruction] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ingredientDetails, setIngredientDetails] = useState(() => {
    const ids = form.ingredients_id || [];
    const units = form.ingredient_unit || [];
    const quantities = form.ingredient_quantity || [];
    return ids.map((id, idx) => ({
      id,
      unit: units[idx] || '',
      quantity: quantities[idx] || '',
    }));
  });

  const fileInputRef = useRef();

  const { data: categoriesData } = useGetRecipeCategoriesQuery({ page: 1, limit: 100 });
  const { data: subCategoriesData } = useGetAllRecipeSubCategorieDetailsQuery({ page: 1, limit: 100 });
  const { data: ingredientsData } = useGetAllIngredientsQuery({ page: 1, limit: 100 });

  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];
  const ingredients = ingredientsData?.data || [];

  const formikContext = useFormikContext?.();
  useEffect(() => {
    if (formikContext) {
      formikContext.setFieldValue('ingredient_unit', ingredientDetails.map(d => d.unit));
      formikContext.setFieldValue('ingredient_quantity', ingredientDetails.map(d => d.quantity));
    }
  }, [ingredientDetails]);

  useEffect(() => {
    const ids = form.ingredients_id || [];
    const units = form.ingredient_unit || [];
    const quantities = form.ingredient_quantity || [];
    setIngredientDetails(
      ids.map((id, idx) => {
        const existing = ingredientDetails.find((i) => i.id === id);
        return existing || { id, unit: units[idx] || '', quantity: quantities[idx] || '' };
      })
    );
  }, [form.ingredients_id, form.ingredient_unit, form.ingredient_quantity]);

  useEffect(() => {
    if (mode === 'edit' && form.image_url && !imageFile) {
      setImagePreview(form.image_url);
    }
    if (mode === 'add' && !imageFile) {
      setImagePreview(null);
    }
  }, [mode, form.image_url, imageFile]);

  const updateIngredientDetail = (id, field, value, setFieldValue) => {
    setIngredientDetails((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, [field]: value } : i));
      if (setFieldValue) {
        setFieldValue('ingredient_unit', updated.map(d => d.unit));
        setFieldValue('ingredient_quantity', updated.map(d => d.quantity));
      }
      return updated;
    });
  };

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
    >
      <DialogTitle>{mode === 'edit' ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
      <Formik
        initialValues={{
          ...form,
          sub_category_id: form.sub_category_id || null,
          ingredients_id: form.ingredients_id || [],
          ingredient_unit: form.ingredient_unit || [],
          ingredient_quantity: form.ingredient_quantity || [],
        }}
        validationSchema={AddRecipeSchema}
        enableReinitialize
        validate={(values) => {
          const errors = {};
          const invalidIngredients = ingredientDetails.filter(
            (detail) => !detail.quantity || !detail.unit
          );
          if (invalidIngredients.length > 0) {
            errors.ingredients_id = 'All ingredients must have a unit and quantity';
          }
          
          if (values.category_id) {
            const categorySubCategories = subCategories.filter(
              (sc) => sc.category_id === Number(values.category_id)
            );
            const subCategoriesExist = categorySubCategories.length > 0;
            
            if (subCategoriesExist && !values.sub_category_id) {
              errors.sub_category_id = 'Sub Category is required for this category';
            }
            
            if (!subCategoriesExist && values.sub_category_id) {
              errors.sub_category_id = 'No sub-categories exist for this category';
            }
          }
          
          return errors;
        }}
        onSubmit={(values, actions) => {
          const ingredients_id = ingredientDetails.map((detail) => detail.id);
          const ingredient_unit = ingredientDetails.map((detail) => detail.unit);
          const ingredient_quantity = ingredientDetails.map((detail) => detail.quantity);
          
          onSubmit(
            {
              ...values,
              ingredients_id,
              ingredient_unit,
              ingredient_quantity,
            },
            actions,
            imageFile
          );
        }}
      >
        {({ values, handleChange, handleBlur, setFieldValue, setFieldTouched, errors, touched, isValid, dirty }) => (
          <Form>
            <DialogContent dividers className="custom-scrollbar">
              <TextField
                label="Title"
                name="title"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
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
                minRows={5}
                error={touched.description && Boolean(errors.description)}
                helperText={
                  (touched.description && errors.description ? errors.description + ' — ' : '') +
                  `${values.description.trim().split(/\s+/).filter(Boolean).length} words`
                }
                sx={{
                  '& .MuiInputBase-root': {
                    padding: 0,
                  },
                  '& .MuiInputBase-input': {
                    height: '120px !important',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    resize: 'vertical',
                    width: '100%',
                    boxSizing: 'border-box',
                  },
                }}
                InputProps={{
                  onWheel: (e) => {
                    e.stopPropagation();
                  }
                }}
              />
              <TextField
                label="Prep Time (minutes)"
                name="prep_time"
                type="number"
                value={values.prep_time}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={touched.prep_time && Boolean(errors.prep_time)}
                helperText={touched.prep_time && errors.prep_time}
              />
              <TextField
                label="Cook Time (minutes)"
                name="cook_time"
                type="number"
                value={values.cook_time}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={touched.cook_time && Boolean(errors.cook_time)}
                helperText={touched.cook_time && errors.cook_time}
              />
              <TextField
                label="Serving Size"
                name="serving_size"
                type="number"
                value={values.serving_size}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={touched.serving_size && Boolean(errors.serving_size)}
                helperText={touched.serving_size && errors.serving_size}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => setFieldValue('serving_size', Math.max(1, Number(values.serving_size) - 1))}
                        disabled={isLoading || Number(values.serving_size) <= 1}
                        aria-label="decrease serving size"
                      >
                        <Remove />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setFieldValue('serving_size', Number(values.serving_size) + 1)}
                        disabled={isLoading}
                        aria-label="increase serving size"
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  ),
                  inputProps: {
                    style: { textAlign: 'center' },
                  },
                }}
              />
              <TextField
                select
                label="Category"
                name="category_id"
                value={values.category_id || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={touched.category_id && Boolean(errors.category_id)}
                helperText={touched.category_id && errors.category_id}
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              {(() => {
                const categorySubCategories = subCategories.filter(
                  (sc) => sc.category_id === Number(values.category_id)
                );
                const subCategoriesExist = categorySubCategories.length > 0;
                
                return subCategoriesExist ? (
                  <TextField
                    select
                    label="Sub Category"
                    name="sub_category_id"
                    value={values.sub_category_id || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    margin="normal"
                    required
                    error={touched.sub_category_id && Boolean(errors.sub_category_id)}
                    helperText={touched.sub_category_id && errors.sub_category_id}
                  >
                    <MenuItem value="">Select Sub Category</MenuItem>
                    {categorySubCategories.map((sc) => (
                      <MenuItem key={sc.sub_category_id} value={sc.sub_category_id}>
                        {sc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : values.category_id ? (
                  <div style={{ marginTop: 16, marginBottom: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4, color: '#666' }}>
                    No sub-categories exist for this category. Sub-category selection is not required.
                  </div>
                ) : null;
              })()}
              <Autocomplete
                multiple
                freeSolo
                filterSelectedOptions
                options={
                  ingredients
                    .filter(
                      (ing) =>
                        !ingredientDetails.some(detail => detail.id === ing.ingredient_id)
                    )
                    .map((ing) => ({ label: ing.name, id: ing.ingredient_id }))
                }
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option.label
                }
                value={ingredientDetails.map(detail => {
                  const found = ingredients.find((ing) => ing.ingredient_id === detail.id);
                  return found
                    ? { label: found.name, id: found.ingredient_id }
                    : { label: detail.id, id: detail.id };
                })}
                onChange={(event, newValue) => {
                  const filtered = newValue.filter(val => val && (val.id || val.label));
                  setIngredientDetails(
                    filtered.map((val) => {
                      const existing = ingredientDetails.find(i => i.id === (val.id || val.label));
                      return existing || { id: val.id || val.label, unit: '', quantity: '' };
                    })
                  );
                  setFieldValue(
                    'ingredients_id',
                    filtered.map((val) => val.id || val.label)
                  );
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'reset' && !newInputValue) {
                    event?.preventDefault?.();
                  }
                }}
                onBlur={() => {
                  setFieldTouched('ingredients_id', true);
                }}
                renderTags={() => null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ingredients"
                    margin="normal"
                    fullWidth
                    required
                    error={touched.ingredients_id && Boolean(errors.ingredients_id)}
                    helperText={touched.ingredients_id && errors.ingredients_id}
                    inputProps={{
                      ...params.inputProps,
                      required: false,
                    }}
                  />
                )}
              />
              {touched.ingredients_id && errors.ingredients_id && (
                <div style={{ color: 'red', fontSize: 12, marginTop: 8 }}>
                  {errors.ingredients_id}
                </div>
              )}
              <div style={{ marginBottom: 20 }} />
              {ingredientDetails.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {ingredientDetails.map((detail, idx) => {
                    const ingredient = ingredients.find(i => i.ingredient_id === detail.id);
                    return (
                      <div key={detail.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ minWidth: 120 }}>{ingredient ? ingredient.name : detail.id}</span>
                        <TextField
                          label="Quantity"
                          value={detail.quantity}
                          onChange={e => updateIngredientDetail(detail.id, 'quantity', e.target.value, setFieldValue)}
                          size="small"
                          style={{ minWidth: 70 }}
                          inputProps={{ min: 0, step: "any" }}
                        />
                        <TextField
                          select
                          label="Unit"
                          value={detail.unit}
                          onChange={e => updateIngredientDetail(detail.id, 'unit', e.target.value, setFieldValue)}
                          size="small"
                          style={{ minWidth: 90 }}
                        >
                          <MenuItem value="">Unit</MenuItem>
                          {helper.ingredientUnits.map(unit => (
                            <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                          ))}
                        </TextField>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const newDetails = ingredientDetails.filter((_, i) => i !== idx);
                            setIngredientDetails(newDetails);
                            setFieldValue(
                              'ingredients_id',
                              newDetails.map(d => d.id)
                            );
                          }}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <TextField
                  label="Add Instruction"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newInstruction.trim()) {
                      e.preventDefault();
                      setFieldValue('recipe_instructions', [
                        ...values.recipe_instructions,
                        newInstruction.trim(),
                      ]);
                      setNewInstruction('');
                    }
                  }}
                  fullWidth
                  margin="normal"
                  disabled={isLoading}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  style={{ marginTop: 8, marginBottom: 8 }}
                  disabled={!newInstruction.trim() || isLoading}
                  onClick={() => {
                    if (newInstruction.trim()) {
                      setFieldValue('recipe_instructions', [
                        ...values.recipe_instructions,
                        newInstruction.trim(),
                      ]);
                      setNewInstruction('');
                    }
                  }}
                >
                  Add Instruction
                </Button>
                {values.recipe_instructions.length > 0 && (
                  <div style={{ fontWeight: 'bold', marginBottom: 4, marginTop: 8 }}>
                    Instructions List
                  </div>
                )}
                <div>
                  {values.recipe_instructions.map((inst, idx) => (
                    <InstructionItem
                      key={idx}
                      instruction={inst}
                      index={idx}
                      onUpdate={(newValue) => {
                        const updatedInstructions = [...values.recipe_instructions];
                        updatedInstructions[idx] = newValue;
                        setFieldValue('recipe_instructions', updatedInstructions);
                      }}
                      onRemove={() => {
                        setFieldValue(
                          'recipe_instructions',
                          values.recipe_instructions.filter((_, i) => i !== idx)
                        );
                      }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {touched.recipe_instructions && errors.recipe_instructions && (
                  <div style={{ color: 'red', fontSize: 12 }}>{errors.recipe_instructions}</div>
                )}
              </div>
              <TextField
                label="YouTube Video URL"
                name="video_url"
                value={values.video_url || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                error={touched.video_url && Boolean(errors.video_url)}
                helperText={touched.video_url && errors.video_url}
              />
              {values.video_url && !errors.video_url && getYouTubeThumbnail(values.video_url) && (
                <div style={{ margin: '8px 0' }}>
                  <img
                    src={getYouTubeThumbnail(values.video_url)}
                    alt="YouTube Thumbnail"
                    style={{ width: 240, borderRadius: 8, border: '1px solid #ccc' }}
                  />
                </div>
              )}
              <div
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                    setFieldValue('image_url', '');
                  }
                }}
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: 8,
                  padding: 16,
                  textAlign: 'center',
                  background: '#fafafa',
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
                  {imageFile ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    setImageFile(file);
                    setImagePreview(file ? URL.createObjectURL(file) : null);
                    setFieldValue('image_url', '');
                  }}
                />
                <div style={{ marginTop: 8, color: '#888', fontSize: 14 }}>
                  or drag and drop image here
                </div>
                {imagePreview && (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ display: 'block', margin: '0 auto', width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      style={{ marginTop: 8 }}
                      onClick={e => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        setFieldValue('image_url', '');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                {touched.image_url && errors.image_url && (
                  <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>
                    {errors.image_url}
                  </div>
                )}
              </div>
           </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !isValid || !dirty}
              >
                {isLoading ? <CircularProgress size={24} /> : (mode === 'edit' ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RecipeDialog;