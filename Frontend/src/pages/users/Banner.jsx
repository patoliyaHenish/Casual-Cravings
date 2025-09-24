import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useGetHeroBannerQuery } from '../../features/api/bannerApi'
import { CircularProgress, Button, Box, Typography } from '@mui/material'
import BannerSkeleton from '../../components/BannerSkeleton'
import { getImageUrl } from '../../utils/helper'
import { useTheme } from '../../context/ThemeContext'

const Banner = () => {
  const { data: heroBanner, isLoading } = useGetHeroBannerQuery()
  const navigate = useNavigate();
  const { isDarkMode: _isDarkMode } = useTheme();
  if (isLoading) {
    return <BannerSkeleton />
  }
  if (!heroBanner) return null
  return (
    <div className="px-2 md:px-4 lg:px-6 xl:px-8" style={{ 
      paddingTop: '80px',
      backgroundColor: 'var(--bg-primary)',
      transition: 'background-color 0.3s ease'
    }}>
      <Box
        className="relative w-full max-w-7xl mx-auto overflow-hidden flex items-stretch"
        sx={{ 
          height: { xs: 'auto', sm: 320, md: 480, lg: 630 },
          minHeight: { xs: 300, sm: 320, md: 480, lg: 630 },
          transition: 'all 0.3s ease'
        }}
      >
        <div 
          className="flex flex-col w-full max-w-sm sm:hidden mx-auto items-center overflow-hidden rounded-lg gap-4"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: `1px solid var(--card-border)`,
            transition: 'all 0.3s ease'
          }}
        >
          <img src={getImageUrl(heroBanner, 'banner')} alt={heroBanner.title} className="block w-full h-48 object-cover rounded-t-lg" />
          <div className="flex flex-col items-center w-full px-4 pb-4">
            <Typography
              variant="h4"
              className="font-black text-center mb-3 text-[22px] leading-tight uppercase"
              sx={{ 
                fontWeight: 700,
                color: 'var(--text-primary)',
                transition: 'color 0.3s ease'
              }}
            >
              {heroBanner.title}
            </Typography>
            {heroBanner.button_text && (
              <Button
                variant="contained"
                className="uppercase font-semibold shadow-lg text-[15px] px-6 py-2 rounded-lg"
                sx={{
                  background: _isDarkMode ? '#000000' : '#ffffff',
                  color: _isDarkMode ? '#ffffff' : '#000000',
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: _isDarkMode ? '0 4px 20px 0 rgba(0, 0, 0, 0.3)' : '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
                  width: 'fit-content',
                  maxWidth: 'none',
                  alignSelf: 'center',
                  '&:hover': {
                    background: _isDarkMode ? '#333333' : '#f5f5f5',
                    color: _isDarkMode ? '#ffffff' : '#000000',
                    transform: 'scale(1.06)',
                    boxShadow: _isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                  }
                }}
                onClick={() => {
                  navigate('/banner-recipes', {
                    state: { keywords: heroBanner.keywords || heroBanner.title }
                  });
                }}
              >
                {heroBanner.button_text}
              </Button>
            )}
          </div>
        </div>
        <>
          <Box
            className="absolute inset-0 w-full h-full hidden sm:block"
            sx={{
              backgroundImage: `url(${getImageUrl(heroBanner, 'banner')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1
            }}
          />
          <Box
            className="absolute left-0 top-0 bottom-0 hidden sm:flex flex-col justify-center h-full px-16 sm:px-8 md:px-10 lg:px-12 py-4 max-w-full md:max-w-[580px] lg:max-w-[640px]"
            sx={{
              width: { xs: '100%', sm: '70%', md: '50%', lg: '45%' },
              background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.0) 100%)',
              zIndex: 2
            }}
          >
            <Typography
              variant="h3"
              className="font-black leading-tight mb-1 sm:mb-2 text-[28px] sm:text-[36px] md:text-[42px] lg:text-[52px] uppercase"
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease'
              }}
            >
              {heroBanner.title}
            </Typography>
            {heroBanner.button_text && (
              <Button
                variant="contained"
                className="uppercase font-semibold shadow-lg mt-1 text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] px-3 sm:px-5 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2 lg:py-2.5 rounded-lg"
                sx={{
                  background: _isDarkMode ? '#000000' : '#ffffff',
                  color: _isDarkMode ? '#ffffff' : '#000000',
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  boxShadow: _isDarkMode ? '0 4px 20px 0 rgba(0, 0, 0, 0.3)' : '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
                  mt: 1,
                  width: 'fit-content',
                  maxWidth: 'none',
                  alignSelf: 'flex-start',
                  '&:hover': {
                    background: _isDarkMode ? '#333333' : '#f5f5f5',
                    color: _isDarkMode ? '#ffffff' : '#000000',
                    transform: 'scale(1.06)',
                    boxShadow: _isDarkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                  }
                }}
                onClick={() => {
                  navigate('/banner-recipes', {
                    state: { keywords: heroBanner.keywords || heroBanner.title }
                  });
                }}
              >
                {heroBanner.button_text}
              </Button>
            )}
          </Box>
        </>
      </Box>
    </div>
  )
}

export default Banner