import * as yup from 'yup';

export const recipeCategoryValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('Category name is required')
        .min(2, 'Category name must be at least 2 characters')
        .max(100, 'Category name must be at most 100 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be at most 500 characters')
});