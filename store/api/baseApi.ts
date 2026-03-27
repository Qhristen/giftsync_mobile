import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { logoutUser, refreshTokens } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // try to get a new token
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (refreshToken) {
            const refreshResult = await api.dispatch(refreshTokens(refreshToken) as any);

            if (refreshResult.meta && refreshResult.meta.requestStatus === 'fulfilled') {
                // retry the initial query
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logoutUser() as any);
            }
        } else {
            api.dispatch(logoutUser() as any);
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Contacts', 'Occasions', 'Recommendations', 'Orders', 'Shortlist'],
    endpoints: () => ({}),
});
