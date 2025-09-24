export const insertRecipeSubCategoryQuery = `
    INSERT INTO recipe_sub_category (category_id, name, description, image)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`;

export const checkRecipeSubCategoryExistsQuery = `
    SELECT * FROM recipe_sub_category WHERE sub_category_id = $1;
`;

export const checkSubCategoryExistsQuery = `SELECT * FROM recipe_sub_category WHERE sub_category_id = $1 AND category_id = $2`;

export const checkSubCategoriesExistForCategoryQuery = `
    SELECT COUNT(*) as count FROM recipe_sub_category WHERE category_id = $1;
`;

export const updateRecipeSubCategoryQuery = `
    UPDATE recipe_sub_category
    SET name = $1, description = $2, image = $3, category_id = $4
    WHERE sub_category_id = $5
    RETURNING *;
`;

export const deleteRecipeSubCategoryQuery = `
  DELETE FROM recipe_sub_category WHERE sub_category_id = $1
`;

export const countAllRecipeSubCategoriesQuery = `
    SELECT COUNT(*) FROM recipe_sub_category
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
`;

export const getAllRecipeSubCategoriesQuery = `
    SELECT sc.*, c.name AS category_name
    FROM recipe_sub_category sc
    JOIN recipe_category c ON sc.category_id = c.category_id
    WHERE ($1::text IS NULL OR LOWER(sc.name) LIKE LOWER('%' || $1 || '%'))
    ORDER BY LEFT(LOWER(sc.name), 1) ASC, sc.name ASC
    LIMIT $2 OFFSET $3
`;
