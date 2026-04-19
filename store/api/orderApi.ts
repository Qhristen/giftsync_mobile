import { Order, PaginationMeta, PaymentResponse } from '@/types';
import { baseApi } from './baseApi';

export interface CreateOrderDto {
    productId: string;
    occasionId?: string;
    deliveryAddressId: string;
    recipientName: string;
    deliveryDate: string;
    deliveryTimeWindow: string;
    giftMessage?: string;
    anonymity: boolean;
}



export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<Order, CreateOrderDto>({
            query: (data) => ({
                url: '/api/v1/orders',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Orders'],
        }),
        getOrders: builder.query<{ items: Order[], meta: PaginationMeta }, { page?: number; limit?: number;[key: string]: unknown }>({
            query: (params) => ({
                url: '/api/v1/orders',
                method: 'GET',
                params: params || {},
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const queryArgsCopy = queryArgs || {};
                delete queryArgsCopy.page;
                return `${endpointName}-${JSON.stringify(queryArgsCopy)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
                if (!params || params.page === 1) {
                    return newItems;
                }
                const existingIds = new Set(currentCache.items.map(item => item.id));
                currentCache.items.push(
                    ...newItems.items.filter(item => !existingIds.has(item.id))
                );
                currentCache.meta = newItems.meta;
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                const curr = currentArg as { page?: number } | undefined;
                const prev = previousArg as { page?: number } | undefined;
                return curr?.page !== prev?.page;
            },
            providesTags: ['Orders'],
        }),
        getOrdersByProduct: builder.query<{items: Order[], meta: PaginationMeta}, string>({
            query: (productId) => ({
                url: `/api/v1/orders/product/${productId}`,
                method: 'GET',
            }),
            providesTags: ['Orders'],
        }),
        getOrderById: builder.query<Order, string>({
            query: (id) => ({
                url: `/api/v1/orders/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Orders', id }],
        }),
        confirmDelivery: builder.mutation<Order, { orderId: string; deliveryCode: string }>({
            query: ({ orderId, deliveryCode }) => ({
                url: `/api/v1/orders/${orderId}/confirm`,
                method: 'POST',
                data: { code: deliveryCode },
            }),
            invalidatesTags: (result, error, { orderId }) => ['Orders', { type: 'Orders', id: orderId }],
        }),
        handlePayment: builder.mutation<PaymentResponse, { orderId: string; method: string }>({
            query: ({ orderId, method }) => ({
                url: `/api/v1/orders/${orderId}/pay`,
                method: 'POST',
                data: { method, orderId },
            }),
            invalidatesTags: (result, error, { orderId }) => ['Orders', { type: 'Orders', id: orderId }, 'Wallet'],
        }),
    }),
    overrideExisting: true,
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrdersByProductQuery, useGetOrderByIdQuery, useConfirmDeliveryMutation, useHandlePaymentMutation } = orderApi;

