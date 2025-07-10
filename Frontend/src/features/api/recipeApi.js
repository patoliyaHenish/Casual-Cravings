import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const RECIPE_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-recipe-by-admin`;

export const recipeApi = createApi({
    reducerPath: "recipeApi",
    tagTypes: ["Refetch_Recipe"],
    baseQuery: fetchBaseQuery({
        baseUrl: RECIPE_API_URL,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createRecipeByAdmin: builder.mutation({
            query: (inputData) => ({
                url: "/create-recipe-by-admin",
                method: "POST",
                body: inputData,
            }),
            invalidatesTags: ["Refetch_Recipe"],
        }),
        getAllRecipesForAdmin: builder.query({
            query: ({ search = '', page = 1, limit = 10 } = {}) => ({
                url: `/get-all-recipes-for-admin?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["Refetch_Recipe"],
        }),
        getRecipeByIdForAdmin: builder.query({
            query: (id) => ({
                url: `/get-recipe-by-id/${id}`,
                method: "GET",
            }),
            providesTags: ["Refetch_Recipe"],
        }),
        deleteRecipeByAdmin: builder.mutation({
            query: (id) => ({
                url: `/delete-recipe-by-admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Recipe"],
        }),
        updateRecipeByAdmin: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/update-recipe-by-admin/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Refetch_Recipe"],
        }),
        updateRecipeAdminApprovedStatus: builder.mutation({
            query: ({ id, admin_approved_status }) => ({
                url: `/update-admin-approved-status/${id}`,
                method: "PATCH",
                body: { admin_approved_status },
            }),
            invalidatesTags: ["Refetch_Recipe"],
        }),
        updateRecipePublicApprovedStatus: builder.mutation({
            query: ({ id, public_approved }) => ({
                url: `/update-public-approved-status/${id}`,
                method: "PATCH",
                body: { public_approved },
            }),
            invalidatesTags: ["Refetch_Recipe"],
        }),
    })
});

export const {
    useCreateRecipeByAdminMutation,
    useGetAllRecipesForAdminQuery,
    useGetRecipeByIdForAdminQuery,
    useDeleteRecipeByAdminMutation,
    useUpdateRecipeByAdminMutation,
    useUpdateRecipeAdminApprovedStatusMutation,
    useUpdateRecipePublicApprovedStatusMutation,
} = recipeApi;