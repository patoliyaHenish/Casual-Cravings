import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { createRecipeValidation } from '../validations/recipeValidation.js';
import { createRecipeByAdmin, getAllRecipesForAdmin, getRecipeByIdForAdmin, deleteRecipeByAdmin, updateRecipeByAdmin, updateRecipeAdminApprovedStatus, updateRecipePublicApprovedStatus, getMostUsedKeywords, getPublicRecipesByKeywords } from '../controllers/recipe.controller.js';
import { updateRecipeValidation } from '../validations/recipeValidation.js';
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

router.get(
    '/get-all-recipes-for-admin',
    isAuthenticated,
    checkRole(['admin']),
    getAllRecipesForAdmin
);

router.get(
    '/get-recipe-by-id/:id',
    isAuthenticated,
    checkRole(['admin']),
    getRecipeByIdForAdmin
);

router.get(
    '/get-most-used-keywords',
    isAuthenticated,
    checkRole(['admin']),
    getMostUsedKeywords
);

router.get('/public-by-keywords', getPublicRecipesByKeywords)

router.delete(
    '/delete-recipe-by-admin/:id',
    isAuthenticated,
    checkRole(['admin']),
    deleteRecipeByAdmin
);

router.put(
    '/update-recipe-by-admin/:id',
    isAuthenticated,
    checkRole(['admin']),
    upload.fields([{name: "recipeImage", maxCount: 1}]),
    validate(updateRecipeValidation),
    updateRecipeByAdmin
);

router.patch(
    '/update-admin-approved-status/:id',
    isAuthenticated,
    checkRole(['admin']),
    updateRecipeAdminApprovedStatus
);

router.patch(
    '/update-public-approved-status/:id',
    isAuthenticated,
    checkRole(['admin']),
    updateRecipePublicApprovedStatus
);

export default router;