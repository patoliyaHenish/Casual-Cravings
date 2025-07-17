export const insertBannerQuery = `
    INSERT INTO banner (
        title, image_url, button_text, keywords
    ) VALUES (
        $1, $2, $3, $4
    ) RETURNING *;
`;

export const updateBannerQuery = `
    UPDATE banner SET
        title = $1,
        image_url = $2,
        button_text = $3,
        keywords = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE banner_id = $5
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

export const selectActiveBannerQuery = `
    SELECT * FROM banner ORDER BY created_at DESC LIMIT 1;
`; 