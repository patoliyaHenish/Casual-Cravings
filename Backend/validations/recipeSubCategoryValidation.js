import * as yup from 'yup';

export const recipeSubCategoryValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('Sub-category name is required')
        .min(2, 'Sub-category name must be at least 2 characters')
        .max(100, 'Sub-category name must be at most 100 characters'),
    description: yup
        .string()
        .nullable()
        .max(500, 'Description must be at most 500 characters')
});