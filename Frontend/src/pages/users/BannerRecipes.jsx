import React from 'react'
import { Box, Card, CardContent, CardMedia, Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useGetPublicRecipesByKeywordsQuery } from '../../features/api/recipeApi';

const BannerRecipes = () => {
  const location = useLocation();
  const keywords = location.state?.keywords || '';
  const { data, isLoading, error } = useGetPublicRecipesByKeywordsQuery(keywords);
  const recipes = data?.data || [];

  return (
    <Container 
      maxWidth="lg" 
      className="mt-28 py-8 bg-gray-50" 
      sx={{
        height: 'calc(100vh - 112px)',
        overflow: 'hidden',
      }}
    >
      <Box className="h-full overflow-y-auto custom-scrollbar px-4">
        <Typography variant="h4" component="h2" className="font-bold mb-6 text-center">
          All Recipes
        </Typography>
      
        {isLoading && <Typography className="text-center">Loading recipes...</Typography>}
        {error && <Typography className="text-center text-red-500">Failed to load recipes.</Typography>}
        {!isLoading && recipes.length === 0 && (
          <Typography className="text-center text-gray-500">No recipes found for these keywords.</Typography>
        )}
        
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {recipes.map(recipe => (
            <Card key={recipe.recipe_id} className="flex flex-col hover:shadow-md transition-shadow duration-300 overflow-hidden bg-white">
              <CardMedia
                component="img"
                image={recipe.image_url || '/default-recipe.jpg'}
                alt={recipe.title}
                className="w-full aspect-video object-cover hover:opacity-95 transition-opacity"
              />
              
              <CardContent className="p-4">
                <Typography variant="h6" className="font-bold text-gray-900 text-lg line-clamp-2">
                  {recipe.title}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export default BannerRecipes;

