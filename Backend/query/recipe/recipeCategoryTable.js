export const createRecipeCategoryTable = `
CREATE TABLE IF NOT EXISTS recipe_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
`;