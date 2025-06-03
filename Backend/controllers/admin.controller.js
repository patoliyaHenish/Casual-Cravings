import { handleServerError, handleValidationError } from "../utils/erroHandler.js";

export const createRecipeCategories = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return handleValidationError(res, "Category name is required");
        }

        const checkQuery = 'SELECT * FROM recipe_category WHERE name = $1';
        const checkResult = await pool.query(checkQuery, [name.trim()]);

        if (checkResult.rowCount > 0) {
            return handleValidationError(res, "Category already exists", 409);
        }

        const insertQuery = `
            INSERT INTO recipe_category (name, description)
            VALUES ($1, $2)
            RETURNING *;
        `;

        const insertResult = await pool.query(insertQuery, [name.trim(), description || null]);

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
}