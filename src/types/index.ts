export interface Service {
  id: string;
  name: string;
}

export interface Topic {
  name: string;
}

export interface MessageHeaders {
  'correlation-id': string;
  'source': string;
  'content-type': string;
}

export interface MessagePayload {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Message {
  id: string;
  key: string;
  serviceId: string;
  topic: string;
  timestamp: string;
  errorType: string;
  replayCount: number;
  lastReplayAt: string | null;
  headers: MessageHeaders;
  payload: MessagePayload;
  stacktrace: string;
}

export interface Filters {
  errorType: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  searchByKey: string;
  searchByValue: string;
  headerKey: string;
  headerValue: string;
}

export interface MetricsOverview {
  totalDltMessages: number;
  dltLast24h: number;
  topServices: Array<{ serviceName: string; count: number }>;
  dltByTopic: Array<{ topic: string; count: number }>;
  dltByErrorType: Array<{ errorType: string; count: number }>;
  dltByTime: Array<{ date: string; count: number }>;
}

export interface ReplayHistoryItem {
  id: string;
  messageId: string;
  replayedAt: string;
  status: 'SUCCESS' | 'FAILED';
  replayedBy: string;
}

export interface DltStore {
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
  
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  
  selectedMessage: Message | null;
  setSelectedMessage: (message: Message | null) => void;
  
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  
  selectedMessages: string[];
  setSelectedMessages: (messages: string[]) => void;
  toggleMessageSelection: (messageId: string) => void;
  clearSelection: () => void;
  
  replayDialogOpen: boolean;
  setReplayDialogOpen: (open: boolean) => void;
}
