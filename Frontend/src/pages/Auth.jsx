import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Paper, Tabs, Tab, Box, CircularProgress,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRegisterUserMutation, useLoginUserMutation, useForgetPasswordMutation, useMyProfileQuery } from '../features/api/authApi';
import { toast } from 'sonner';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import VerifyOtp from '../components/VerifyOtp';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const registerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').max(255),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character'),
  profilePic: Yup.mixed()
    .nullable()
    .notRequired()
    .test('fileSize', 'Image too large', value => !value || (value && value.size <= 5 * 1024 * 1024))
    .test('fileType', 'Unsupported file format', value => !value || (value && ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(value.type))),
});

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6),
});

const Auth = () => {
  const [tab, setTab] = useState(1);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [shouldFetchProfile, setShouldFetchProfile] = useState(false);

  const [registerUser, { isLoading: regLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginLoading }] = useLoginUserMutation();
  const [forgetPassword, { isLoading: forgetLoading }] = useForgetPasswordMutation();

  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const [forgetPasswordOpen, setForgetPasswordOpen] = useState(false);
  const [forgetEmail, setForgetEmail] = useState('');
  const [forgetEmailError, setForgetEmailError] = useState('');

  const { setUser } = useUser();
  const { data: profileData, isSuccess: profileSuccess, refetch } = useMyProfileQuery(undefined, { skip: !shouldFetchProfile });

  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleGoogleLogin = () => {
    try {
      window.location.href = `${import.meta.env.VITE_APP_API_URL}/api/auth/google`;
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to initiate Google login");
    }
};

  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('password', values.password);
      if (values.profilePic) {
        formData.append('profilePic', values.profilePic);
      }
      const res = await registerUser(formData).unwrap();
      if (res.user) {
        setUser(res.user);
      }
      toast.success(res.message || "Registration successful! Check your email for OTP.");
      setOtpEmail(values.email);
      setShowOtp(true);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    }
    setSubmitting(false);
  };

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const res = await loginUser(values).unwrap();
      setShouldFetchProfile(true);
      toast.success(res.message || "Login successful!");
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (profileSuccess && profileData?.user) {
      setUser(profileData.user);
      setShouldFetchProfile(false); 
    }
  }, [profileSuccess, profileData, setUser]);

  const handleForgetPassword = async () => {
    setForgetEmailError('');
    if (!forgetEmail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(forgetEmail)) {
      setForgetEmailError('Please enter a valid email');
      return;
    }
    try {
      await forgetPassword({ email: forgetEmail }).unwrap();
      toast.success('Password reset link sent to your email.');
      setForgetPasswordOpen(false);
      setForgetEmail('');
    } catch (err) {
      setForgetEmailError(err?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
      <Paper
        elevation={6}
        className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg p-4 sm:p-8 md:p-10"
        style={{ borderRadius: 18 }}
      >
        {!showOtp && (
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            TabIndicatorProps={{ style: { backgroundColor: '#F97C1B', height: 4 } }}
            sx={{
              backgroundColor: '#FFF8ED',
              borderRadius: 2,
              mb: 2,
              '& .MuiTab-root': {
                color: '#3B2200',
                fontWeight: 'bold',
              },
              '& .Mui-selected': {
                color: '#F97C1B !important',
              },
            }}
          >
            <Tab label="Sign Up" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, fontWeight: 'bold' }} />
            <Tab label="Login" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }, fontWeight: 'bold' }} />
          </Tabs>
        )}
        <Box hidden={tab !== 0}>
          {showOtp ? (
            <VerifyOtp
              email={otpEmail}
              onSuccess={async () => {
                setShowOtp(false);
                toast.success("Account verified! You can now log in.");
                setTab(1);
                const profile = await refetch();
                if (profile.data?.user) {
                  setUser(profile.data.user);
                }
                navigate('/');
              }}
            />
          ) : (
            <Formik
              initialValues={{ name: '', email: '', password: '', profilePic: null }}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                <Form className="flex flex-col gap-4 mt-6">
                  <TextField
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    required
                    fullWidth
                    variant="outlined"
                    size="medium"
                    InputProps={{ className: 'bg-white' }}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    required
                    fullWidth
                    variant="outlined"
                    size="medium"
                    InputProps={{ className: 'bg-white' }}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type={showRegisterPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    required
                    fullWidth
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      className: 'bg-white',
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowRegisterPassword((show) => !show)}
                            edge="end"
                          >
                            {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <div>
                    <label className="block mb-1 font-semibold text-[#3B2200]">Profile Picture (optional)</label>
                    <input
                      id="profilePic"
                      name="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={event => setFieldValue('profilePic', event.currentTarget.files[0])}
                      className="block w-full text-sm text-[#3B2200] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F97C1B] file:text-[#FFF8ED] hover:file:bg-[#FFB15E] transition"
                    />
                    {touched.profilePic && errors.profilePic && (
                      <div className="text-red-500 text-xs mt-1">{errors.profilePic}</div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#F97C1B',
                      color: '#FFF8ED',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#FFB15E', color: '#3B2200' },
                      height: 56,
                      fontSize: '1.1rem',
                    }}
                    disabled={regLoading || isSubmitting}
                    className="mt-4"
                  >
                    {regLoading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Box>
        <Box hidden={tab !== 1 || showOtp} className="mt-6">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  required
                  fullWidth
                  variant="outlined"
                  size="medium"
                  InputProps={{ className: 'bg-white' }}
                />
                <TextField
                  label="Password"
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  required
                  fullWidth
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    className: 'bg-white',
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowLoginPassword((show) => !show)}
                          edge="end"
                        >
                          {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#F97C1B',
                    color: '#FFF8ED',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#FFB15E', color: '#3B2200' },
                    height: 56,
                    fontSize: '1.1rem',
                  }}
                  disabled={loginLoading || isSubmitting}
                  className="mt-2"
                >
                  {loginLoading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setForgetPasswordOpen(true)}
                  sx={{ mt: 1, color: '#F97C1B', textTransform: 'none', fontWeight: 'bold' }}
                >
                  Forgot Password?
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
        <Dialog open={forgetPasswordOpen} onClose={() => setForgetPasswordOpen(false)}>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Enter your email"
              type="email"
              fullWidth
              value={forgetEmail}
              onChange={e => setForgetEmail(e.target.value)}
              error={!!forgetEmailError}
              helperText={forgetEmailError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setForgetPasswordOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleForgetPassword}
              color="primary"
              disabled={forgetLoading}
              variant="contained"
            >
              {forgetLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
            </Button>
          </DialogActions>
        </Dialog>
        <Box className="flex flex-col gap-2 mb-4 mt-4">
          <Button
            variant="outlined"
            fullWidth
            sx={{ borderColor: '#4285F4', color: '#4285F4', fontWeight: 'bold' }}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default Auth;