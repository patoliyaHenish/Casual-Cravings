import * as yup from 'yup';

export const createBannerValidation = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  button_text: yup.string().required('Button text is required').min(1, 'Button text is required').max(100, 'Button text must be less than 100 characters'),
  keywords: yup.array().of(yup.string().trim().required('Keyword cannot be empty')).min(1, 'At least one keyword is required'),
  is_hero: yup.boolean().optional(),
  imageData: yup.object().optional().nullable()
});

export const updateBannerValidation = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters').max(255, 'Title must be less than 255 characters'),
  button_text: yup.string().required('Button text is required').min(1, 'Button text is required').max(100, 'Button text must be less than 100 characters'),
  keywords: yup.array().of(yup.string().trim().required('Keyword cannot be empty')).min(1, 'At least one keyword is required'),
  is_hero: yup.boolean().optional(),
  imageData: yup.object().optional().nullable()
});
