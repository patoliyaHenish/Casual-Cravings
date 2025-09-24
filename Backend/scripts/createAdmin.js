import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const createAdmin = async () => {
    const name = 'Admin';
    const email = adminEmail;
    const password = adminPassword;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, email, hashedPassword, 'admin', true]
        );
    } catch (error) {
    } finally {
        pool.end();
    }
};

createAdmin();