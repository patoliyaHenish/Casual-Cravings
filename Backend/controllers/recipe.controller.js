import fs from 'fs';
import { pool } from "../config/db.js";
import {
    checkRecipeTitleExistsQuery,
    deleteRecipeQuery,
    getAllRecipesCountQuery,
    getAllRecipesQuery,
    getMostUsedKeywordsQuery,
    getPublicRecipesByKeywordsQuery,
    insertRecipeQuery,
    selectRecipeByIdQuery,
    updateRecipeInstructionsQuery,
    updateRecipeQuery
} from "../query/recipe.js";
import { checkRecipeCategoryExistsByIdQuery } from "../query/recipeCategory.js";
import { deleteRecipeIngredientsQuery, getRecipeIngredientsQuery } from "../query/recipeIngredient.js";
import { getRecipeInstructionsByRecipeIdQuery } from "../query/recipeInstruction.js";
import { checkRecipeSubCategoryExistsQuery, checkSubCategoriesExistForCategoryQuery, checkSubCategoryExistsQuery } from "../query/subCategory.js";
import { insertFileStorage } from "../query/fileStorage.js";
import { handleNotFoundError, handleServerError, handleValidationError } from "../utils/erroHandler.js";
import { getYouTubeThumbnail } from "../utils/helper.js";

