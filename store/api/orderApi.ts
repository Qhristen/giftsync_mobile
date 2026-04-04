import { Order } from '@/types';
import { baseApi } from './baseApi';

export interface CreateOrderDto {
    productId: string;
    occasionId?: string;
    deliveryAddressId: string;
    recipientName: string;
    deliveryDate: string;
    deliveryTimeWindow: string;
    giftMessage?: string;
    paymentMethod: string;
}



export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<Order, CreateOrderDto>({
            query: (data) => ({
                url: '/api/v1/orders',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Orders' as any],
        }),
        getOrders: builder.query<Order[], void>({
            query: () => ({
                url: '/api/v1/orders',
                method: 'GET',
            }),
            providesTags: ['Orders' as any],
        }),
        getOrderById: builder.query<Order, string>({
            query: (id) => ({
                url: `/api/v1/orders/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Orders' as any, id }],
        }),
    }),
    overrideExisting: true,
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrderByIdQuery } = orderApi;
