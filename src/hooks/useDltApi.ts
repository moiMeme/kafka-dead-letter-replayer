import { useMemo } from 'react';
import { useApi } from '../contexts/ApiProvider';
import { DltApiService } from '../api/dltService';

export const useDltApi = () => {
  const api = useApi();
  return useMemo(() => DltApiService(api), [api]);
};
