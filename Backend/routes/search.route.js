import express from 'express';
import { searchRecipes, getSearchSuggestions } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/recipes', searchRecipes);

router.get('/suggestions', getSearchSuggestions);

export default router; 