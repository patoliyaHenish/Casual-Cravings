import express from 'express';
import { changePassword, forgetPassword, login, logout, myProfile, register, resendOtp, resetPassword, updateProfile, verifyOtp } from '../controllers/auth.controller.js';
import { validate } from '../utils/helper.js';
import {changePasswordSchema, emailValidationSchema, loginSchema, registerSchema, resetPasswordSchema, updateProfileSchema} from '../validations/userValidation.js'
import isAuthenticated from '../middlewares/auth.middleware.js';
import validateResetToken from '../middlewares/validateRestToken.js';
import { upload } from '../utils/multer.js';
import passport from "../utils/passport.js";
import { setTokenCookie } from '../utils/generateToken.js';
import dotnenv from 'dotenv';
import { pool } from '../config/db.js';
dotnenv.config();

const router = express.Router();

router.post('/register', upload.fields([{name: "profilePic", maxCount: 1}]), validate(registerSchema), register);
router.post('/verify-otp', verifyOtp);
router.put('/resend-otp', validate(emailValidationSchema), resendOtp);
router.post('/login', validate(loginSchema), login);

router.put('/forget-password', validate(emailValidationSchema), forgetPassword);
router.put('/reset-password/:email/:token', validateResetToken, validate(resetPasswordSchema), resetPassword);
router.put('/change-password', isAuthenticated, validate(changePasswordSchema), changePassword);

router.get('/my-profile', isAuthenticated, myProfile);
router.put('/update-profile', isAuthenticated, upload.fields([{name: "profilePic", maxCount: 1}]), validate(updateProfileSchema), updateProfile);
router.put('/logout', isAuthenticated, logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
     try {
        await pool.query(
            'UPDATE users SET is_verified = TRUE WHERE email = $1',
            [req.user.email]
        );
    } catch (err) {
        console.error('Failed to update is_verified:', err);
    }
    setTokenCookie(res, {
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profile_picture,
        role: req.user.role || 'user',
    }, 'Google login successful');

    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
});

export default router;