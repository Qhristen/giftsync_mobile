import { tokenCache } from '@/utils/cache';
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as jose from 'jose';
import { logoutUser } from '../slices/authSlice';

interface AxiosBaseQueryArgs extends Omit<AxiosRequestConfig, 'url'> {
    url: string;
}

interface ErrorResponse {
    message: string;
    code?: string;
    status?: number;
}


export type AxiosBaseQueryError = {
    status?: number | string;
    data?: ErrorResponse;
}

let lastCheckedToken: string | null = null;
let lastCheckedTokenExp: number = 0;

export const isTokenExpired = (token: string): boolean => {
    if (!token) return true;

    let exp = lastCheckedTokenExp;
    if (token !== lastCheckedToken) {
        try {
            const decoded = jose.decodeJwt(token);
            lastCheckedToken = token;
            lastCheckedTokenExp = decoded?.exp || 0;
            exp = lastCheckedTokenExp;
        } catch {
            return true;
        }
    }

    if (!exp) return true;

    // Add a 10-second buffer to prevent edge cases
    const BUFFER_MS = 10000;
    return (exp * 1000) - BUFFER_MS <= Date.now();
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let refreshPromise: Promise<string | null> | null = null;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000, // 15s timeout to prevent hanging requests
});

/**
 * Gets a valid access token, refreshing it if necessary.
 * Handles concurrent refresh requests by using a shared promise.
 * 
 * @param forceRefresh - If true, ignores memory/storage cache and attempts a network refresh.
 */
export const getValidToken = async (forceRefresh = false): Promise<string | null> => {
    // 1. Happy path: check storage/cache first unless forcing a refresh
    if (!forceRefresh) {
        const storedAccessToken = await tokenCache.getToken('accessToken');
        if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
            return storedAccessToken;
        }
    }

    // 2. If a refresh is already in progress, wait for it
    if (refreshPromise) {
        return refreshPromise;
    }

    // 3. Start refresh process
    refreshPromise = (async () => {
        try {
            // Double check storage inside the promise to catch cases where another
            // request already finished refreshing while we were waiting
            if (!forceRefresh) {
                const latestToken = await tokenCache.getToken('accessToken');
                if (latestToken && !isTokenExpired(latestToken)) {
                    return latestToken;
                }
            }

            const storedRefreshToken = await tokenCache.getToken('refreshToken');
            if (!storedRefreshToken) {
                return null;
            }

            const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`,
                { refreshToken: storedRefreshToken },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 10000,
                }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            await tokenCache.saveToken('accessToken', accessToken);
            if (newRefreshToken) {
                await tokenCache.saveToken('refreshToken', newRefreshToken);
            }

            return accessToken;
        } catch (error) {
            console.error('[BaseApi] Token refresh failed:', error);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};


axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig<any>) => {
        // Add timestamp to track request duration
        (config as any).metadata = { startTime: Date.now() };

        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json";

        // Performance Optimization: Check memory cache synchronously first.
        // This avoids the 'await' microtask delay for every single request.
        const token = tokenCache.getTokenSync('accessToken');
        if (token && !isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
        }

        // If not in memory or expired, use the async path (handles first load and refresh)
        return getValidToken().then(newToken => {
            if (newToken) {
                config.headers.Authorization = `Bearer ${newToken}`;
            }
            return config;
        });
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    (response) => {
        const startTime = (response.config as any).metadata?.startTime;
        if (startTime) {
            const duration = Date.now() - startTime;
            console.log(`[BaseApi] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const startTime = (error.config as any)?.metadata?.startTime;
        if (startTime) {
            const duration = Date.now() - startTime;
            console.log(`[BaseApi] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms (Error: ${error.message})`);
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If we get a 401, force a refresh to get a fresh token
                const newToken = await getValidToken(true);

                if (newToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
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
            api.dispatch(logoutUser());
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
    tagTypes: ['Contacts', 'Occasions', 'Recommendations', 'Orders', 'Shortlist', 'UserProfile', 'Wallet', 'Notifications', 'Products', 'Addresses', 'Chat', 'Business', 'Review', 'TrustSafety', 'Disputes', 'ReferralInfo', 'ReferralsList'],
    // Keep unused data cached for 5 minutes to reduce redundant fetches
    keepUnusedDataFor: 300,
    // Refetch on reconnect and on focus for freshness
    refetchOnReconnect: true,
    endpoints: () => ({}),
});
