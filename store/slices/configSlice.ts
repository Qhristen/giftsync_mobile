import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlatformConfigItem } from '../api/platformConfigApi';

interface ConfigState {
    configs: Record<string, any>;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ConfigState = {
    configs: {
        ai_chat_cost: 0, // Fallback defaults
        ngn_usd_rate: 0,
        usd_per_coin: 0,
        occasion_creation_cost: 0,
        product_creation_cost: 0,
        delivery_fee_ngn: 0,
        packaging_fee_ngn: 0,
    },
    status: 'idle',
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setConfigs: (state, action: PayloadAction<PlatformConfigItem[]>) => {
            const configMap = action.payload.reduce((acc, item) => {
                const value = item.value;
                // Try to parse number if it looks like one, otherwise keep as string
                acc[item.key] = isNaN(Number(value)) ? value : Number(value);
                return acc;
            }, {} as Record<string, any>);
            state.configs = { ...state.configs, ...configMap };
            state.status = 'succeeded';
        },
        setConfigStatus: (state, action: PayloadAction<ConfigState['status']>) => {
            state.status = action.payload;
        }
    },
});

export const { setConfigs, setConfigStatus } = configSlice.actions;
export default configSlice.reducer;
