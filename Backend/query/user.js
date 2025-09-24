export const getUserByEmailQuery = `
    SELECT * FROM users WHERE email = $1
`;

export const insertUser = `
    INSERT INTO users (
        name, email, password
    )
    VALUES ($1, $2, $3)
    RETURNING user_id, name, email, password
`;

export const updateResetTokenByEmail = `
    UPDATE users
    SET reset_password_token = $1,
        reset_password_expires = $2
    WHERE email = $3
`;

export const getUserByEmailAndResetToken = `
    SELECT email FROM users 
    WHERE email = $1
      AND reset_password_token = $2
      AND reset_password_expires > NOW()
`;

export const getUserProfileByEmail = `
    SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.bio, 
        u.role, 
        u.password,
        fs.filename as profile_picture,
        fs.mime_type as profile_picture_mime_type,
        fs.image_data as profile_picture_data
    FROM users u
    LEFT JOIN file_storage fs ON u.user_id = fs.table_id AND fs.table_name = 'users'
    WHERE u.email = $1
`;

