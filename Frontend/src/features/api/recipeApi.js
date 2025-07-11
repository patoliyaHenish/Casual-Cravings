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
            query: ({ search = '', page = 1, limit = 10, category_name = '', sub_category_name = '', added_by_user = '', added_by_admin = '', admin_approved_status = '', public_approved = '' } = {}) => {
                const params = new URLSearchParams({
                    search,
                    page,
                    limit,
                });
                if (category_name) params.append('category_name', category_name);
                if (sub_category_name) params.append('sub_category_name', sub_category_name);
                if (added_by_user !== '') params.append('added_by_user', added_by_user);
                if (added_by_admin !== '') params.append('added_by_admin', added_by_admin);
                if (admin_approved_status) params.append('admin_approved_status', admin_approved_status);
                if (public_approved !== '') params.append('public_approved', public_approved);
                return {
                    url: `/get-all-recipes-for-admin?${params.toString()}`,
                method: "GET",
                };
            },
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