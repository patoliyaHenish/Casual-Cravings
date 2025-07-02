export const insertRecipeInstructionQuery = `
    INSERT INTO recipe_instruction (recipe_id, step_number, instruction_text)
    VALUES ($1, $2, $3)
    RETURNING instruction_id;
`;