import { Product } from '@/types';
import { baseApi } from './baseApi';

export interface AiChatHistoryItem {
    role: 'user' | 'model';
    content: string;
}

export interface AiChatRequest {
    message: string;
    history?: AiChatHistoryItem[];
}

export interface AiProductSuggestion {
    name: string;
    whyItFits: string;
    availability: 'not_on_platform';
    estimatedBudget?: string;
    canRequest: boolean;
}

export interface AiGiftRequestDetails {
    eventId?: string;
    orderDetails: {
        deliveryDate: string;
        deliveryTimeWindow: string;
        giftMessage?: string;
        anonymity: boolean;
        quantity: number;
    };
    recipientName: string;
    recipientPhoneNumber?: string;
    occasion?: string;
    description: string;
    category: string;
    budget: number;
    currency: string;
    neededBy: string;
    preferences: string[];
}

export interface AiActionDetails extends Partial<AiGiftRequestDetails> {
    recipients?: string[];
    contactName?: string;
    message?: string;
    productId?: string;
    productName?: string;
    price?: string;
}

export interface AiCreatedGiftRequest {
    id: string;
    status: string;
    orderId?: string;
    orderTotal?: number;
    paymentStatus?: string;
    currency?: string;
    paymentUrl: string;
}

export interface AiUiData {
    type: 'products' | 'occasions' | 'contacts' | 'send_message' | 'businesses' | 'confirm_action' | 'gift_request' | 'none';
    actionType?: 'send_direct_sms' | 'send_occasion_message' | 'purchase_product' | 'create_gift_request';
    details?: AiActionDetails;
    items?: any[];
    suggestions?: AiProductSuggestion[];
    giftRequest?: AiCreatedGiftRequest;
    order?: {
        id: string;
        total?: number;
        paymentStatus?: string;
        currency?: string;
    };
    item?: { type: string; data: any };
}

export interface AiChatResponse {
    response: {
        message: string;
        uiData?: AiUiData;
    };
}

export interface AiFindProductsRequest {
    query: string;
}

export interface AiFindProductsResponse {
    response: {
        message: string;
        uiData?: {
            type: 'products';
            items?: Product[];
        };
    };
}

export interface AiRecommendationsResponse {
    response: {
        message: string;
        uiData?: {
            type: 'products';
            items?: Product[];
        };
    };
}

export const aiApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        chat: builder.mutation<AiChatResponse, AiChatRequest>({
            query: (body) => ({
                url: '/api/v1/ai/chat',
                method: 'POST',
                data: body,
            }),
        }),
        getRecommendations: builder.query<AiRecommendationsResponse, void>({
            query: () => ({
                url: '/api/v1/ai/recommendations',
                method: 'GET',
            }),
        }),
        findProducts: builder.mutation<AiFindProductsResponse, AiFindProductsRequest>({
            query: (body) => ({
                url: '/api/v1/ai/find-products',
                method: 'POST',
                data: body,
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useChatMutation,
    useGetRecommendationsQuery,
    useFindProductsMutation
} = aiApi;
