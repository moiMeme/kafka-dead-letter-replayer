import axios, { AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:3001';

export const createApi = (config?: AxiosRequestConfig) =>
  axios.create({
    baseURL,
    ...config,
  });
