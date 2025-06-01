import express from 'express';
import { changePassword, forgetPassword, login, logout, register, resetPassword } from '../controllers/auth.controller.js';
import { validate } from '../utils/helper.js';
import {changePasswordSchema, forgetPasswordSchema, loginSchema, registerSchema, resetPasswordSchema} from '../validations/userValidation.js'
import isAuthenticated from '../middlewares/auth.middleware.js';
import validateResetToken from '../middlewares/validateRestToken.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.put('/forget-password', validate(forgetPasswordSchema), forgetPassword);
router.put('/reset-password/:email/:token', validateResetToken, validate(resetPasswordSchema), resetPassword);
router.put('/change-password', isAuthenticated, validate(changePasswordSchema), changePassword);

router.put('/logout', isAuthenticated, logout);

export default router;