export const checkSubCategoryExistsQuery = `
    SELECT * FROM recipe_sub_category WHERE name = $1 AND category_id = $2;
`;

export const insertSubCategoryQuery = `
    INSERT INTO recipe_sub_category (name, description, category_id, image) VALUES ($1, $2, $3, $4) RETURNING *;
`;

export const checkCategoryExistsQuery = `
    SELECT 1 FROM recipe_category WHERE category_id = $1;
`;

export const getSubCategoriesByCategoryQuery = `
    SELECT name, description 
    FROM recipe_sub_category 
    WHERE category_id = $1 
    ORDER BY name ASC;
`;

export const deleteSubCategoryByIdQuery = `
    DELETE FROM recipe_sub_category
    WHERE sub_category_id = $1 AND category_id = $2
    RETURNING name, description;
`;

export const checkSubCategoryByIdAndCategoryQuery = `
    SELECT name, description FROM recipe_sub_category WHERE sub_category_id = $1 AND category_id = $2;
`;

export const getSubCategoryImageByIdAndCategoryQuery = `
    SELECT image FROM recipe_sub_category WHERE sub_category_id = $1 AND category_id = $2;
`;

export const updateSubCategoryQuery = `
    UPDATE recipe_sub_category
    SET name = $1, description = $2, image = $3
    WHERE sub_category_id = $4 AND category_id = $5
    RETURNING name, description, image;
`;