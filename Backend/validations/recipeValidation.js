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
  ingredients_id: yup.array()
    .of(yup.number().required('Ingredient ID is required'))
    .min(1, 'At least one ingredient is required')
    .required('Ingredients are required'),
  ingredient_unit: yup.array()
    .of(yup.string().required('Unit is required'))
    .min(1, 'At least one unit is required')
    .required('Ingredient units are required'),
  ingredient_quantity: yup.array()
    .of(yup.string().required('Quantity is required'))
    .min(1, 'At least one quantity is required')
    .required('Ingredient quantities are required'),
  recipe_instructions: yup
    .array()
    .of(yup.string().trim().min(1, 'Instruction cannot be empty').required())
    .required('Instructions are required')
    .min(1, 'At least one instruction is required'),
}).test('ingredients-arrays-length', 'Ingredients, units, and quantities must have the same length', function(value) {
  const { ingredients_id, ingredient_unit, ingredient_quantity } = value;
  
  if (!ingredients_id || !ingredient_unit || !ingredient_quantity) {
    return true;
  }
  
  const lengths = [ingredients_id.length, ingredient_unit.length, ingredient_quantity.length];
  const allSameLength = lengths.every(length => length === lengths[0]);
  
  return allSameLength || this.createError({
    message: 'Ingredients, units, and quantities must have the same length'
  });
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
  ingredients_id: yup.array().of(yup.number()).notRequired(),
  ingredient_unit: yup.array().of(yup.string()).notRequired(),
  ingredient_quantity: yup.array().of(yup.string()).notRequired(),
  recipe_instructions: yup.array().of(yup.string().trim().min(1)).notRequired(),
}).test('ingredients-arrays-length', 'Ingredients, units, and quantities must have the same length', function(value) {
  const { ingredients_id, ingredient_unit, ingredient_quantity } = value;
  if (!ingredients_id || !ingredient_unit || !ingredient_quantity) {
    return true;
  }
  const lengths = [ingredients_id.length, ingredient_unit.length, ingredient_quantity.length];
  const allSameLength = lengths.every(length => length === lengths[0]);
  return allSameLength || this.createError({
    message: 'Ingredients, units, and quantities must have the same length'
  });
});