import { LoginResponse, User } from '@/types';
import { tokenCache } from '@/utils/cache';
import * as jose from 'jose';
import { setCredentials } from '../slices/authSlice';
import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        googleAuth: builder.mutation<LoginResponse, { idToken: string }>({
            query: (credentials) => ({
                url: '/api/v1/auth/google',
                method: 'POST',
                data: credentials,
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data: response } = await queryFulfilled;

                    if (response.accessToken) await tokenCache.saveToken('accessToken', response.accessToken);
                    if (response.refreshToken) await tokenCache.saveToken('refreshToken', response.refreshToken);

                    dispatch(setCredentials({
                        user: response.user
                    }));
                } catch (err) {
                    // error handled by RTK Query's error state
                }
            },
        }),
        refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, { refreshToken: string }>({
            query: (credentials) => ({
                url: '/api/v1/auth/refresh',
                method: 'POST',
                data: credentials,
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data: tokens } = await queryFulfilled;

                    if (tokens.accessToken) await tokenCache.saveToken('accessToken', tokens.accessToken);
                    if (tokens.refreshToken) await tokenCache.saveToken('refreshToken', tokens.refreshToken);

                    const user = jose.decodeJwt(tokens.accessToken) as User;
                    dispatch(setCredentials({
                        user,
                    }));
                } catch (err) {
                    // error handled by RTK Query's error state
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGoogleAuthMutation, useRefreshTokenMutation } = authApi;
