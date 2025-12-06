import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from "@/constants/api.constant";

export const setAccessToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (e) {
    console.error("Failed to save access token", e);
  }
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (e) {
    console.error("Failed to get access token", e);
    return null;
  }
};

export const clearAccessToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (e) {
    console.error("Failed to clear access token", e);
  }
};
