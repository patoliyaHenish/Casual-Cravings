import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { createRecipeValidation } from '../validations/recipeValidation.js';
import { createRecipeByAdmin } from '../controllers/recipe.controller.js';

const router = express.Router();

router.post(
    '/create-recipe-by-admin',
    isAuthenticated,
    checkRole(['admin']),
    validate(createRecipeValidation),
    createRecipeByAdmin
);

export default router;