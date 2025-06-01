import * as yup from 'yup';

export const registerSchema = yup.object().shape({
    name: yup.string().required('Name is required').max(255),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(6),
});