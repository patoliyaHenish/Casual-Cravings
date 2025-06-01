import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { getUserByEmailQuery, insertUserWithProfilePicQuery } from '../query/users/user.js';
import {
    handleValidationError,
    handleServerError
} from '../utils/erroHandler.js';
import { extractProfilePicInfo } from '../utils/helper.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    const file = req.file;
    

    if (!name || !email || !password) {
        return handleValidationError(res, 'Name, email, and password are required.');
    }

    try {
        const userExists = await pool.query(getUserByEmailQuery, [email]);
        if (userExists.rowCount > 0) {
            return handleValidationError(res, 'User already exists with this email.', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const {
            profilePicFileName,
            profilePicContentType,
            profilePicData,
            profilePicSize
        } = extractProfilePicInfo(file);

        const result = await pool.query(
            insertUserWithProfilePicQuery,
            [
                name,
                email,
                hashedPassword,
                'user',
                profilePicFileName,
                profilePicContentType,
                profilePicData,
                profilePicSize
            ]
        );

        const user = result.rows[0];
        return res.status(201).json({ message: 'User registered successfully.', user });
    } catch (err) {
        console.error('Error registering user:', err);
        return handleServerError(res, err);
    }
};