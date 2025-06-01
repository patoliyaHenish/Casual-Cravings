export const getUserByEmailQuery = `
    SELECT * FROM users WHERE email = $1
`;

export const insertUser = `
    INSERT INTO users (
        name, email, password, created_at
    )
    VALUES ($1, $2, $3)
    RETURNING id, name, email, password
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