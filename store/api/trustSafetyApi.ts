import { BlockedUser, CreateReportDto } from '@/types';
import { baseApi } from './baseApi';

export const trustSafetyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        blockUser: builder.mutation<void, { blockedId: string }>({
            query: (data) => ({
                url: '/api/v1/trust-safety/block',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['TrustSafety'],
        }),
        unblockUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/trust-safety/block/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TrustSafety'],
        }),
        getBlockedUsers: builder.query<BlockedUser[], void>({
            query: () => ({
                url: '/api/v1/trust-safety/block',
                method: 'GET',
            }),
            providesTags: ['TrustSafety'],
        }),
        submitReport: builder.mutation<void, CreateReportDto>({
            query: (data) => ({
                url: '/api/v1/trust-safety/report',
                method: 'POST',
                data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useBlockUserMutation,
    useUnblockUserMutation,
    useGetBlockedUsersQuery,
    useSubmitReportMutation,
} = trustSafetyApi;
