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

export const searchRecipesQuery = `
    SELECT 
        r.recipe_id,
        r.title,
        r.image_url,
        r.prep_time,
        r.cook_time,
        r.keywords,
        u.name AS author_name,
        fs.image_data AS author_profile_picture_data,
        fs.mime_type AS author_profile_picture_mime_type,
        recipe_fs.image_data AS recipe_image_data,
        recipe_fs.mime_type AS recipe_image_mime_type
    FROM recipe r
    LEFT JOIN users u ON r.user_id = u.user_id
    LEFT JOIN file_storage fs ON u.user_id = fs.table_id AND fs.table_name = 'users'
    LEFT JOIN file_storage recipe_fs ON r.recipe_id = recipe_fs.table_id AND recipe_fs.table_name = 'recipe'
    WHERE r.admin_approved_status = 'approved' 
    AND r.public_approved = true
`;

export const searchRecipesCountQuery = `
    SELECT COUNT(*) as total
    FROM recipe r
    WHERE r.admin_approved_status = 'approved' 
    AND r.public_approved = true
`;

export const getPopularKeywordsQuery = `
    SELECT keyword, COUNT(*) as usage_count
    FROM (
        SELECT unnest(keywords) as keyword
        FROM recipe 
        WHERE admin_approved_status = 'approved' 
        AND public_approved = true
        AND keywords IS NOT NULL
        AND array_length(keywords, 1) > 0
    ) keyword_unnest
    GROUP BY keyword
    ORDER BY usage_count DESC, keyword ASC
    LIMIT 4
`;

export const getSearchSuggestionsQuery = `
    SELECT DISTINCT 
        r.title, 
        r.keywords,
        r.image_url,
        fs.image_data AS recipe_image_data,
        fs.mime_type AS recipe_image_mime_type
    FROM recipe r
    LEFT JOIN file_storage fs ON r.recipe_id = fs.table_id AND fs.table_name = 'recipe'
    WHERE r.admin_approved_status = 'approved' 
    AND r.public_approved = true
    AND (LOWER(r.title) LIKE LOWER($1) OR LOWER(r.keywords::text) LIKE LOWER($1))
    LIMIT 10
`;

export const getMostUsedKeywordsQuery = `
    SELECT 
        unnest(keywords) as keyword,
        COUNT(*) as usage_count
    FROM recipe 
    WHERE keywords IS NOT NULL 
    AND array_length(keywords, 1) > 0
    GROUP BY unnest(keywords)
    ORDER BY usage_count DESC
    LIMIT 20
`;

export const getPublicRecipesByKeywordsQuery = `
    SELECT 
        r.recipe_id,
        r.title,
        r.image_url
    FROM recipe r
    WHERE r.public_approved = true 
    AND r.admin_approved_status = 'approved' 
    AND r.keywords && $1
    ORDER BY r.created_at DESC
`;