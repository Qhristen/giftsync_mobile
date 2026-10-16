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
    status: 'PENDING' | 'IN_REVIEW' | 'SOURCING' | 'FULFILLED' | 'CANCELLED';
    eventId?: string;
    contactId?: string;
    addressId?: string;
    orderId?: string;
    orderTotal?: number;
    paymentStatus?: string;
    currency?: string;
    createdAt: string;
}

export const giftRequestApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createGiftRequest: builder.mutation<GiftRequest, CreateGiftRequestDto>({
            query: (data) => ({
                url: '/api/v1/gift-requests',
                method: 'POST',
                data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useCreateGiftRequestMutation } = giftRequestApi;
