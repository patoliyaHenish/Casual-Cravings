export const createSubCategoryTable = `
    CREATE TABLE IF NOT EXISTS recipe_sub_category (
        sub_category_id SERIAL PRIMARY KEY,
        category_id INT NOT NULL REFERENCES recipe_category(category_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        image VARCHAR(255)
    );
`;