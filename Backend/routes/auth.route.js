import express from 'express';
import { changePassword, forgetPassword, login, logout, register, resetPassword, verifyOtp } from '../controllers/auth.controller.js';
import { validate } from '../utils/helper.js';
import {changePasswordSchema, emailValidationSchema, loginSchema, registerSchema, resetPasswordSchema} from '../validations/userValidation.js'
import isAuthenticated from '../middlewares/auth.middleware.js';
import validateResetToken from '../middlewares/validateRestToken.js';
import { upload } from '../utils/multer.js';

const router = express.Router();

router.post('/register', upload.fields([{name: "profilePic", maxCount: 1}]), validate(registerSchema), register);
router.post('/verify-otp', verifyOtp);
router.put('/resend-otp', validate(emailValidationSchema), verifyOtp);
router.post('/login', validate(loginSchema), login);

router.put('/forget-password', validate(emailValidationSchema), forgetPassword);
router.put('/reset-password/:email/:token', validateResetToken, validate(resetPasswordSchema), resetPassword);
router.put('/change-password', isAuthenticated, validate(changePasswordSchema), changePassword);

router.put('/logout', isAuthenticated, logout);

export default router;