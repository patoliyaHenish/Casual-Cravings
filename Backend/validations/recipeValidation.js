import * as yup from 'yup';

const parseArray = (value, originalValue) => {
    if (typeof originalValue === 'string') {
        try {
            const parsed = JSON.parse(originalValue);
            return Array.isArray(parsed) ? parsed : value;
        } catch {
            if (/^\[\s*[\d.,\s]+\s*\]$/.test(originalValue)) {
                const arr = originalValue
                    .replace(/^\[|\]$/g, '')
                    .split(/[.,]/)
                    .map(s => Number(s.trim()))
                    .filter(n => !isNaN(n));
                if (arr.length && arr.every(n => typeof n === 'number')) {
                    return arr;
                }
                return undefined;
            }
            return undefined;
        }
    }
    return value;
};

export const createRecipeValidation = yup.object().shape({
    category_id: yup.number().required('Category ID is required'),
    sub_category_id: yup.number().required('Sub-category ID is required'),
    title: yup.string().required('Title is required').min(3).max(255),
    description: yup.string().required('Description is required').min(10),
    video_url: yup.string().url().required('Video URL is required'),
    image_url: yup.string().url().nullable(),
    prep_time: yup.number().required('Prep time is required'),
    cook_time: yup.number().required('Cook time is required'),
    serving_size: yup.number().required('Serving size is required'),
    ingredients_id: yup
        .array()
        .transform(parseArray)
        .of(yup.number())
        .required('Ingredients are required'),
    recipe_instructions: yup
        .array()
        .transform(parseArray)
        .of(yup.string())
        .required('Instructions are required'),
});