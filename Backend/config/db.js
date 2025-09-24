import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import { handleServerError } from '../utils/erroHandler.js';

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const connectDB = async (res) => {
    try {
        await pool.connect();
    } catch (err) {
        handleServerError(res, err, 'Database connection error');
    }
};
