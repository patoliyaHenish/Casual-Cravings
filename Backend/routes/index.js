import express from 'express';
import authRoutes from './auth.route.js';
import recipeCategoryRoutes from './category.route.js';

const router = express.Router();

router.use('/auth', authRoutes);

router.use('/manage-recipe-category', recipeCategoryRoutes);

export default router;