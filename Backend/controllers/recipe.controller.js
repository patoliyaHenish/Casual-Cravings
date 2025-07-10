import { pool } from "../config/db.js";
import { handleServerError, handleValidationError, handleNotFoundError } from "../utils/erroHandler.js";
import { checkRecipeTitleExistsQuery, getAllRecipesCountQuery, getAllRecipesQuery, insertRecipeQuery, selectRecipeByIdQuery, updateRecipeInstructionsQuery, deleteRecipeQuery, updateRecipeQuery } from "../query/recipe/recipe.js";
import { checkRecipeSubCategoryExistsQuery, checkSubCategoryExistsQuery, checkSubCategoriesExistForCategoryQuery } from "../query/sub category/subCategory.js";
import { getYouTubeThumbnail, safeDeleteLocalFile, uploadImageAndCleanup } from "../utils/helper.js";
import { checkRecipeCategoryExistsByIdQuery } from "../query/recipe category/recipeCategory.js";
import { insertRecipeInstructionQuery, getRecipeInstructionsByRecipeIdQuery } from "../query/recipe instruction/recipeInstruction.js";
import { checkIngredientsExistByIdsQuery } from "../query/ingredients/indegredients.js";
import { uploadToClodinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const createRecipeByAdmin = async (req, res) => {
    let imagePath = null;
    try {
        const {
            category_id,
            sub_category_id,
            title,
            description,
            video_url,
            image_url,
            prep_time,
            cook_time,
            serving_size,
            ingredients_id,
            ingredient_unit,
            ingredient_quantity,
            recipe_instructions
        } = req.body;

        const user_id = req.user.userId;

        let final_image_url = image_url || null;
        let parsed_ingredients_id = ingredients_id;
        let parsed_ingredient_unit = ingredient_unit;
        let parsed_ingredient_quantity = ingredient_quantity;
        let parsed_recipe_instructions = recipe_instructions;

        try {
            if (typeof ingredients_id === "string") {
                parsed_ingredients_id = JSON.parse(ingredients_id);
            }

            if (typeof ingredient_unit === "string") {
                parsed_ingredient_unit = JSON.parse(ingredient_unit);
            }

            if (typeof ingredient_quantity === "string") {
                parsed_ingredient_quantity = JSON.parse(ingredient_quantity);
            }

            if (typeof recipe_instructions === "string") {
                parsed_recipe_instructions = JSON.parse(recipe_instructions);
            }

            if (!Array.isArray(parsed_ingredients_id) || parsed_ingredients_id.length === 0) {
                return handleValidationError(res, "Ingredients must be a non-empty array");
            }

            if (!Array.isArray(parsed_ingredient_unit) || parsed_ingredient_unit.length === 0) {
                return handleValidationError(res, "Ingredient units must be a non-empty array");
            }

            if (!Array.isArray(parsed_ingredient_quantity) || parsed_ingredient_quantity.length === 0) {
                return handleValidationError(res, "Ingredient quantities must be a non-empty array");
            }
        } catch (error) {
            return handleValidationError(res, "Invalid JSON format for ingredients, units, quantities or instructions");
        }

        if (
            !Array.isArray(parsed_ingredients_id) ||
            !Array.isArray(parsed_ingredient_unit) ||
            !Array.isArray(parsed_ingredient_quantity) ||
            parsed_ingredients_id.length !== parsed_ingredient_unit.length ||
            parsed_ingredients_id.length !== parsed_ingredient_quantity.length ||
            parsed_ingredients_id.length === 0
        ) {
            return handleValidationError(res, "Ingredients, units, and quantities must be non-empty arrays of the same length");
        }

        for (let i = 0; i < parsed_ingredients_id.length; i++) {
            if (
                parsed_ingredients_id[i] === undefined ||
                parsed_ingredients_id[i] === null ||
                isNaN(Number(parsed_ingredients_id[i])) ||
                !parsed_ingredient_unit[i] ||
                typeof parsed_ingredient_unit[i] !== "string" ||
                parsed_ingredient_unit[i].trim().length === 0 ||
                parsed_ingredient_quantity[i] === undefined ||
                parsed_ingredient_quantity[i] === null ||
                (typeof parsed_ingredient_quantity[i] !== "string" && typeof parsed_ingredient_quantity[i] !== "number") ||
                parsed_ingredient_quantity[i].toString().trim().length === 0
            ) {
                return handleValidationError(res, `Invalid ingredient/unit/quantity at index ${i + 1}`);
            }
        }

        if (category_id) {
            const categoryResult = await pool.query(checkRecipeCategoryExistsByIdQuery, [category_id]);
            if (categoryResult.rowCount === 0) {
                return handleNotFoundError(res, "Category not found");
            }

            const subCategoriesResult = await pool.query(checkSubCategoriesExistForCategoryQuery, [category_id]);
            const subCategoriesExist = parseInt(subCategoriesResult.rows[0].count) > 0;

            if (subCategoriesExist && !sub_category_id) {
                return handleValidationError(res, "Sub-category is required for this category");
            }

            if (!subCategoriesExist && sub_category_id && sub_category_id !== null && sub_category_id !== 'null' && sub_category_id !== 0) {
                return handleValidationError(res, "No sub-categories exist for this category");
            }
        }

        if (sub_category_id && sub_category_id !== null && sub_category_id !== 'null' && sub_category_id !== 0) {
            const subCategoryResult = await pool.query(checkRecipeSubCategoryExistsQuery, [sub_category_id]);
            if (subCategoryResult.rowCount === 0) {
                return handleNotFoundError(res, "Sub-category not found");
            }
        }

        if (category_id && sub_category_id && sub_category_id !== null && sub_category_id !== 'null' && sub_category_id !== 0) {
            const subCatResult = await pool.query(
                checkSubCategoryExistsQuery,
                [sub_category_id, category_id]
            );
            if (subCatResult.rowCount === 0) {
                return handleValidationError(res, "Selected sub-category does not exist under the specified category");
            }
        }

        if (video_url && !image_url) {
            const thumbnailUrl = getYouTubeThumbnail(video_url);
            if (thumbnailUrl) {
                final_image_url = thumbnailUrl;
            } else {
                return handleValidationError(res, "Invalid YouTube video URL");
            }
        }

        const { rows: ingredientRows } = await pool.query(checkIngredientsExistByIdsQuery, [parsed_ingredients_id]);
        if (ingredientRows.length !== parsed_ingredients_id.length) {
            return handleNotFoundError(res, "One or more ingredients not found");
        }

        const titleResult = await pool.query(checkRecipeTitleExistsQuery, [title]);
        if (titleResult.rowCount > 0) {
            return handleValidationError(res, "Recipe title already exists");
        }

        const parsed_prep_time = Number(prep_time);
        const parsed_cook_time = Number(cook_time);
        const parsed_serving_size = Number(serving_size);

        if (
            !Number.isInteger(parsed_prep_time) || parsed_prep_time <= 0 ||
            !Number.isInteger(parsed_cook_time) || parsed_cook_time <= 0 ||
            !Number.isInteger(parsed_serving_size) || parsed_serving_size <= 0
        ) {
            return handleValidationError(res, "Prep time, cook time, and serving size must be positive integers");
        }

        if (!Array.isArray(parsed_recipe_instructions) || parsed_recipe_instructions.length === 0) {
            return handleValidationError(res, "Recipe instructions must be a non-empty array");
        }

        if (!parsed_recipe_instructions.every(instr => typeof instr === "string" && instr.trim().length > 0)) {
            return handleValidationError(res, "Each recipe instruction must be a non-empty string");
        }

        if (req.files.recipeImage && req.files.recipeImage.length > 0) {
            imagePath = req.files.recipeImage[0].path;
            final_image_url = await uploadImageAndCleanup(imagePath, 'recipe_images', uploadToClodinary);
        }

        const dbSubCategoryId = (sub_category_id && sub_category_id !== null && sub_category_id !== 'null' && sub_category_id !== 0) ? sub_category_id : null;
        
        const recipeResult = await pool.query(
            insertRecipeQuery,
            [
                user_id,
                category_id,
                dbSubCategoryId,
                title,
                description,
                video_url,
                final_image_url,
                parsed_prep_time,
                parsed_cook_time,
                parsed_serving_size,
                parsed_ingredients_id,
                parsed_recipe_instructions,
                'approved',
                true,
                parsed_ingredient_unit,
                parsed_ingredient_quantity
            ]
        );

        if (recipeResult.rowCount === 0) {
            return handleServerError(res, "Failed to create recipe");
        }

        const recipe = recipeResult.rows[0];

        const instructionIds = [];
        for (let i = 0; i < parsed_recipe_instructions.length; i++) {
            const { rows } = await pool.query(
                insertRecipeInstructionQuery,
                [recipe.recipe_id, i + 1, parsed_recipe_instructions[i]]
            );
            instructionIds.push(rows[0].instruction_id);
        }

        await pool.query(
            updateRecipeInstructionsQuery,
            [instructionIds, recipe.recipe_id]
        );

        const updatedRecipe = await pool.query(
            selectRecipeByIdQuery,
            [recipe.recipe_id]
        );

        return res.status(201).json({
            success: true,
            message: "Recipe created successfully",
            data: updatedRecipe.rows[0],
        });
    } catch (error) {
        console.error("Error creating recipe:", error);
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error, "Failed to create recipe");
    }
};

