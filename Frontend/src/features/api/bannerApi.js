import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BANNER_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/manage-banner`;
const PUBLIC_BANNER_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/banner`;

export const bannerApi = createApi({
    reducerPath: "bannerApi",
    tagTypes: ["Refetch_Banner"],
    baseQuery: fetchBaseQuery({
        baseUrl: BANNER_API_URL,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createBanner: builder.mutation({
            query: (inputData) => ({
                url: `/`,
                method: "POST",
                body: inputData,
            }),
            invalidatesTags: ["Refetch_Banner"],
        }),
        getBanners: builder.query({
            query: () => ({
                url: `/`,
                method: "GET",
            }),
            providesTags: ["Refetch_Banner"],
        }),
        getBannerById: builder.query({
            query: (id) => ({
                url: `/${id}`,
                method: "GET",
            }),
            providesTags: ["Refetch_Banner"],
        }),
        updateBanner: builder.mutation({
            query: ({ id, inputData }) => ({
                url: `/${id}`,
                method: "PUT",
                body: inputData,
            }),
            invalidatesTags: ["Refetch_Banner"],
        }),
        deleteBanner: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Banner"],
        }),
        setHeroBanner: builder.mutation({
            query: (id) => ({
                url: `/${id}/set-hero`,
                method: "POST",
            }),
            invalidatesTags: ["Refetch_Banner"],
        }),
        getHeroBanner: builder.query({
            query: () => ({
                url: `/hero`,
                baseUrl: PUBLIC_BANNER_API_URL,
                method: "GET",
            }),
            providesTags: ["Refetch_Banner"],
        }),
    })
})

export const {
    useCreateBannerMutation,
    useGetBannersQuery,
    useGetBannerByIdQuery,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
    useSetHeroBannerMutation,
    useGetHeroBannerQuery
} = bannerApi; 