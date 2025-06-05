export const createRecipeInstructionTable = `
    CREATE TABLE IF NOT EXISTS recipe_instruction (
        instruction_id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE,
        step_number INT NOT NULL,
        instruction_text TEXT NOT NULL
    )
`;