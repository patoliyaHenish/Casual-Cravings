import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    name: yup.string().required('Name is required').max(255),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special character'),
});

export const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(6),
});

export const changePasswordSchema = yup.object().shape({
    currentPassword: yup
        .string()
        .required('Current password is required')
        .min(6, 'Current password must be at least 6 characters'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(6, 'New password must be at least 6 characters')
        .matches(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'New password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'New password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'New password must contain at least one special character'),
});

export const emailValidationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required('New password is required')
        .min(6, 'New password must be at least 6 characters')
        .matches(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'New password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'New password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'New password must contain at least one special character'),
});

export const updateProfileSchema = yup.object().shape({
    name: yup.string().max(255, 'Name must be at most 255 characters'),
    email: yup.string().email('Invalid email').max(255, 'Email must be at most 255 characters'),
    bio: yup.string().max(500, 'Bio must be at most 500 characters'),
    profilePic: yup.mixed().nullable(),
});