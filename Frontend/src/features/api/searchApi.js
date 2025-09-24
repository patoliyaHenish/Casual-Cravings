import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const SEARCH_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/search`;

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: fetchBaseQuery({
        baseUrl: SEARCH_API_URL,
        credentials: 'include',
    }),
    tagTypes: ['SearchResults', 'SearchSuggestions'],
    endpoints: (builder) => ({
        searchRecipes: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                
                if (params.q) searchParams.append('q', params.q);
                if (params.category) searchParams.append('category', params.category);
                if (params.subCategory) searchParams.append('subCategory', params.subCategory);
                if (params.prepTime) searchParams.append('prepTime', params.prepTime);
                if (params.cookTime) searchParams.append('cookTime', params.cookTime);
                if (params.servingSize) searchParams.append('servingSize', params.servingSize);
                if (params.page) searchParams.append('page', params.page);
                if (params.limit) searchParams.append('limit', params.limit);
                if (params.sortBy) searchParams.append('sortBy', params.sortBy);
                if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
                
                return {
                    url: `/recipes?${searchParams.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (result, error, params) => [
                { type: 'SearchResults', id: `${params.q || 'all'}-${params.page}` }
            ],
            transformResponse: (response) => {
                if (response.success) {
                    return response.data;
                }
                throw new Error(response.message || 'Search failed');
            },
        }),

        getSearchSuggestions: builder.query({
            query: (query) => ({
                url: `/suggestions?q=${encodeURIComponent(query)}`,
                method: 'GET',
            }),
            providesTags: (result, error, query) => [
                { type: 'SearchSuggestions', id: query }
            ],
            transformResponse: (response) => {
                if (response.success) {
                    return response.data;
                }
                throw new Error(response.message || 'Failed to get suggestions');
            },
        }),


    }),
});

export const {
    useSearchRecipesQuery,
    useGetSearchSuggestionsQuery,
} = searchApi; 