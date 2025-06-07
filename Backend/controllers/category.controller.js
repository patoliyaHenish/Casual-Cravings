import { pool } from "../config/db.js";
import { checkRecipeCategoryExistsQuery, getRecipeCategoriesCountQuery, getRecipeCategoriesQuery, insertRecipeCategoryQuery } from "../query/recipe category/recipeCategory.js";
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";

export const createRecipeCategories = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return handleValidationError(res, "Category name is required");
        }

        const checkResult = await pool.query(checkRecipeCategoryExistsQuery, [name.trim()]);

        if (checkResult.rowCount > 0) {
            return handleValidationError(res, "Category already exists", 409);
        }

        const insertResult = await pool.query(insertRecipeCategoryQuery, [name.trim(), description || null]);

        if (insertResult.rowCount === 0) {
            return handleValidationError(res, "Failed to create category", 500);
        }

        return res.status(201).json({
            success: true,
            message: "Recipe category created successfully",
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getRecipeCategories = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const countResult = await pool.query(getRecipeCategoriesCountQuery, [search || null]);
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(getRecipeCategoriesQuery, [search || null, limit, offset]);
        const categories = result.rows;

        return res.status(200).json({
            success: true,
            data: categories,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getRecipeCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleValidationError(res, "Category ID is required");
        }

        const result = await pool.query("SELECT * FROM recipe_category WHERE category_id = $1", [id]);

        if (result.rowCount === 0) {
            return handleValidationError(res, "Category not found", 404);
        }

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const deleteRecipeCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleValidationError(res, "Category ID is required");
        }

        const result = await pool.query("DELETE FROM recipe_category WHERE category_id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return handleValidationError(res, "Category not found", 404);
        }

        return res.status(200).json({
            success: true,
            message: "Recipe category deleted successfully"
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const updateRecipeCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!id) {
            return handleValidationError(res, "Category ID is required");
        }

        if (!name) {
            return handleValidationError(res, "Category name is required");
        }

        const checkResult = await pool.query(checkRecipeCategoryExistsQuery, [name.trim()]);

        if (checkResult.rowCount > 0 && checkResult.rows[0].category_id !== parseInt(id)) {
            return handleValidationError(res, "Category already exists", 409);
        }

        const updateResult = await pool.query(
            "UPDATE recipe_category SET name = $1, description = $2 WHERE category_id = $3 RETURNING *",
            [name.trim(), description || null, id]
        );

        if (updateResult.rowCount === 0) {
            return handleValidationError(res, "Failed to update category", 500);
        }

        // Remove category_id from the response
        const { category_id, ...categoryWithoutId } = updateResult.rows[0];

        return res.status(200).json({
            success: true,
            message: "Recipe category updated successfully",
            data: categoryWithoutId
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};