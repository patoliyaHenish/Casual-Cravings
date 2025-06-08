import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { createRecipeSubCategory, deleteRecipeSubCategory, getParticularRecipeAllSubCategories, getSubCategoryById, updateRecipeSubCategoryById } from '../controllers/subCategory.controller.js';
import { recipeSubCategoryValidationSchema } from '../validations/recipeSubCategoryValidation.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.post('/:id/create-recipe-sub-category', isAuthenticated, checkRole(['admin']), upload.fields([{name: "recipeSubCategoryProfileImage", maxCount: 1}]), validate(recipeSubCategoryValidationSchema), createRecipeSubCategory);
router.get('/:id/get-recipe-sub-categories', isAuthenticated, checkRole(['admin']), getParticularRecipeAllSubCategories);
router.delete('/:id/delete-recipe-sub-category/:subCategoryId', isAuthenticated, checkRole(['admin']), deleteRecipeSubCategory);
router.get('/:id/get-recipe-sub-category/:subCategoryId', isAuthenticated, checkRole(['admin']), getSubCategoryById);
router.put('/:id/update-recipe-sub-category/:subCategoryId', isAuthenticated, checkRole(['admin']), upload.fields([{name: "recipeSubCategoryProfileImage", maxCount: 1}]), validate(recipeSubCategoryValidationSchema), updateRecipeSubCategoryById);

export default router;