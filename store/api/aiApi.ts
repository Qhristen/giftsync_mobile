import { Product } from '@/types';
import type { GiftRequestOrder, GiftRequestStatus } from './giftRequestApi';
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
    status: GiftRequestStatus;
    orderId: string | null;
    budget?: number | string;
    currency?: string;
    order?: GiftRequestOrder | null;
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

const AI_UI_TYPES = new Set<AiUiData['type']>([
    'products',
    'occasions',
    'contacts',
    'send_message',
    'businesses',
    'confirm_action',
    'gift_request',
    'none',
]);

const isRecord = (value: unknown): value is Record<string, unknown> => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const parseJson = (value: string): unknown => {
    const withoutFence = value
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try {
        return JSON.parse(withoutFence);
    } catch {
        return undefined;
    }
};

const normalizeMessageFormatting = (value: string): string => value
    // The endpoint occasionally returns JSON-escaped line breaks one level too
    // deep, leaving visible "\\n" text that Markdown cannot interpret.
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n');

const findResponseRecord = (value: unknown, depth = 0): Record<string, unknown> | undefined => {
    if (depth > 4) return undefined;

    if (typeof value === 'string') {
        const parsed = parseJson(value);
        return parsed === undefined
            ? { message: value }
            : findResponseRecord(parsed, depth + 1);
    }

    if (!isRecord(value)) return undefined;
    if ('message' in value) return value;

    if ('response' in value) {
        const response = findResponseRecord(value.response, depth + 1);
        if (response) return response;
    }

    if ('data' in value) {
        return findResponseRecord(value.data, depth + 1);
    }

    return undefined;
};

const readBalancedObject = (value: string, start: number): string | undefined => {
    let depth = 0;
    let isInString = false;
    let isEscaped = false;

    for (let index = start; index < value.length; index += 1) {
        const character = value[index];

        if (isInString) {
            if (isEscaped) {
                isEscaped = false;
            } else if (character === '\\') {
                isEscaped = true;
            } else if (character === '"') {
                isInString = false;
            }
            continue;
        }

        if (character === '"') {
            isInString = true;
        } else if (character === '{') {
            depth += 1;
        } else if (character === '}') {
            depth -= 1;
            if (depth === 0) return value.slice(start, index + 1);
        }
    }

    return undefined;
};

const normalizeUiData = (value: unknown): AiUiData | undefined => {
    if (!isRecord(value)) return undefined;

    const suggestions = Array.isArray(value.suggestions) ? value.suggestions : undefined;
    const rawType = typeof value.type === 'string' && AI_UI_TYPES.has(value.type as AiUiData['type'])
        ? value.type as AiUiData['type']
        : 'none';

    // A few model responses contain suggestions but incorrectly label their UI as
    // "none". Treat those as products so the existing suggestion cards can render.
    const type = suggestions?.length && rawType === 'none' ? 'products' : rawType;

    return {
        ...value,
        type,
        ...(suggestions ? { suggestions: suggestions as AiProductSuggestion[] } : {}),
    } as AiUiData;
};

const extractEmbeddedResponse = (value: string): { message: string; uiData?: AiUiData } => {
    const parsed = parseJson(value);
    const parsedRecord = parsed === undefined ? undefined : findResponseRecord(parsed);

    if (parsedRecord && typeof parsedRecord.message === 'string') {
        const nested = extractEmbeddedResponse(parsedRecord.message);
        return {
            message: nested.message,
            uiData: normalizeUiData(parsedRecord.uiData) || nested.uiData,
        };
    }

    // Handles partially unwrapped model output such as:
    // Helpful prose here...","uiData":{"type":"products",...}}
    const marker = /"\s*,\s*"uiData"\s*:\s*/g;
    let match: RegExpExecArray | null;
    let lastMatch: RegExpExecArray | null = null;

    while ((match = marker.exec(value)) !== null) lastMatch = match;

    if (!lastMatch) return { message: value.trim() };

    const objectStart = value.indexOf('{', lastMatch.index + lastMatch[0].length);
    const objectText = objectStart >= 0 ? readBalancedObject(value, objectStart) : undefined;
    const uiData = objectText ? normalizeUiData(parseJson(objectText)) : undefined;

    if (!uiData) return { message: value.trim() };

    const message = value
        .slice(0, lastMatch.index)
        .replace(/^\s*\{\s*"response"\s*:\s*\{\s*"message"\s*:\s*"/, '')
        .replace(/^\s*\{\s*"message"\s*:\s*"/, '')
        .trim();

    return { message, uiData };
};

/**
 * Normalizes the different response shapes produced by the AI endpoint and
 * prevents structured UI JSON from being displayed inside a chat bubble.
 */
export const normalizeAiChatResponse = (value: unknown): AiChatResponse => {
    const record = findResponseRecord(value);
    const rawMessage = typeof record?.message === 'string' ? record.message : '';
    const embedded = extractEmbeddedResponse(rawMessage);
    const uiData = normalizeUiData(record?.uiData) || embedded.uiData;

    return {
        response: {
            message: normalizeMessageFormatting(embedded.message),
            ...(uiData ? { uiData } : {}),
        },
    };
};

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
            transformResponse: normalizeAiChatResponse,
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
