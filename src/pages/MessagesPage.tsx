import { useState, useEffect } from 'react';
import { MessageTable } from '../components/MessageTable';
import { MessageDetailDrawer } from '../components/MessageDetailDrawer';
import { FiltersPanel } from '../components/FiltersPanel';
import { ReplayDialog } from '../components/ReplayDialog';
import useDltStore from '../store/useDltStore';
import { useDltApi } from '../hooks/useDltApi';
import type { Message } from '@/types';
import { Button } from '../components/ui/button';
import { Play, X } from 'lucide-react';

export default function MessagesPage() {
  const dltApi = useDltApi();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { selectedService, selectedTopic, filters, selectedMessages, clearSelection, setReplayDialogOpen } = useDltStore();

  // Fetch messages whenever page or filters change
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await dltApi.getMessages({
          page: currentPage,
          pageSize,
          serviceId: selectedService || undefined,
          topic: selectedTopic || undefined,
          errorType: filters.errorType || undefined,
          search: filters.search || undefined,
          searchByKey: filters.searchByKey || undefined,
          searchByValue: filters.searchByValue || undefined,
          headerKey: filters.headerKey || undefined,
          headerValue: filters.headerValue || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        });
        setMessages(response.data);
        setTotalMessages(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
        setTotalMessages(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [dltApi, currentPage, pageSize, selectedService, selectedTopic, filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedService, selectedTopic, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">DLT Messages</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore, filter, and replay dead letter messages
          </p>
        </div>
      </div>

      {selectedMessages.length > 0 && (
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''} selected
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setReplayDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Replay Selected
            </Button>
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="text-slate-600 dark:text-slate-400"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <FiltersPanel />
        
        <div className="space-y-4">
          <MessageTable
            messages={messages}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalMessages={totalMessages}
          />
        </div>
      </div>

      <MessageDetailDrawer />
      <ReplayDialog />
    </div>
  );
}
