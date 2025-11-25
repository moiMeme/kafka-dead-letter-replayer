import { AxiosInstance } from 'axios';
import type { Message, Service, Topic, MetricsOverview, ReplayHistoryItem, Filters, ErrorType, PaginatedResponse } from '@/types';

export interface PaginatedResponseAdapter<T> {
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

export interface ReplayRequest {
  messageId: string;
  payload: string;
  headers: Record<string, string>;
}

export const DltApiService = (api: AxiosInstance) => ({
  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  // Topics - now included in services response, but keep this for compatibility
  getTopics: async (serviceId?: string): Promise<Topic[]> => {
    if (serviceId) {
      // Find service and return its topics
      const servicesResponse = await api.get('/services');
      const service = servicesResponse.data.find((s: Service) => s.id === serviceId);
      return service?.topics || [];
    }
    // Return all topics from all services
    const servicesResponse = await api.get('/services');
    const allTopics: Topic[] = [];
    servicesResponse.data.forEach((service: Service) => {
      if (service.topics) {
        allTopics.push(...service.topics);
      }
    });
    return allTopics;
  },

  // Error Types
  getErrorTypes: async (): Promise<string[]> => {
    const response = await api.get('/errorTypes');
    // Map objects to names
    return response.data.map((item: ErrorType) => item.name);
  },

  // Messages - with server-side pagination from Spring Boot
  getMessages: async (params?: MessageQueryParams): Promise<PaginatedResponseAdapter<Message>> => {
    const { page = 0, pageSize = 20, ...filters } = params || {};

    // Build query params for Spring Boot (page is 0-indexed)
    const queryParams: any = {
      page: page > 0 ? page - 1 : 0, // Convert 1-indexed to 0-indexed
      size: pageSize,
      sort: 'timestamp,desc'
    };

    // Add filters
    if (filters.serviceId) queryParams.serviceId = filters.serviceId;
    if (filters.topic) queryParams.topic = filters.topic;
    if (filters.errorType) queryParams.errorType = filters.errorType;
    if (filters.search) queryParams.search = filters.search;
    if (filters.searchByKey) queryParams.key = filters.searchByKey;
    if (filters.searchByValue) queryParams.value = filters.searchByValue;
    if (filters.headerKey) queryParams.headerKey = filters.headerKey;
    if (filters.headerValue) queryParams.headerValue = filters.headerValue;
    if (filters.dateFrom) queryParams.dateFrom = filters.dateFrom;
    if (filters.dateTo) queryParams.dateTo = filters.dateTo;

    const response = await api.get('/messages', { params: queryParams });

    // Spring Boot returns paginated response
    const springPage: PaginatedResponse<Message> = response.data;

    return {
      data: springPage.content,
      total: springPage.totalElements,
      page: springPage.number + 1, // Convert back to 1-indexed
      pageSize: springPage.size,
      totalPages: springPage.totalPages
    };
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  // Replay
  replayMessages: async (requests: ReplayRequest[]): Promise<void> => {
    const response = await api.post('/replays', requests);
    return response.data;
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
