import nodemailer from 'nodemailer';
import { handleValidationError } from './erroHandler.js';

export const validate = (schema) => async (req, res, next) => {
    if (req.body) {
        ['ingredients_id', 'ingredient_unit', 'ingredient_quantity', 'recipe_instructions'].forEach((field) => {
            if (req.body[field] !== undefined && typeof req.body[field] === 'string') {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                } catch (error) {
                    console.error(`Error parsing ${field}:`, error);
                    return handleValidationError(res, `Invalid format for ${field}. Expected an array.`);
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

export const safeDeleteLocalFile = async (filePath) => {
    if (!filePath) return;
    try {
        await import('fs/promises').then(fs => fs.unlink(filePath));
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error('Error deleting local file:', err);
        }
    }
};

export const uploadImageAndCleanup = async (imagePath, folder, uploadFn) => {
    const uploadResult = await uploadFn(imagePath, folder);
    await safeDeleteLocalFile(imagePath);
    return uploadResult.secure_url;
};

export const deleteCloudinaryImageByUrl = async (imageUrl, folder, deleteFn) => {
    if (imageUrl) {
        const publicIdMatch = imageUrl.match(/\/([^\/]+)\.[a-zA-Z]+$/);
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = `${folder}/${publicIdMatch[1]}`;
            try {
                await deleteFn(publicId);
            } catch (err) {
                console.error('Error deleting old image from Cloudinary:', err);
            }
        }
    }
};

export const getYouTubeThumbnail = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
}