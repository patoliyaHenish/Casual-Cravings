import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, Avatar, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_bg_removed.png';
import { useLogoutUserMutation } from '../features/api/authApi';
import { useDispatch } from 'react-redux';
import { useUser } from '../context/UserContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, setUser } = useUser();

   const isAdmin = user?.role === 'admin';

  const profilePic = user?.profilePic;

  const [logoutUser] = useLogoutUserMutation();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate('/my-profile');
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutUser();
    setUser(null);
    navigate('/auth');
  };

  const visibleLinks = user?.role === 'admin'
    ? []
    : navLinks;

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#FFF3E0', color: '#2C1400', boxShadow: 2 }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Casual Cravings Logo"
                sx={{
                  height: 38,
                  width: 53,
                  mr: 1,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Typography
                variant="h5"
                component="span"
                fontSize={{ xs: '1.2rem', sm: '1.5rem' }}
                sx={{
                  color: '#E06B00',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  textDecoration: 'none',
                }}
              >
                Casual Cravings
              </Typography>
            </Box>
            {user?.role === 'admin' && (
              <Button
                component={RouterLink}
                to="/admin"
                variant="contained"
                sx={{
                  ml: 2,
                  bgcolor: '#E06B00',
                  color: '#FFF3E0',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#F97C1B', color: '#2C1400' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  px: 2,
                }}
              >
                Admin
              </Button>
            )}
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.2 }}>
            {visibleLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{
                  color: '#2C1400',
                  fontWeight: 600,
                  '&:hover': { color: '#E06B00', bgcolor: 'transparent' },
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  px: 1.8,
                }}
              >
                {link.label}
              </Button>
            ))}
            {user ? (
              <>
                <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                  <Avatar
                    src={user.profile_picture}
                    alt={user.name || user.email}
                    sx={{ width: 36, height: 36, bgcolor: '#E06B00', color: '#FFF3E0', fontWeight: 'bold' }}
                  >
                    {!profilePic && (user.name ? user.name[0] : user.email[0])}
                  </Avatar>
                </IconButton>
                {user.role !== 'admin' && (
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={handleProfile}>Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                )}
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/auth"
                variant="contained"
                sx={{
                  bgcolor: '#E06B00',
                  color: '#FFF3E0',
                  fontWeight: 'bold',
                  ml: 1,
                  '&:hover': { bgcolor: '#F97C1B', color: '#2C1400' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.08rem',
                  px: 2.2,
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </Box>
         <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            sx={{ display: { xs: isAdmin ? 'none' : 'flex', md: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 200 }} role="presentation" onClick={handleDrawerToggle}>
          <List>
            {visibleLinks.map((link) => (
              <ListItem button component={RouterLink} to={link.to} key={link.to}>
                <ListItemText primary={link.label} sx={{ '.MuiListItemText-primary': { fontSize: '1.05rem' } }} />
              </ListItem>
            ))}
            {user ? (
              <ListItem>
                <IconButton onClick={handleAvatarClick}>
                  <Avatar
                    src={profilePic}
                    alt={user.name || user.email}
                    sx={{ width: 32, height: 32, bgcolor: '#E06B00', color: '#FFF3E0', fontWeight: 'bold' }}
                  >
                    {!profilePic && (user.name ? user.name[0] : user.email[0])}
                  </Avatar>
                </IconButton>
                <Typography sx={{ ml: 1, fontWeight: 'bold', color: '#2C1400', alignSelf: 'center' }}>
                  {user.name}
                </Typography>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleProfile}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </ListItem>
            ) : (
              <ListItem button component={RouterLink} to="/auth">
                <ListItemText primary="Login / Sign Up" sx={{ '.MuiListItemText-primary': { fontSize: '1.08rem' } }} />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;