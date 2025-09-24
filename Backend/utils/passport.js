import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { pool } from '../config/db.js';
import { getUserByEmailQuery, insertUser } from '../query/user.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let userResult = await pool.query(getUserByEmailQuery, [email]);
        if (userResult.rowCount === 0) {
            await pool.query(insertUser, [
                profile.displayName,
                email,
                null,
                profile.photos[0]?.value || null,
            ]);
            userResult = await pool.query(getUserByEmailQuery, [email]);
        }
        return done(null, userResult.rows[0]);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.email);
});
passport.deserializeUser(async (email, done) => {
    const userResult = await pool.query(getUserByEmailQuery, [email]);
    done(null, userResult.rows[0]);
});

export default passport;