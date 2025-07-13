export const createIngredientTable = `
    CREATE TABLE IF NOT EXISTS ingredient (
        ingredient_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
    );
`;

