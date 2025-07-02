export const createIngredientsTable = `
    CREATE TABLE IF NOT EXISTS ingredients (
        ingredient_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        uses TEXT NOT NULL,
        substitutes TEXT NOT NULL
    );
`;