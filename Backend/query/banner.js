export const insertBannerQuery = `
    INSERT INTO banner (
        title, image_url, button_text, keywords, is_hero
    ) VALUES (
        $1, $2, $3, $4, $5
    ) RETURNING *;
`;

export const updateBannerQuery = `
    UPDATE banner SET
        title = $1,
        image_url = $2,
        button_text = $3,
        keywords = $4,
        is_hero = $5,
        updated_at = CURRENT_TIMESTAMP
    WHERE banner_id = $6
    RETURNING *;
`;

export const deleteBannerQuery = `
    DELETE FROM banner WHERE banner_id = $1 RETURNING *;
`;

export const selectAllBannersQuery = `
    SELECT * FROM banner ORDER BY created_at DESC;
`;

export const selectBannerByIdQuery = `
    SELECT * FROM banner WHERE banner_id = $1;
`;

export const selectHeroBannerQuery = `
    SELECT * FROM banner WHERE is_hero = true LIMIT 1;
`;

export const unsetAllHeroBannersQuery = `
    UPDATE banner SET is_hero = false WHERE is_hero = true;
`; 