export const createIngredientTable = `
    CREATE TABLE IF NOT EXISTS ingredient (
        ingredient_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    );
`;



export const insertIngredientQuery = `
    INSERT INTO ingredient (name)  
    VALUES ($1) 
    RETURNING *;
`;

export const getIngredientByIdQuery = `
    SELECT * FROM ingredient 
    WHERE ingredient_id = $1;
`;

export const getIngredientByNameQuery = `
    SELECT * FROM ingredient 
    WHERE LOWER(name) = LOWER($1);
`;

export const searchIngredientsQuery = `
    SELECT * FROM ingredient 
    WHERE LOWER(name) LIKE LOWER($1) 
    ORDER BY name 
    LIMIT 10;
`;

export const getAllIngredientsQuery = `
    SELECT * FROM ingredient 
    ORDER BY name;
`;

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

