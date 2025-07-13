import React, { useEffect, useState } from 'react';
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
  Chip,
} from '@mui/material';
import { useGetRecipeCategoriesQuery } from '../../../features/api/categoryApi';
import { useGetAllRecipeSubCategorieDetailsQuery } from '../../../features/api/subCategoryApi';
import { useGetMostUsedKeywordsQuery } from '../../../features/api/recipeApi';
import * as Yup from 'yup';
import { Add, Remove, Edit, Save, Cancel } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import { isValidYouTubeVideo, getYouTubeThumbnail, getYouTubeVideoTitle } from '../../../utils/helper';
import FileUploadField from '../../../components/FileUploadField';
import IngredientInput from '../../../components/IngredientInput';

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
      <div className="flex items-center gap-2 mb-2">
        <span className="min-w-[30px] font-bold">{index + 1}.</span>
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
    <div className="flex items-start gap-2 mb-2">
      <span className="min-w-[30px] font-bold mt-2">{index + 1}.</span>
      <div className="flex-1 p-2 bg-gray-100 rounded min-h-[40px] flex items-center">
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
  recipe_instructions: Yup.array().min(1, 'At least one instruction').required(),
  keywords: Yup.array().of(Yup.string().trim().min(1, 'Keyword cannot be empty')).nullable(),
  ingredients: Yup.array().of(
    Yup.lazy((val) =>
      val && val.isFreeText
        ? Yup.object().shape({
            isFreeText: Yup.boolean().oneOf([true]),
            freeText: Yup.string().required('Ingredient text is required'),
          })
        : Yup.object().shape({
            ingredient_id: Yup.number().required(),
            ingredient_name: Yup.string().required(),
            quantity: Yup.number().required().min(0.1),
            unit: Yup.string().required(),
          })
    )
  ),
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
  const [newKeyword, setNewKeyword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(form.video_url || '');

  const { data: categoriesData } = useGetRecipeCategoriesQuery({ page: 1, limit: 100 });
  const { data: subCategoriesData } = useGetAllRecipeSubCategorieDetailsQuery({ page: 1, limit: 100 });
  const { data: mostUsedKeywords } = useGetMostUsedKeywordsQuery({ page: 1, limit: 100 });

  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];
  const keywords = mostUsedKeywords?.data || [];

  const isYouTubeThumbnail = (url) => {
    if (!url) return false;
    return url.startsWith('https://img.youtube.com/vi/');
  };

  useEffect(() => {
    if (open) {
      setImageFile(null);
      setImageRemoved(false);
      setImagePreview(null);
      if (mode === 'edit' && form.image_url && !isYouTubeThumbnail(form.image_url)) {
        setImagePreview(form.image_url);
      }
    }
  }, [open, mode, form.image_url]);

  useEffect(() => {
    if (mode === 'edit' && form.image_url && !imageFile && !imageRemoved && !isYouTubeThumbnail(form.image_url)) {
      setImagePreview(form.image_url);
    }
    if (mode === 'add' && !imageFile) {
      setImagePreview(null);
    }
  }, [mode, form.image_url, imageFile, imageRemoved]);

  useEffect(() => {
    let ignore = false;
    const url = videoUrl;
    if (!url) {
      setVideoThumbnail(null);
      setVideoTitle(null);
      setVideoError(null);
      setVideoLoading(false);
      return;
    }
    setVideoLoading(true);
    setVideoError(null);
    setVideoThumbnail(null);
    setVideoTitle(null);
    (async () => {
      const valid = await isValidYouTubeVideo(url);
      if (ignore) return;
      if (!valid) {
        setVideoError('Invalid or non-existent YouTube video.');
        setVideoThumbnail(null);
        setVideoTitle(null);
        setVideoLoading(false);
        return;
      }
      const thumb = getYouTubeThumbnail(url);
      const title = await getYouTubeVideoTitle(url);
      if (ignore) return;
      setVideoThumbnail(thumb);
      setVideoTitle(title);
      setVideoError(null);
      setVideoLoading(false);
    })();
    return () => { ignore = true; };
  }, [videoUrl]);

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
          ingredients: form.ingredients || [],
        }}
        validationSchema={AddRecipeSchema}
        enableReinitialize
        validate={(values) => {
          const errors = {};
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
          let finalImageFile = imageFile;
          let finalImageUrl = values.image_url;

          if (mode === 'edit' && imageRemoved) {
            finalImageUrl = '';
            finalImageFile = null;
          }
          else if (imageFile) {
            // Empty block
          }
          else if (imagePreview) {
            finalImageUrl = imagePreview;
            finalImageFile = null;
          }
          else if (videoThumbnail) {
            finalImageUrl = videoThumbnail;
            finalImageFile = null;
          }

          onSubmit(
            {
              ...values,
              image_url: finalImageUrl,
            },
            actions,
            finalImageFile
          );
        }}
      >
        {({ values, handleChange, handleBlur, setFieldValue, errors, touched, isValid, dirty }) => (
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
              <div className="mb-4">
                <TextField
                  label="Add Keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyword.trim()) {
                      e.preventDefault();
                      setFieldValue('keywords', [
                        ...(values.keywords || []),
                        newKeyword.trim(),
                      ]);
                      setNewKeyword('');
                    }
                  }}
                  fullWidth
                  margin="normal"
                  disabled={isLoading}
                  placeholder="Type a keyword and press Enter"
                />
                <Button
                  variant="outlined"
                  color="primary"
                  className="mt-2 mb-2"
                  disabled={!newKeyword.trim() || isLoading}
                  onClick={() => {
                    if (newKeyword.trim()) {
                      setFieldValue('keywords', [
                        ...(values.keywords || []),
                        newKeyword.trim(),
                      ]);
                      setNewKeyword('');
                    }
                  }}
                >
                  Add Keyword
                </Button>
                
                {keywords.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Popular Keywords:</h5>
                    <div className="flex flex-wrap gap-1">
                      {keywords.slice(0, 10).map((keywordData, index) => (
                        <Chip
                          key={index}
                          label={`${keywordData.keyword} (${keywordData.usage_count})`}
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            if (!values.keywords?.includes(keywordData.keyword)) {
                              setFieldValue('keywords', [
                                ...(values.keywords || []),
                                keywordData.keyword,
                              ]);
                            }
                          }}
                          className="cursor-pointer hover:bg-blue-50"
                          disabled={values.keywords?.includes(keywordData.keyword)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {(values.keywords || []).length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(values.keywords || []).map((keyword, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newKeywords = values.keywords.filter((_, i) => i !== index);
                            setFieldValue('keywords', newKeywords);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <div className="mt-4 mb-2 p-3 bg-gray-100 rounded text-gray-600">
                    No sub-categories exist for this category. Sub-category selection is not required.
                  </div>
                ) : null;
              })()}
              <div className="mb-4">
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
                  className="mt-2 mb-2"
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
              </div>
              {values.recipe_instructions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  {values.recipe_instructions.map((instruction, index) => (
                    <InstructionItem
                      key={index}
                      instruction={instruction}
                      index={index}
                      onUpdate={(updatedInstruction) => {
                        const newInstructions = [...values.recipe_instructions];
                        newInstructions[index] = updatedInstruction;
                        setFieldValue('recipe_instructions', newInstructions);
                      }}
                      onRemove={() => {
                        const newInstructions = values.recipe_instructions.filter((_, i) => i !== index);
                        setFieldValue('recipe_instructions', newInstructions);
                      }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              )}
              

              <IngredientInput
                value={values.ingredients || []}
                onChange={(ingredients) => setFieldValue('ingredients', ingredients)}
                disabled={isLoading}
                dialogOpen={open}
              />
              <TextField
                label={(!videoTitle && !videoThumbnail) ? "Video URL (YouTube)" : ""}
                name="video_url"
                value={values.video_url}
                onChange={e => {
                  handleChange(e);
                  setVideoUrl(e.target.value);
                }}
                onBlur={handleBlur}
                fullWidth
                margin="normal"
                required
                error={
                  (!videoTitle && !videoThumbnail) && touched.video_url && Boolean(errors.video_url)
                }
                helperText={
                  (!videoTitle && !videoThumbnail && touched.video_url && errors.video_url)
                    ? errors.video_url + ' — Enter a valid YouTube video URL'
                    : ''
                }
                InputLabelProps={{
                  shrink: !!values.video_url && (!videoTitle && !videoThumbnail)
                }}
              />
              {values.video_url && (
                <div className="mb-4 flex flex-col items-start gap-2">
                  {videoLoading && <span className="text-gray-500">Checking video...</span>}
                  {videoError && <span className="text-red-500">{videoError}</span>}
                  {videoThumbnail && (
                    <img
                      src={videoThumbnail}
                      alt="YouTube video thumbnail"
                      className="rounded border w-48 h-28 object-cover"
                    />
                  )}
                  {videoTitle && (
                    <span className="font-medium text-gray-700">{videoTitle}</span>
                  )}
                </div>
              )}
              <FileUploadField
                label="Upload Image"
                value={imageFile}
                onChange={file => {
                  setImageFile(file);
                  setImageRemoved(false);
                  setImagePreview(null);
                  setFieldValue('image_url', '');
                }}
                preview={imagePreview}
                setPreview={setImagePreview}
                accept="image/*"
                style={{ marginBottom: 16 }}
                error={Boolean(errors.image_url)}
                helperText={touched.image_url && errors.image_url}
                showRemoveButton={mode === 'edit' && !imageRemoved}
                onRemove={() => setImageRemoved(true)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  !isValid ||
                  !dirty ||
                  isLoading ||
                  !values.title ||
                  !values.description ||
                  values.description.trim().split(/\s+/).filter(Boolean).length < 50 ||
                  !values.prep_time ||
                  !values.cook_time ||
                  !values.serving_size ||
                  !values.category_id ||
                  (subCategories.filter(sc => sc.category_id === Number(values.category_id)).length > 0 && !values.sub_category_id) ||
                  values.recipe_instructions.length === 0 ||
                  !values.video_url ||
                  !values.ingredients ||
                  values.ingredients.filter(
                    ing => (ing.isFreeText && ing.freeText?.trim()) ||
                           (!ing.isFreeText && ing.ingredient_id && ing.ingredient_name && ing.quantity && ing.unit)
                  ).length === 0
                }
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Recipe' : 'Add Recipe'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RecipeDialog;