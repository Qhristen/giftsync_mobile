import type { OrderStatus } from '@/types';
import { baseApi } from './baseApi';

type EventRecurrence = 'NONE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface GiftRequestNewEvent {
    title: string;
    date: string;
    recurrenceType: EventRecurrence;
    name: string;
    phoneNumber: string;
    relationship?: string;
}

export interface GiftRequestNewAddress {
    recipientName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
}

export interface GiftRequestOrderDetails {
    deliveryDate: string;
    deliveryTimeWindow: 'Morning' | 'Afternoon' | 'Evening';
    giftMessage?: string;
    anonymity: boolean;
    quantity: number;
}

export interface CreateGiftRequestDto {
    eventId?: string;
    contactId?: string;
    newEvent?: GiftRequestNewEvent;
    newAddress?: GiftRequestNewAddress;
    orderDetails: GiftRequestOrderDetails;
    recipientName: string;
    recipientPhoneNumber?: string;
    occasion?: string;
    description: string;
    category: string;
    budget: number;
    currency: string;
    neededBy: string;
    preferences: string[];
    referenceLink?: string;
    referenceImageUrl?: string;
}

export type GiftRequestStatus = 'PENDING' | 'SOURCING' | 'FULFILLED' | 'CANCELLED';

export interface GiftRequestOrderItem {
    productId?: string | null;
    unitPrice: number;
    quantity: number;
    total: number;
}

export interface GiftRequestOrder {
    id: string;
    paymentStatus: 'pending' | 'paid' | string;
    subtotal: number;
    deliveryFee: number;
    packagingFee: number;
    total: number;
    status: OrderStatus;
    item?: GiftRequestOrderItem | null;
    createdAt?: string;
}

export interface GiftRequest {
    id: string;
    status: GiftRequestStatus;
    eventId?: string | null;
    contactId?: string | null;
    addressId?: string | null;
    productId?: string | null;
    orderId: string | null;
    conversationId?: string | null;
    budget?: number;
    currency: string;
    recipientName?: string;
    description?: string;
    category?: string;
    orderDetails?: GiftRequestOrderDetails;
    order?: GiftRequestOrder | null;
    conversation?: {
        id: string;
        lastMessagePreview: string | null;
        lastMessageAt: string | null;
        unreadCount: number;
    } | null;
    createdAt: string;
}

const normalizeGiftRequest = (request: GiftRequest): GiftRequest => ({
    ...request,
    budget: request.budget == null ? undefined : Number(request.budget),
    order: request.order ? {
        ...request.order,
        subtotal: Number(request.order.subtotal),
        deliveryFee: Number(request.order.deliveryFee),
        packagingFee: Number(request.order.packagingFee),
        total: Number(request.order.total),
        item: request.order.item ? {
            ...request.order.item,
            unitPrice: Number(request.order.item.unitPrice),
            total: Number(request.order.item.total),
        } : request.order.item,
    } : request.order,
});

export const giftRequestApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createGiftRequest: builder.mutation<GiftRequest, CreateGiftRequestDto>({
            query: (data) => ({
                url: '/api/v1/gift-requests',
                method: 'POST',
                data,
            }),
            transformResponse: normalizeGiftRequest,
            invalidatesTags: ['GiftRequests'],
            async onQueryStarted(_data, { dispatch, queryFulfilled }) {
                try {
                    const { data: request } = await queryFulfilled;
                    dispatch(giftRequestApi.util.upsertQueryData('getGiftRequest', request.id, request));
                } catch {
                    // The mutation error is surfaced by the calling screen.
                }
            },
        }),
        getGiftRequest: builder.query<GiftRequest, string>({
            query: (giftRequestId) => ({
                url: `/api/v1/gift-requests/${giftRequestId}`,
                method: 'GET',
            }),
            transformResponse: normalizeGiftRequest,
            providesTags: (_result, _error, giftRequestId) => [
                { type: 'GiftRequests', id: giftRequestId },
            ],
        }),
    }),
    overrideExisting: true,
});

export const { useCreateGiftRequestMutation, useGetGiftRequestQuery } = giftRequestApi;
