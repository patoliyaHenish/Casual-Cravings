import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLoading } from '../context/LoadingContext';
import { toast } from 'react-toastify';
import Loader from './LoadingSpinner';

const AppWrapper = () => {
  const { user, isLoading: userLoading } = useUser();
  const { isLoading: routeLoading, startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  const validRoutes = [
    '/',
    '/auth',
    '/my-profile',
    '/search',	
    '/banner-recipes',
    '/recipe/:recipeId',
    '/admin/manage-recipe-category',
    '/admin/manage-recipe-subcategories',
    '/admin/manage-recipes',
    '/admin/manage-banners',
    '/not-authenticated'
  ];

  const isValidRoute = (path) => {
    return validRoutes.includes(path) || path.startsWith('/reset-password/');
  };

  useEffect(() => {
    if (currentPath !== location.pathname) {
      startLoading();
      setCurrentPath(location.pathname);
      
      const timer = setTimeout(() => {
        stopLoading();
      }, 800);
      
      if (!isValidRoute(location.pathname)) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, currentPath, startLoading, stopLoading, navigate]);

  useEffect(() => {
    const maxLoadingTime = 3000;
    const timer = setTimeout(() => {
      if (routeLoading) {
        stopLoading();
      }
    }, maxLoadingTime);

    return () => clearTimeout(timer);
  }, [routeLoading, stopLoading]);

  useEffect(() => {
    if (user && location.pathname === '/auth') {
      navigate('/');
    }
    
    if (user && location.search.includes('login=success')) {
      toast.success('Google login successful!');
      navigate('/', { replace: true });
    }
  }, [user, location.pathname, location.search, navigate]);

  if (userLoading || routeLoading) {
    return <Loader />;
  }

  return <Outlet />;
};

export default AppWrapper; 