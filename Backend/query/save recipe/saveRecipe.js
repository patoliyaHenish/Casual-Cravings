export const createSaveRecipeTable = `
    CREATE TABLE IF NOT EXISTS save_recipe (
        save_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_user_recipe ON save_recipe (user_id, recipe_id);
`;