export const getAllRecipesForAdmin = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const countResult = await pool.query(getAllRecipesCountQuery, [`%${search}%`]);
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(getAllRecipesQuery, [`%${search}%`, limit, offset]);
        const recipes = result.rows;

        return res.status(200).json({
            success: true,
            data: recipes,
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

export const getRecipeByIdForAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleValidationError(res, "Recipe ID is required");
        }

        const result = await pool.query(selectRecipeByIdQuery, [id]);

        if (result.rowCount === 0) {
            return handleValidationError(res, "Recipe not found", 404);
        }

        const recipe = result.rows[0];

        const instructionsResult = await pool.query(getRecipeInstructionsByRecipeIdQuery, [id]);
        recipe.recipe_instructions = instructionsResult.rows;

        return res.status(200).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const deleteRecipeByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return handleValidationError(res, "Recipe ID is required");
        }

        const recipeResult = await pool.query(selectRecipeByIdQuery, [id]);
        if (recipeResult.rowCount === 0) {
            return handleNotFoundError(res, "Recipe not found");
        }

        const deleteResult = await pool.query(deleteRecipeQuery, [id]);

        if (deleteResult.rowCount === 0) {
            return handleServerError(res, "Failed to delete recipe");
        }

        return res.status(200).json({
            success: true,
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return handleServerError(res, error, "Failed to delete recipe");
    }
};

