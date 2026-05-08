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

export interface AiChatResponse {
    response: {
        message: string;
        uiData?: {
            type: 'products' | 'occasions' | 'contacts' | 'send_message' | 'businesses' | 'confirm_action' | 'none';
            actionType?: 'send_direct_sms' | 'send_occasion_message' | 'purchase_product';
            details?: {
                recipients?: string[];
                contactName?: string;
                message?: string;
                productId?: string;
                productName?: string;
                price?: string;
            };
            items?: any[];
            item?: { type: string; data: any[] };
        };
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
