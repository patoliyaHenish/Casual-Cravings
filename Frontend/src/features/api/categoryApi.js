import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CATEGORY_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-recipe-category`;

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    tagTypes: ["Refetch_Category"],
    baseQuery: fetchBaseQuery({
        baseUrl: CATEGORY_API_URL,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createRecipeCategory: builder.mutation({
            query: (inputData) => ({
                url: "/create-recipe-category",
                method: "POST",
                body: inputData,
            }),
            invalidatesTags: ["Refetch_Category"],
        }),
        getRecipeCategories: builder.query({
            query: ({ search = '', page = 1, limit = 10 } = {}) => ({
                url: `/get-recipe-categories?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["Refetch_Category"],
        }),
        getRecipeCategoryById: builder.query({
            query: (id) => ({
                url: `/get-recipe-category/${id}`,
                method: "GET",
            }),
            providesTags: ["Refetch_Category"],
        }),
        deleteRecipeCategoryById: builder.mutation({
            query: (id) => ({
                url: `/delete-recipe-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Category"],
        }),
        updateRecipeCategoryById: builder.mutation({
            query: ({ id, inputData }) => ({
                url: `/update-recipe-category/${id}`,
                method: "PUT",
                body: inputData,
            }),
            invalidatesTags: ["Refetch_Category"],
        }),
    })
})

export const {
    useCreateRecipeCategoryMutation,
    useGetRecipeCategoriesQuery,
    useGetRecipeCategoryByIdQuery,
    useDeleteRecipeCategoryByIdMutation,
    useUpdateRecipeCategoryByIdMutation
} = categoryApi;