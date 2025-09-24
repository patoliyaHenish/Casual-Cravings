import { pool } from "../config/db.js";
import { checkRecipeCategoryExistsByIdQuery, checkRecipeCategoryExistsQuery } from "../query/recipeCategory.js";
import { checkRecipeSubCategoryExistsQuery, countAllRecipeSubCategoriesQuery, deleteRecipeSubCategoryQuery, getAllRecipeSubCategoriesQuery, insertRecipeSubCategoryQuery, updateRecipeSubCategoryQuery } from "../query/subCategory.js"
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";
import { insertFileStorage } from "../query/fileStorage.js";

export const createRecipeSubCategory = async (req, res) => {
    try {
        const { categoryId, name, description, imageData } = req.body;

        const parsedCategoryId = parseInt(categoryId, 10);
        if (!parsedCategoryId || isNaN(parsedCategoryId)) {
            return handleValidationError(res, "Category ID must be a valid integer");
        }

        if (!name) {
            return handleValidationError(res, "Sub-category name is required");
        }

        if (!description || description.length < 10) {
            return handleValidationError(res, "Sub-category description must be at least 10 characters");
        }

        const checkCategoryResult = await pool.query(checkRecipeCategoryExistsByIdQuery, [parsedCategoryId]);

        if (checkCategoryResult.rowCount === 0) {
            return handleValidationError(res, "Category does not exist", 404);
        }

        const checkSubCategoryResult = await pool.query(
            "SELECT * FROM recipe_sub_category WHERE LOWER(name) = LOWER($1) AND category_id = $2",
            [name.trim(), parsedCategoryId]
        );

        if (checkSubCategoryResult.rowCount > 0) {
            return handleValidationError(res, "Sub-category already exists", 409);
        }

        const insertResult = await pool.query(
            insertRecipeSubCategoryQuery,
            [parsedCategoryId, name.trim(), description || null, null]
        );

        if (insertResult.rowCount === 0) {
            return handleValidationError(res, "Failed to create sub-category", 500);
        }

        const subCategoryId = insertResult.rows[0].sub_category_id;

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            try {
                const imageBuffer = Buffer.from(imageData.image_data, 'base64');

                const fileStorageResult = await pool.query(
                    insertFileStorage,
                    [
                        'recipe_sub_category',
                        subCategoryId,
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
            message: "Recipe sub-category created successfully",
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};

export const updateRecipeSubCategory = async (req, res) => {
    try {
        const { subCategoryId, categoryId, name, description, imageData } = req.body;

        const parsedCategoryId = parseInt(categoryId, 10);
        const parsedSubCategoryId = parseInt(subCategoryId, 10);

        if (!parsedSubCategoryId || isNaN(parsedSubCategoryId)) {
            return handleValidationError(res, "Sub-category ID must be a valid integer");
        }
        if (!parsedCategoryId || isNaN(parsedCategoryId)) {
            return handleValidationError(res, "Category ID must be a valid integer");
        }
        if (!name) {
            return handleValidationError(res, "Sub-category name is required");
        }
        if (!description || description.length < 10) {
            return handleValidationError(res, "Sub-category description must be at least 10 characters");
        }

        const checkCategoryResult = await pool.query(checkRecipeCategoryExistsByIdQuery, [parsedCategoryId]);
        if (checkCategoryResult.rowCount === 0) {
            return handleValidationError(res, "Category does not exist", 404);
        }

        const checkSubCategoryResult = await pool.query(checkRecipeSubCategoryExistsQuery, [parsedSubCategoryId]);
        if (checkSubCategoryResult.rowCount === 0) {
            return handleValidationError(res, "Sub-category does not exist", 404);
        }

        const updateResult = await pool.query(
            updateRecipeSubCategoryQuery,
            [name.trim(), description, null, parsedCategoryId, parsedSubCategoryId]
        );

        if (updateResult.rowCount === 0) {
            return handleValidationError(res, "Failed to update sub-category", 500);
        }

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            await pool.query("DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2", ['recipe_sub_category', parsedSubCategoryId]);

            try {
                const imageBuffer = Buffer.from(imageData.image_data, 'base64');

                const fileStorageResult = await pool.query(
                    insertFileStorage,
                    [
                        'recipe_sub_category',
                        parsedSubCategoryId,
                        imageData.filename,
                        imageData.mime_type,
                        imageBuffer
                    ]
                );

            } catch (err) {
            }
        }

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category updated successfully",
            data: updateResult.rows[0]
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};

export const deleteRecipeSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.body;
        const parsedSubCategoryId = parseInt(subCategoryId, 10);

        if (!parsedSubCategoryId || isNaN(parsedSubCategoryId)) {
            return handleValidationError(res, "Sub-category ID must be a valid integer");
        }

        const subCategoryResult = await pool.query(checkRecipeSubCategoryExistsQuery, [parsedSubCategoryId]);

        if (subCategoryResult.rowCount === 0) {
            return handleValidationError(res, "Sub-category does not exist", 404);
        }

        await pool.query("DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2", ['recipe_sub_category', parsedSubCategoryId]);

        const deleteResult = await pool.query(deleteRecipeSubCategoryQuery, [parsedSubCategoryId]);

        if (deleteResult.rowCount === 0) {
            return handleValidationError(res, "Failed to delete sub-category", 500);
        }

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category deleted successfully"
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getAllRecipeSubCategorieDetails = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        if (isNaN(parsedLimit) || isNaN(parsedPage) || parsedLimit < 1 || parsedPage < 1) {
            return handleValidationError(res, "Invalid pagination parameters");
        }
        const offset = (parsedPage - 1) * parsedLimit;

        const countResult = await pool.query(
            countAllRecipeSubCategoriesQuery,
            [search || null]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            getAllRecipeSubCategoriesQuery,
            [search || null, parsedLimit, offset]
        );
        const subCategories = result.rows;

        for (let subCategory of subCategories) {
            try {
                const imageResult = await pool.query(
                    'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 ORDER BY id DESC LIMIT 1',
                    ['recipe_sub_category', subCategory.sub_category_id]
                );
                
                if (imageResult.rows.length > 0) {
                    const imageData = imageResult.rows[0];
                    const base64 = imageData.image_data.toString('base64');
                    subCategory.image = `data:${imageData.mime_type};base64,${base64}`;
                }
            } catch (err) {
            }
        }

        return res.status(200).json({
            success: true,
            data: subCategories,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages: Math.ceil(total / parsedLimit)
            }
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getRecipeSubCategoryById = async (req, res) => {
    try {
        const { subCategoryId } = req.body;
        const parsedSubCategoryId = parseInt(subCategoryId, 10);

        if (!parsedSubCategoryId || isNaN(parsedSubCategoryId)) {
            return handleValidationError(res, "Sub-category ID must be a valid integer");
        }

        const result = await pool.query(
            `SELECT sc.*, c.name AS category_name
             FROM recipe_sub_category sc
             JOIN recipe_category c ON sc.category_id = c.category_id
             WHERE sc.sub_category_id = $1`,
            [parsedSubCategoryId]
        );

        if (result.rowCount === 0) {
            return handleValidationError(res, "Sub-category not found", 404);
        }

        const subCategory = result.rows[0];

        try {
            const imageResult = await pool.query(
                'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 ORDER BY id DESC LIMIT 1',
                ['recipe_sub_category', subCategory.sub_category_id]
            );
            
            if (imageResult.rows.length > 0) {
                const imageData = imageResult.rows[0];
                const base64 = imageData.image_data.toString('base64');
                subCategory.image = `data:${imageData.mime_type};base64,${base64}`;
            }
        } catch (err) {
        }

        return res.status(200).json({
            success: true,
            data: subCategory
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};