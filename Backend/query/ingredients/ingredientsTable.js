export const createIngredientsTable = `
    CREATE TABLE IF NOT EXISTS ingredients (
        ingredient_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
    );
`;