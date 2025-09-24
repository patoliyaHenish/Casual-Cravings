export const insertRecipeInstructionQuery = `
    INSERT INTO recipe_instruction (recipe_id, step_number, instruction_text)
    VALUES ($1, $2, $3)
    RETURNING instruction_id;
`;

export const getRecipeInstructionsByRecipeIdQuery = `
    SELECT instruction_id, step_number, instruction_text
    FROM recipe_instruction
    WHERE recipe_id = $1
    ORDER BY step_number ASC
`;