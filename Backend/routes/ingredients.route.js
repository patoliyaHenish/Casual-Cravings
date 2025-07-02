import express from 'express';
import isAuthenticated from '../middlewares/auth.middleware.js';
import { checkRole, validate } from '../utils/helper.js';
import { addIngredientValidation } from '../validations/ingredientsValidations.js';
import { addNewIngredient, deleteIngredientById, getAllIngredients, getIngredientById, updateIngredient } from '../controllers/indegredients.controller.js';

const router = express.Router();

router.post('/add-new-ingredient', isAuthenticated, checkRole(['admin']), validate(addIngredientValidation), addNewIngredient);
router.put('/update-ingredient', isAuthenticated, checkRole(['admin']), validate(addIngredientValidation), updateIngredient);
router.post('/get-ingredient', isAuthenticated, checkRole(['admin']), getIngredientById);
router.delete('/delete-ingredient', isAuthenticated, checkRole(['admin']), deleteIngredientById);
router.get('/get-all-ingredients', isAuthenticated, checkRole(['admin']), getAllIngredients);

export default router;