import {AxiosError, AxiosInstance} from 'axios';
import React, {createContext, FC, useContext, useState} from 'react';
import {createApi} from '../api/api';

const ApiContext = createContext<AxiosInstance>({} as AxiosInstance);

interface ApiProviderProps {
  children?: React.ReactNode;
}

export const ApiProvider: FC<ApiProviderProps> = ({ children }) => {
  const api = useApiWithAuth();

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
    return useContext(ApiContext);
};

const useApiWithAuth = () => {
  const REFRESH_COOLDOWN = 60 * 1000;
  const REFRESH_KEY = 'lastRefreshTime';

  const [api] = useState(() => {
    const api = createApi();

    api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status !== 403) {
          return Promise.reject(error);
        }

        const currentTime = Date.now();
        const lastRefreshTime = +(sessionStorage.getItem(REFRESH_KEY) ?? 0);

        if (currentTime - lastRefreshTime > REFRESH_COOLDOWN) {
          sessionStorage.setItem(REFRESH_KEY, currentTime.toString());
          window.location.reload();
        }

        return Promise.reject(error);
      }
    );

    return api;
  });

  return api;
};
