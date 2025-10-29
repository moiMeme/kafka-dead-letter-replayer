import React, { useState, useMemo, useEffect } from 'react';
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
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedService, selectedTopic, filters, selectedMessages, clearSelection, setReplayDialogOpen } = useDltStore();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await dltApi.getMessages();
        setAllMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [dltApi]);

  const filteredMessages = useMemo(() => {
    let filtered = [...allMessages];

    if (selectedService) {
      filtered = filtered.filter(m => m.serviceId === selectedService);
    }

    if (selectedTopic) {
      filtered = filtered.filter(m => m.topic === selectedTopic);
    }

    if (filters.errorType) {
      filtered = filtered.filter(m => m.errorType === filters.errorType);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m =>
        m.key.toLowerCase().includes(searchLower) ||
        m.topic.toLowerCase().includes(searchLower) ||
        JSON.stringify(m.payload).toLowerCase().includes(searchLower)
      );
    }

    if (filters.searchByKey) {
      const keyLower = filters.searchByKey.toLowerCase();
      filtered = filtered.filter(m => m.key.toLowerCase().includes(keyLower));
    }

    if (filters.searchByValue) {
      const valueLower = filters.searchByValue.toLowerCase();
      filtered = filtered.filter(m =>
        JSON.stringify(m.payload).toLowerCase().includes(valueLower)
      );
    }

    if (filters.headerKey) {
      const headerKeyLower = filters.headerKey.toLowerCase();
      filtered = filtered.filter(m =>
        Object.keys(m.headers).some(key => key.toLowerCase().includes(headerKeyLower))
      );
    }

    if (filters.headerValue) {
      const headerValLower = filters.headerValue.toLowerCase();
      filtered = filtered.filter(m =>
        Object.values(m.headers).some(val =>
          String(val).toLowerCase().includes(headerValLower)
        )
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(m => new Date(m.timestamp) <= new Date(filters.dateTo));
    }

    return filtered;
  }, [allMessages, selectedService, selectedTopic, filters]);

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMessages.slice(startIndex, startIndex + pageSize);
  }, [filteredMessages, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMessages.length / pageSize);

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
            messages={paginatedMessages}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalMessages={filteredMessages.length}
          />
        </div>
      </div>

      <MessageDetailDrawer />
      <ReplayDialog />
    </div>
  );
}
