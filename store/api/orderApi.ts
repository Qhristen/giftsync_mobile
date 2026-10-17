import { Order, PaginationMeta, PaymentGateway, PaymentResponse } from '@/types';
import { normalizeOrder } from '@/utils/normalizeOrder';
import { adjustCoinBalance } from '../slices/authSlice';
import { baseApi } from './baseApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';
import { walletApi } from './walletApi';

export interface CreateOrderDto {
    productId: string;
    eventId?: string;
    deliveryAddressId: string;
    recipientName: string;
    deliveryDate: string;
    deliveryTimeWindow: string;
    giftMessage?: string;
    anonymity: boolean;
    quantity: number;
}

type OrdersQueryArgs = { page?: number; limit?: number; [key: string]: unknown };

const patchOrderLists = (
    dispatch: any,
    getState: () => unknown,
    recipe: (draft: { items: Order[]; meta: PaginationMeta }) => void,
) => getCachedQueryArgs<OrdersQueryArgs>(getState(), 'getOrders').map((args) =>
    dispatch(orderApi.util.updateQueryData('getOrders', args, recipe)),
);

const patchOrderEverywhere = (
    dispatch: any,
    getState: () => unknown,
    orderId: string,
    recipe: (order: Order) => void,
) => {
    const patches: OptimisticPatch[] = patchOrderLists(dispatch, getState, (draft) => {
        const order = draft.items.find((item) => item.id === orderId);
        if (order) recipe(order);
    });
    patches.push(dispatch(
        orderApi.util.updateQueryData('getOrderById', orderId, recipe),
    ));
    for (const productId of getCachedQueryArgs<string>(getState(), 'getOrdersByProduct')) {
        patches.push(dispatch(
            orderApi.util.updateQueryData('getOrdersByProduct', productId, (draft) => {
                const order = draft.items.find((item) => item.id === orderId);
                if (order) recipe(order);
            }),
        ));
    }
    return patches;
};



