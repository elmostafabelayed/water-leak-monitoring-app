import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { router } from 'expo-router';



const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('@auth_token');
      router.replace('/login');
      return Promise.resolve(error.response);
    }

    if (error?.code === 'ECONNABORTED') {
      const url = config?.url ?? 'unknown';
      console.log(`Request timeout: ${url}`);
    }

    const isNetworkError = !error?.response;
    if (isNetworkError && config) {
      config.__retryCount = config.__retryCount ?? 0;
      if (config.__retryCount < 3) {
        config.__retryCount += 1;
        await new Promise((r) => setTimeout(r, 350 * config.__retryCount));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export const unwrap = (response) => {
  const payload = response?.data;
  if (!payload?.success) {
    throw new Error(payload?.message || 'Erreur serveur');
  }
  if (payload?.data == null) {
    throw new Error('Données manquantes');
  }
  return payload.data;
};

export default api;

