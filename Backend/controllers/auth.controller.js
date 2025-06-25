import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { getUserByEmailAndResetToken, getUserByEmailQuery, getUserProfileByEmail, insertUser, updateResetTokenByEmail } from '../query/users/user.js';
import {
    handleValidationError,
    handleServerError,
    handleNotFoundError
} from '../utils/erroHandler.js';
import { deleteToken, generateToken } from '../utils/generateToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateAndSendOtp } from '../utils/helper.js';
import { uploadToClodinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
dotenv.config();

export const register = async (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;

    try {
        const userExists = await pool.query(getUserByEmailQuery, [email]);
        if (userExists.rowCount > 0) {
            return handleValidationError(res, 'User already exists with this email.', 409);
        }

        let profilePicUrl = null;
        let profilePicPath = null;
        
        if (req.files && req.files.profilePic && req.files.profilePic.length > 0) {
            profilePicPath = req.files.profilePic[0].path;
            const uploadResult = await uploadToClodinary(profilePicPath, 'profile_pics');
            profilePicUrl = uploadResult.secure_url;

            fs.unlink(profilePicPath, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            insertUser,
            [
                name,
                email,
                hashedPassword,
                profilePicUrl,
            ] 
        );

        await generateAndSendOtp(email, pool);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email.',
        });
    } catch (err) {
         if (profilePicPath) {
            fs.unlink(profilePicPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting local file after error:', unlinkErr);
            });
        }
        console.error('Error while register:', err);
        return handleServerError(res, err);
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const userResult = await pool.query(
            `SELECT * FROM users WHERE email = $1 AND otp_code = $2 AND otp_expires > NOW()`,
            [email, otp]
        );
        if (userResult.rowCount === 0) {
            return handleValidationError(res, 'Invalid or expired OTP.', 400);
        }
        const user = userResult.rows[0];

        await pool.query(
            `UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE email = $1`,
            [email]
        );

        const userResponse = {
            name: user.name,
            email: user.email,
            profilePic: user?.profile_pic,
            role: user.role || 'user',
        };

        return generateToken(res, userResponse, 'Registered successfully');
    } catch (err) {
        console.error('Error verifying OTP:', err);
        return handleServerError(res, err);
    }
};

export const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await pool.query(getUserByEmailQuery, [email]);
        if (userResult.rowCount === 0) {
            return handleNotFoundError(res, 'User not found.', 404);
        }
        const user = userResult.rows[0];
        if (user.is_verified === true) {
            return handleValidationError(res, 'User already verified.', 400);
        }

        await generateAndSendOtp(email, pool);
        return res.status(200).json({
            success: true,
            message: 'OTP resent to your email.',
        });
    } catch (err) { 
        console.error('Error resending OTP:', err);
        return handleServerError(res, err);
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(getUserByEmailQuery, [email]);
        if (userResult.rowCount === 0) {
            return handleValidationError(res, 'Invalid email or password.', 401);
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return handleValidationError(res, 'Invalid email or password.', 401);
        }

        if (!user.is_verified) {
            return handleValidationError(res, 'Please verify your email before logging in.', 403);
        }

        const userResponse = {
            name: user.name,
            email: user.email,
            profilePic: user?.profile_pic,
            role: user.role || 'user',
        };

        return generateToken(res, userResponse, 'Login successful');
    } catch (err) {
        console.error('Error logging in:', err);
        return handleServerError(res, err);
    }
};

export const logout = async (req, res) => {
    try {
        return deleteToken(res, 'Logged out successfully');
    } catch (err) {
        console.error('Error logging out:', err);
        return handleServerError(res, err);
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const userResult = await pool.query(getUserByEmailQuery, [req.user.email]);

        const user = userResult.rows[0];

        if (!user) {
            return handleNotFoundError(res, 'User not found.', 404);
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return handleValidationError(res, 'Current password is incorrect.', 401);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [hashedNewPassword, req.user.email]
        );

        return res.status(200).json({
            success: true,
            message: 'Password changes successfully',
        });
    } catch (error) {
        console.error('Error changing password:', error);
        return handleServerError(res, error);
    }
};

export const forgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await pool.query(getUserByEmailQuery, [email]);

        if (userResult.rowCount === 0) {
            return handleNotFoundError(res, 'User not found.', 404);
        }

        const resetToken = Math.random().toString(36).substring(2, 32);
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(updateResetTokenByEmail, [resetToken, expires, email]);

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${email}/${resetToken}`

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
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email.',
        });

    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return handleServerError(res, error);
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, email } = req.params;
        const { newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return handleValidationError(res, 'Token, email, and new password are required.', 400);
        }

        const userResult = await pool.query(getUserByEmailAndResetToken, [email, token]);
        if (userResult.rowCount === 0) {
            return handleValidationError(res, 'Invalid or expired password reset token.', 400);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users 
             SET password = $1, reset_password_token = NULL, reset_password_expires = NULL 
             WHERE email = $2`,
            [hashedNewPassword, email]
        );

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully.',
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return handleServerError(res, error);
    }
};

export const myProfile = async (req, res) => {
    try {
        const userResult = await pool.query(getUserProfileByEmail, [req.user.email]);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = userResult.rows[0];

        return res.status(200).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture,
                bio: user.bio,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return handleServerError(res, error);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, bio } = req.body;
        const email = req.user.email;

        const userResult = await pool.query(getUserByEmailQuery, [email]);
        if (userResult.rowCount === 0) {
            return handleNotFoundError(res, 'Not authenticated.', 401);
        }

        const user = userResult.rows[0];

        const updatedName = name || user.name;
        const updatedBio = bio || user.bio;

        let profilePicUrl = user.profile_picture;
        let profilePicPath = null;

        if (req.files && req.files.profilePic && req.files.profilePic.length > 0) {
            profilePicPath = req.files.profilePic[0].path;

            if (user.profile_picture) {
                const urlParts = user.profile_picture.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const [publicId] = fileName.split('.'); 
                const folder = 'profile_pics';
                const publicIdWithFolder = `${folder}/${publicId}`;
                try {
                    await deleteFromCloudinary(publicIdWithFolder);
                } catch (err) {
                    console.error('Error deleting previous profile pic from Cloudinary:', err);
                }
            }

            const uploadResult = await uploadToClodinary(profilePicPath, 'profile_pics');
            profilePicUrl = uploadResult.secure_url;

            fs.unlink(profilePicPath, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }

        await pool.query(
            `UPDATE users
             SET name = $1, bio = $2, profile_picture = $3
             WHERE email = $4`,
            [updatedName, updatedBio, profilePicUrl, email]
        );

        const updatedUserResult = await pool.query(getUserProfileByEmail, [email]);
        if (updatedUserResult.rowCount === 0) {
            return handleServerError(res, 'Failed to fetch updated user profile.');
        }

        const updatedUser = updatedUserResult.rows[0];
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                profile_picture: updatedUser.profile_picture,
                bio: updatedUser.bio,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return handleServerError(res, error);
    }
};