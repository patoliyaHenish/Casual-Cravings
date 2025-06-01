export const getUserByEmailQuery = `
    SELECT * FROM users WHERE email = $1
`;

export const insertUserWithProfilePicQuery = `
    INSERT INTO users (
        name, email, password, role,
        profile_pic_file_name, profile_pic_content_type, profile_pic_data, profile_pic_size
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, email, role, created_at, profile_pic_file_name, profile_pic_content_type, profile_pic_size
`;