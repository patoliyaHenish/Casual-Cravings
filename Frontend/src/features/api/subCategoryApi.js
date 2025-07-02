import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const SUB_CATEGORY_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-recipe-sub-category`;

export const subCategoryApi = createApi({
    reducerPath: "subCategoryApi",
    tagTypes: ["Refetch_SubCategory"],
    baseQuery: fetchBaseQuery({
        baseUrl: SUB_CATEGORY_API_URL,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createRecipeSubCategory: builder.mutation({
            query: (data) => ({
                url: "create-recipe-sub-category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Refetch_SubCategory"],
        }),
        updateRecipeSubCategory: builder.mutation({
            query: (data) => ({
                url: "/update-recipe-sub-category",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Refetch_SubCategory"],
        }),
        deleteRecipeSubCategory: builder.mutation({
            query: (data) => ({
                url: "/delete-recipe-sub-category",
                method: "DELETE",
                body: data,
            }),
            invalidatesTags: ["Refetch_SubCategory"],
        }),
        getAllRecipeSubCategorieDetails: builder.query({
            query: (params) => ({
                url: "/get-all-recipe-sub-category-details",
                method: "GET",
                params,
            }),
            providesTags: ["Refetch_SubCategory"],
        }),
        getRecipeSubCategoryById: builder.mutation({
            query: (data) => ({
                url: "/get-particular-recipe-sub-category",
                method: "post",
                body: data,
            }),
            providesTags: ["Refetch_SubCategory"],
        }),
    }),
});

export const {
    useCreateRecipeSubCategoryMutation,
    useUpdateRecipeSubCategoryMutation,
    useDeleteRecipeSubCategoryMutation,
    useGetAllRecipeSubCategorieDetailsQuery,
    useGetRecipeSubCategoryByIdMutation,
} = subCategoryApi;