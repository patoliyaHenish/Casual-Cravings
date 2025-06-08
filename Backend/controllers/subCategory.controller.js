import {
    handleNotFoundError,
    handleServerError,
    handleValidationError,
} from "../utils/erroHandler.js";
import { pool } from "../config/db.js";
import {
    checkCategoryExistsQuery,
    checkSubCategoryByIdAndCategoryQuery,
    checkSubCategoryExistsQuery,
    deleteSubCategoryByIdQuery,
    getSubCategoriesByCategoryQuery,
    getSubCategoryImageByIdAndCategoryQuery,
    insertSubCategoryQuery,
    updateSubCategoryQuery,
} from "../query/sub category/subCategory.js";
import {
    uploadToClodinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { deleteCloudinaryImageByUrl, safeDeleteLocalFile, uploadImageAndCleanup } from "../utils/helper.js";

export const createRecipeSubCategory = async (req, res) => {
    let imagePath = null;
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;

        if (!name || !categoryId) {
            return handleValidationError(
                res,
                "Sub-category name and category ID are required"
            );
        }

        const categoryCheckResult = await pool.query(checkCategoryExistsQuery, [
            categoryId,
        ]);
        if (categoryCheckResult.rowCount === 0) {
            return handleValidationError(res, "Category does not exist", 404);
        }

        const checkResult = await pool.query(checkSubCategoryExistsQuery, [
            name.trim(),
            categoryId,
        ]);

        if (checkResult.rowCount > 0) {
            return handleValidationError(res, "Sub-category already exists", 409);
        }

        let imageUrl = null;

        if (
            req.files &&
            req.files.recipeSubCategoryProfileImage &&
            req.files.recipeSubCategoryProfileImage.length > 0
        ) {
            imagePath = req.files.recipeSubCategoryProfileImage[0].path;
            imageUrl = await uploadImageAndCleanup(imagePath, "recipe_sub_category_images", uploadToClodinary);
        }

        const insertResult = await pool.query(insertSubCategoryQuery, [
            name.trim(),
            description,
            categoryId,
            imageUrl,
        ]);

        if (insertResult.rowCount === 0) {
            return handleValidationError(res, "Failed to create sub-category", 500);
        }

        const {
            name: subName,
            description: subDescription,
            image,
        } = insertResult.rows[0];

        return res.status(201).json({
            success: true,
            message: "Recipe sub-category created successfully",
            data: {
                name: subName,
                description: subDescription,
                image: image || null,
            },
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};

export const getParticularRecipeAllSubCategories = async (req, res) => {
    try {
        const categoryId = req.params.id;

        if (!categoryId) {
            return handleValidationError(res, "Category ID is required");
        }

        const categoryCheckResult = await pool.query(checkCategoryExistsQuery, [
            categoryId,
        ]);
        if (categoryCheckResult.rowCount === 0) {
            return handleNotFoundError(res, "Category does not exist");
        }

        const result = await pool.query(getSubCategoriesByCategoryQuery, [
            categoryId,
        ]);

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const deleteRecipeSubCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const subCategoryId = req.params.subCategoryId;

        if (!categoryId || !subCategoryId) {
            return handleValidationError(
                res,
                "Category ID and Sub-category ID are required"
            );
        }

        const checkResult = await pool.query(checkSubCategoryByIdAndCategoryQuery, [
            subCategoryId,
            categoryId,
        ]);

        if (checkResult.rowCount === 0) {
            return handleNotFoundError(
                res,
                "Sub-category does not exist for this category"
            );
        }

        const deleteResult = await pool.query(deleteSubCategoryByIdQuery, [
            subCategoryId,
            categoryId,
        ]);
        if (deleteResult.rowCount === 0) {
            return handleValidationError(res, "Failed to delete sub-category", 500);
        }

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category deleted successfully",
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getSubCategoryById = async (req, res) => {
    try {
        const { subCategoryId, categoryId } = req.params;

        if (!subCategoryId || !categoryId) {
            return handleValidationError(
                res,
                "Sub-category ID and Category ID are required"
            );
        }

        const checkResult = await pool.query(checkSubCategoryByIdAndCategoryQuery, [
            subCategoryId,
            categoryId,
        ]);

        if (checkResult.rowCount === 0) {
            return handleNotFoundError(
                res,
                "Sub-category does not exist for this category"
            );
        }

        return res.status(200).json({
            success: true,
            data: checkResult.rows[0],
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const updateRecipeSubCategoryById = async (req, res) => {
    try {
        const { id: categoryId, subCategoryId } = req.params;

        const { name, description } = req.body;

        if (!categoryId || !subCategoryId) {
            return handleValidationError(
                res,
                "Category ID and Sub-category ID are required"
            );
        }

        if (!name || !description) {
            return handleValidationError(
                res,
                "Sub-category name and description are required"
            );
        }

        const categoryCheckResult = await pool.query(checkCategoryExistsQuery, [
            categoryId,
        ]);

        if (categoryCheckResult.rowCount === 0) {
            return handleNotFoundError(res, "Category does not exist");
        }

        const checkResult = await pool.query(checkSubCategoryByIdAndCategoryQuery, [
            subCategoryId,
            categoryId,
        ]);

        if (checkResult.rowCount === 0) {
            return handleNotFoundError(
                res,
                "Sub-category does not exist for this category"
            );
        }

        const currentSubCategory = await pool.query(
            getSubCategoryImageByIdAndCategoryQuery,
            [subCategoryId, categoryId]
        );

        let imagePath = null;
        let imageUrl = currentSubCategory.rows[0]?.image || null;

        if (
            req.files &&
            req.files.recipeSubCategoryProfileImage &&
            req.files.recipeSubCategoryProfileImage.length > 0
        ) {
            imagePath = req.files.recipeSubCategoryProfileImage[0].path;
            await deleteCloudinaryImageByUrl(imageUrl, "recipe_sub_category_images", deleteFromCloudinary);
            imageUrl = await uploadImageAndCleanup(imagePath, "recipe_sub_category_images", uploadToClodinary);
        }

        const updateResult = await pool.query(
            updateSubCategoryQuery,
            [name.trim(), description, imageUrl, subCategoryId, categoryId]
        );

        if (updateResult.rowCount === 0) {
            return handleValidationError(res, "Failed to update sub-category", 500);
        }

        const {
            name: updatedName,
            description: updatedDescription,
            image,
        } = updateResult.rows[0];

        return res.status(200).json({
            success: true,
            message: "Recipe sub-category updated successfully",
            data: {
                name: updatedName,
                description: updatedDescription,
                image: image || null,
            },
        });
    } catch (error) {
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error);
    }
};