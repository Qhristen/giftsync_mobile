import { User } from '@/types';
import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<User, void>({
            query: () => ({ url: '/api/v1/users/me', method: 'GET' }),
            providesTags: ['UserProfile'],
        }),
        updateProfile: builder.mutation<User, Partial<User>>({
            query: (data) => ({
                url: '/api/v1/users/me',
                method: 'PATCH',
                data,
            }),
            invalidatesTags: ['UserProfile'],
        }),
        deleteAccount: builder.mutation<void, void>({
            query: () => ({
                url: '/api/v1/users/me',
                method: 'DELETE',
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useLazyGetProfileQuery, useGetProfileQuery, useUpdateProfileMutation, useDeleteAccountMutation } = userApi;
