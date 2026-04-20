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

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jose.decodeJwt(token);
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


axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json";

        const storedAccessToken = await tokenCache.getToken('accessToken');
        if (storedAccessToken) {
            config.headers.Authorization = `Bearer ${storedAccessToken}`;
        }

        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);

export const getValidToken = async () => {

    const storedRefreshToken = await tokenCache.getToken('refreshToken');


    if (!storedRefreshToken) {
        return null;
    }

    const storedAccessToken = await tokenCache.getToken('accessToken');
    if (storedAccessToken && !isTokenExpired(storedAccessToken)) {
        return storedAccessToken;
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`,
            { refreshToken: storedRefreshToken },
            {
                headers: {
                    Authorization: `Bearer ${storedAccessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout: 10000,
            }
        );
        await tokenCache.saveToken('accessToken', response.data.accessToken);
        await tokenCache.saveToken('refreshToken', response.data.refreshToken);

        return response.data.accessToken;
    } catch (error: any) {
        throw error;
    }
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error?.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const storedAccessToken = await tokenCache.getToken('accessToken');

                // Only try to refresh if we have a token and it will expire within 24 hours
                if (storedAccessToken && isTokenExpired(storedAccessToken)) {
                    const newToken = await getValidToken();
                    if (newToken) {
                        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                        if (originalRequest && originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return axiosInstance(originalRequest);
                        }
                    }
                }
                throw error;
            } catch (refreshError) {
                throw refreshError;
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
    tagTypes: ['Contacts', 'Occasions', 'Recommendations', 'Orders', 'Shortlist', 'UserProfile', 'Wallet', 'Notifications', 'Products', 'Addresses', 'Chat', 'Business', 'Review'],
    // Keep unused data cached for 5 minutes to reduce redundant fetches
    keepUnusedDataFor: 300,
    // Refetch on reconnect and on focus for freshness
    refetchOnReconnect: true,
    endpoints: () => ({}),
});
