import * as SecureStore from "expo-secure-store";

// In-memory cache to avoid hitting SecureStore (disk I/O) on every API request
let memoryCache: Record<string, string | null> = {};
let memoryCacheLoaded: Record<string, boolean> = {};

const getToken = async (key: string) => {
    // Return from memory if already loaded
    if (memoryCacheLoaded[key]) {
        return memoryCache[key];
    }

    try {
        const value = await SecureStore.getItemAsync(key);
        memoryCache[key] = value;
        memoryCacheLoaded[key] = true;
        return value;
    } catch (error) {
        console.error("SecureStore get error:", error);
        return null;
    }
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
};

export const tokenCache = {
    getToken,
    saveToken,
    deleteToken,
    clearAll,
};
