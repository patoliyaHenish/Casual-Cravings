import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDB } from './config/db.js';
import { executeSetup } from './utils/default.js';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';
import session from 'express-session';
import passport from './utils/passport.js';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [ process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

executeSetup();

app.use('/api', router);

app.listen(PORT, () => {
});