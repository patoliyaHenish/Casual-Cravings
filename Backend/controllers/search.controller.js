import { pool } from "../config/db.js";
import { handleServerError, handleValidationError } from "../utils/erroHandler.js";
import { 
    searchRecipesQuery, 
    searchRecipesCountQuery, 
    getPopularKeywordsQuery, 
    getSearchSuggestionsQuery 
} from "../query/recipe.js";

export const searchRecipes = async (req, res) => {
    try {
        const {
            q = '',
            category = null,
            subCategory = null,
            prepTime = null,
            cookTime = null,
            servingSize = null,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const searchTerm = `%${q}%`;

        let baseQuery = searchRecipesQuery;
        const queryParams = [];
        let paramCount = 0;

        if (q.trim()) {
            paramCount++;
            baseQuery += ` AND (
                LOWER(r.title) LIKE LOWER($${paramCount}) 
                OR LOWER(r.keywords::text) LIKE LOWER($${paramCount})
            )`;
            queryParams.push(searchTerm);
        }

        if (prepTime) {
            paramCount++;
            baseQuery += ` AND r.prep_time <= $${paramCount}`;
            queryParams.push(parseInt(prepTime));
        }

        if (cookTime) {
            paramCount++;
            baseQuery += ` AND r.cook_time <= $${paramCount}`;
            queryParams.push(parseInt(cookTime));
        }

        if (servingSize) {
            paramCount++;
            baseQuery += ` AND r.serving_size >= $${paramCount}`;
            queryParams.push(parseInt(servingSize));
        }

        const validSortFields = ['created_at', 'title', 'prep_time', 'cook_time', 'serving_size'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
        
        baseQuery += ` ORDER BY r.${sortField} ${order}`;

        paramCount++;
        baseQuery += ` LIMIT $${paramCount}`;
        queryParams.push(parseInt(limit));

        paramCount++;
        baseQuery += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        const searchResult = await pool.query(baseQuery, queryParams);

        let countQuery = searchRecipesCountQuery;

        const countParams = [];
        paramCount = 0;

        if (q.trim()) {
            paramCount++;
            countQuery += ` AND (
                LOWER(r.title) LIKE LOWER($${paramCount}) 
                OR LOWER(r.keywords::text) LIKE LOWER($${paramCount})
            )`;
            countParams.push(searchTerm);
        }

        if (prepTime) {
            paramCount++;
            countQuery += ` AND r.prep_time <= $${paramCount}`;
            countParams.push(parseInt(prepTime));
        }

        if (cookTime) {
            paramCount++;
            countQuery += ` AND r.cook_time <= $${paramCount}`;
            countParams.push(parseInt(cookTime));
        }

        if (servingSize) {
            paramCount++;
            countQuery += ` AND r.serving_size >= $${paramCount}`;
            countParams.push(parseInt(servingSize));
        }

        const countResult = await pool.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].total);

        const recipes = searchResult.rows.map(recipe => {
            const totalTime = recipe.prep_time + recipe.cook_time;
            let authorProfilePicture = null;
            let recipeImage = recipe.image_url;
            
            if (recipe.author_profile_picture_data && recipe.author_profile_picture_mime_type) {
                const base64 = recipe.author_profile_picture_data.toString('base64');
                authorProfilePicture = `data:${recipe.author_profile_picture_mime_type};base64,${base64}`;
            }
            
            if (recipe.recipe_image_data && recipe.recipe_image_mime_type) {
                const base64 = recipe.recipe_image_data.toString('base64');
                recipeImage = `data:${recipe.recipe_image_mime_type};base64,${base64}`;
            }
            
            return {
                id: recipe.recipe_id,
                image: recipeImage,
                title: recipe.title,
                totalTime: totalTime,
                authorName: recipe.author_name || 'Anonymous',
                authorProfilePicture: authorProfilePicture
            };
        });

        res.status(200).json({
            success: true,
            data: {
                recipes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        return handleServerError(res, "Failed to search recipes");
    }
};

export const getSearchSuggestions = async (req, res) => {
    try {
        const { q = '' } = req.query;
        const searchTerm = `%${q}%`;

        const popularResult = await pool.query(getPopularKeywordsQuery);
        const popularSearches = popularResult.rows.map(row => row.keyword);

        if (!q.trim()) {
            return res.status(200).json({
                success: true,
                data: {
                    suggestions: [],
                    popularSearches
                }
            });
        }

        const suggestionsResult = await pool.query(getSearchSuggestionsQuery, [searchTerm]);

        const suggestions = [];
        const seenSuggestions = new Set();

        suggestionsResult.rows.forEach(recipe => {
            if (recipe.title.toLowerCase().includes(q.toLowerCase()) && !seenSuggestions.has(recipe.title)) {
                let recipeImage = recipe.image_url;
                if (recipe.recipe_image_data && recipe.recipe_image_mime_type) {
                    const base64 = recipe.recipe_image_data.toString('base64');
                    recipeImage = `data:${recipe.recipe_image_mime_type};base64,${base64}`;
                }
                
                suggestions.push({
                    type: 'title',
                    text: recipe.title,
                    image: recipeImage
                });
                seenSuggestions.add(recipe.title);
            }

            if (recipe.keywords && Array.isArray(recipe.keywords)) {
                recipe.keywords.forEach(keyword => {
                    if (keyword.toLowerCase().includes(q.toLowerCase()) && !seenSuggestions.has(keyword)) {
                        suggestions.push({
                            type: 'keyword',
                            text: keyword
                        });
                        seenSuggestions.add(keyword);
                    }
                });
            }
        });

        res.status(200).json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, 10),
                popularSearches
            }
        });

    } catch (error) {
        return handleServerError(res, "Failed to get search suggestions");
    }
};

