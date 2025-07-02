export const createRecipeTable = `
    CREATE TABLE IF NOT EXISTS recipe (
        recipe_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        category_id INTEGER REFERENCES recipe_category(category_id),
        sub_category_id INTEGER REFERENCES recipe_sub_category(sub_category_id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        video_url VARCHAR(255) DEFAULT NULL,
        image_url VARCHAR(255) DEFAULT NULL,
        prep_time INT NOT NULL,
        cook_time INT NOT NULL,
        serving_size INT NOT NULL,
        ingredients_id INTEGER[] DEFAULT '{}',
        recipe_instructions TEXT[] DEFAULT '{}',
        added_by_user BOOLEAN DEFAULT FALSE,
        added_by_admin BOOLEAN DEFAULT FALSE,
        admin_approved_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (admin_approved_status IN ('pending', 'approved', 'rejected')),
        public_approved BOOLEAN DEFAULT FALSE,
        edited_by_user BOOLEAN DEFAULT FALSE,
        edited_by_admin BOOLEAN DEFAULT FALSE,
        last_edited_by_user_id INTEGER DEFAULT NULL,
        last_edited_by_admin TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
`;