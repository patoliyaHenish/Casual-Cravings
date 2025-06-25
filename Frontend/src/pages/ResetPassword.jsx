import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, CircularProgress, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'sonner';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import { useResetPasswordMutation } from '../features/api/authApi';

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm your new password'),
});

const ResetPassword = () => {
  const { email, token } = useParams();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleReset = async (values, { setSubmitting }) => {
    try {
      const res = await resetPassword({ email, token, newPassword: values.newPassword }).unwrap();
      toast.success(res.message || 'Password reset successful!');
      navigate('/auth');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reset password');
    }
    setSubmitting(false);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center px-2 sm:px-4">
      <Paper elevation={6} className="w-full max-w-md p-8" style={{ borderRadius: 18 }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <Formik
          initialValues={{ newPassword: '', confirmPassword: '' }}
          validationSchema={resetPasswordSchema}
          onSubmit={handleReset}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <TextField
                label="New Password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword((show) => !show)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((show) => !show)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading || isSubmitting}
                sx={{ height: 56, fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {isLoading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default ResetPassword;