export const createRecipeByAdmin = async (req, res) => {
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
            recipe_instructions,
            keywords,
            ingredients,
            imageData
        } = req.body;

        const user_id = req.user.userId;

        let final_image_url = image_url || null;
        const parsed_recipe_instructions = recipe_instructions;
        const parsed_keywords = keywords;
        const parsed_ingredients = ingredients;

        if (category_id) {
            const categoryResult = await pool.query(checkRecipeCategoryExistsByIdQuery, [category_id]);
            if (categoryResult.rowCount === 0) {
                return handleNotFoundError(res, "Category not found");
            }

            const subCategoriesResult = await pool.query(checkSubCategoriesExistForCategoryQuery, [category_id]);
            const subCategoriesExist = parseInt(subCategoriesResult.rows[0].count) > 0;

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

        if (!imageData) {
            if (video_url) {
                const thumbnailUrl = getYouTubeThumbnail(video_url);
                if (thumbnailUrl) {
                    final_image_url = thumbnailUrl;
                } else {
                    return handleValidationError(res, "Invalid YouTube video URL");
                }
            }
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
            !Number.isInteger(parsed_cook_time) || parsed_cook_time < 0 ||
            !Number.isInteger(parsed_serving_size) || parsed_serving_size <= 0
        ) {
            return handleValidationError(res, "Prep time and serving size must be positive integers, cook time must be 0 or more");
        }

        if (!Array.isArray(parsed_recipe_instructions) || parsed_recipe_instructions.length === 0) {
            return handleValidationError(res, "Recipe instructions must be a non-empty array");
        }

        if (!parsed_recipe_instructions.every(instr => typeof instr === "string" && instr.trim().length > 0)) {
            return handleValidationError(res, "Each recipe instruction must be a non-empty string");
        }

        if (parsed_keywords && !Array.isArray(parsed_keywords)) {
            return handleValidationError(res, "Keywords must be an array");
        }

        if (parsed_keywords && parsed_keywords.length > 0 && !parsed_keywords.every(keyword => typeof keyword === "string" && keyword.trim().length > 0)) {
            return handleValidationError(res, "Each keyword must be a non-empty string");
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
                parsed_recipe_instructions,
                parsed_keywords || [],
                'approved',
                true,
                false
            ]
        );

        if (recipeResult.rowCount === 0) {
            return handleServerError(res, "Failed to create recipe");
        }

        const recipe = recipeResult.rows[0];

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            const imageBuffer = Buffer.from(imageData.image_data, 'base64');
            
            await pool.query(insertFileStorage, [
                'recipe',
                recipe.recipe_id,
                imageData.filename,
                imageData.mime_type,
                imageBuffer
            ]);
        }

        if (parsed_recipe_instructions.length > 0) {
            const instructionValues = parsed_recipe_instructions.map((instruction, index) => 
                `(${recipe.recipe_id}, ${index + 1}, $${index + 1})`
            ).join(', ');
            
            const instructionParams = parsed_recipe_instructions;
            const batchInsertQuery = `
                INSERT INTO recipe_instruction (recipe_id, step_number, instruction_text) 
                VALUES ${instructionValues} 
                RETURNING instruction_id
            `;
            
            const instructionResult = await pool.query(batchInsertQuery, instructionParams);
            const instructionIds = instructionResult.rows.map(row => row.instruction_id);
            
            await pool.query(
                updateRecipeInstructionsQuery,
                [instructionIds, recipe.recipe_id]
            );
        }

        if (parsed_ingredients && Array.isArray(parsed_ingredients) && parsed_ingredients.length > 0) {
            const uniqueIngredients = [];
            const seenIngredientIds = new Set();
            
            for (const ingredient of parsed_ingredients) {
                if (ingredient.ingredient_id && ingredient.quantity && ingredient.unit) {
                    if (!seenIngredientIds.has(ingredient.ingredient_id)) {
                        seenIngredientIds.add(ingredient.ingredient_id);
                        uniqueIngredients.push(ingredient);
                    }
                }
            }
            
            if (uniqueIngredients.length > 0) {
                const ingredientValues = uniqueIngredients.map((ingredient, index) => 
                    `(${recipe.recipe_id}, $${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
                ).join(', ');
                
                const ingredientParams = uniqueIngredients.flatMap(ingredient => [
                    ingredient.ingredient_id,
                    ingredient.quantity,
                    ingredient.quantity_display || ingredient.quantity,
                    ingredient.unit
                ]);
                
                const batchIngredientQuery = `
                    INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, quantity_display, unit) 
                    VALUES ${ingredientValues}
                `;
                
                await pool.query(batchIngredientQuery, ingredientParams);
            }
        }

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
        return handleServerError(res, error, "Failed to create recipe");
    }
};

export const getAllRecipesForAdmin = async (req, res) => {
    try {
        const {
            search = '',
            page = 1,
            limit = 10,
            category_name = '',
            sub_category_name = '',
            added_by_user = '',
            added_by_admin = '',
            admin_approved_status = '',
            public_approved = ''
        } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const categoryNameFilter = category_name ? `%${category_name}%` : null;
        const subCategoryNameFilter = sub_category_name ? `%${sub_category_name}%` : null;
        const addedByUserFilter = added_by_user !== '' ? added_by_user : null;
        const addedByAdminFilter = added_by_admin !== '' ? added_by_admin : null;
        const adminApprovedStatusFilter = admin_approved_status ? admin_approved_status : null;
        const publicApprovedFilter = public_approved !== '' ? public_approved : null;

        const countResult = await pool.query(
            getAllRecipesCountQuery,
            [
                `%${search}%`,
                categoryNameFilter,
                subCategoryNameFilter,
                addedByUserFilter,
                addedByAdminFilter,
                adminApprovedStatusFilter,
                publicApprovedFilter
            ]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            getAllRecipesQuery,
            [
                `%${search}%`,
                categoryNameFilter,
                subCategoryNameFilter,
                addedByUserFilter,
                addedByAdminFilter,
                adminApprovedStatusFilter,
                publicApprovedFilter,
                limit,
                offset
            ]
        );
        const recipes = result.rows;

        for (const recipe of recipes) {
            const imageResult = await pool.query(
                'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 LIMIT 1',
                ['recipe', recipe.recipe_id]
            );
            
            if (imageResult.rows.length > 0) {
                const imageData = imageResult.rows[0];
                const base64 = imageData.image_data.toString('base64');
                recipe.image = `data:${imageData.mime_type};base64,${base64}`;
            } else {
                recipe.image = recipe.image_url;
            }
        }

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

        const ingredientsResult = await pool.query(getRecipeIngredientsQuery, [id]);
        recipe.ingredients = ingredientsResult.rows.map(row => ({
            ingredient_id: row.ingredient_id,
            ingredient_name: row.ingredient_name,
            quantity: row.quantity,
            unit: row.unit
        }));

        const imageResult = await pool.query(
            'SELECT image_data, mime_type FROM file_storage WHERE table_name = $1 AND table_id = $2 LIMIT 1',
            ['recipe', id]
        );
        
        if (imageResult.rows.length > 0) {
            const imageData = imageResult.rows[0];
            const base64 = imageData.image_data.toString('base64');
            recipe.image = `data:${imageData.mime_type};base64,${base64}`;
        } else {
            recipe.image = recipe.image_url;
        }

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

        await pool.query(
            'DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2',
            ['recipe', id]
        );

        const deleteResult = await pool.query(deleteRecipeQuery, [id]);

        if (deleteResult.rowCount === 0) {
            return handleServerError(res, "Failed to delete recipe");
        }

        return res.status(200).json({
            success: true,
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to delete recipe");
    }
};

export const updateRecipeByAdmin = async (req, res) => {
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
            recipe_instructions = existingRecipe.recipe_instructions,
            keywords = existingRecipe.keywords,
            ingredients,
            keepExistingImage = false,
            imageRemoved = false,
            imageData
        } = req.body;
        
        if (typeof keepExistingImage === 'string') {
            keepExistingImage = keepExistingImage === 'true';
        }
        
        if (typeof imageRemoved === 'string') {
            imageRemoved = imageRemoved === 'true';
        }
        
        let final_image_url = image_url || existingRecipe.image_url;

        if (keepExistingImage !== true) {
            await pool.query(
                'DELETE FROM file_storage WHERE table_name = $1 AND table_id = $2',
                ['recipe', id]
            );
        }

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            final_image_url = null;
        }
        else if (keepExistingImage === true) {
            final_image_url = existingRecipe.image_url;
        }
        else {
            if (imageRemoved === true || image_url === '' || image_url === null || image_url === undefined) {
                if (video_url) {
                    const thumbnailUrl = getYouTubeThumbnail(video_url);
                    final_image_url = thumbnailUrl || null;
                } else {
                    final_image_url = null;
                }
            } else if (image_url) {
                final_image_url = image_url;
            } else {
                if (video_url) {
                    const thumbnailUrl = getYouTubeThumbnail(video_url);
                    final_image_url = thumbnailUrl || null;
                } else {
                    final_image_url = null;
                }
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
                recipe_instructions,
                keywords || [],
                'approved',
                true,
                existingRecipe.public_approved,
                id
            ]
        );
        if (updateResult.rowCount === 0) {
            return handleServerError(res, "Failed to update recipe");
        }
        await pool.query('DELETE FROM recipe_instruction WHERE recipe_id = $1', [id]);
        if (Array.isArray(recipe_instructions) && recipe_instructions.length > 0) {
            const instructionValues = recipe_instructions.map((instruction, index) => 
                `(${id}, ${index + 1}, $${index + 1})`
            ).join(', ');
            
            const instructionParams = recipe_instructions;
            const batchInsertQuery = `
                INSERT INTO recipe_instruction (recipe_id, step_number, instruction_text) 
                VALUES ${instructionValues}
            `;
            
            await pool.query(batchInsertQuery, instructionParams);
        }

        if (ingredients !== undefined) {
            await pool.query(deleteRecipeIngredientsQuery, [id]);

            if (Array.isArray(ingredients) && ingredients.length > 0) {
                const uniqueIngredients = [];
                const seenIngredientIds = new Set();
                
                for (const ingredient of ingredients) {
                    if (ingredient.ingredient_id && ingredient.quantity && ingredient.unit) {
                        if (!seenIngredientIds.has(ingredient.ingredient_id)) {
                            seenIngredientIds.add(ingredient.ingredient_id);
                            uniqueIngredients.push(ingredient);
                        }
                    }
                }
                
                if (uniqueIngredients.length > 0) {
                    const ingredientValues = uniqueIngredients.map((ingredient, index) => 
                        `(${id}, $${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
                    ).join(', ');
                    
                    const ingredientParams = uniqueIngredients.flatMap(ingredient => [
                        ingredient.ingredient_id,
                        ingredient.quantity,
                        ingredient.quantity_display || ingredient.quantity,
                        ingredient.unit
                    ]);
                    
                    const batchIngredientQuery = `
                        INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, quantity_display, unit) 
                        VALUES ${ingredientValues}
                    `;
                    
                    await pool.query(batchIngredientQuery, ingredientParams);
                }
            }
        }

        if (imageData && imageData.filename && imageData.mime_type && imageData.image_data) {
            const imageBuffer = Buffer.from(imageData.image_data, 'base64');
            
            await pool.query(insertFileStorage, [
                'recipe',
                id,
                imageData.filename,
                imageData.mime_type,
                imageBuffer
            ]);
        }

        const updatedRecipe = updateResult.rows[0];
        return res.status(200).json({
            success: true,
            message: "Recipe updated successfully",
            data: updatedRecipe,
        });
    } catch (error) {
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

        const currentRecipe = recipeResult.rows[0];
        const public_approved = admin_approved_status === 'approved' ? currentRecipe.public_approved : false;

        const updateResult = await pool.query(
            'UPDATE recipe SET admin_approved_status = $1, public_approved = $2 WHERE recipe_id = $3 RETURNING *',
            [admin_approved_status, public_approved, id]
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
        return handleServerError(res, error, "Failed to update public approved status");
    }
};

export const getMostUsedKeywords = async (req, res) => {
    try {
        const result = await pool.query(getMostUsedKeywordsQuery);

        const keywords = result.rows.map(row => ({
            keyword: row.keyword,
            usage_count: parseInt(row.usage_count)
        }));

        return res.status(200).json({
            success: true,
            data: keywords
        });
    } catch (error) {
        return handleServerError(res, error);
    }
};

export const getPublicRecipesByKeywords = async (req, res) => {
    try {
        let { keywords } = req.query;
        if (!keywords) {
            return res.status(400).json({
                success: false,
                message: 'Keywords are required'
            });
        }

        if (typeof keywords === 'string') {
            try {
                keywords = JSON.parse(keywords);
            } catch {
                keywords = [keywords];
            }
        }
        if (!Array.isArray(keywords)) {
            keywords = [keywords];
        }

        const result = await pool.query(getPublicRecipesByKeywordsQuery, [keywords]);

        return res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        return handleServerError(res, error, "Failed to fetch recipes");
    }
}