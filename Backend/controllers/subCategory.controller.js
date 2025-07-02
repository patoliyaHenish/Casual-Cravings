import { pool } from "../config/db.js";
import { checkRecipeCategoryExistsByIdQuery, checkRecipeCategoryExistsQuery } from "../query/recipe category/recipeCategory.js";
import { checkRecipeSubCategoryExistsQuery, countAllRecipeSubCategoriesQuery, deleteRecipeSubCategoryQuery, getAllRecipeSubCategoriesQuery, insertRecipeSubCategoryQuery, updateRecipeSubCategoryQuery } from "../query/sub category/subCategory.js"
import { uploadToClodinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";
import { deleteCloudinaryImageByUrl, safeDeleteLocalFile, uploadImageAndCleanup } from "../utils/helper.js";

export const createRecipeSubCategory = async (req, res) => {
    let imagePath = null;
    try {
        const { categoryId, name, description } = req.body;

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

        let imageUrl = null;

        if (req.files && req.files.recipeSubCategoryProfileImage && req.files.recipeSubCategoryProfileImage.length > 0) {
            imagePath = req.files.recipeSubCategoryProfileImage[0].path;
            imageUrl = await uploadImageAndCleanup(imagePath, 'recipe_sub_category_images', uploadToClodinary);
        }

        const insertResult = await pool.query(
            insertRecipeSubCategoryQuery,
            [parsedCategoryId, name.trim(), description || null, imageUrl || null]
        );

        if (insertResult.rowCount === 0) {
            return handleValidationError(res, "Failed to create sub-category", 500);
        }

        return res.status(201).json({
            success: true,
            message: "Recipe sub-category created successfully",
        });
    } catch (error) {
        console.error("Error creating recipe sub-category:", error);
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};

export const updateRecipeSubCategory = async (req, res) => {
    let imagePath = null;
    try {
        const { subCategoryId, categoryId, name, description } = req.body;
        console.log("Received data:", req.body);

        const parsedCategoryId = parseInt(categoryId, 10);
        const parsedSubCategoryId = parseInt(subCategoryId, 10);
        console.log("Parsed IDs:", { parsedCategoryId, parsedSubCategoryId });

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

        let imageUrl = checkSubCategoryResult.rows[0]?.image || null;

        if (req.files && req.files.recipeSubCategoryProfileImage && req.files.recipeSubCategoryProfileImage.length > 0) {
            imagePath = req.files.recipeSubCategoryProfileImage[0].path;
            await deleteCloudinaryImageByUrl(imageUrl, 'recipe_sub_category_images', deleteFromCloudinary);
            imageUrl = await uploadImageAndCleanup(imagePath, 'recipe_sub_category_images', uploadToClodinary);
        }

        const updateResult = await pool.query(
            updateRecipeSubCategoryQuery,
            [name.trim(), description, imageUrl, parsedCategoryId, parsedSubCategoryId]
        );

        if (updateResult.rowCount === 0) {
            return handleValidationError(res, "Failed to update sub-category", 500);
        }

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category updated successfully",
            data: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Error updating recipe sub-category:", error);
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

        const imageUrl = subCategoryResult.rows[0]?.image || null;

        const deleteResult = await pool.query(deleteRecipeSubCategoryQuery, [parsedSubCategoryId]);

        if (deleteResult.rowCount === 0) {
            return handleValidationError(res, "Failed to delete sub-category", 500);
        }

        if (imageUrl) {
            await deleteCloudinaryImageByUrl(imageUrl, 'recipe_sub_category_images', deleteFromCloudinary);
        }

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting recipe sub-category:", error);
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
        console.error("Error fetching all recipe sub-categories:", error);
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

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error fetching recipe sub-category by ID:", error);
        return handleServerError(res, error);
    }
};