import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { userLoggedIn, userLoggedOut } from '../authSlice';

const AUTH_API_URL = `${import.meta.env.VITE_APP_API_URL}/api/auth`;

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: AUTH_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: '/register',
                method: 'POST',
                body: inputData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(userLoggedIn(data));
                } catch {
                    dispatch(userLoggedOut());
                }
            },
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: '/login',
                method: 'POST',
                body: inputData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(userLoggedIn(data));
                } catch (error) {
                    console.error('Login failed:', error);
                }
            },
        }),
        verifyOtp: builder.mutation({
            query: (inputData) => ({
                url: '/verify-otp',
                method: 'POST',
                body: inputData,
            }),
        }),
        resendOtp: builder.mutation({
            query: (inputData) => ({
                url: '/resend-otp',
                method: 'PUT',
                body: inputData,
            }),
        }),
        forgetPassword: builder.mutation({
            query: (inputData) => ({
                url: '/forget-password',
                method: 'PUT',
                body: inputData,
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ email, token, newPassword }) => ({
                url: `/reset-password/${email}/${token}`,
                method: 'PUT',
                body: { newPassword },
            }),
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'PUT',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            },
        }),
        myProfile: builder.query({
            query: () => ({
                url: '/my-profile',
                method: 'GET',
            }),
            providesTags: ['UserProfile'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.user) {
                        dispatch(userLoggedIn({ user: data.user }));
                    }
                } catch (error) {
                    console.error('Fetching profile failed:', error);
                }
            },
        }),
        updateProfile: builder.mutation({
            query: (inputData) => ({
                url: '/update-profile',
                method: 'PUT',
                body: inputData,
            }),
            invalidatesTags: ['UserProfile'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.user) {
                        dispatch(userLoggedIn({ user: data.user }));
                    }
                } catch (error) {
                    console.error('Updating profile failed:', error);
                }
            },
        }),
        changePassword: builder.mutation({
            query: (inputData) => ({
                url: '/change-password',
                method: 'PUT',
                body: inputData,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.message) {
                        console.log('Password changed successfully:', data.message);
                    }
                } catch (error) {
                    console.error('Changing password failed:', error);
                }
            },
        })
    })
})

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
    useLogoutUserMutation,
    useMyProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation
} = authApi;    