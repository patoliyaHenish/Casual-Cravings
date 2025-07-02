import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { createRecipeSubCategory, deleteRecipeSubCategory, getAllRecipeSubCategorieDetails, getRecipeSubCategoryById, updateRecipeSubCategory } from '../controllers/subCategory.controller.js';
import { recipeSubCategoryValidationSchema, requireSubCategoryId } from '../validations/recipeSubCategoryValidation.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.post('/create-recipe-sub-category', isAuthenticated, checkRole(['admin']), upload.fields([{name: "recipeSubCategoryProfileImage", maxCount: 1}]), validate(recipeSubCategoryValidationSchema), createRecipeSubCategory);
router.put('/update-recipe-sub-category', isAuthenticated, checkRole(['admin']), upload.fields([{name: "recipeSubCategoryProfileImage", maxCount: 1}]), validate(recipeSubCategoryValidationSchema), updateRecipeSubCategory);
router.delete('/delete-recipe-sub-category', isAuthenticated, checkRole(['admin']), deleteRecipeSubCategory);
router.get('/get-all-recipe-sub-category-details', isAuthenticated, checkRole(['admin']), getAllRecipeSubCategorieDetails);
router.post('/get-particular-recipe-sub-category', isAuthenticated, checkRole(['admin']), validate(requireSubCategoryId), getRecipeSubCategoryById);

export default router;