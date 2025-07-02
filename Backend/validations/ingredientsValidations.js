import * as yup from 'yup';

export const addIngredientValidation = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be at most 500 characters'),
    uses: yup
        .string()
        .required('Uses are required')
        .min(10, 'Uses must be at least 10 characters')
        .max(500, 'Uses must be at most 500 characters'),
    substitutes: yup
        .string()
        .required('Substitutes are required')
        .min(10, 'Substitutes must be at least 10 characters')
        .max(500, 'Substitutes must be at most 500 characters'),
});

export const updateIngredientValidation = yup.object().shape({
    ingredientId: yup
        .number()
        .required('Ingredient ID is required'),
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be at most 500 characters'),
    uses: yup
        .string()
        .required('Uses are required')
        .min(10, 'Uses must be at least 10 characters')
        .max(500, 'Uses must be at most 500 characters'),
    substitutes: yup
        .string()
        .required('Substitutes are required')
        .min(10, 'Substitutes must be at least 10 characters')
        .max(500, 'Substitutes must be at most 500 characters'),
});