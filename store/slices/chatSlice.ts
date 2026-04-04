import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TypingStatus {
    conversationId: string;
    userId: string;
}

interface ChatState {
    typingUsers: Record<string, string[]>; // conversationId -> userId[]
    activeConversationId: string | null;
}

const initialState: ChatState = {
    typingUsers: {},
    activeConversationId: null,
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
    },
});

export const {
    setUserTyping,
    setUserStopTyping,
    setActiveConversation,
    clearTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
