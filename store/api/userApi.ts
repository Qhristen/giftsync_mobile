import { User } from '@/types';
import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<User, void>({
            query: () => ({ url: '/api/v1/users/me', method: 'GET' }),
            providesTags: ['UserProfile'],
        }),
    }),
    overrideExisting: true,
});

export const { useLazyGetProfileQuery, useGetProfileQuery } = userApi;
