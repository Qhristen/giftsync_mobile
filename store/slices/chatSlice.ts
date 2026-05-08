import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TypingStatus {
    conversationId: string;
    userId: string;
}

interface ChatState {
    typingUsers: Record<string, string[]>; // conversationId -> userId[]
    activeConversationId: string | null;
    unreadCount: number;
}

const initialState: ChatState = {
    typingUsers: {},
    activeConversationId: null,
    unreadCount: 0,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setUserTyping: (state, action: PayloadAction<TypingStatus>) => {
            const { conversationId, userId } = action.payload;
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }
            if (!state.typingUsers[conversationId].includes(userId)) {
                state.typingUsers[conversationId].push(userId);
            }
        },
        setUserStopTyping: (state, action: PayloadAction<TypingStatus>) => {
            const { conversationId, userId } = action.payload;
            if (state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
                    (id) => id !== userId
                );
            }
        },
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },
        clearTyping: (state, action: PayloadAction<string>) => {
            delete state.typingUsers[action.payload];
        },
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
    },
});

export const {
    setUserTyping,
    setUserStopTyping,
    setActiveConversation,
    clearTyping,
    setUnreadCount,
} = chatSlice.actions;

const EMPTY_ARRAY: string[] = [];

// Selectors
export const selectTypingUsers = (state: { chat: ChatState }, conversationId: string) =>
    state.chat.typingUsers[conversationId] || EMPTY_ARRAY;

export const selectUnreadCount = (state: { chat: ChatState }) => state.chat.unreadCount;

export default chatSlice.reducer;
