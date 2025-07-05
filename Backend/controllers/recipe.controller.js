import { pool } from "../config/db.js";
import { handleServerError, handleValidationError, handleNotFoundError } from "../utils/erroHandler.js";
import { checkRecipeTitleExistsQuery, insertRecipeQuery, selectRecipeByIdQuery, updateRecipeInstructionsQuery } from "../query/recipe/recipe.js";
import { checkRecipeSubCategoryExistsQuery, checkSubCategoryExistsQuery } from "../query/sub category/subCategory.js";
import { getYouTubeThumbnail, safeDeleteLocalFile, uploadImageAndCleanup } from "../utils/helper.js";
import { checkRecipeCategoryExistsByIdQuery } from "../query/recipe category/recipeCategory.js";
import { insertRecipeInstructionQuery } from "../query/recipe instruction/recipeInstruction.js";
import { checkIngredientsExistByIdsQuery } from "../query/ingredients/indegredients.js";
import { uploadToClodinary } from "../utils/cloudinary.js";

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
            recipe_instructions
        } = req.body;

        console.log("Request body:", req.body);

        const user_id = req.user.userId;

        let final_image_url = image_url || null;
        let parsed_ingredients_id = ingredients_id;
        let parsed_recipe_instructions = recipe_instructions;

        if (
            !title ||
            !description ||
            !prep_time ||
            !cook_time ||
            !serving_size ||
            !ingredients_id ||
            !recipe_instructions
        ) {
            return handleValidationError(res, "All fields are required");
        }

        if (typeof ingredients_id === "string") {
            try {
                parsed_ingredients_id = JSON.parse(ingredients_id);
            } catch {
                return handleValidationError(res, "Invalid ingredients_id format");
            }
        }
        if (typeof recipe_instructions === "string") {
            try {
                parsed_recipe_instructions = JSON.parse(recipe_instructions);
            } catch {
                return handleValidationError(res, "Invalid recipe_instructions format");
            }
        }

        const parsed_prep_time = Number(prep_time);
        const parsed_cook_time = Number(cook_time);
        const parsed_serving_size = Number(serving_size);

        if (category_id) {
            const categoryResult = await pool.query(checkRecipeCategoryExistsByIdQuery, [category_id]);
            if (categoryResult.rowCount === 0) {
                return handleNotFoundError(res, "Category not found");
            }
        }

        if (sub_category_id) {
            const subCategoryResult = await pool.query(checkRecipeSubCategoryExistsQuery, [sub_category_id]);
            if (subCategoryResult.rowCount === 0) {
                return handleNotFoundError(res, "Sub-category not found");
            }
        }

        if (category_id && sub_category_id) {
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

        if (typeof ingredients_id !== 'object' || !Array.isArray(ingredients_id)) {
            return handleValidationError(res, "Ingredients must be an array");
        }

        const { rows: ingredientRows } = await pool.query(checkIngredientsExistByIdsQuery, [ingredients_id]);
        if (ingredientRows.length !== ingredients_id.length) {
            return handleNotFoundError(res, "One or more ingredients not found");
        }

        const titleResult = await pool.query(checkRecipeTitleExistsQuery, [title]);

        if (titleResult.rowCount > 0) {
            return handleValidationError(res, "Recipe title already exists");
        }

        if (
            !Number.isInteger(prep_time) || prep_time <= 0 ||
            !Number.isInteger(cook_time) || cook_time <= 0 ||
            !Number.isInteger(serving_size) || serving_size <= 0
        ) {
            return handleValidationError(res, "Prep time, cook time, and serving size must be positive integers");
        }

        if (!Array.isArray(recipe_instructions) || recipe_instructions.length === 0) {
            return handleValidationError(res, "Recipe instructions must be a non-empty array");
        }

        if (!recipe_instructions.every(instr => typeof instr === "string" && instr.trim().length > 0)) {
            return handleValidationError(res, "Each recipe instruction must be a non-empty string");
        }

        if ( req.files.recipeImage && req.files.recipeImage.length > 0) {
            imagePath = req.files.recipeImage[0].path;
            final_image_url = await uploadImageAndCleanup(imagePath, 'recipe_images', uploadToClodinary);
        }

        const recipeResult = await pool.query(
            insertRecipeQuery,
            [
                user_id,
                category_id,
                sub_category_id,
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
                true
            ]
        );


        if (recipeResult.rowCount === 0) {
            return handleServerError(res, "Failed to create recipe");
        }

        const recipe = recipeResult.rows[0];

        const instructionIds = [];
        for (let i = 0; i < recipe_instructions.length; i++) {
            const { rows } = await pool.query(
                insertRecipeInstructionQuery,
                [recipe.recipe_id, i + 1, recipe_instructions[i]]
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