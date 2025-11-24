import axios, { AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : 'http://localhost:8183/api/cold-control/v1';

export const createApi = (config?: AxiosRequestConfig) =>
  axios.create({
    baseURL,
    ...config,
  });
