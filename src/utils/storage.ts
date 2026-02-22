import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LAUNCHED_KEY = '@app_has_launched';
const USER_NAME_KEY = '@user_name';

export const setHasLaunched = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(APP_LAUNCHED_KEY, 'true');
    } catch (error) {
        console.error('Error saving launch status', error);
    }
};

export const getHasLaunched = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(APP_LAUNCHED_KEY);
        return value === 'true';
    } catch (error) {
        console.error('Error getting launch status', error);
        return false;
    }
};

export const saveUserName = async (name: string): Promise<void> => {
    try {
        if (name.trim()) {
            await AsyncStorage.setItem(USER_NAME_KEY, name.trim());
        }
    } catch (error) {
        console.error('Error saving user name', error);
    }
};

export const getUserName = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(USER_NAME_KEY);
    } catch (error) {
        console.error('Error getting user name', error);
        return null;
    }
};