export const updateRecipeByAdmin = async (req, res) => {
    let imagePath = null;
    try {
        const { id } = req.params;
        if (!id) {
            return handleValidationError(res, "Recipe ID is required");
        }
        const existingResult = await pool.query(selectRecipeByIdQuery, [id]);
        if (existingResult.rowCount === 0) {
            return handleNotFoundError(res, "Recipe not found");
        }
        const existingRecipe = existingResult.rows[0];
        let {
            category_id = existingRecipe.category_id,
            sub_category_id = existingRecipe.sub_category_id,
            title = existingRecipe.title,
            description = existingRecipe.description,
            video_url = existingRecipe.video_url,
            image_url = existingRecipe.image_url,
            prep_time = existingRecipe.prep_time,
            cook_time = existingRecipe.cook_time,
            serving_size = existingRecipe.serving_size,
            ingredients_id = existingRecipe.ingredients_id,
            ingredient_unit = existingRecipe.ingredient_unit,
            ingredient_quantity = existingRecipe.ingredient_quantity,
            recipe_instructions = existingRecipe.recipe_instructions
        } = req.body;
        try {
            if (typeof ingredients_id === "string") ingredients_id = JSON.parse(ingredients_id);
            if (typeof ingredient_unit === "string") ingredient_unit = JSON.parse(ingredient_unit);
            if (typeof ingredient_quantity === "string") ingredient_quantity = JSON.parse(ingredient_quantity);
            if (typeof recipe_instructions === "string") recipe_instructions = JSON.parse(recipe_instructions);
        } catch (error) {
            return handleValidationError(res, "Invalid JSON format for ingredients, units, quantities or instructions");
        }
        let final_image_url = image_url || existingRecipe.image_url;
        if (req.files.recipeImage && req.files.recipeImage.length > 0) {
            imagePath = req.files.recipeImage[0].path;
            if (existingRecipe.image_url && existingRecipe.image_url.includes("res.cloudinary.com")) {
                const urlParts = existingRecipe.image_url.split("/");
                const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
                await deleteFromCloudinary(publicIdWithExt);
            }
            final_image_url = await uploadImageAndCleanup(imagePath, 'recipe_images', uploadToClodinary);
        } else {
            if ((image_url === '' || image_url === null) && existingRecipe.image_url && existingRecipe.image_url.includes("res.cloudinary.com")) {
                const urlParts = existingRecipe.image_url.split("/");
                const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
                await deleteFromCloudinary(publicIdWithExt);
                final_image_url = null;
            }
            if ((image_url === '' || image_url === null) && video_url && getYouTubeThumbnail(video_url)) {
                final_image_url = getYouTubeThumbnail(video_url);
            }
        }
        const dbSubCategoryId = (sub_category_id && sub_category_id !== null && sub_category_id !== 'null' && sub_category_id !== 0) ? sub_category_id : null;
        const updateResult = await pool.query(
            updateRecipeQuery,
            [
                category_id,
                dbSubCategoryId,
                title,
                description,
                video_url,
                final_image_url,
                Number(prep_time),
                Number(cook_time),
                Number(serving_size),
                ingredients_id,
                ingredient_unit,
                ingredient_quantity,
                recipe_instructions,
                'approved',
                true,
                id
            ]
        );
        if (updateResult.rowCount === 0) {
            return handleServerError(res, "Failed to update recipe");
        }
        await pool.query('DELETE FROM recipe_instruction WHERE recipe_id = $1', [id]);
        if (Array.isArray(recipe_instructions)) {
            for (let i = 0; i < recipe_instructions.length; i++) {
                await pool.query(
                    'INSERT INTO recipe_instruction (recipe_id, step_number, instruction_text) VALUES ($1, $2, $3)',
                    [id, i + 1, recipe_instructions[i]]
                );
            }
        }
        const updatedRecipe = updateResult.rows[0];
        return res.status(200).json({
            success: true,
            message: "Recipe updated successfully",
            data: updatedRecipe,
        });
    } catch (error) {
        console.error("Error updating recipe:", error);
        await safeDeleteLocalFile(imagePath);
        return handleServerError(res, error, "Failed to update recipe");
    }
};

export const updateRecipeAdminApprovedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_approved_status } = req.body;

        if (!id) {
            return handleValidationError(res, "Recipe ID is required");
        }

        if (!admin_approved_status || !['pending', 'approved', 'rejected'].includes(admin_approved_status)) {
            return handleValidationError(res, "Admin approved status must be 'pending', 'approved', or 'rejected'");
        }

        const recipeResult = await pool.query(selectRecipeByIdQuery, [id]);
        if (recipeResult.rowCount === 0) {
            return handleNotFoundError(res, "Recipe not found");
        }

        const updateResult = await pool.query(
            'UPDATE recipe SET admin_approved_status = $1 WHERE recipe_id = $2 RETURNING *',
            [admin_approved_status, id]
        );

        if (updateResult.rowCount === 0) {
            return handleServerError(res, "Failed to update admin approved status");
        }

        return res.status(200).json({
            success: true,
            message: "Admin approved status updated successfully",
            data: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Error updating admin approved status:", error);
        return handleServerError(res, error, "Failed to update admin approved status");
    }
};

export const updateRecipePublicApprovedStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { public_approved } = req.body;

        if (!id) {
            return handleValidationError(res, "Recipe ID is required");
        }

        if (typeof public_approved !== 'boolean') {
            return handleValidationError(res, "Public approved must be a boolean value");
        }

        const recipeResult = await pool.query(selectRecipeByIdQuery, [id]);
        if (recipeResult.rowCount === 0) {
            return handleNotFoundError(res, "Recipe not found");
        }

        const updateResult = await pool.query(
            'UPDATE recipe SET public_approved = $1 WHERE recipe_id = $2 RETURNING *',
            [public_approved, id]
        );

        if (updateResult.rowCount === 0) {
            return handleServerError(res, "Failed to update public approved status");
        }

        return res.status(200).json({
            success: true,
            message: "Public approved status updated successfully",
            data: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Error updating public approved status:", error);
        return handleServerError(res, error, "Failed to update public approved status");
    }
};