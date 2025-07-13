

export const createRecipeIngredientTable = `
    CREATE TABLE IF NOT EXISTS recipe_ingredient (
        recipe_ingredient_id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE,
        ingredient_id INTEGER NOT NULL REFERENCES ingredient(ingredient_id) ON DELETE CASCADE,
        quantity VARCHAR(20) NOT NULL,
        quantity_display VARCHAR(20),
        unit VARCHAR(50) NOT NULL,
        UNIQUE(recipe_id, ingredient_id)
    );
`;