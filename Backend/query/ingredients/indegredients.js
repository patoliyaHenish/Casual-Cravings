export const insertIngredientQuery = `
    INSERT INTO ingredients (name, description, uses, substitutes)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`;

export const checkIngredientExistsQuery = `
    SELECT * FROM ingredients WHERE name = $1;
`;

export const getIngredientByIdQuery = `
    SELECT * FROM ingredients WHERE ingredient_id = $1;
`;

export const updateIngredientQuery = `
    UPDATE ingredients
    SET name = $1, description = $2, uses = $3, substitutes = $4
    WHERE ingredient_id = $5
    RETURNING *;
`;

export const deleteIngredientByIdQuery = `
    DELETE FROM ingredients
    WHERE ingredient_id = $1
    RETURNING *;
`;

export const getAllIngredientsQuery = `
    SELECT * FROM ingredients
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
    ORDER BY LEFT(LOWER(name), 1) ASC, name ASC
    LIMIT $2 OFFSET $3;
`;

export const countAllIngredientsQuery = `
    SELECT COUNT(*) FROM ingredients
    WHERE ($1::text IS NULL OR LOWER(name) LIKE LOWER('%' || $1 || '%'));
`;

export const checkIngredientExistsForUpdateQuery = `
    SELECT * FROM ingredients WHERE name = $1 AND ingredient_id != $2;
`;

export const checkIngredientsExistByIdsQuery = `
    SELECT ingredient_id FROM ingredients WHERE ingredient_id = ANY($1)
`;