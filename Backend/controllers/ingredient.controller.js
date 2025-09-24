import { pool } from "../config/db.js";
import { handleServerError, handleValidationError, handleNotFoundError } from "../utils/erroHandler.js";
import {
    insertIngredientQuery,
    getIngredientByIdQuery,
    getIngredientByNameQuery,
    searchIngredientsQuery,
    searchIngredientsExcludingQuery,
    getAllIngredientsQuery,
    getAllIngredientsExcludingQuery
} from "../query/ingredient.js";
import {
    insertRecipeIngredientQuery,
    getRecipeIngredientsQuery,
    deleteRecipeIngredientsQuery,
    updateRecipeIngredientQuery,
    deleteRecipeIngredientQuery
} from "../query/recipeIngredient.js";

export const createIngredient = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return handleValidationError(res, "Ingredient name is required");
        }

        const trimmedName = name.trim();

        const existingIngredient = await pool.query(getIngredientByNameQuery, [trimmedName]);
        if (existingIngredient.rowCount > 0) {
            return handleValidationError(res, "Ingredient already exists");
        }

        const result = await pool.query(insertIngredientQuery, [trimmedName]);

        return res.status(201).json({
            success: true,
            message: "Ingredient created successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const searchIngredients = async (req, res) => {
    try {
        const { query = '', exclude = '' } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        let result;
        if (exclude && exclude.trim()) {
            const excludeIds = exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (excludeIds.length > 0) {
                result = await pool.query(searchIngredientsExcludingQuery, [`%${query.trim()}%`, excludeIds]);
            } else {
                result = await pool.query(searchIngredientsQuery, [`%${query.trim()}%`]);
            }
        } else {
            result = await pool.query(searchIngredientsQuery, [`%${query.trim()}%`]);
        }

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getAllIngredients = async (req, res) => {
    try {
        const { exclude = '' } = req.query;

        let result;
        if (exclude && exclude.trim()) {
            const excludeIds = exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (excludeIds.length > 0) {
                result = await pool.query(getAllIngredientsExcludingQuery, [excludeIds]);
            } else {
                result = await pool.query(getAllIngredientsQuery);
            }
        } else {
            result = await pool.query(getAllIngredientsQuery);
        }

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getIngredientById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleValidationError(res, "Ingredient ID is required");
        }

        const result = await pool.query(getIngredientByIdQuery, [id]);

        if (result.rowCount === 0) {
            return handleNotFoundError(res, "Ingredient not found");
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getRecipeIngredients = async (req, res) => {
    try {
        const { recipeId } = req.params;

        if (!recipeId) {
            return handleValidationError(res, "Recipe ID is required");
        }

        const result = await pool.query(getRecipeIngredientsQuery, [recipeId]);

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const addIngredientToRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { ingredient_id, quantity, unit } = req.body;

        if (!recipeId) {
            return handleValidationError(res, "Recipe ID is required");
        }

        if (!ingredient_id) {
            return handleValidationError(res, "Ingredient ID is required");
        }

        if (!quantity || quantity <= 0) {
            return handleValidationError(res, "Valid quantity is required");
        }

        if (!unit || unit.trim().length === 0) {
            return handleValidationError(res, "Unit is required");
        }

        const ingredientResult = await pool.query(getIngredientByIdQuery, [ingredient_id]);
        if (ingredientResult.rowCount === 0) {
            return handleNotFoundError(res, "Ingredient not found");
        }

        const existingResult = await pool.query(
            "SELECT * FROM recipe_ingredient WHERE recipe_id = $1 AND ingredient_id = $2",
            [recipeId, ingredient_id]
        );

        if (existingResult.rowCount > 0) {
            return handleValidationError(res, "Ingredient is already added to this recipe");
        }

        const result = await pool.query(insertRecipeIngredientQuery, [
            recipeId,
            ingredient_id,
            quantity,
            unit.trim()
        ]);

        return res.status(201).json({
            success: true,
            message: "Ingredient added to recipe successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const updateRecipeIngredient = async (req, res) => {
    try {
        const { recipeIngredientId } = req.params;
        const { quantity, unit } = req.body;

        if (!recipeIngredientId) {
            return handleValidationError(res, "Recipe ingredient ID is required");
        }

        if (!quantity || quantity <= 0) {
            return handleValidationError(res, "Valid quantity is required");
        }

        if (!unit || unit.trim().length === 0) {
            return handleValidationError(res, "Unit is required");
        }

        const result = await pool.query(updateRecipeIngredientQuery, [
            quantity,
            unit.trim(),
            recipeIngredientId
        ]);

        if (result.rowCount === 0) {
            return handleNotFoundError(res, "Recipe ingredient not found");
        }

        return res.status(200).json({
            success: true,
            message: "Recipe ingredient updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const removeIngredientFromRecipe = async (req, res) => {
    try {
        const { recipeIngredientId } = req.params;

        if (!recipeIngredientId) {
            return handleValidationError(res, "Recipe ingredient ID is required");
        }

        const result = await pool.query(deleteRecipeIngredientQuery, [recipeIngredientId]);

        if (result.rowCount === 0) {
            return handleNotFoundError(res, "Recipe ingredient not found");
        }

        return res.status(200).json({
            success: true,
            message: "Ingredient removed from recipe successfully"
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Ingredient ID is required' });
    }
    const result = await pool.query('DELETE FROM ingredient WHERE ingredient_id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    return res.status(200).json({ success: true, message: 'Ingredient deleted successfully' });
  } catch (error) {
    return handleServerError(res, error);
  }
};

export const getIngredientsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      'SELECT * FROM ingredient ORDER BY name LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    return handleServerError(res, error);
  }
}; 