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
        getOrders: builder.query<Order[], void>({
            query: () => ({
                url: '/api/v1/orders',
                method: 'GET',
            }),
            providesTags: ['Orders'],
        }),
        getOrdersByProduct: builder.query<Order[], string>({
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
                method: 'PATCH',
                body: { deliveryCode },
            }),
            invalidatesTags: (result, error, { orderId }) => ['Orders', { type: 'Orders', id: orderId }],
        }),
        handlePayment: builder.mutation<{ paymentUrl?: string; status: string }, { orderId: string; method: string }>({
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

