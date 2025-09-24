import nodemailer from 'nodemailer';
import { handleValidationError } from './erroHandler.js';

export const validate = (schema) => async (req, res, next) => {
    if (req.body) {
        const fieldsToParse = ['recipe_instructions', 'ingredients', 'keywords', 'imageData'];
        fieldsToParse.forEach((field) => {
            if (req.body[field] !== undefined && typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (error) {
                    return handleValidationError(res, `Invalid format for ${field}. Expected valid JSON.`);
                }
            }
        });

        const numericFields = ['category_id', 'categoryId', 'subCategoryId', 'prep_time', 'cook_time', 'serving_size'];
        numericFields.forEach((field) => {
            if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
                const numValue = Number(req.body[field]);
                if (!isNaN(numValue)) {
                    req.body[field] = numValue;
                }
            }
        });

        if (req.body.sub_category_id !== undefined) {
            if (req.body.sub_category_id === '' || req.body.sub_category_id === 'null' || req.body.sub_category_id === null || req.body.sub_category_id === undefined || req.body.sub_category_id === 0) {
                req.body.sub_category_id = null;
            } else {
                const numValue = Number(req.body.sub_category_id);
                req.body.sub_category_id = isNaN(numValue) ? null : numValue;
            }
        }

        const stringFields = ['title', 'description', 'video_url', 'image_url'];
        stringFields.forEach((field) => {
            if (req.body[field] !== undefined && req.body[field] !== null) {
                if (req.body[field] === '') {
                    req.body[field] = null;
                }
            }
        });
    }
    
    try {
        await schema.validate(req.body, { abortEarly: false});
        next();
    } catch (err) {
        return handleValidationError(res, 'Validation error', 400, err.errors);
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

export const getYouTubeThumbnail = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
};