import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { executeSetup } from './utils/default.js';
import cookieParser from 'cookie-parser';

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

executeSetup();

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});