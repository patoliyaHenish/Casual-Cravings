export const createLikeTable = `
    CREATE TABLE IF NOT EXISTS likes (
        like_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        recipe_id INTEGER NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE,
        UNIQUE (user_id, recipe_id)
    )
`;