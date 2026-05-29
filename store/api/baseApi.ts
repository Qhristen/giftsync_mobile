import { tokenCache } from '@/utils/cache';
import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as jose from 'jose';

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

export const refreshAuthToken = async () => {
    const refreshToken = await tokenCache.get('refreshToken');

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await axiosInstance.post("/api/v1/auth/refresh", {
            refreshToken
        });

        await tokenCache.save('refreshToken', response.data.refreshToken);
        await tokenCache.save('accessToken', response.data.accessToken);

        return response.data.accessToken;
    } catch (error: any) {
        throw error;
    }
};



let cachedToken: string | null = null;

export const clearCachedToken = () => {
    cachedToken = null;
};

export const getValidToken = async (forceRefresh = false): Promise<string | null> => {

    if (cachedToken && !isTokenExpired(cachedToken)) {
        return cachedToken;
    }

    const latestToken = await tokenCache.get('accessToken');
    if (!latestToken) return null;

    if (isTokenExpired(latestToken)) {

        const newToken = await refreshAuthToken()
        cachedToken = newToken;
        return newToken;
    }

    cachedToken = latestToken;
    return latestToken;

};


axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
        // Add timestamp to track request duration
        (config as any).metadata = { startTime: Date.now() };

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
            await tokenCache.remove('refreshToken');
            await tokenCache.remove('accessToken');

        }

        return config;
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

        // Don't retry if it's the refresh token endpoint itself that failed
        if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
            tokenCache.remove('accessToken');
            tokenCache.remove('refreshToken');
            clearCachedToken();
            return Promise.reject(error);
        }

        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const currentToken = await tokenCache.get('accessToken');

                // Only try to refresh if we have a token and it will expire within 24 hours
                if (currentToken && isTokenExpired(currentToken)) {
                    const newToken = await refreshAuthToken();
                    if (newToken) {
                        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                        if (originalRequest && originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return axiosInstance(originalRequest);
                        }
                    }
                }

             
                await tokenCache.remove('accessToken');
                await tokenCache.remove('refreshToken');
                clearCachedToken();
                return Promise.reject(error);
            } catch (refreshError) {
             
                await tokenCache.remove('accessToken');
                await tokenCache.remove('refreshToken');
                clearCachedToken();
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
            const { logout } = require('../slices/authSlice');
            api.dispatch(logout());
            // Clear tokens
            tokenCache.remove('accessToken');
            tokenCache.remove('refreshToken');
            clearCachedToken();
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
    refetchOnFocus: true,
    endpoints: () => ({}),
});
