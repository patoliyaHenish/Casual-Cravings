import express from 'express';
import { createRecipeCategories, deleteRecipeCategoryById, getRecipeCategories, getRecipeCategoryById, updateRecipeCategoryById } from '../controllers/category.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { validate } from '../utils/helper.js';
import { recipeCategoryValidationSchema } from '../validations/adminValidation.js';
import { checkRole } from '../utils/helper.js';

const router = express.Router();

router.post('/create-recipe-category', isAuthenticated, checkRole(['admin']), validate(recipeCategoryValidationSchema), createRecipeCategories);
router.get('/get-recipe-categories', isAuthenticated, checkRole(['admin']), getRecipeCategories);
router.get('/get-recipe-category/:id', isAuthenticated, checkRole(['admin']), getRecipeCategoryById);
router.delete('/delete-recipe-category/:id', isAuthenticated, checkRole(['admin']), deleteRecipeCategoryById);
router.put('/update-recipe-category/:id', isAuthenticated, checkRole(['admin']), validate(recipeCategoryValidationSchema), updateRecipeCategoryById);

export default router;