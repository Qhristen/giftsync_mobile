import { io, Socket } from 'socket.io-client';
import { AppDispatch, RootState } from '../store';
import { chatApi } from '../store/api/chatApi';

import { getValidToken } from '@/store/api/baseApi';
import { setUserStopTyping, setUserTyping } from '@/store/slices/chatSlice';
import { ChatMessage } from '../types';

// ─── Types matching the server contract ──────────────────────────────────────

interface TypingPayload {
    userId: string;
    isTyping: boolean;
    conversationId: string;
}

interface MessagesReadPayload {
    conversationId: string;
    userId: string;
}

interface NewNotificationPayload {
    type: 'MESSAGE';
    conversationId: string;
    senderName: string;
    content: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class SocketService {
    private socket: Socket | null = null;
    private dispatch: AppDispatch | null = null;
    private getState: (() => RootState) | null = null;
    private isInitializing = false;
    private activeConversationId: string | null = null;

    initialize(dispatch: AppDispatch, getState: () => RootState) {
        this.dispatch = dispatch;
        this.getState = getState;
    }

    async connect() {
        if (this.socket?.connected || this.isInitializing) return;

        let token: string | null = null;
        try {
            token = await getValidToken();
        } catch (error: any) {
            console.log('Chat Socket: Failed to get valid token on connect', error?.message || 'Unknown error');
            return;
        }

        if (!token) return;

        this.isInitializing = true;
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

        try {
            this.socket = io(`${BASE_URL}/chat`, {
                auth: { token },
                transports: ['websocket'],
                autoConnect: false,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
            });
            this.setupListeners();
            this.socket.connect();
        } catch (error) {
            console.error('Socket connection error:', error);
        } finally {
            this.isInitializing = false;
        }
    }

    private setupListeners() {
        if (!this.socket || !this.dispatch) return;

        const dispatch = this.dispatch;

        // ── Connection lifecycle ──────────────────────────────────────────────

        this.socket.on('connect', () => {
            console.log('Connected to chat gateway:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Chat Socket disconnected:', reason);
        });

        this.socket.on('connect_error', async (error) => {
            console.error('Socket connect_error:', error.message);
            // If authentication failed, refresh token and reconnect
            if (
                error.message.includes('auth') ||
                error.message.includes('token') ||
                error.message.includes('JWT')
            ) {
                try {
                    const newToken = await getValidToken();
                    if (newToken && this.socket) {
                        this.socket.auth = { token: newToken };
                        this.socket.connect();
                    }
                } catch (refreshError: any) {
                    console.log('Chat Socket: Failed to refresh token on connect_error', refreshError?.message || 'Unknown error');
                }
            }
        });

        this.socket.on('exception', (error: { status: string; message: string }) => {
            console.error('Socket exception:', error);
        });

        // ── newMessage ────────────────────────────────────────────────────────
        // Fires for all participants in the conversation room.

        this.socket.on('newMessage', (message: ChatMessage) => {
            const currentUserId = this.getState?.().auth?.user?.id;

            // Update messages cache
            dispatch(
                chatApi.util.updateQueryData(
                    'getMessages',
                    { conversationId: message.conversationId, limit: 50 },
                    (draft) => {
                        // Initialize structure if missing
                        if (!draft?.items) {
                            draft = { items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } };
                        }

                        const messages = draft.items as ChatMessage[];

                        // 1. If we sent this optimistically, replace the temp entry
                        if (message.sender.id === currentUserId) {
                            const tempIndex = messages.findIndex(
                                (m) => m.id.startsWith('temp-') && m.content === message.content,
                            );
                            if (tempIndex !== -1) {
                                messages[tempIndex] = message;
                                return;
                            }
                        }

                        // 2. Add if not already present
                        if (!messages.find((m) => m.id === message.id)) {
                            messages.push(message);
                        }

                        // 3. Keep sorted ascending by date
                        messages.sort(
                            (a, b) =>
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                        );


                    },
                ),
            );

            // Update conversation list cache
            dispatch(
                chatApi.util.updateQueryData(
                    'getConversations',
                    { page: 1, limit: 50 },
                    (draft) => {
                        if (!draft) return;
                        const conversations = Array.isArray(draft) ? draft : draft;
                        if (!conversations) return;

                        const convIndex = conversations.items.findIndex(
                            (c: any) => c.id === message.conversationId,
                        );
                        if (convIndex !== -1) {
                            const conv = conversations.items[convIndex];
                            conv.lastMessagePreview = message.content;
                            conv.lastMessageAt = message.createdAt;

                            // Increment unread when the message is from someone else and
                            // we are not actively viewing that conversation
                            if (
                                message.senderId !== currentUserId &&
                                this.activeConversationId !== message.conversationId
                            ) {
                                conv.unreadCount = (conv.unreadCount || 0) + 1;
                            }

                            // Bubble to top
                            const [updatedConv] = conversations.items.splice(convIndex, 1);
                            conversations.items.unshift(updatedConv);
                        } else {
                            // Completely new conversation — invalidate list
                            dispatch(
                                chatApi.util.invalidateTags([{ type: 'Chat', id: 'CONV_LIST' }]),
                            );
                        }
                    },
                ),
            );

            // Always refresh unread count
            dispatch(chatApi.util.invalidateTags([{ type: 'Chat', id: 'UNREAD_COUNT' }]));
        });

        // ── typing ────────────────────────────────────────────────────────────
        // Single event for both "is typing" and "stopped typing", differentiated
        // by the `isTyping` boolean — matching the server contract.

        this.socket.on('typing', ({ userId, isTyping, conversationId }: TypingPayload) => {
            if (isTyping) {
                dispatch(setUserTyping({ conversationId, userId }));
            } else {
                dispatch(setUserStopTyping({ conversationId, userId }));
            }
        });

        // ── messagesRead ──────────────────────────────────────────────────────
        // Fires when a participant marks messages as read.

        this.socket.on('messagesRead', ({ conversationId, userId }: MessagesReadPayload) => {
            console.log(`User ${userId} read messages in conversation ${conversationId}`);

            dispatch(
                chatApi.util.updateQueryData(
                    'getConversations',
                    { page: 1, limit: 50 },
                    (draft) => {
                        if (!draft) return;
                        const conversations = Array.isArray(draft) ? draft : draft;
                        if (!conversations) return;

                        const conv = conversations.items.find((c: any) => c.id === conversationId);
                        if (conv) {
                            // Reset our own unread count if we are the reader
                            const currentUserId = this.getState?.().auth?.user?.id;
                            if (userId === currentUserId) {
                                conv.unreadCount = 0;
                            }
                        }
                    },
                ),
            );
        });

        // ── newNotification ───────────────────────────────────────────────────
        // Fires on the private user room (user_<userId>) when the user receives
        // a message in a conversation they are not actively viewing. Ideal for
        // unread badges and toast notifications.

        this.socket.on('newNotification', (notification: NewNotificationPayload) => {
            console.log(
                `New message from ${notification.senderName}: ${notification.content}`,
            );
            dispatch(chatApi.util.invalidateTags([{ type: 'Chat', id: 'UNREAD_COUNT' }]));
            dispatch(chatApi.util.invalidateTags([{ type: 'Chat', id: 'CONV_LIST' }]));
        });
    }

