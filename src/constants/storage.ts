import * as SecureStore from "expo-secure-store";

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync("token", token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync("token");
};



export const saveAuth = async (token: string, user: any) => {
  await SecureStore.setItemAsync("token", token);
  await SecureStore.setItemAsync("user", JSON.stringify(user));
};