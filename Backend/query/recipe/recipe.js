export const insertRecipeQuery = `
    INSERT INTO recipe (
        user_id, category_id, sub_category_id, title, description, video_url, image_url,
        prep_time, cook_time, serving_size, ingredients_id, recipe_instructions, admin_approved_status, added_by_admin
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *;
`;

export const checkRecipeTitleExistsQuery = `
    SELECT recipe_id FROM recipe WHERE LOWER(title) = LOWER($1)
`;

export const updateRecipeInstructionsQuery = `
    UPDATE recipe SET recipe_instructions = $1 WHERE recipe_id = $2
`;

export const selectRecipeByIdQuery = `
    SELECT * FROM recipe WHERE recipe_id = $1
`;