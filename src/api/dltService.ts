import { AxiosInstance } from 'axios';
import type { Message, Service, Topic, MetricsOverview, ReplayHistoryItem, Filters } from '@/types';

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

  // Messages
  getMessages: async (filters?: Partial<Filters & { serviceId?: string; topic?: string }>): Promise<Message[]> => {
    const response = await api.get('/messages', {
      params: filters,
    });
    return response.data;
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
    const response = await api.get('/replays/history', {
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
