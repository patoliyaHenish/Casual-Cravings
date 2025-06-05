export const userTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        otp_code VARCHAR(6),
        otp_expires TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE
    );
`;