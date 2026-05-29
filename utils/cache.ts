import * as SecureStore from "expo-secure-store";

const get = async (key: string): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error("SecureStore get error:", error);
        return null;
    }
};

const save = async (key: string, value: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error("SecureStore save error:", error);
    }
};

const remove = async (key: string): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error("SecureStore delete error:", error);
    }
};

export const tokenCache = {
    get,
    save,
    remove
};