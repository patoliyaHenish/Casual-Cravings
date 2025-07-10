export const insertRecipeQuery = `
    INSERT INTO recipe (
        user_id, category_id, sub_category_id, title, description, video_url, image_url,
        prep_time, cook_time, serving_size, ingredients_id, recipe_instructions, admin_approved_status, added_by_admin,
        ingredient_unit, ingredient_quantity
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING *;
`;

export const checkRecipeTitleExistsQuery = `
    SELECT recipe_id FROM recipe WHERE LOWER(title) = LOWER($1)
`;

export const updateRecipeInstructionsQuery = `
    UPDATE recipe SET recipe_instructions = $1 WHERE recipe_id = $2
`;

export const deleteRecipeQuery = `
    DELETE FROM recipe WHERE recipe_id = $1 RETURNING *
`;

export const updateRecipeQuery = `
    UPDATE recipe SET
        category_id = $1,
        sub_category_id = $2,
        title = $3,
        description = $4,
        video_url = $5,
        image_url = $6,
        prep_time = $7,
        cook_time = $8,
        serving_size = $9,
        ingredients_id = $10,
        ingredient_unit = $11,
        ingredient_quantity = $12,
        recipe_instructions = $13,
        admin_approved_status = $14,
        added_by_admin = $15,
        updated_at = CURRENT_TIMESTAMP
    WHERE recipe_id = $16
    RETURNING *;
`;

export const selectRecipeByIdQuery = `
    SELECT 
        r.*,
        rc.name AS category_name,
        rsc.name AS sub_category_name
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.category_id = rc.category_id
    LEFT JOIN recipe_sub_category rsc ON r.sub_category_id = rsc.sub_category_id
    WHERE r.recipe_id = $1
`;

export const getAllRecipesCountQuery = `
    SELECT COUNT(*) FROM recipe WHERE LOWER(title) LIKE LOWER($1)
`;

export const getAllRecipesQuery = `
    SELECT 
        r.recipe_id,
        r.image_url,
        r.title,
        rc.name AS category_name,
        rsc.name AS sub_category_name,
        r.added_by_user,
        r.added_by_admin,
        r.admin_approved_status,
        r.public_approved
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.category_id = rc.category_id
    LEFT JOIN recipe_sub_category rsc ON r.sub_category_id = rsc.sub_category_id
    WHERE LOWER(r.title) LIKE LOWER($1)
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
`;