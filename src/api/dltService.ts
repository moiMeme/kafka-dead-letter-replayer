import { AxiosInstance } from 'axios';
import type { Message, Service, Topic, MetricsOverview, ReplayHistoryItem, Filters } from '@/types';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MessageQueryParams extends Partial<Filters> {
  serviceId?: string;
  topic?: string;
  page?: number;
  pageSize?: number;
}

export const DltApiService = (api: AxiosInstance) => ({
  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  // Topics
  getTopics: async (serviceId?: string): Promise<Topic[]> => {
    const response = await api.get('/topics', {
      params: serviceId ? { serviceId } : undefined,
    });
    return response.data;
  },

  // Error Types
  getErrorTypes: async (): Promise<string[]> => {
    const response = await api.get('/errorTypes');
    // Map objects to names
    return response.data.map((item: { id: number; name: string }) => item.name);
  },

  // Messages - with server-side pagination
  getMessages: async (params?: MessageQueryParams): Promise<PaginatedResponse<Message>> => {
    const { page = 1, pageSize = 20, ...filters } = params || {};

    // Build query params for json-server
    const queryParams: any = {
      _page: page,
      _limit: pageSize,
      _sort: 'timestamp',
      _order: 'desc'
    };

    // Add filters
    if (filters.serviceId) queryParams.serviceId = filters.serviceId;
    if (filters.topic) queryParams.topic = filters.topic;
    if (filters.errorType) queryParams.errorType = filters.errorType;
    if (filters.search) queryParams.q = filters.search;
    if (filters.searchByKey) queryParams.key_like = filters.searchByKey;

    // Date range filters - json-server uses _gte and _lte
    if (filters.dateFrom) queryParams.timestamp_gte = filters.dateFrom;
    if (filters.dateTo) queryParams.timestamp_lte = filters.dateTo;

    const response = await api.get('/messages', { params: queryParams });

    // json-server returns total count in X-Total-Count header
    const total = parseInt(response.headers['x-total-count'] || '0', 10);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: response.data,
      total,
      page,
      pageSize,
      totalPages
    };
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  // Replay
  replayMessages: async (messageIds: string[], headers?: Record<string, string>): Promise<void> => {
    await api.post('/replays', { messageIds, headers });
  },

  getReplayHistory: async (messageId: string): Promise<ReplayHistoryItem[]> => {
    const response = await api.get(`/replays`, {
      params: { messageId },
    });
    return response.data;
  },

  // Metrics
  getMetricsOverview: async (): Promise<MetricsOverview> => {
    const response = await api.get('/metrics');
    return response.data;
  },

  getTopicMetrics: async (topic: string) => {
    const response = await api.get(`/metrics/topic/${topic}`);
    return response.data;
  },
});

export type DltApi = ReturnType<typeof DltApiService>;
