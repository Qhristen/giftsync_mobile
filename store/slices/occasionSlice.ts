import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Occasion {
    id: string;
    name: string;
    type: string;
    date: string;
    avatarUrl?: string;
    countdown: string;
    dotColor: string;
}

interface OccasionState {
    items: Occasion[];
}

const initialState: OccasionState = {
    items: [],
};

const occasionSlice = createSlice({
    name: 'occasions',
    initialState,
    reducers: {
        setOccasions: (state, action: PayloadAction<Occasion[]>) => {
            state.items = action.payload;
        },
        addOccasion: (state, action: PayloadAction<Occasion>) => {
            state.items.push(action.payload);
        },
        clearOccasions: (state) => {
            state.items = [];
        },
    },
});

export const { setOccasions, addOccasion, clearOccasions } = occasionSlice.actions;
export default occasionSlice.reducer;
