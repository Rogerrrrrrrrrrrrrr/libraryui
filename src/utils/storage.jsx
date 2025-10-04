import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (data) => {
  try {
    await AsyncStorage.setItem("userToken", data);
    console.log("📌 [storage] Token stored:", data);
  } catch (err) {
    console.error("⚠️ [storage] Failed to store token:", err);
  }
};

export const getUserData = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    const role = await AsyncStorage.getItem("role");
    const userId = await AsyncStorage.getItem("userId");
    return { token, role, userId };
  } catch (err) {
    console.error("⚠️ [storage] Failed to fetch user data:", err);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("role");
    await AsyncStorage.removeItem("userId");
    console.log("📌 [storage] Token removed");
  } catch (err) {
    console.error("⚠️ [storage] Failed to remove token:", err);
  }
};
