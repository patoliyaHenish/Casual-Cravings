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

export const searchIngredientsExcludingQuery = `
    SELECT * FROM ingredient 
    WHERE LOWER(name) LIKE LOWER($1) 
    AND ingredient_id NOT IN (SELECT unnest($2::int[]))
    ORDER BY name 
    LIMIT 10;
`;

export const getAllIngredientsQuery = `
    SELECT * FROM ingredient 
    ORDER BY name;
`;

export const getAllIngredientsExcludingQuery = `
    SELECT * FROM ingredient 
    WHERE ingredient_id NOT IN (SELECT unnest($1::int[]))
    ORDER BY name;
`; 