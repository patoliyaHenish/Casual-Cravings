import express from 'express';
import { createRecipeCategories } from '../controllers/admin.controller.js';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { validate } from '../utils/helper.js';
import { recipeCategoryValidationSchema } from '../validations/adminValidation.js';
import { checkRole } from '../utils/helper.js';

const router = express.Router();

router.post('/create-recipe-category', isAuthenticated, checkRole(['admin']), validate(recipeCategoryValidationSchema), createRecipeCategories);


export default router;