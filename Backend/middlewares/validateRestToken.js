import { pool } from '../config/db.js';
import { getUserByEmailAndResetToken } from '../query/users/user.js';
import { handleValidationError } from '../utils/erroHandler.js';

const validateResetToken = async (req, res, next) => {
    const { token, email } = req.params;

    if (!token || !email) {
        return handleValidationError(res, 'Token and email are required.', 400);
    }

    try {
        const userResult = await pool.query(getUserByEmailAndResetToken, [email, token]);
        if (userResult.rowCount === 0) {
            return handleValidationError(res, 'Invalid or expired password reset token.', 400);
        }
        req.resetUser = userResult.rows[0];
        next();
    } catch (error) {
        return handleValidationError(res, 'Error validating reset token.', 400);
    }
};

export default validateResetToken;