import { UnknownAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import checkoutReducer from './slices/checkoutSlice';
import notificationReducer from './slices/notificationSlice';
import occasionReducer from './slices/occasionSlice';
import onboardingReducer from './slices/onboardingSlice';
import themeReducer from './slices/themeSlice';
import walletReducer from './slices/walletSlice';

const appReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    checkout: checkoutReducer,
    onboarding: onboardingReducer,
    notification: notificationReducer,
    occasions: occasionReducer,
    wallet: walletReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer = (state: any, action: UnknownAction) => {
    // Clear all states when the user explicitly logs out
    if (action.type === 'auth/logout/fulfilled') {
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // For easier handling of dates and non-serializable objects in development
        }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
