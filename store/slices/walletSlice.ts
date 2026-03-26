import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
    coins: number;
}

const initialState: WalletState = {
    coins: 50, // Default for new users or starting amount
};

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        addCoins: (state, action: PayloadAction<number>) => {
            state.coins += action.payload;
        },
        spendCoins: (state, action: PayloadAction<number>) => {
            if (state.coins >= action.payload) {
                state.coins -= action.payload;
            }
        },
        setCoins: (state, action: PayloadAction<number>) => {
            state.coins = action.payload;
        },
    },
});

export const { addCoins, spendCoins, setCoins } = walletSlice.actions;
export default walletSlice.reducer;
