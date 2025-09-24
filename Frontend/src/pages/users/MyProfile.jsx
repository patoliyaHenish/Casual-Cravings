import React, { useState } from 'react';
import CropImage from '../../components/CropImage';
import { useMyProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useLogoutUserMutation } from '../../features/api/authApi';
import { Card, CardContent, Typography, Avatar, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton } from '@mui/material';
import { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { convertBase64ToImageUrl, convertImageFileToBase64 } from '../../utils/helper';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  const { data, isLoading } = useMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();
  const [logoutUser] = useLogoutUserMutation();
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState('');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

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
      
      const profilePicUrl = convertBase64ToImageUrl({
        image_data: data.user.profile_picture_data,
        mime_type: data.user.profile_picture_mime_type
      });
      setPreview(profilePicUrl);
    }
  }, [data]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawImage(URL.createObjectURL(file));
      setProfilePic(file);
      setShowCropDialog(true);
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

  const handleCropComplete = async (croppedAreaPixels) => {
    if (rawImage && croppedAreaPixels) {
      const croppedBlob = await getCroppedImg(rawImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
      setProfilePic(croppedFile);
      setPreview(URL.createObjectURL(croppedBlob));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      name,
      bio
    };

    if (profilePic) {
      try {
        const imageData = await convertImageFileToBase64(profilePic);
        if (imageData) {
          updateData.profilePicData = {
            filename: imageData.filename,
            mime_type: imageData.mime_type,
            image_data: imageData.image_data
          };
        }
      } catch {
        toast.error('Failed to process image.');
        return;
      }
    }
    
    try {
      await updateProfile(updateData).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      setUser(null);
      toast.success('Logged out successfully!');
      navigate('/auth');
    } catch {
      toast.error('Failed to logout');
    }
  };



  if (isLoading) return (
    <div 
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="text-xl font-semibold">Loading...</div>
    </div>
  );

  return (
    <div 
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundColor: 'var(--bg-primary)',
        transition: 'all 0.3s ease'
      }}
    >
      <Card 
        className="w-full max-w-md shadow-2xl rounded-xl"
        sx={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          transition: 'all 0.3s ease'
        }}
      >

        <CardContent className="flex flex-col items-center gap-4">
          <Avatar
            src={preview}
            alt={name}
            sx={{ 
              width: 110, 
              height: 110, 
              bgcolor: 'var(--btn-primary)', 
              fontSize: 36,
              color: '#ffffff',
              border: '3px solid var(--border-color)',
              transition: 'all 0.3s ease'
            }}
            className="mb-2"
          >
            {!preview && name ? name[0] : ''}
          </Avatar>
          {!isEditing ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <Typography 
                variant="h6"
                sx={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  transition: 'color 0.3s ease'
                }}
              >
                {name}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}
              >
                {data?.user?.email}
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'var(--text-primary)',
                  transition: 'color 0.3s ease'
                }}
              >
                {bio || <span style={{ color: 'var(--text-muted)' }}>No bio</span>}
              </Typography>
              <div className="flex gap-2 w-full">
                <Button
                  variant="contained"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                  sx={{
                    backgroundColor: 'var(--btn-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'var(--btn-primary-hover)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Edit Profile
                </Button>
                {data?.user?.password && (
                  <Button
                    variant="outlined"
                    className="flex-1"
                    onClick={() => setShowPasswordDialog(true)}
                    sx={{
                      borderColor: 'var(--btn-secondary)',
                      color: 'var(--btn-secondary)',
                      '&:hover': {
                        borderColor: 'var(--btn-secondary-hover)',
                        backgroundColor: 'var(--btn-secondary)',
                        color: '#ffffff',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Change Password
                  </Button>
                )}
              </div>
              <Button
                variant="outlined"
                className="w-full mt-2"
                onClick={handleLogout}
                sx={{
                  borderColor: '#dc3545',
                  color: '#dc3545',
                  '&:hover': {
                    borderColor: '#c82333',
                    backgroundColor: '#dc3545',
                    color: '#ffffff',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full items-center">
              <Button 
                variant="contained" 
                component="label"
                sx={{
                  backgroundColor: 'var(--btn-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'var(--btn-primary-hover)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Change Picture
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Button>
              <CropImage
                open={showCropDialog}
                imageSrc={rawImage}
                onClose={() => setShowCropDialog(false)}
                onCropComplete={async (croppedAreaPixels) => {
                  await handleCropComplete(croppedAreaPixels);
                  setShowCropDialog(false);
                }}
              />
              <TextField
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--btn-primary)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--btn-primary)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--btn-primary)',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-color)',
                  },
                  transition: 'all 0.3s ease'
                }}
              />
              <TextField
                label="Bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--btn-primary)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--btn-primary)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                    '&.Mui-focused': {
                      color: 'var(--btn-primary)',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-color)',
                  },
                  transition: 'all 0.3s ease'
                }}
              />
              <div className="flex gap-2 w-full justify-center">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdating}
                  className="mt-2"
                  sx={{
                    backgroundColor: 'var(--btn-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'var(--btn-primary-hover)',
                    },
                    '&:disabled': {
                      backgroundColor: 'var(--text-muted)',
                      color: 'var(--text-secondary)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
                <Button
                  variant="outlined"
                  className="mt-2"
                  onClick={() => {
                    setIsEditing(false);
                    setName(data?.user?.name || '');
                    setBio(data?.user?.bio || '');
                    setPreview(convertBase64ToImageUrl({
                      image_data: data?.user?.profile_picture_data,
                      mime_type: data?.user?.profile_picture_mime_type
                    }));
                    setProfilePic(null);
                  }}
                  sx={{
                    borderColor: 'var(--btn-secondary)',
                    color: 'var(--btn-secondary)',
                    '&:hover': {
                      borderColor: 'var(--btn-secondary-hover)',
                      backgroundColor: 'var(--btn-secondary)',
                      color: '#ffffff',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </Button>
              </div>
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
        onEnter={() => {
          setShowPasswordDialog(true);
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            color: 'var(--text-primary)',
            fontWeight: 600,
            transition: 'color 0.3s ease'
          }}
        >
          Change Password
        </DialogTitle>
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={passwordSchema}
          onSubmit={async (values, { setSubmitting, setStatus, resetForm, setFieldError }) => {
            try {
              const res = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              }).unwrap();
              toast.success(res.message || 'Password changed successfully!');
              setStatus({ success: true });
              resetForm();
              setTimeout(() => setShowPasswordDialog(false), 1200);
            } catch (err) {
              if (err?.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
                err.data.errors.forEach((error) => {
                  toast.error(error);
                });
                
                err.data.errors.forEach((error) => {
                  if (error.toLowerCase().includes('current password')) {
                    setFieldError('currentPassword', error);
                  } else if (error.toLowerCase().includes('new password')) {
                    setFieldError('newPassword', error);
                  } else if (error.toLowerCase().includes('confirm')) {
                    setFieldError('confirmPassword', error);
                  }
                });
                setStatus({ success: false, errors: err.data.errors });
              } else if (err?.data?.message) {
                let cleanErrorMessage = err.data.message;
                if (typeof cleanErrorMessage === 'string') {
                  cleanErrorMessage = cleanErrorMessage.trim();
                } else {
                  cleanErrorMessage = 'An error occurred';
                }
                if (cleanErrorMessage.toLowerCase().includes('current password')) {
                  console.log('Setting current password field error:', cleanErrorMessage);
                  setFieldError('currentPassword', cleanErrorMessage);
                  setStatus({ success: false, errors: [] });
                } else {
                  toast.error(cleanErrorMessage);
                  setStatus({ success: false, errors: [cleanErrorMessage] });
                }
              } else {
                toast.error('Failed to change password.');
                setStatus({ success: false, errors: ['Failed to change password.'] });
              }
            }
            setSubmitting(false);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, status, setStatus }) => {
            const handleFieldChange = (e) => {
              handleChange(e);
              if (status?.success === false) {
                setStatus({ success: true });
              }
            };
            
            return (
            <Form>
              <DialogContent className="flex flex-col gap-3 min-w-[300px]">
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={values.currentPassword}
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  error={touched.currentPassword && Boolean(errors.currentPassword)}
                  helperText={touched.currentPassword && errors.currentPassword ? String(errors.currentPassword) : ''}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      '&.Mui-focused': {
                        color: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-color)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'var(--text-secondary)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={() => setShowCurrent((show) => !show)}
                          edge="end"
                          sx={{ color: 'var(--text-secondary)' }}
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
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      '&.Mui-focused': {
                        color: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-color)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'var(--text-secondary)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNew((show) => !show)}
                          edge="end"
                          sx={{ color: 'var(--text-secondary)' }}
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
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      '&.Mui-focused': {
                        color: 'var(--btn-primary)',
                      }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--border-color)',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'var(--text-secondary)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirm((show) => !show)}
                          edge="end"
                          sx={{ color: 'var(--text-secondary)' }}
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setShowPasswordDialog(false)}
                  sx={{
                    borderColor: 'var(--btn-secondary)',
                    color: 'var(--btn-secondary)',
                    '&:hover': {
                      borderColor: 'var(--btn-secondary-hover)',
                      backgroundColor: 'var(--btn-secondary)',
                      color: '#ffffff',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting || isChanging}
                  sx={{
                    backgroundColor: 'var(--btn-primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'var(--btn-primary-hover)',
                    },
                    '&:disabled': {
                      backgroundColor: 'var(--text-muted)',
                      color: 'var(--text-secondary)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSubmitting || isChanging ? 'Changing...' : 'Change Password'}
                </Button>
              </DialogActions>
            </Form>
            );
          }}
        </Formik>
      </Dialog>
    </div>
  );
};

export default MyProfile;