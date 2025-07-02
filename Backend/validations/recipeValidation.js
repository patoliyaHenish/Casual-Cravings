import * as yup from 'yup';

export const createRecipeValidation = yup.object().shape({
    user_id: yup.number(),
    category_id: yup.number().required('Category ID is required'),
    sub_category_id: yup.number().required('Sub-category ID is required'),
    title: yup.string().required('Title is required').min(3).max(255),
    description: yup.string().required('Description is required').min(10),
    video_url: yup.string().url().nullable(),
    image_url: yup.string().url().nullable(),
    prep_time: yup.number().required('Prep time is required'),
    cook_time: yup.number().required('Cook time is required'),
    serving_size: yup.number().required('Serving size is required'),
    ingredients_id: yup.array().of(yup.number()).required('Ingredients are required'),
    recipe_instructions: yup.array().of(yup.string()).required('Instructions are required'),
});