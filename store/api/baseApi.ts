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
        const exp = (decoded as any).exp;
        const now = Math.floor(Date.now() / 1000);
        // Check if the token has expired (current time is past expiration)
        return decoded?.exp ? decoded.exp * 1000 <= Date.now() : true;
    } catch {
        return true;
    }
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});


axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig<any>) => {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json";

        const storedAccessToken = await tokenCache.getToken('accessToken');
        config.headers.Authorization = `Bearer ${storedAccessToken}`;

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

    try {
        const storedAccessToken = await tokenCache.getToken('accessToken');
        const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`,
            { refreshToken: storedRefreshToken },
            {
                headers: {
                    Authorization: `Bearer ${storedAccessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
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
> => async (args) => {
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
        return {
            error: {
                status: axiosError.response?.status,
                data: axiosError.response?.data || { message: axiosError.message },
            },
        };
    }
};

export const api = axiosInstance
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Contacts', 'Occasions', 'Recommendations', 'Orders', 'Shortlist', 'UserProfile', 'Wallet', 'Notifications', 'Products', 'Addresses', 'Chat', 'Business'],
    endpoints: () => ({}),
});
