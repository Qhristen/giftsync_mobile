import { tokenCache } from '@/utils/cache';
import { BASE_URL } from '@/utils/constants';
import { AuthUser } from '@/utils/middleware';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as jose from 'jose';

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async Thunks
export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, { dispatch }) => {
        try {
            const storedAccessToken = await tokenCache.getToken('accessToken');
            const storedRefreshToken = await tokenCache.getToken('refreshToken');
            console.log('storedAccessToken', storedAccessToken);
            console.log('storedRefreshToken', storedRefreshToken);
            if (!storedAccessToken) {
                if (storedRefreshToken) {
                    return await dispatch(refreshTokens(storedRefreshToken)).unwrap();
                }
                return null;
            }

            try {
                const decoded = jose.decodeJwt(storedAccessToken);
                const exp = (decoded as any).exp;
                const now = Math.floor(Date.now() / 1000);

                if (exp && exp > now) {
                    return {
                        user: decoded as AuthUser,
                        accessToken: storedAccessToken,
                        refreshToken: storedRefreshToken,
                    };
                } else if (storedRefreshToken) {
                    return await dispatch(refreshTokens(storedRefreshToken)).unwrap();
                }
            } catch (e) {
                if (storedRefreshToken) {
                    return await dispatch(refreshTokens(storedRefreshToken)).unwrap();
                }
            }
            return null;
        } catch (error) {
            console.error('Error restoring session:', error);
            return null;
        }
    }
);

export const exchangeIdToken = createAsyncThunk(
    'auth/exchangeIdToken',
    async ({ idToken }: { idToken: string }) => {
        const formData = new FormData();
        formData.append('idToken', idToken);
        formData.append('platform', 'native');

        const response = await fetch(`${BASE_URL}/api/auth/token`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Token exchange failed');
        }

        const tokens = await response.json();

        // Save to SecureStore
        if (tokens.accessToken) await tokenCache.saveToken('accessToken', tokens.accessToken);
        if (tokens.refreshToken) await tokenCache.saveToken('refreshToken', tokens.refreshToken);

        const user = jose.decodeJwt(tokens.accessToken) as AuthUser;
        return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    }
);

export const refreshTokens = createAsyncThunk(
    'auth/refreshTokens',
    async (tokenToUse: string, { dispatch }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform: 'native', refreshToken: tokenToUse }),
            });

            if (!response.ok) {
                dispatch(logoutUser());
                throw new Error('Refresh token invalid');
            }

            const tokens = await response.json();
            if (tokens.accessToken) await tokenCache.saveToken('accessToken', tokens.accessToken);
            if (tokens.refreshToken) await tokenCache.saveToken('refreshToken', tokens.refreshToken);

            const user = jose.decodeJwt(tokens.accessToken) as AuthUser;
            return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
        } catch (error) {
            dispatch(logoutUser());
            throw error;
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        await GoogleSignin.signOut();
        await tokenCache.deleteToken('accessToken');
        await tokenCache.deleteToken('refreshToken');
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(restoreSession.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.user = action.payload.user;
                    state.accessToken = action.payload.accessToken;
                    state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                }
            })
            .addCase(restoreSession.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(exchangeIdToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(exchangeIdToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(exchangeIdToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Authentication failed';
            })
            .addCase(refreshTokens.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            });
    },
});

export const { setCredentials, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;

