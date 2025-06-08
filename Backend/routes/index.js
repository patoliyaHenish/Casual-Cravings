import express from 'express';
import authRoutes from './auth.route.js';
import recipeCategoryRoutes from './category.route.js';
import recipeSubCategoryRoutes from './subCategory.route.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/manage-recipe-category', recipeCategoryRoutes);
router.use('/manage-recipe-sub-category', recipeSubCategoryRoutes);

export default router;