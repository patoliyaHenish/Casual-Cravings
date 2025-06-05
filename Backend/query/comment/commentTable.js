export const createCommentTable = `
    CREATE TABLE IF NOT EXISTS comment (
        comment_id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;