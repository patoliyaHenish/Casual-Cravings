import nodemailer from 'nodemailer';
import { handleValidationError } from './erroHandler.js';

export const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors,
        });
    }
};

export const storeFile = async (pool, {
    tableName,
    tableId,
    fieldName,
    fileName,
    contentType,
    fileData,
    fileSize
}) => {
    if (fileName && contentType && fileData && fileSize) {
        const buffer = Buffer.from(fileData, 'base64');
        try {
            await pool.query(
                `INSERT INTO store_files 
                    (table_name, table_id, field_name, file_name, content_type, file_data, file_size)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    tableName,
                    tableId,
                    fieldName,
                    fileName,
                    contentType,
                    buffer,
                    fileSize
                ]
            );
            console.log(`File stored for ${tableName} id:`, tableId);
        } catch (fileErr) {
            console.error('Error storing file:', fileErr);
            throw fileErr;
        }
    }
};

export const generateAndSendOtp = async (email, pool) => {
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 
        await pool.query(
            `UPDATE users SET otp_code = $1, otp_expires = $2 WHERE email = $3`,
            [otp, otpExpires, email]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
        };

        return await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error generating or sending OTP:', err);
        throw err;
    }
};

export const checkRole = (roles = []) => {
    return (req, res, next) => {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return handleValidationError(res, 'Forbidden: You do not have permission to perform this action', 403);
        }
        next();
    };
};