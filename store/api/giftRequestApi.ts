import { Order } from '@/types';
import { normalizeOrder } from '@/utils/normalizeOrder';
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

export interface GiftRequest {
    id: string;
    status: 'PENDING' | 'SOURCING' | 'FULFILLED' | 'CANCELLED';
    eventId: string;
    contactId: string | null;
    addressId: string | null;
    orderId: string | null;
    conversationId: string | null;
    orderTotal: number;
    paymentStatus: string;
    currency: string;
    paymentUrl: string;
    order?: (Partial<Order> & Pick<Order, 'id' | 'total' | 'paymentStatus' | 'status'>) | null;
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
    orderTotal: Number(request.orderTotal ?? 0),
    order: request.order ? normalizeOrder(request.order) : request.order,
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
            invalidatesTags: ['GiftRequests', 'Orders'],
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
