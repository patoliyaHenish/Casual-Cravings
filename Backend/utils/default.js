import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { userTableQuery } from '../query/Tables/userTable.js';

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

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [adminEmail]
        );
        if (result.rowCount === 0) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await pool.query(
                `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
                [adminName, adminEmail, hashedPassword, 'admin']
            );
            console.log('Default admin user created.');
        } else {
            console.log('Default admin user already exists.');
        }
    } catch (err) {
        console.error('Error creating default admin user:', err);
    }
};

export const executeSetup = async () => {
    await createRecipeDatabaseIfNotExists();
    await createUsersTableIfNotExists();
    await createDefaultAdminUser();
};