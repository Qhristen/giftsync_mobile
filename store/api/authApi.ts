import { LoginResponse, User } from '@/types';
import { tokenCache } from '@/utils/cache';
import * as jose from 'jose';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { logout, setCredentials } from '../slices/authSlice';
import { baseApi, clearCachedToken } from './baseApi';

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

                    if (response.accessToken) await tokenCache.save('accessToken', response.accessToken);
                    if (response.refreshToken) await tokenCache.save('refreshToken', response.refreshToken);

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

                    if (tokens.accessToken) await tokenCache.save('accessToken', tokens.accessToken);
                    if (tokens.refreshToken) await tokenCache.save('refreshToken', tokens.refreshToken);

                    const user = jose.decodeJwt(tokens.accessToken) as User;
                    dispatch(setCredentials({
                        user,
                    }));
                } catch (err) {
                    // error handled by RTK Query's error state
                }
            },
        }),
        logout: builder.mutation<void, void>({
            queryFn: async (_, { dispatch }, _extraOptions, baseQuery) => {
                // Call backend logout if we have a refresh token
                try {
                    const refreshToken = await tokenCache.get('refreshToken');
                    if (refreshToken) {
                        await baseQuery({
                            url: '/api/v1/auth/logout',
                            method: 'POST',
                            data: { refreshToken },
                        });
                    }
                } catch (error) {
                    console.error('logout failed:', error);
                }

                // Perform local cleanup
                try {
                    await GoogleSignin.signOut();
                } catch (error) {
                    console.log('Google sign out error (possibly not signed in with Google):', error);
                }

                try {
                    // Clear from SecureStore
                    await tokenCache.remove('accessToken');
                    await tokenCache.remove('refreshToken');
                } catch (error) {
                    console.error('Error clearing tokens from SecureStore:', error);
                }

                // Always clear memory cache and reset API state
                clearCachedToken();
                dispatch(baseApi.util.resetApiState());
                dispatch(logout());

                return { data: undefined };
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGoogleAuthMutation, useRefreshTokenMutation, useLogoutMutation } = authApi;
