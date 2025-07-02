import express from 'express';
import authRoutes from './auth.route.js';
import recipeCategoryRoutes from './category.route.js';
import recipeSubCategoryRoutes from './subCategory.route.js';
import recipeIngredientRoutes from './ingredients.route.js';
import recipeByAdminRoutes from './recipe.route.js';

const router = express.Router();

router.use('/auth', authRoutes);

// admin sides management routes
router.use('/manage-recipe-category', recipeCategoryRoutes);
router.use('/manage-recipe-sub-category', recipeSubCategoryRoutes);
router.use('/manage-recipe-ingredient', recipeIngredientRoutes);
router.use('/manage-recipe-by-admin', recipeByAdminRoutes);

export default router;