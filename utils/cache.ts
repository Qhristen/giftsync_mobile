import * as SecureStore from "expo-secure-store";

// In-memory cache to avoid hitting SecureStore (disk I/O) on every API request
let memoryCache: Record<string, string | null> = {};
let memoryCacheLoaded: Record<string, boolean> = {};
let getPromises: Record<string, Promise<string | null> | undefined> = {};

const getToken = async (key: string) => {
    // Return from memory if already loaded
    if (memoryCacheLoaded[key]) {
        return memoryCache[key];
    }

    // Return the existing promise if a fetch is already in progress
    if (getPromises[key]) {
        return getPromises[key];
    }

    // Create a new promise and store it
    getPromises[key] = (async () => {
        try {
            const value = await SecureStore.getItemAsync(key);
            memoryCache[key] = value;
            memoryCacheLoaded[key] = true;
            return value;
        } catch (error) {
            console.error("SecureStore get error:", error);
            return null;
        } finally {
            // Clean up the promise once it's resolved or rejected
            delete getPromises[key];
        }
    })();

    return getPromises[key];
};

const saveToken = async (key: string, value: string) => {
    // Update memory cache immediately
    memoryCache[key] = value;
    memoryCacheLoaded[key] = true;

    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error("SecureStore save error:", error);
    }
};

const deleteToken = async (key: string) => {
    // Clear memory cache immediately
    memoryCache[key] = null;
    memoryCacheLoaded[key] = true;

    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error("SecureStore delete error:", error);
    }
};

const clearAll = () => {
    memoryCache = {};
    memoryCacheLoaded = {};
    getPromises = {};
};

const getTokenSync = (key: string) => {
    return memoryCacheLoaded[key] ? memoryCache[key] : null;
};

const isCacheLoaded = (key: string) => {
    return !!memoryCacheLoaded[key];
};

const preloadCache = async () => {
    await Promise.all([
        getToken('accessToken'),
        getToken('refreshToken')
    ]);
};

export const tokenCache = {
    getToken,
    getTokenSync,
    isCacheLoaded,
    saveToken,
    deleteToken,
    clearAll,
    preloadCache,
};
