import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole } from '../utils/helper.js';
import {
    createIngredient,
    searchIngredients,
    getAllIngredients,
    getIngredientById,
    getRecipeIngredients,
    addIngredientToRecipe,
    updateRecipeIngredient,
    removeIngredientFromRecipe,
    deleteIngredient,
    getIngredientsPaginated
} from '../controllers/ingredient.controller.js';

const router = express.Router();

router.post(
    '/create',
    isAuthenticated,
    checkRole(['admin']),
    createIngredient
);

router.get(
    '/search',
    searchIngredients
);

router.get(
    '/all',
    getAllIngredients
);

router.get(
    '/paginated',
    getIngredientsPaginated
);

router.get(
    '/:id',
    getIngredientById
);

router.delete(
    '/:id',
    isAuthenticated,
    checkRole(['admin']),
    deleteIngredient
);

router.get(
    '/recipe/:recipeId',
    getRecipeIngredients
);

router.post(
    '/recipe/:recipeId/add',
    isAuthenticated,
    checkRole(['admin']),
    addIngredientToRecipe
);

router.put(
    '/recipe-ingredient/:recipeIngredientId',
    isAuthenticated,
    checkRole(['admin']),
    updateRecipeIngredient
);

router.delete(
    '/recipe-ingredient/:recipeIngredientId',
    isAuthenticated,
    checkRole(['admin']),
    removeIngredientFromRecipe
);

export default router; 