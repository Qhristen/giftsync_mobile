import { User } from '@/types';
import { tokenCache } from '@/utils/cache';
import { BASE_URL } from '@/utils/constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import axios from 'axios';
import * as jose from 'jose';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    pendingReferralCode: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingReferralCode: null,
};


export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.log('Google sign out error (possibly not signed in with Google):', error);
        }

        try {
            // Clear from SecureStore
            await tokenCache.deleteToken('accessToken');
            await tokenCache.deleteToken('refreshToken');
        } catch (error) {
            console.error('Error clearing tokens from SecureStore:', error);
        }

        // Always clear memory cache and reset API state
        tokenCache.clearAll();
        dispatch(baseApi.util.resetApiState());
        
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setPendingReferralCode: (state, action: PayloadAction<string | null>) => {
            state.pendingReferralCode = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            });
    },
});

export const { setCredentials, setLoading, setError, setPendingReferralCode } = authSlice.actions;
export default authSlice.reducer;

