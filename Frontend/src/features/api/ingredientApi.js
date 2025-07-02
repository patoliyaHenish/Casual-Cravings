import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const INGREDIENT_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-recipe-ingredient`;

export const ingredientApi = createApi({
    reducerPath: "ingredientApi",
    tagTypes: ["Refetch_Ingredient"],
    baseQuery: fetchBaseQuery({
        baseUrl: INGREDIENT_API_URL,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        addNewIngredient: builder.mutation({
            query: (data) => ({
                url: "/add-new-ingredient",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Refetch_Ingredient"],
        }),
        updateIngredient: builder.mutation({
            query: (data) => ({
                url: "/update-ingredient",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Refetch_Ingredient"],
        }),
        deleteIngredient: builder.mutation({
            query: (data) => ({
                url: "/delete-ingredient",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["Refetch_Ingredient"],
        }),
        getAllIngredients: builder.query({
            query: (params) => ({
                url: "/get-all-ingredients",
                method: "GET",
                params,
            }),
            providesTags: ["Refetch_Ingredient"],
        }),
        getIngredientById: builder.mutation({
            query: (data) => ({
                url: "/get-ingredient",
                method: "POST",
                body: data,
            }),
            providesTags: ["Refetch_Ingredient"],
        }),
    }),
});

export const {
    useAddNewIngredientMutation,
    useUpdateIngredientMutation,
    useDeleteIngredientMutation,
    useGetAllIngredientsQuery,
    useGetIngredientByIdMutation,
} = ingredientApi;