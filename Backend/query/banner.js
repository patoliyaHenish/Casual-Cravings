export const insertBannerQuery = `
    INSERT INTO banner (
        title, button_text, keywords, is_hero
    ) VALUES (
        $1, $2, $3, $4
    ) RETURNING *;
`;

export const updateBannerQuery = `
    UPDATE banner SET
        title = $1,
        button_text = $2,
        keywords = $3,
        is_hero = $4
    WHERE banner_id = $5
    RETURNING *;
`;

export const deleteBannerQuery = `
    DELETE FROM banner WHERE banner_id = $1 RETURNING *;
`;

export const selectAllBannersQuery = `
    SELECT 
        b.*,
        fs.filename as image_filename,
        fs.mime_type as image_mime_type,
        fs.image_data as image_data
    FROM banner b
    LEFT JOIN file_storage fs ON b.banner_id = fs.table_id AND fs.table_name = 'banner'
    ORDER BY b.banner_id DESC;
`;

export const selectBannerByIdQuery = `
    SELECT 
        b.*,
        fs.filename as image_filename,
        fs.mime_type as image_mime_type,
        fs.image_data as image_data
    FROM banner b
    LEFT JOIN file_storage fs ON b.banner_id = fs.table_id AND fs.table_name = 'banner'
    WHERE b.banner_id = $1;
`;

export const selectHeroBannerQuery = `
    SELECT 
        b.*,
        fs.filename as image_filename,
        fs.mime_type as image_mime_type,
        fs.image_data as image_data
    FROM banner b
    LEFT JOIN file_storage fs ON b.banner_id = fs.table_id AND fs.table_name = 'banner'
    WHERE b.is_hero = true LIMIT 1;
`;

export const unsetAllHeroBannersQuery = `
    UPDATE banner SET is_hero = false WHERE is_hero = true;
`; 