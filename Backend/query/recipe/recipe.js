export const insertRecipeQuery = `
    INSERT INTO recipe (
        user_id, category_id, sub_category_id, title, description, video_url, image_url,
        prep_time, cook_time, serving_size, recipe_instructions, keywords, admin_approved_status, added_by_admin, public_approved
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
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
        recipe_instructions = $10,
        keywords = $11,
        admin_approved_status = $12,
        added_by_admin = $13,
        public_approved = $14,
        updated_at = CURRENT_TIMESTAMP
    WHERE recipe_id = $15
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
    SELECT COUNT(*) FROM recipe r
    LEFT JOIN recipe_category rc ON r.category_id = rc.category_id
    LEFT JOIN recipe_sub_category rsc ON r.sub_category_id = rsc.sub_category_id
    WHERE (LOWER(r.title) LIKE LOWER($1) OR LOWER(r.keywords::text) LIKE LOWER($1))
      AND ($2::text IS NULL OR LOWER(rc.name) LIKE LOWER($2))
      AND ($3::text IS NULL OR LOWER(rsc.name) LIKE LOWER($3))
      AND ($4::text IS NULL OR CAST(r.added_by_user AS TEXT) = $4)
      AND ($5::text IS NULL OR CAST(r.added_by_admin AS TEXT) = $5)
      AND ($6::text IS NULL OR LOWER(r.admin_approved_status) = LOWER($6))
      AND ($7::text IS NULL OR CAST(r.public_approved AS TEXT) = $7)
`;

export const getAllRecipesQuery = `
    SELECT 
        r.recipe_id,
        r.image_url,
        r.title,
        r.keywords,
        rc.name AS category_name,
        rsc.name AS sub_category_name,
        r.added_by_user,
        r.added_by_admin,
        r.admin_approved_status,
        r.public_approved
    FROM recipe r
    LEFT JOIN recipe_category rc ON r.category_id = rc.category_id
    LEFT JOIN recipe_sub_category rsc ON r.sub_category_id = rsc.sub_category_id
    WHERE (LOWER(r.title) LIKE LOWER($1) OR LOWER(r.keywords::text) LIKE LOWER($1))
      AND ($2::text IS NULL OR LOWER(rc.name) LIKE LOWER($2))
      AND ($3::text IS NULL OR LOWER(rsc.name) LIKE LOWER($3))
      AND ($4::text IS NULL OR CAST(r.added_by_user AS TEXT) = $4)
      AND ($5::text IS NULL OR CAST(r.added_by_admin AS TEXT) = $5)
      AND ($6::text IS NULL OR LOWER(r.admin_approved_status) = LOWER($6))
      AND ($7::text IS NULL OR CAST(r.public_approved AS TEXT) = $7)
    ORDER BY r.created_at DESC
    LIMIT $8 OFFSET $9
`;