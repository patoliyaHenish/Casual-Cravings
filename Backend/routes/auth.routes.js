import express from 'express';
import { register } from '../controllers/auth.controller.js';
import { upload, validate } from '../utils/helper.js';
import { registerSchema } from '../validations/registerValidation.js';

const router = express.Router();

router.post('/register', upload.single('profilePic'), validate(registerSchema), register)

export default router;