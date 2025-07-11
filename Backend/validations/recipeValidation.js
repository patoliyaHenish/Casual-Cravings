import * as yup from 'yup';

export const createRecipeValidation = yup.object().shape({
  category_id: yup.number().required('Category ID is required'),
  sub_category_id: yup.mixed().nullable().transform((value) => {
    if (value === '' || value === 'null' || value === null || value === undefined || value === 0) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }),
  title: yup.string().required('Title is required').min(3).max(255),
  description: yup.string().required('Description is required').min(10),
  video_url: yup.string().url().required('Video URL is required'),
  image_url: yup.string().url().nullable(),
  prep_time: yup.number().required('Prep time is required'),
  cook_time: yup.number().required('Cook time is required'),
  serving_size: yup.number().required('Serving size is required'),
  recipe_instructions: yup
    .array()
    .of(yup.string().trim().min(1, 'Instruction cannot be empty').required())
    .required('Instructions are required')
    .min(1, 'At least one instruction is required'),
});

export const updateRecipeValidation = yup.object().shape({
  category_id: yup.number().notRequired(),
  sub_category_id: yup.mixed().nullable().transform((value) => {
    if (value === '' || value === 'null' || value === null || value === undefined || value === 0) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }),
  title: yup.string().required('Title is required').min(3).max(255),
  description: yup.string().notRequired().min(10),
  video_url: yup.string().url().notRequired(),
  image_url: yup.string().url().nullable(),
  prep_time: yup.number().notRequired(),
  cook_time: yup.number().notRequired(),
  serving_size: yup.number().notRequired(),
  recipe_instructions: yup.array().of(yup.string().trim().min(1)).notRequired(),
});