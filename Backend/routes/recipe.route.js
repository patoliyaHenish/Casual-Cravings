import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { createRecipeValidation } from '../validations/recipeValidation.js';
import { createRecipeByAdmin } from '../controllers/recipe.controller.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.post(
    '/create-recipe-by-admin',
    isAuthenticated,
    checkRole(['admin']),
    upload.fields([{name: "recipeImage", maxCount: 1}]),
    validate(createRecipeValidation),
    createRecipeByAdmin
);

export default router;