export const insertRecipeIngredientQuery = `
    INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, quantity_display, unit) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *;
`;

export const getRecipeIngredientsQuery = `
    SELECT ri.*, i.name as ingredient_name 
    FROM recipe_ingredient ri 
    JOIN ingredient i ON ri.ingredient_id = i.ingredient_id 
    WHERE ri.recipe_id = $1 
    ORDER BY ri.recipe_ingredient_id;
`;

export const deleteRecipeIngredientsQuery = `
    DELETE FROM recipe_ingredient 
    WHERE recipe_id = $1;
`;

export const updateRecipeIngredientQuery = `
    UPDATE recipe_ingredient 
    SET quantity = $1, quantity_display = $2, unit = $3 
    WHERE recipe_ingredient_id = $4 
    RETURNING *;
`;

export const deleteRecipeIngredientQuery = `
    DELETE FROM recipe_ingredient 
    WHERE recipe_ingredient_id = $1;
`; 