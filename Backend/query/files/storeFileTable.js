export const storeFileTableQuery = `
    CREATE TABLE IF NOT EXISTS store_files (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(255) NOT NULL,
        table_id INTEGER NOT NULL,
        field_name VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        file_data BYTEA NOT NULL,
        file_size INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
`