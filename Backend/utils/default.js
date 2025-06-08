import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { userTableQuery } from '../query/users/userTable.js';
import { createRecipeCategoryTable } from '../query/recipe category/recipeCategoryTable.js';
import { createSubCategoryTable } from '../query/sub category/subCategoryTable.js';
import { createRecipeTable } from '../query/recipe/recipeTable.js';
import { createIngredientsTable } from '../query/ingredients/ingredientsTable.js';
import { createRecipeInstructionTable } from '../query/recipe instruction/recipeInstructionTable.js';
import { createCommentTable } from '../query/comment/commentTable.js';
import { createLikeTable } from '../query/likes/likeTable.js';
import { createSaveRecipeTable } from '../query/save recipe/saveRecipe.js';
import { createFollowerTable } from '../query/followers/followersTable.js';

const createRecipeDatabaseIfNotExists = async () => {
    const dbName = process.env.DB_NAME;

    try {
        const result = await pool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
        );
        if (result.rowCount === 0) {
            await pool.query(`CREATE DATABASE "${dbName}"`);
        }
    } catch (err) {
        console.error('Error checking or creating database:', err);
    }
}

const createUsersTableIfNotExists = async () => {
    try {
        await pool.query(userTableQuery);
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

const createDefaultAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = 'Admin';
    const is_verified = process.env.ADMIN_IS_VERIFIED || 'true';
    const adminBio = 'This is the default admin user.';

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [adminEmail]
        );
        if (result.rowCount === 0) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await pool.query(
                `INSERT INTO users (name, email, password, role, is_verified, bio) VALUES ($1, $2, $3, $4, $5, $6)`,
                [adminName, adminEmail, hashedPassword, 'admin', is_verified, adminBio]
            );
        }
    } catch (err) {
        console.error('Error creating default admin user:', err);
    }
};

const createRecipeCategoryTableIfNotExists = async () => {
    try {
        await pool.query(createRecipeCategoryTable);
    } catch (error) {
        console.error('Error creating recipe category table:', error);
    }
};

const createSubCategoryTableIfNotExists = async () => {
    try {
        await pool.query(createSubCategoryTable);
    } catch (error) {
        console.error('Error creating sub category table:', error);
    }
};

const createRecipeTableIfNotExists = async () => {
    try {
        await pool.query(createRecipeTable);
    } catch (error) {
        console.error('Error creating recipe table:', error);
    }
};

const createIngredientsTableIfNotExists = async () => {
    try {
        await pool.query(createIngredientsTable);
    } catch (error) {
        console.error('Error creating ingredients table:', error);
    }
};

const createRecipeInstructionsTableIfNotExists = async () => {
    try {
        await pool.query(createRecipeInstructionTable);
    } catch (error) {
        console.error('Error creating recipe instructions table:', error);
    }
};

const createCommentTableIfNotExists = async () => {
    try {
        await pool.query(createCommentTable);
    } catch (error) {
        console.error('Error creating comment table:', error);
    }
};

const createLikeTableIfNotExists = async () => {
    try {
        await pool.query(createLikeTable);
    } catch (error) {
        console.error('Error creating like table:', error);
    }
};

const saveRecipeTableIfNotExists = async () => {
    try {
        await pool.query(createSaveRecipeTable);
    } catch (error) {
        console.error('Error creating recipe table:', error);
    }
};

const createFollowerTableIfNotExists = async () => {
    try {
        await pool.query(createFollowerTable);
    } catch (error) {
        console.error('Error creating follower table:', error);
    }
};

export const executeSetup = async () => {
    await createRecipeDatabaseIfNotExists();
    await createUsersTableIfNotExists();
    await createDefaultAdminUser();
    await createRecipeCategoryTableIfNotExists();
    await createSubCategoryTableIfNotExists();
    await createRecipeTableIfNotExists();
    await createIngredientsTableIfNotExists();
    await createRecipeInstructionsTableIfNotExists();
    await createCommentTableIfNotExists();
    await createLikeTableIfNotExists();
    await saveRecipeTableIfNotExists();
    await createFollowerTableIfNotExists();
};