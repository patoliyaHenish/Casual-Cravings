import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { userTableQuery } from '../query/users/userTable.js';
import { storeFileTableQuery } from '../query/files/storeFileTable.js';
import { createRecipeCategoryTable } from '../query/recipe/recipeCategoryTable.js';

const createRecipeDatabaseIfNotExists = async () => {
    const dbName = process.env.DB_NAME;

    try {
        const result = await pool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
        );
        if (result.rowCount === 0) {
            await pool.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully.`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
    } catch (err) {
        console.error('Error checking or creating database:', err);
    }
}

const createUsersTableIfNotExists = async () => {
    try {
        await pool.query(userTableQuery);
        console.log('Users table checked/created successfully.');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

const createDefaultAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = 'Admin';
    const is_verified = process.env.ADMIN_IS_VERIFIED === 'true';

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [adminEmail]
        );
        if (result.rowCount === 0) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await pool.query(
                `INSERT INTO users (name, email, password, role, is_verified, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
                [adminName, adminEmail, hashedPassword, 'admin', is_verified, new Date()]
            );
            console.log('Default admin user created.');
        } else {
            console.log('Default admin user already exists.');
        }
    } catch (err) {
        console.error('Error creating default admin user:', err);
    }
};

export const createFileStoreTableIfNotExists = async () => {
    try {
        await pool.query(storeFileTableQuery);
        console.log('File store table checked/created successfully.');
    } catch (error) {
        console.error('Error creating file store table:', error);
    }
};

const createRecipeCategoryTableIfNotExists = async () => {
    try {
        await pool.query(createRecipeCategoryTable);
        console.log('Recipe category table checked/created successfully.');
    } catch (error) {
        console.error('Error creating recipe category table:', error);
    }
};

export const executeSetup = async () => {
    await createRecipeDatabaseIfNotExists();
    await createUsersTableIfNotExists();
    await createDefaultAdminUser();
    await createFileStoreTableIfNotExists();  
    await createRecipeCategoryTableIfNotExists();
};