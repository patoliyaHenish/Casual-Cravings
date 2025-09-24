import express from 'express';
import authRoutes from './auth.route.js';
import recipeCategoryRoutes from './category.route.js';
import recipeSubCategoryRoutes from './subCategory.route.js';
import recipeByAdminRoutes from './recipe.route.js';
import ingredientRoutes from './ingredient.route.js';
import bannerRoutes from './banner.route.js';
import searchRoutes from './search.route.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/manage-recipe-category', recipeCategoryRoutes);
router.use('/manage-recipe-sub-category', recipeSubCategoryRoutes);
router.use('/manage-recipe-by-admin', recipeByAdminRoutes);
router.use('/manage-ingredients', ingredientRoutes);
router.use('/manage-banner', bannerRoutes);
router.use('/banner', bannerRoutes);
router.use('/search', searchRoutes);

export default router;