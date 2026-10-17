import {
    ChatMessage,
    Conversation,
    CreateConversationDto,
    PaginationMeta
} from '@/types';
import { baseApi } from './baseApi';
import { setUnreadCount } from '../slices/chatSlice';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';
import { orderApi } from './orderApi';

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ── GET /api/v1/chat/conversations ──────────────────────────────────
        getConversations: builder.query<
            { items: Conversation[], meta: PaginationMeta },
            { page?: number; limit?: number }
        >({
            query: ({ page = 1, limit = 50 } = {}) => ({
                url: '/api/v1/chat/conversations',
                method: 'GET',
                params: { page, limit },
            }),
            providesTags: (result) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Chat' as const, id: `CONV_${id}` })),
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
            invalidatesTags: (_result, _error, { orderId }) => [
                { type: 'Chat', id: 'CONV_LIST' },
                ...(orderId ? ['Orders' as const, { type: 'Orders' as const, id: orderId }] : []),
            ],
            async onQueryStarted({ orderId }, { dispatch, getState, queryFulfilled }) {
                const state = getState() as { auth?: { user?: Conversation['participants'][number] } };
                const currentUser = state.auth?.user;
                const order = orderId
                    ? orderApi.endpoints.getOrderById.select(orderId)(getState() as any).data
                    : undefined;
                const tempId = createOptimisticId('conversation');
                const now = new Date().toISOString();
                const optimisticConversation = {
                    id: tempId,
                    orderId: orderId ?? '',
                    order,
                    lastMessagePreview: '',
                    lastMessageAt: now,
                    lastMessageSenderId: '',
                    participants: currentUser ? [currentUser] : [],
                    messages: [],
                    unreadCount: 0,
                    createdAt: now,
                    updatedAt: now,
                } as Conversation;
                const patches = getCachedQueryArgs<{ page?: number; limit?: number }>(getState(), 'getConversations').map((args) =>
                    dispatch(chatApi.util.updateQueryData('getConversations', args, (draft) => {
                        draft.items.unshift(optimisticConversation);
                        draft.meta.total += 1;
                    })),
                );

                try {
                    const { data: savedConversation } = await queryFulfilled;
                    dispatch(chatApi.util.upsertQueryData('getConversation', savedConversation.id, savedConversation));
                    for (const args of getCachedQueryArgs<{ page?: number; limit?: number }>(getState(), 'getConversations')) {
                        dispatch(chatApi.util.updateQueryData('getConversations', args, (draft) => {
                            const index = draft.items.findIndex((conversation) => conversation.id === tempId);
                            if (index !== -1) draft.items[index] = savedConversation;
                        }));
                    }
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),

        // ── GET /api/v1/chat/conversations/:id/messages ──────────────────────
        getMessages: builder.query<
            {items: ChatMessage[], meta: PaginationMeta},
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
        markConversationAsRead: builder.mutation<{ count: number }, string>({
            query: (conversationId) => ({
                url: `/api/v1/chat/conversations/${conversationId}/read`,
                method: 'PUT',
            }),
            invalidatesTags: (_result, _err, conversationId) => [
                { type: 'Chat', id: 'UNREAD_COUNT' },
                { type: 'Chat', id: `MESSAGES_${conversationId}` },
                { type: 'Chat', id: 'CONV_LIST' },
                { type: 'Chat', id: `CONV_${conversationId}` }
            ],
            async onQueryStarted(conversationId, { dispatch, getState, queryFulfilled }) {
                let clearedCount = 0;
                const currentUserId = (getState() as { auth?: { user?: { id?: string } } }).auth?.user?.id;
                const patches: OptimisticPatch[] = [];
                for (const args of getCachedQueryArgs<{ page?: number; limit?: number }>(getState(), 'getConversations')) {
                    patches.push(dispatch(
                        chatApi.util.updateQueryData('getConversations', args, (draft) => {
                            const conversation = draft.items.find((item) => item.id === conversationId);
                            if (conversation) {
                                clearedCount = Math.max(clearedCount, conversation.unreadCount ?? 0);
                                conversation.unreadCount = 0;
                            }
                        }),
                    ));
                }
                for (const args of getCachedQueryArgs<{ conversationId: string; page?: number; limit?: number }>(getState(), 'getMessages')) {
                    if (args.conversationId !== conversationId) continue;
                    patches.push(dispatch(
                        chatApi.util.updateQueryData('getMessages', args, (draft) => {
                            draft.items.forEach((message) => {
                                if (message.senderId !== currentUserId) message.isRead = true;
                            });
                        }),
                    ));
                }
                patches.push(dispatch(
                    chatApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
                        draft.count = Math.max(0, draft.count - clearedCount);
                    }),
                ));
                const previousSliceCount = (getState() as { chat?: { unreadCount?: number } }).chat?.unreadCount ?? 0;
                dispatch(setUnreadCount(Math.max(0, previousSliceCount - clearedCount)));

                try {
                    await queryFulfilled;
                } catch {
                    undoOptimisticPatches(patches);
                    dispatch(setUnreadCount(previousSliceCount));
                }
            },
        }),
        // ── GET /api/v1/chat/unread-count ──────────────────────────────────
        getUnreadCount: builder.query<{ count: number }, void>({
            query: () => ({
                url: '/api/v1/chat/unread-count',
                method: 'GET',
            }),
            providesTags: [{ type: 'Chat', id: 'UNREAD_COUNT' }],
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
    useGetUnreadCountQuery,
} = chatApi;
