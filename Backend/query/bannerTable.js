export const createBannerTable = `
    CREATE TABLE IF NOT EXISTS banner (
        banner_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        button_text VARCHAR(255) NOT NULL,
        keywords TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`; 