    // ── Emitters ──────────────────────────────────────────────────────────────

    /**
     * Join a conversation room. Must be called before sending or receiving
     * messages in a specific conversation.
     */
    joinConversation(conversationId: string, callback?: (response: { event: string; conversationId: string }) => void) {
        this.activeConversationId = conversationId;
        if (this.socket?.connected) {
            if (callback) {
                this.socket.emit('joinConversation', { conversationId }, callback);
            } else {
                this.socket.emit('joinConversation', { conversationId });
            }
        }
    }

    /**
     * Leave a conversation room (not in the official spec but kept for
     * cleanup when navigating away from a conversation screen).
     */
    leaveConversation(conversationId: string) {
        if (this.activeConversationId === conversationId) {
            this.activeConversationId = null;
        }
        if (this.socket?.connected) {
            this.socket.emit('leaveConversation', { conversationId });
        }
    }

    /**
     * Broadcast typing state. A single `typing` event with `isTyping: true/false`
     * matches the server contract — no separate "stopTyping" event.
     */
    sendTyping(conversationId: string, isTyping: boolean) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { conversationId, isTyping });
        }
    }

    /**
     * Send a message to a conversation with optimistic UI updates.
     * The server ack returns the saved message object directly.
     */
    sendMessage(conversationId: string, content: string, attachments?: object | null) {
        if (!this.dispatch || !this.socket?.connected) {
            return Promise.reject('Socket not connected');
        }

        const dispatch = this.dispatch;
        const user = this.getState?.().auth?.user;
        if (!user) {
            console.error('Chat Socket: User not authenticated');
            return Promise.reject('User not authenticated');
        }

        const optimisticMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            conversationId,
            senderId: user.id,
            sender: user,
            content,
            attachments: [],
            isRead: false,
            readAt: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 1. Optimistically update messages cache
        const patchMessages = dispatch(
            chatApi.util.updateQueryData(
                'getMessages',
                { conversationId, limit: 50 },
                (draft) => {
                    if (!draft) return;
                    if (!draft?.items) {
                        draft = { items: [], meta: { page: 1, limit: 50, total: 0, totalPages: 1 } };
                    }

                    const messages = draft.items;

                    if (!messages.find((m) => m.id === optimisticMessage.id)) {
                        messages.push(optimisticMessage);
                    }
                },
            ),
        );

        // 2. Optimistically update conversation list cache
        const patchConversations = dispatch(
            chatApi.util.updateQueryData(
                'getConversations',
                { page: 1, limit: 50 },
                (draft) => {
                    if (!draft) return;
                    const conversations = Array.isArray(draft) ? draft : draft;
                    if (!conversations) return;

                    const convIndex = conversations.items.findIndex(
                        (c: any) => c.id === conversationId,
                    );
                    if (convIndex !== -1) {
                        const conv = conversations.items[convIndex];
                        conv.lastMessagePreview = content;
                        conv.lastMessageAt = optimisticMessage.createdAt;

                        const [updatedConv] = conversations.items.splice(convIndex, 1);
                        conversations.items.unshift(updatedConv);
                    }
                },
            ),
        );

        return new Promise<ChatMessage>((resolve, reject) => {
            console.log('Chat Socket: Emitting sendMessage', { conversationId, content });

            // Ack callback receives the saved message object directly (no wrapper)
            this.socket!.emit(
                'sendMessage',
                { conversationId, content, attachments: attachments ?? null },
                (finalMessage: ChatMessage) => {
                    if (finalMessage && finalMessage.id) {
                        // Replace temp with the real server message
                        dispatch(
                            chatApi.util.updateQueryData(
                                'getMessages',
                                { conversationId, limit: 50 },
                                (draft) => {
                                    if (!draft) return;
                                    const messages = draft.items as ChatMessage[];
                                    if (!messages) return;

                                    const index = messages.findIndex(
                                        (m) => m.id === optimisticMessage.id,
                                    );
                                    if (index !== -1) {
                                        messages[index] = finalMessage;
                                    }
                                },
                            ),
                        );
                        resolve(finalMessage);
                    } else {
                        // Server returned an error or unexpected shape — rollback
                        const errorMsg =
                            (finalMessage as any)?.message ?? 'Failed to send message';
                        console.error('Chat Socket: sendMessage failed', errorMsg);
                        patchMessages.undo();
                        patchConversations.undo();
                        reject(errorMsg);
                    }
                },
            );
        });
    }

    /**
     * Mark all unread messages in a conversation as read.
     * Notifies other participants via the `messagesRead` event.
     */
    markAsRead(conversationId: string) {
        if (this.socket?.connected) {
            this.socket.emit('markAsRead', { conversationId });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
