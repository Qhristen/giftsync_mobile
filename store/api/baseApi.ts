import { tokenCache } from '@/utils/cache';
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as jose from 'jose';
import { logout } from '../slices/authSlice';

interface AxiosBaseQueryArgs extends Omit<AxiosRequestConfig, 'url'> {
    url: string;
}

interface ErrorResponse {
    message: string;
    code?: string;
    feature?: string;
    status?: number;
    statusCode?: number;
    timestamp?: string;
    path?: string;
}


export type AxiosBaseQueryError = {
    status?: number | string;
    data?: ErrorResponse;
}



export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jose.decodeJwt(token);
        // Check if the token has expired (current time is past expiration)
        return decoded?.exp ? decoded.exp * 1000 <= Date.now() : true;
    } catch {
        return true;
    }
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15s timeout to prevent hanging requests
});

let cachedToken: string | null = null;
let tokenLoadPromise: Promise<string | null> | null = null;
let tokenRefreshPromise: Promise<string | null> | null = null;

const clearStoredTokens = async () => {
    await Promise.all([
        tokenCache.remove('accessToken'),
        tokenCache.remove('refreshToken'),
    ]);
};

export const clearCachedToken = () => {
    cachedToken = null;
};

export const refreshAuthToken = async (): Promise<string | null> => {
    if (tokenRefreshPromise) return tokenRefreshPromise;

    tokenRefreshPromise = (async () => {
        const refreshToken = await tokenCache.get('refreshToken');
        if (!refreshToken) return null;

        const response = await axiosInstance.post('/api/v1/auth/refresh', {
            refreshToken,
        });

        const accessToken = response.data.accessToken as string;
        cachedToken = accessToken;

        await Promise.all([
            tokenCache.save('refreshToken', response.data.refreshToken),
            tokenCache.save('accessToken', accessToken),
        ]);

        return accessToken;
    })().finally(() => {
        tokenRefreshPromise = null;
    });

    return tokenRefreshPromise;
};

export const getValidToken = async (forceRefresh = false): Promise<string | null> => {
    if (forceRefresh) return refreshAuthToken();

    if (cachedToken && !isTokenExpired(cachedToken)) {
        return cachedToken;
    }

    if (!tokenLoadPromise) {
        tokenLoadPromise = (async () => {
            const latestToken = await tokenCache.get('accessToken');
            if (!latestToken) return null;

            if (isTokenExpired(latestToken)) {
                return refreshAuthToken();
            }

            cachedToken = latestToken;
            return latestToken;
        })().finally(() => {
            tokenLoadPromise = null;
        });
    }

    return tokenLoadPromise;
};


axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json";

        if (config.url?.includes('/api/v1/auth/refresh')) {
            return config;
        }

        try {
            const token = await getValidToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Token refresh failed in request interceptor:', error);
            clearCachedToken();
            await clearStoredTokens();
            return Promise.reject(error);
        }

        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!originalRequest) return Promise.reject(error);

        // Don't retry if it's the refresh token endpoint itself that failed
        if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
            clearCachedToken();
            await clearStoredTokens();
            return Promise.reject(error);
        }

        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await getValidToken(true);
                if (newToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }

                clearCachedToken();
                await clearStoredTokens();
                return Promise.reject(error);
            } catch (refreshError) {
                clearCachedToken();
                await clearStoredTokens();
                return Promise.reject(refreshError);
            }
        }

        throw error;
    }
);


const axiosBaseQuery = (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
> => async (args, api) => {
    try {
        const { url, method, data, params } = args;
        const result = await axiosInstance({
            url,
            method,
            data,
            params,
        });

        return { data: result.data };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        const status = axiosError.response?.status;

        // Automatically log out user if we get a 401 Unauthorized
        // This handles cases where the refresh token has expired or is invalid
        if (status === 401) {
            api.dispatch(logout());
            // Clear tokens
            clearCachedToken();
            void clearStoredTokens();
        }

        // A flag can change between manifest refreshes. Refresh the cached
        // manifest immediately whenever a feature endpoint rejects the call.
        if (axiosError.response?.data?.code === 'FEATURE_DISABLED') {
            api.dispatch(baseApi.util.invalidateTags(['FeatureManifest']));
        }

        return {
            error: {
                status,
                data: axiosError.response?.data || { message: axiosError.message },
            },
        };
    }
};

export const api = axiosInstance
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Contacts', 'Events', 'Recommendations', 'Orders', 'Shortlist', 'UserProfile', 'Wallet', 'Notifications', 'Products', 'Addresses', 'Chat', 'Business', 'Review', 'TrustSafety', 'Disputes', 'ReferralInfo', 'ReferralsList', 'FeatureManifest', 'PlatformConfig'],
    // Keep unused data cached for 5 minutes to reduce redundant fetches
    keepUnusedDataFor: 300,
    // Refetch on reconnect and on focus for freshness
    refetchOnReconnect: true,
    refetchOnFocus: true,
    endpoints: () => ({}),
});
