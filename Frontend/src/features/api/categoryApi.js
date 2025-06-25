import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CATEGORY_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-recipe-category`;

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: CATEGORY_API_URL,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        
    })
})

export const {

} = categoryApi;