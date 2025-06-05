export const insertRecipeCategoryQuery = `
    INSERT INTO recipe_category (name, description)
    VALUES ($1, $2)
    RETURNING *;
`;

export const checkRecipeCategoryExistsQuery = `
    SELECT * FROM recipe_category WHERE name = $1;
`;

export const getRecipeCategoriesQuery = `
    SELECT * FROM recipe_category
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
`;

export const getRecipeCategoriesCountQuery = `
    SELECT COUNT(*) FROM recipe_category
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'));
`;