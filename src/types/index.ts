export interface Service {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  name: string;
}

export interface ErrorType {
  name: string;
}

export interface Message {
  id: string;
  key: string;
  serviceId: string;
  topic: string;
  timestamp: string;
  errorType: string;
  errorMessage: string;
  errorLocation: string;
  errorCauseTrace: string;
  replayCount: number;
  lastReplayAt: string | null;
  headers: Record<string, string>;
  payload: string; // JSON string
  stacktrace: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
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
  topServices: Array<{ serviceId: string; count: number }>;
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
