import React, { useState } from 'react';
import { useMyProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '../../features/api/authApi';
import { Card, CardContent, Typography, Avatar, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton } from '@mui/material';
import { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as Yup from 'yup';

const MyProfile = () => {
  const { data, isLoading } = useMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(/[A-Z]/, 'Must contain an uppercase letter')
      .matches(/[a-z]/, 'Must contain a lowercase letter')
      .matches(/[0-9]/, 'Must contain a number')
      .matches(/[@$!%*?&#]/, 'Must contain a special character'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm your new password'),
  });

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || '');
      setBio(data.user.bio || '');
      setPreview(data.user.profile_picture || '');
    }
  }, [data]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (profilePic) {
      formData.append('profilePic', profilePic);
    }
    try {
      await updateProfile(formData).unwrap();
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage('Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      return;
    }
    try {
      const res = await changePassword({ currentPassword, newPassword }).unwrap();
      setPasswordMsg(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordDialog(false), 1200);
    } catch (err) {
      setPasswordMsg(err?.data?.message || 'Failed to change password.');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-2xl rounded-xl bg-[#FFF3E0] text-[#2C1400]">

        <CardContent className="flex flex-col items-center gap-4">
          <Avatar
            src={preview}
            alt={name}
            sx={{ width: 110, height: 110, bgcolor: '#E06B00', fontSize: 36 }}
            className="mb-2"
          >
            {!preview && name ? name[0] : ''}
          </Avatar>
          {!isEditing ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <Typography variant="h6">{name}</Typography>
              <Typography variant="body2" color="textSecondary">{data?.user?.email}</Typography>
              <Typography variant="body1">{bio || <span className="text-gray-400">No bio</span>}</Typography>
              <Button
                variant="contained"
                color="primary"
                className="mt-2"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                className="mt-2"
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
              {message && (
                <Typography variant="body2" color={message.includes('success') ? 'green' : 'red'}>
                  {message}
                </Typography>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full items-center">
              <Button variant="contained" component="label">
                Change Picture
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              <TextField
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              <div className="flex gap-2 w-full justify-center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isUpdating}
                  className="mt-2"
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  className="mt-2"
                  onClick={() => {
                    setIsEditing(false);
                    setName(data?.user?.name || '');
                    setBio(data?.user?.bio || '');
                    setPreview(data?.user?.profile_picture || '');
                    setProfilePic(null);
                    setMessage('');
                  }}
                >
                  Cancel
                </Button>
              </div>
              {message && (
                <Typography variant="body2" color={message.includes('success') ? 'green' : 'red'}>
                  {message}
                </Typography>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      <Dialog
  open={showPasswordDialog}
  onClose={(event, reason) => {
    if (reason !== 'backdropClick') {
      setShowPasswordDialog(false);
    }
  }}
>
  <DialogTitle>Change Password</DialogTitle>
  <Formik
    initialValues={{
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }}
    validationSchema={passwordSchema}
    onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
      setPasswordMsg('');
      try {
        const res = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }).unwrap();
        setPasswordMsg(res.message || 'Password changed successfully!');
        setStatus({ success: true });
        resetForm();
        setTimeout(() => setShowPasswordDialog(false), 1200);
      } catch (err) {
        setPasswordMsg(err?.data?.message || 'Failed to change password.');
        setStatus({ success: false });
      }
      setSubmitting(false);
    }}
  >
    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
      <Form>
        <DialogContent className="flex flex-col gap-3 min-w-[300px]">
          <TextField
            label="Current Password"
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            value={values.currentPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.currentPassword && Boolean(errors.currentPassword)}
            helperText={touched.currentPassword && errors.currentPassword}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowCurrent((show) => !show)}
                    edge="end"
                  >
                    {showCurrent ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="New Password"
            name="newPassword"
            type={showNew ? "text" : "password"}
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.newPassword && Boolean(errors.newPassword)}
            helperText={touched.newPassword && errors.newPassword}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNew((show) => !show)}
                    edge="end"
                  >
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
            helperText={touched.confirmPassword && errors.confirmPassword}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirm((show) => !show)}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {passwordMsg && (
            <Typography variant="body2" color={passwordMsg.includes('success') ? 'green' : 'red'}>
              {passwordMsg}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={isSubmitting || isChanging}>
            {isSubmitting || isChanging ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Form>
    )}
  </Formik>
</Dialog>
    </div>
  );
};

export default MyProfile;