import {
    ChatMessage,
    Conversation,
    CreateConversationDto
} from '@/types';
import { baseApi } from './baseApi';

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ── GET /api/v1/chat/conversations ──────────────────────────────────
        getConversations: builder.query<
            Conversation[],
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 50 } = {}) => ({
                url: '/api/v1/chat/conversations',
                method: 'GET',
                params: { page, limit },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Chat' as const, id: `CONV_${id}` })),
                        { type: 'Chat', id: 'CONV_LIST' }
                    ]
                    : [{ type: 'Chat', id: 'CONV_LIST' }],
        }),

        // ── GET /api/v1/chat/conversations/:id ──────────────────────────────
        getConversation: builder.query<Conversation, string>({
            query: (id) => ({
                url: `/api/v1/chat/conversations/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _err, id) => [{ type: 'Chat', id: `CONV_${id}` }],
        }),

        // ── POST /api/v1/chat/conversations ─────────────────────────────────
        createConversation: builder.mutation<Conversation, CreateConversationDto>({
            query: (body) => ({
                url: '/api/v1/chat/conversations',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [{ type: 'Chat', id: 'CONV_LIST' }],
        }),

        // ── GET /api/v1/chat/conversations/:id/messages ──────────────────────
        getMessages: builder.query<
            ChatMessage[],
            { conversationId: string; page?: number; limit?: number }
        >({
            query: ({ conversationId, page = 1, limit = 50 }) => ({
                url: `/api/v1/chat/conversations/${conversationId}/messages`,
                method: 'GET',
                params: { page, limit },
            }),
            providesTags: (result, _err, { conversationId }) => [
                { type: 'Chat', id: `MESSAGES_${conversationId}` },
            ],
        }),

        // ── PUT /api/v1/chat/conversations/:id/read ─────────────────────────
        markConversationAsRead: builder.mutation<void, string>({
            query: (conversationId) => ({
                url: `/api/v1/chat/conversations/${conversationId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: (_result, _err, conversationId) => [
                { type: 'Chat', id: 'UNREAD_COUNT' },
                { type: 'Chat', id: `MESSAGES_${conversationId}` },
                { type: 'Chat', id: `CONV_${conversationId}` }
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetConversationsQuery,
    useGetConversationQuery,
    useCreateConversationMutation,
    useGetMessagesQuery,
    useMarkConversationAsReadMutation,
} = chatApi;
