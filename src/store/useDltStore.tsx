import { create } from 'zustand';

const useDltStore = create((set) => ({
  selectedService: null,
  setSelectedService: (service) => set({ selectedService: service, selectedTopic: null }),
  
  selectedTopic: null,
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  
  filters: {
    errorType: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    searchByKey: '',
    searchByValue: '',
    headerKey: '',
    headerValue: ''
  },
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({
    filters: {
      errorType: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      searchByKey: '',
      searchByValue: '',
      headerKey: '',
      headerValue: ''
    }
  }),
  
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
  
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  
  selectedMessages: [],
  setSelectedMessages: (messages) => set({ selectedMessages: messages }),
  toggleMessageSelection: (messageId) => set((state) => {
    const isSelected = state.selectedMessages.includes(messageId);
    return {
      selectedMessages: isSelected
        ? state.selectedMessages.filter(id => id !== messageId)
        : [...state.selectedMessages, messageId]
    };
  }),
  clearSelection: () => set({ selectedMessages: [] }),
  
  replayDialogOpen: false,
  setReplayDialogOpen: (open) => set({ replayDialogOpen: open })
}));

export default useDltStore;
