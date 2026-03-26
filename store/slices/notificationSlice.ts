import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: 'occasion' | 'gift' | 'system' | 'autopilot';
    timestamp: string;
    isRead: boolean;
    deepLink?: string;
}

interface NotificationState {
    unreadCount: number;
    items: Notification[];
}

const initialState: NotificationState = {
    unreadCount: 0,
    items: [],
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            // Add to start of list
            state.items.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        markRead: (state, action: PayloadAction<string>) => {
            const idx = state.items.findIndex(n => n.id === action.payload);
            if (idx !== -1 && !state.items[idx].isRead) {
                state.items[idx].isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllRead: (state) => {
            state.items.forEach(n => (n.isRead = true));
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, markRead, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
