export const insertFileStorage = `
    INSERT INTO file_storage (
        table_name, table_id, filename, mime_type, image_data
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
`;
