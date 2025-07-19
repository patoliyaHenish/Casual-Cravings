import React from 'react'
import { useGetHeroBannerQuery } from '../../features/api/bannerApi'
import { CircularProgress, Button, Box, Typography } from '@mui/material'

const Banner = () => {
  const { data: heroBanner, isLoading } = useGetHeroBannerQuery()
  if (isLoading) {
    return (
      <Box className="flex justify-center items-center min-h-[200px]">
        <CircularProgress />
      </Box>
    )
  }
  if (!heroBanner) return null
  return (
    <div className="px-2 md:px-10 lg:px-24 xl:px-32 mt-8 sm:mt-14 md:mt-20 lg:mt-24">
      <Box
        className="relative w-full max-w-6xl mx-auto mt-4 sm:mt-8 md:mt-10 overflow-hidden flex items-stretch shadow-lg"
        sx={{ height: { sm: 320, md: 400, lg: 480 } }}
      >
        <div className="flex flex-col w-full max-w-sm sm:hidden bg-white mx-auto mt-6 mb-4 shadow-lg items-center overflow-hidden rounded-lg border border-gray-200 gap-4">
          <img src={heroBanner.image_url} alt={heroBanner.title} className="block w-full h-48 object-cover rounded-t-lg" />
          <div className="flex flex-col items-center w-full px-4">
            <Typography
              variant="h4"
              className="text-black font-bold text-center mb-3 text-[22px] leading-tight"
            >
              {heroBanner.title}
            </Typography>
            {heroBanner.button_text && (
              <Button
                variant="contained"
                className="uppercase font-extrabold shadow-lg text-[15px] px-6 py-2 rounded-lg"
                sx={{
                  background: 'linear-gradient(90deg, #ff9800 0%, #ffb300 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  transition: 'transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
                  boxShadow: '0 4px 20px 0 rgba(255,152,0,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #fb8c00 0%, #ffd54f 100%)',
                    transform: 'scale(1.06)',
                    boxShadow: '0 8px 32px 0 rgba(255,152,0,0.35)'
                  }
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
              backgroundImage: `url(${heroBanner.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1
            }}
          />
          <Box
            className="absolute left-0 top-0 bottom-0 hidden sm:flex flex-col justify-center h-full px-16 sm:px-8 md:px-8 lg:px-10 py-4 max-w-full md:max-w-[520px] lg:max-w-[560px]"
            sx={{
              width: { xs: '100%', sm: '70%', md: '45%', lg: '40%' },
              background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.0) 100%)',
              zIndex: 2
            }}
          >
            <Typography
              variant="h3"
              className="text-white font-bold leading-tight mb-1 sm:mb-2 text-[28px] sm:text-[36px] md:text-[38px] lg:text-[44px]"
            >
              {heroBanner.title}
            </Typography>
            {heroBanner.button_text && (
              <Button
                variant="contained"
                className="uppercase font-extrabold shadow-lg mt-1 text-[16px] sm:text-[18px] md:text-[18px] lg:text-[20px] px-3 sm:px-5 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-1.5 lg:py-2 rounded-lg"
                sx={{
                  background: 'linear-gradient(90deg, #ff9800 0%, #ffb300 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  transition: 'transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.2s',
                  boxShadow: '0 4px 20px 0 rgba(255,152,0,0.25)',
                  mt: 1,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #fb8c00 0%, #ffd54f 100%)',
                    transform: 'scale(1.06)',
                    boxShadow: '0 8px 32px 0 rgba(255,152,0,0.35)'
                  }
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