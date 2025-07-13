import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const INGREDIENT_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-ingredients`;

export const ingredientApi = createApi({
  reducerPath: 'ingredientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: INGREDIENT_API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Ingredient', 'RecipeIngredient'],
  endpoints: (builder) => ({
    searchIngredients: builder.query({
      query: (query) => ({
        url: '/search',
        params: { query },
      }),
      providesTags: ['Ingredient'],
    }),

    getAllIngredients: builder.query({
      query: () => '/all',
      providesTags: ['Ingredient'],
    }),

    createIngredient: builder.mutation({
      query: (ingredient) => ({
        url: '/create',
        method: 'POST',
        body: ingredient,
      }),
      invalidatesTags: ['Ingredient'],
    }),

    deleteIngredient: builder.mutation({
      query: (ingredientId) => ({
        url: `/${ingredientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ingredient'],
    }),

    getRecipeIngredients: builder.query({
      query: (recipeId) => `/recipe/${recipeId}`,
      providesTags: ['RecipeIngredient'],
    }),

    addIngredientToRecipe: builder.mutation({
      query: ({ recipeId, ingredient }) => ({
        url: `/recipe/${recipeId}/add`,
        method: 'POST',
        body: ingredient,
      }),
      invalidatesTags: ['RecipeIngredient'],
    }),

    updateRecipeIngredient: builder.mutation({
      query: ({ recipeIngredientId, ingredient }) => ({
        url: `/recipe-ingredient/${recipeIngredientId}`,
        method: 'PUT',
        body: ingredient,
      }),
      invalidatesTags: ['RecipeIngredient'],
    }),

    removeIngredientFromRecipe: builder.mutation({
      query: (recipeIngredientId) => ({
        url: `/recipe-ingredient/${recipeIngredientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecipeIngredient'],
    }),

    getIngredientsPaginated: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/paginated',
        params: { page, limit },
      }),
    }),
  }),
});

export const {
  useSearchIngredientsQuery,
  useGetAllIngredientsQuery,
  useCreateIngredientMutation,
  useDeleteIngredientMutation,
  useGetRecipeIngredientsQuery,
  useAddIngredientToRecipeMutation,
  useUpdateRecipeIngredientMutation,
  useRemoveIngredientFromRecipeMutation,
  useGetIngredientsPaginatedQuery,
} = ingredientApi; 