export const createFollowerTable = `
    CREATE TABLE IF NOT EXISTS followers (
        follower_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,         -- The user being followed
        follower_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- The user who follows
        UNIQUE (user_id, follower_user_id)
    );
`;