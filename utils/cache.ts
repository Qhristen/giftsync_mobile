import * as SecureStore from "expo-secure-store";

const getToken = async (key: string) => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error("SecureStore get error:", error);
        return null;
    }
};

const saveToken = async (key: string, value: string) => {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error("SecureStore save error:", error);
    }
};

const deleteToken = async (key: string) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error("SecureStore delete error:", error);
    }
};

export const tokenCache = {
    getToken,
    saveToken,
    deleteToken,
};
