export const insertRecipeCategoryQuery = `
    INSERT INTO recipe_category (name, description, image)
    VALUES ($1, $2, $3)
    RETURNING *;
`;

export const checkRecipeCategoryExistsQuery = `
    SELECT * FROM recipe_category WHERE LOWER(name) = LOWER($1);
`;

export const checkRecipeCategoryExistsByIdQuery = `
    SELECT * FROM recipe_category WHERE category_id = $1;
`;

export const getRecipeCategoriesQuery = `
    SELECT * FROM recipe_category
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
    ORDER BY LEFT(LOWER(name), 1) ASC, name ASC
    LIMIT $2 OFFSET $3;
`;

export const getRecipeCategoriesCountQuery = `
    SELECT COUNT(*) FROM recipe_category
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'));
`;

export const updateRecipeCategoryQuery = `
    UPDATE recipe_category
    SET name = $1, description = $2, image = $3
    WHERE category_id = $4
    RETURNING *;
`;