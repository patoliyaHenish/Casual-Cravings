import { pool } from "../config/db.js";
import { checkRecipeCategoryExistsQuery, getRecipeCategoriesCountQuery, getRecipeCategoriesQuery, insertRecipeCategoryQuery, updateRecipeCategoryQuery } from "../query/recipeCategory.js";
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";
import { insertFileStorage } from "../query/fileStorage.js";

export const createRecipeCategory = async (req, res) => {
    try {
        const { name, description, imageData } = req.body;

        if (!name) {
            return handleValidationError(res, "Category name is required");
        }

        if (name.length < 2 || name.length > 100) {
            return handleValidationError(res, "Category name must be between 2 and 100 characters");
        }

        const checkResult = await pool.query(checkRecipeCategoryExistsQuery, [name.trim()]);

        if (checkResult.rowCount > 0) {
            return handleValidationError(res, "Category already exists", 409);
        }

        const insertResult = await pool.query(insertRecipeCategoryQuery, [name.trim(), description || null, null]);

        if (insertResult.rowCount === 0) {
            return handleValidationError(res, "Failed to create category", 500);
        }

        const categoryId = insertResult.rows[0].category_id;

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            try {
                const imageBuffer = Buffer.from(imageData.image_data, 'base64');

                const fileStorageResult = await pool.query(
                    insertFileStorage,
                    [
                        'recipe_category',
                        categoryId,
                        imageData.filename,
                        imageData.mime_type,
                        imageBuffer
                    ]
                );

            } catch (err) {
            }
        }

        return res.status(201).json({
            success: true,
            message: "Recipe category created successfully",
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
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

        for (let category of categories) {
            try {
                const imageResult = await pool.query(
                    'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 ORDER BY id DESC LIMIT 1',
                    ['recipe_category', category.category_id]
                );
                
                if (imageResult.rows.length > 0) {
                    const imageData = imageResult.rows[0];
                    const base64 = imageData.image_data.toString('base64');
                    category.image = `data:${imageData.mime_type};base64,${base64}`;
                }
            } catch (err) {
            }
        }

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

        const category = result.rows[0];

        try {
            const imageResult = await pool.query(
                'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 ORDER BY id DESC LIMIT 1',
                ['recipe_category', category.category_id]
            );
            
            if (imageResult.rows.length > 0) {
                const imageData = imageResult.rows[0];
                const base64 = imageData.image_data.toString('base64');
                category.image = `data:${imageData.mime_type};base64,${base64}`;
            }
        } catch (err) {
        }

        return res.status(200).json({
            success: true,
            data: category
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

        const categoryResult = await pool.query("SELECT category_id FROM recipe_category WHERE category_id = $1", [id]);
        if (categoryResult.rowCount === 0) {
            return handleValidationError(res, "Category not found", 404);
        }

        await pool.query("DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2", ['recipe_category', id]);

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
        const { name, description, imageData } = req.body;

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
            updateRecipeCategoryQuery,
            [name.trim(), description || null, null, id]
        );

        if (updateResult.rowCount === 0) {
            return handleValidationError(res, "Failed to update category", 500);
        }

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            await pool.query("DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2", ['recipe_category', id]);

            try {
                const imageBuffer = Buffer.from(imageData.image_data, 'base64');

                const fileStorageResult = await pool.query(
                    insertFileStorage,
                    [
                        'recipe_category',
                        id,
                        imageData.filename,
                        imageData.mime_type,
                        imageBuffer
                    ]
                );

            } catch (err) {
            }
        }

        const { category_id, ...categoryWithoutId } = updateResult.rows[0];

        return res.status(200).json({
            success: true,
            message: "Recipe category updated successfully",
            data: categoryWithoutId
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};