import * as yup from 'yup';

export const recipeSubCategoryValidationSchema = yup.object().shape({
    categoryId: yup
        .number()
        .required('Category ID is required'),
    name: yup
        .string()
        .required('Sub-category name is required')
        .min(2, 'Sub-category name must be at least 2 characters')
        .max(100, 'Sub-category name must be at most 100 characters'),
    description: yup
        .string()
        .required('Sub-category Description is required')
        .min(10, 'Sub-category description must be at least 10 characters')
});

export const requireSubCategoryId = yup.object().shape({
    subCategoryId: yup
        .number()
        .required('Sub-category ID is required')
});
