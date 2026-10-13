import { baseApi } from './baseApi';

export interface CreateGiftRequestDto {
    eventId?: string;
    contactId?: string;
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
