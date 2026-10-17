import { CreateDisputeDto, Dispute, Order, PaginationMeta } from '@/types';
import { baseApi } from './baseApi';
import { orderApi } from './orderApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

export const disputeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createDispute: builder.mutation<Dispute, CreateDisputeDto>({
            query: (data) => ({
                url: '/api/v1/disputes',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Disputes', 'Orders'],
            async onQueryStarted(data, { dispatch, getState, queryFulfilled }) {
                const tempId = createOptimisticId('dispute');
                const optimisticDispute: Dispute = {
                    ...data,
                    id: tempId,
                    status: 'open',
                    createdAt: new Date().toISOString(),
                };
                const patches: OptimisticPatch[] = [
                    dispatch(disputeApi.util.updateQueryData('getDisputes', undefined, (draft) => {
                        draft.unshift(optimisticDispute);
                    })),
                    dispatch(orderApi.util.updateQueryData('getOrderById', data.orderId, (draft) => {
                        draft.status = 'Disputed';
                    })),
                ];
                for (const args of getCachedQueryArgs<{ page?: number; limit?: number; [key: string]: unknown }>(getState(), 'getOrders')) {
                    patches.push(dispatch(orderApi.util.updateQueryData('getOrders', args, (draft: { items: Order[]; meta: PaginationMeta }) => {
                        const order = draft.items.find((item) => item.id === data.orderId);
                        if (order) order.status = 'Disputed';
                    })));
                }
                for (const productId of getCachedQueryArgs<string>(getState(), 'getOrdersByProduct')) {
                    patches.push(dispatch(orderApi.util.updateQueryData('getOrdersByProduct', productId, (draft) => {
                        const order = draft.items.find((item) => item.id === data.orderId);
                        if (order) order.status = 'Disputed';
                    })));
                }

                try {
                    const { data: savedDispute } = await queryFulfilled;
                    dispatch(disputeApi.util.updateQueryData('getDisputes', undefined, (draft) => {
                        const index = draft.findIndex((dispute) => dispute.id === tempId);
                        if (index !== -1) draft[index] = savedDispute;
                    }));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
