import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_bg_removed.png';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { convertBase64ToImageUrl } from '../utils/helper';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  const handleAvatarClick = () => {
    navigate('/my-profile');
  };


  const visibleLinks = user?.role === 'admin'
    ? []
    : navLinks;

  return (
    <>
      <AppBar position="fixed" sx={{ 
        bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--bg-secondary)' : 'var(--bg-primary)') : (isDarkMode ? '#000000' : '#ffffff'), 
        color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : (isDarkMode ? '#ffffff' : '#000000'), 
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)', 
        zIndex: 1300,
        transition: 'all 0.3s ease',
        borderBottom: isDarkMode ? '1px solid var(--border-color)' : '1px solid #e5e7eb'
      }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={drawerOpen ? "close menu" : "open menu"}
            sx={{ display: { xs: user?.role === 'admin' ? 'none' : 'flex', md: 'none' }, mr: 1 }}
            onClick={handleDrawerToggle}
          >
            {drawerOpen ? (
              <CloseIcon sx={{ fontSize: 30 }} />
            ) : (
              <MenuIcon sx={{ fontSize: 30 }} />
            )}
          </IconButton>
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
                  height: 70,
                  width: 70,
                  mr: 1,
                }}
              />
            </Box>
            {user?.role === 'admin' && (
              <Button
                component={RouterLink}
                to="/admin"
                variant="contained"
                sx={{
                  ml: 2,
                  bgcolor: 'var(--btn-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': { 
                    bgcolor: 'var(--btn-primary-hover)', 
                    color: '#ffffff' 
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  px: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                Admin
              </Button>
            )}
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.2, alignItems: 'center' }}>
            {visibleLinks.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{
                  color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : (isDarkMode ? '#ffffff' : '#000000'),
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  px: 1.8,
                  borderBottom: '2px solid transparent',
                  borderRadius: 0,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: user?.role === 'admin' ? (isDarkMode ? 'var(--navbar-hover)' : 'var(--btn-primary)') : (isDarkMode ? '#f4c542' : '#f4c542'),
                    bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)') : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'),
                    borderBottom: user?.role === 'admin' ? (isDarkMode ? '2px solid var(--navbar-hover)' : '2px solid var(--btn-primary)') : '2px solid #f4c542',
                    borderRadius: 0,
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
            {(!user || user.role !== 'admin') && (
              <IconButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/search');
                }}
                sx={{
                  color: isDarkMode ? '#ffffff' : '#000000',
                  '&:hover': { 
                    color: '#f4c542', 
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  },
                }}
              >
                <SearchIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}
            <ThemeToggle />
            {user ? (
              <>
                <IconButton onClick={handleAvatarClick} sx={{ ml: 1 }}>
                  <Avatar
                    src={convertBase64ToImageUrl({
                      image_data: user.profile_picture_data,
                      mime_type: user.profile_picture_mime_type
                    })}
                    alt={user.name || user.email}
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--btn-primary)' : 'var(--btn-primary)') : '#f4c542', 
                      color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : '#ffffff') : '#000000', 
                      fontWeight: 'bold',
                      border: user?.role === 'admin' ? (isDarkMode ? '2px solid var(--border-color)' : '2px solid var(--border-color)') : (isDarkMode ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(0, 0, 0, 0.3)')
                    }}
                  >
                    {!convertBase64ToImageUrl({
                      image_data: user.profile_picture_data,
                      mime_type: user.profile_picture_mime_type
                    }) && (user.name ? user.name[0] : user.email[0])}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/auth"
                variant="contained"
                sx={{
                  bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--btn-primary)' : 'var(--btn-primary)') : '#f4c542',
                  color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : '#ffffff') : '#000000',
                  fontWeight: 'bold',
                  ml: 1,
                  '&:hover': { 
                    bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--btn-primary-hover)' : 'var(--btn-primary-hover)') : '#e6b800', 
                    color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : '#ffffff') : '#000000' 
                  },
                  borderRadius: 2,
                  minWidth: 0,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 28 }} />
              </Button>
            )}
          </Box>
         {(!user || user.role !== 'admin') && (
           <IconButton
             color="inherit"
             aria-label="search"
             onClick={e => {
               e.preventDefault();
               e.stopPropagation();
               navigate('/search');
             }}
             sx={{ 
               display: { xs: 'flex', md: 'none' }, 
               mr: 1, 
               color: isDarkMode ? '#ffffff' : '#000000',
               transition: 'all 0.3s ease',
               '&:hover': { 
                 color: '#f4c542', 
                 bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
               }
             }}
           >
             <SearchIcon sx={{ fontSize: 24 }} />
           </IconButton>
         )}
         <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
           <ThemeToggle />
         </Box>
         {user && (
           <IconButton
             color="inherit"
             aria-label="profile"
             onClick={handleAvatarClick}
             sx={{ 
               display: { xs: 'flex', md: 'none' }, 
               mr: 1, 
               color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : (isDarkMode ? '#ffffff' : '#000000'),
               transition: 'all 0.3s ease',
               '&:hover': { 
                 bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)') : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
               }
             }}
           >
             <Avatar
               src={convertBase64ToImageUrl({
                 image_data: user.profile_picture_data,
                 mime_type: user.profile_picture_mime_type
               })}
               alt={user.name || user.email}
               sx={{ 
                 width: 28, 
                 height: 28, 
                 bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--btn-primary)' : 'var(--btn-primary)') : '#f4c542', 
                 color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : '#ffffff') : '#000000', 
                 fontWeight: 'bold',
                 border: user?.role === 'admin' ? (isDarkMode ? '2px solid var(--border-color)' : '2px solid var(--border-color)') : (isDarkMode ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(0, 0, 0, 0.3)')
               }}
             >
               {!convertBase64ToImageUrl({
                 image_data: user.profile_picture_data,
                 mime_type: user.profile_picture_mime_type
               }) && (user.name ? user.name[0] : user.email[0])}
             </Avatar>
           </IconButton>
         )}
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--bg-secondary)' : 'var(--bg-primary)') : (isDarkMode ? '#000000' : '#ffffff'),
          zIndex: 1200,
          display: { xs: drawerOpen && user?.role !== 'admin' ? 'block' : 'none', md: 'none' },
          pt: { xs: 8, sm: 9 },
          transition: 'all 0.3s ease'
        }}
      >

        <Box sx={{ p: 2 }}>
          <List>
            {visibleLinks.map((link) => (
              <ListItem 
                button 
                component={RouterLink} 
                to={link.to} 
                key={link.to}
                onClick={handleDrawerToggle}
                sx={{ 
                  color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : (isDarkMode ? '#ffffff' : '#000000'),
                  '&:hover': { 
                    bgcolor: user?.role === 'admin' ? (isDarkMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)') : '#f4c542', 
                    color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : '#000000' 
                  },
                  mb: 1,
                  borderRadius: 1,
                  borderBottom: user?.role === 'admin' ? (isDarkMode ? '1px solid var(--border-color)' : '1px solid var(--border-color)') : (isDarkMode ? '1px solid rgba(244, 197, 66, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'),
                  pb: 2,
                  pt: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemText 
                  primary={link.label} 
                  sx={{ 
                    '.MuiListItemText-primary': { 
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      color: user?.role === 'admin' ? (isDarkMode ? 'var(--text-primary)' : 'var(--text-primary)') : (isDarkMode ? '#ffffff' : '#000000'),
                      transition: 'all 0.3s ease'
                    } 
                  }} 
                />
              </ListItem>
            ))}

                        {!user && (
              <ListItem 
                button 
                component={RouterLink} 
                to="/auth"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: isDarkMode ? '#ffffff' : '#000000',
                  '&:hover': { 
                    bgcolor: '#f4c542', 
                    color: '#000000' 
                  },
                  mb: 1,
                  borderRadius: 1,
                  borderBottom: isDarkMode ? '1px solid rgba(244, 197, 66, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                  pb: 2,
                  pt: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                <IconButton sx={{ 
                  color: isDarkMode ? '#ffffff' : '#000000',
                  transition: 'all 0.3s ease'
                }}>
                  <AccountCircleIcon sx={{ fontSize: 28 }} />
                </IconButton>
                <Typography sx={{ 
                  ml: 1, 
                  fontWeight: 'bold', 
                  color: isDarkMode ? '#ffffff' : '#000000', 
                  alignSelf: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  Login
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
      </Box>
    </>
  );
};

export default Navbar;