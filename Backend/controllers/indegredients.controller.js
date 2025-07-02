import { pool } from "../config/db.js";
import { checkIngredientExistsForUpdateQuery, checkIngredientExistsQuery, countAllIngredientsQuery, deleteIngredientByIdQuery, getAllIngredientsQuery, getIngredientByIdQuery, insertIngredientQuery, updateIngredientQuery } from "../query/ingredients/indegredients.js";
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";

export const addNewIngredient = async (req, res) => {
    try {
        const { name, description, uses, substitutes } = req.body;

        if (!name || !description || !uses || !substitutes) {
            return handleValidationError(res, "All fields are required");
        }

        const exists = await pool.query(checkIngredientExistsQuery, [name]);

        if (exists.rowCount > 0) {
            return handleValidationError(res, "Ingredient already exists", 409);
        }

        const result = await pool.query(insertIngredientQuery, [name, description, uses, substitutes]);

        if (result.rowCount === 0) {
            return handleServerError(res, "Failed to add ingredient");
        }

        return res.status(201).json({
            success: true,
            message: "Ingredient added successfully",
            data: result.rows[0],
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to add ingredient");
    }
};

export const updateIngredient = async (req, res) => {
    try {
        const { ingredientId, name, description, uses, substitutes } = req.body;

        if (!ingredientId || !name || !description || !uses || !substitutes) {
            return handleValidationError(res, "All fields are required");
        }

        const exists = await pool.query(checkIngredientExistsForUpdateQuery, [name, ingredientId]);

        if (exists.rowCount > 0) {
            return handleValidationError(res, "Ingredient already exists", 409);
        }

        const result = await pool.query(updateIngredientQuery, [name, description, uses, substitutes, ingredientId]);

        if (result.rowCount === 0) {
            return handleServerError(res, "Ingredient not found or update failed");
        }

        return res.status(200).json({
            success: true,
            message: "Ingredient updated successfully",
            data: result.rows[0],
        });
     } catch (error) {
        console.error("Error updating ingredient:", error);
        return handleServerError(res, error, "Failed to update ingredient");
    }
};

export const getAllIngredients = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);

        if (isNaN(parsedLimit) || isNaN(parsedPage) || parsedLimit < 1 || parsedPage < 1) {
            return handleValidationError(res, "Invalid pagination parameters");
        }

        const offset = (parsedPage - 1) * parsedLimit;

        const countResult = await pool.query(
            countAllIngredientsQuery,
            [search || null]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            getAllIngredientsQuery,
            [search || null, parsedLimit, offset]
        );
        const ingredients = result.rows;

        return res.status(200).json({
            success: true,
            data: ingredients,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to fetch ingredients");
    }
};

export const getIngredientById = async (req, res) => {
    try {
        const { ingredientId } = req.body;

        if (!ingredientId) {
            return handleValidationError(res, "Ingredient ID is required");
        }

        const result = await pool.query(getIngredientByIdQuery, [ingredientId]);

        if (result.rowCount === 0) {
            return handleValidationError(res, "Ingredient not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Ingredient fetched successfully",
            data: result.rows[0],
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to fetch ingredient");
    }
};

export const deleteIngredientById = async (req, res) => {
    try {
        const { ingredientId } = req.body;

        if (!ingredientId) {
            return handleValidationError(res, "Ingredient ID is required");
        }

        const result = await pool.query(deleteIngredientByIdQuery, [ingredientId]);

        if (result.rowCount === 0) {
            return handleValidationError(res, "Ingredient not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Ingredient deleted successfully",
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to delete ingredient");
    }
};