export const createBannerTable = `
    CREATE TABLE IF NOT EXISTS banner (
        banner_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        button_text VARCHAR(255) NOT NULL,
        keywords TEXT[] DEFAULT '{}',
        is_hero BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_hero_banner ON banner (is_hero) WHERE is_hero = true;
`; 