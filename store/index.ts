import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnknownAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import occasionReducer from './slices/occasionSlice';
import onboardingReducer from './slices/onboardingSlice';
import themeReducer from './slices/themeSlice';
import walletReducer from './slices/walletSlice';

const appReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    onboarding: onboardingReducer,
    notification: notificationReducer,
    occasions: occasionReducer,
    wallet: walletReducer,
    chat: chatReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer = (state: any, action: UnknownAction) => {
    // Clear all states when the user explicitly logs out
    if (action.type === 'auth/logout/fulfilled') {
        // Redux persist uses PURGE to wipe storage but returning undefined resets RAM state
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'theme', 'onboarding', baseApi.reducerPath] // Cache RTK Query APIs permanently
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
            immutableCheck: false, // Prevents Redux from freezing the JS thread doing deep equality checks on large API arrays
        }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
