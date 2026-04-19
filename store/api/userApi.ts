import { User } from '@/types';
import { baseApi } from './baseApi';
import { setCredentials } from '../slices/authSlice';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<User, void>({
            query: () => ({ url: '/api/v1/users/me', method: 'GET' }),
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data: user } = await queryFulfilled;
                    dispatch(setCredentials({ user }));
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            },
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