export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<Order, CreateOrderDto>({
            query: (data) => ({
                url: '/api/v1/orders',
                method: 'POST',
                data,
            }),
            transformResponse: (response: Order) => normalizeOrder(response),
            invalidatesTags: ['Orders'],
            async onQueryStarted(data, { dispatch, getState, queryFulfilled }) {
                const tempId = createOptimisticId('order');
                const optimisticOrder = {
                    id: tempId,
                    recipientName: data.recipientName,
                    deliveryDate: data.deliveryDate,
                    deliveryTimeWindow: data.deliveryTimeWindow,
                    giftMessage: data.giftMessage ?? '',
                    paymentMethod: 'coins',
                    paymentStatus: 'pending',
                    subtotal: 0,
                    deliveryFee: 0,
                    packagingFee: 0,
                    total: 0,
                    deliveryCode: '',
                    anonymity: data.anonymity,
                    status: 'Processing',
                    createdAt: new Date().toISOString(),
                } as Order;
                const patches: OptimisticPatch[] = patchOrderLists(dispatch, getState, (draft) => {
                    draft.items.unshift(optimisticOrder);
                    draft.meta.total += 1;
                });
                for (const productId of getCachedQueryArgs<string>(getState(), 'getOrdersByProduct')) {
                    if (productId !== data.productId) continue;
                    patches.push(dispatch(
                        orderApi.util.updateQueryData('getOrdersByProduct', productId, (draft) => {
                            draft.items.unshift(optimisticOrder);
                            draft.meta.total += 1;
                        }),
                    ));
                }

                try {
                    const { data: savedOrder } = await queryFulfilled;
                    patchOrderLists(dispatch, getState, (draft) => {
                        const index = draft.items.findIndex((order) => order.id === tempId);
                        if (index !== -1) draft.items[index] = savedOrder;
                    });
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        getOrders: builder.query<{ items: Order[], meta: PaginationMeta }, { page?: number; limit?: number;[key: string]: unknown }>({
            query: (params) => ({
                url: '/api/v1/orders',
                method: 'GET',
                params: params || {},
            }),
            transformResponse: (response: { items: Order[], meta: PaginationMeta }) => ({
                ...response,
                items: response.items.map(normalizeOrder),
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { page, ...rest } = queryArgs || {};
                return `${endpointName}-${JSON.stringify(rest)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
                if (!params || params.page === 1) {
                    return newItems;
                }
                
                // Update existing items if they are already in the cache, otherwise append
                newItems.items.forEach(newItem => {
                    const index = currentCache.items.findIndex(item => item.id === newItem.id);
                    if (index !== -1) {
                        currentCache.items[index] = newItem;
                    } else {
                        currentCache.items.push(newItem);
                    }
                });
                
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
            transformResponse: (response: { items: Order[], meta: PaginationMeta }) => ({
                ...response,
                items: response.items.map(normalizeOrder),
            }),
            providesTags: ['Orders'],
        }),
        getOrderById: builder.query<Order, string>({
            query: (id) => ({
                url: `/api/v1/orders/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: Order) => normalizeOrder(response),
            providesTags: (result, error, id) => [{ type: 'Orders', id }],
        }),
        confirmDelivery: builder.mutation<Order, { orderId: string; deliveryCode: string }>({
            query: ({ orderId, deliveryCode }) => ({
                url: `/api/v1/orders/${orderId}/confirm`,
                method: 'POST',
                data: { code: deliveryCode },
            }),
            transformResponse: (response: Order) => normalizeOrder(response),
            invalidatesTags: (result, error, { orderId }) => ['Orders', { type: 'Orders', id: orderId }],
            async onQueryStarted({ orderId }, { dispatch, getState, queryFulfilled }) {
                const patches = patchOrderEverywhere(dispatch, getState, orderId, (order) => {
                    order.status = 'Delivered';
                });

                try {
                    const { data: savedOrder } = await queryFulfilled;
                    dispatch(orderApi.util.upsertQueryData('getOrderById', orderId, savedOrder));
                    patchOrderLists(dispatch, getState, (draft) => {
                        const index = draft.items.findIndex((order) => order.id === orderId);
                        if (index !== -1) draft.items[index] = savedOrder;
                    });
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        handlePayment: builder.mutation<PaymentResponse, { orderId: string; method: PaymentGateway | 'coins'; couponCode?: string; optimisticCoinAmount?: number }>({
            query: ({ orderId, method, couponCode }) => ({
                url: `/api/v1/orders/${orderId}/pay`,
                method: 'POST',
                data: {
                    orderId,
                    method,
                    ...(couponCode ? { couponCode } : {}),
                },
            }),
            invalidatesTags: (result, error, { orderId }) => ['Orders', { type: 'Orders', id: orderId }, 'GiftRequests', 'Wallet'],
            async onQueryStarted({ orderId, method, optimisticCoinAmount = 0 }, { dispatch, getState, queryFulfilled }) {
                if (method !== 'coins') return;
                const patches = patchOrderEverywhere(dispatch, getState, orderId, (order) => {
                    order.paymentStatus = 'paid';
                    order.paymentMethod = 'coins';
                });
                if (optimisticCoinAmount > 0) {
                    dispatch(adjustCoinBalance(-optimisticCoinAmount));
                    dispatch(walletApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
                        draft.balance = Math.max(0, draft.balance - optimisticCoinAmount);
                    }));
                }

                const rollback = () => {
                    undoOptimisticPatches(patches);
                    if (optimisticCoinAmount > 0) {
                        dispatch(adjustCoinBalance(optimisticCoinAmount));
                        dispatch(walletApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
                            draft.balance += optimisticCoinAmount;
                        }));
                    }
                };

                try {
                    const { data: response } = await queryFulfilled;
                    if (response.status !== 'paid') rollback();
                } catch {
                    rollback();
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useCreateOrderMutation, useGetOrdersQuery, useGetOrdersByProductQuery, useGetOrderByIdQuery, useConfirmDeliveryMutation, useHandlePaymentMutation } = orderApi;

