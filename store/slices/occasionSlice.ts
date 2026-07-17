import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface event {
    id: string;
    name: string;
    type: string;
    date: string;
    avatarUrl?: string;
    countdown: string;
    dotColor: string;
}

interface EventState {
    items: event[];
}

const initialState: EventState = {
    items: [],
};

const occasionSlice = createSlice({
    name: 'occasions',
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<event[]>) => {
            state.items = action.payload;
        },
        addEvent: (state, action: PayloadAction<event>) => {
            state.items.push(action.payload);
        },
        clearEvents: (state) => {
            state.items = [];
        },
    },
});

export const { setEvents, addEvent, clearEvents } = occasionSlice.actions;
export default occasionSlice.reducer;
