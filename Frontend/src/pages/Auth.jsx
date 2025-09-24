import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Paper, Tabs, Tab, Box, CircularProgress,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRegisterUserMutation, useLoginUserMutation, useForgetPasswordMutation, useMyProfileQuery } from '../features/api/authApi';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import VerifyOtp from '../components/VerifyOtp';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import CropImage from '../components/CropImage';
import { convertImageFileToBase64 } from '../utils/helper';

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
    } catch {
      toast.error("Failed to initiate Google login");
    }
};

  const handleRegister = async (values, { setSubmitting, resetForm }) => {
    try {
      const registerData = {
        name: values.name,
        email: values.email,
        password: values.password
      };

      if (values.profilePic) {
        const imageData = await convertImageFileToBase64(values.profilePic);
        if (imageData) {
          registerData.profilePicData = {
            filename: imageData.filename,
            mime_type: imageData.mime_type,
            image_data: imageData.image_data
          };
        }
      }

      const res = await registerUser(registerData).unwrap();
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

  const [registerRawImage, setRegisterRawImage] = useState(null);
  const [registerShowCropDialog, setRegisterShowCropDialog] = useState(false);
  const [registerPreview, setRegisterPreview] = useState('');
  const [registerProfilePic, setRegisterProfilePic] = useState(null);

  const handleRegisterFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setRegisterRawImage(URL.createObjectURL(file));
      setRegisterProfilePic(file);
      setRegisterShowCropDialog(true);
      setFieldValue('profilePic', file);
    }
  };

  const getCroppedImg = async (imageSrc, crop) => {
    return new Promise((resolve) => {
      const image = new window.Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      };
    });
  };

  const handleRegisterCropComplete = async (croppedAreaPixels) => {
    if (registerRawImage && croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(registerRawImage, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setRegisterPreview(croppedUrl);
      const croppedFile = new File([croppedBlob], registerProfilePic?.name || 'profile.jpg', { type: 'image/jpeg' });
      setRegisterProfilePic(croppedFile);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
      <Paper
        elevation={6}
        className="w-full max-w-[95vw] sm:max-w-md md:max-w-lg p-4 sm:p-8 md:p-10 rounded-[18px]"
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
              onSubmit={async (values, actions) => {
                if (registerProfilePic) {
                  values.profilePic = registerProfilePic;
                }
                await handleRegister(values, actions);
              }}
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
                      onChange={event => handleRegisterFileChange(event, setFieldValue)}
                      className="block w-full text-sm text-[#3B2200] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F97C1B] file:text-[#FFF8ED] hover:file:bg-[#FFB15E] transition"
                    />
                    {touched.profilePic && errors.profilePic && (
                      <div className="text-red-500 text-xs mt-1">{errors.profilePic}</div>
                    )}
                  </div>
                  {registerPreview && (
                    <div className="flex flex-col items-center mt-2">
                      <img src={registerPreview} alt="Preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E06B00' }} />
                    </div>
                  )}
                  <CropImage
                    open={registerShowCropDialog}
                    imageSrc={registerRawImage}
                    onClose={() => setRegisterShowCropDialog(false)}
                    onCropComplete={async (croppedAreaPixels) => {
                      await handleRegisterCropComplete(croppedAreaPixels);
                      setRegisterShowCropDialog(false);
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
        {!showOtp && (
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
        )}
      </Paper>
    </div>
  );
};

export default Auth;