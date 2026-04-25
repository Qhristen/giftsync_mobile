import { CreateDisputeDto, Dispute } from '@/types';
import { baseApi } from './baseApi';

export const disputeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createDispute: builder.mutation<Dispute, CreateDisputeDto>({
            query: (data) => ({
                url: '/api/v1/disputes',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Disputes', 'Orders'],
        }),
        getDisputes: builder.query<Dispute[], void>({
            query: () => ({
                url: '/api/v1/disputes',
                method: 'GET',
            }),
            providesTags: ['Disputes'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateDisputeMutation,
    useGetDisputesQuery,
} = disputeApi;
