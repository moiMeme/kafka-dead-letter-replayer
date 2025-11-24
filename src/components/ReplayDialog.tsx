import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import useDltStore from '../store/useDltStore';
import { useDltApi } from '../hooks/useDltApi';
import type { Message } from '@/types';
import type { ReplayRequest } from '../api/dltService';
import { toast } from '../hooks/use-toast';
import { Play, X } from 'lucide-react';

export function ReplayDialog() {
  const dltApi = useDltApi();
  const { replayDialogOpen, setReplayDialogOpen, selectedMessages, clearSelection, triggerRefresh } = useDltStore();
  const [isReplaying, setIsReplaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch message details when dialog opens
  useEffect(() => {
    const fetchMessages = async () => {
      if (replayDialogOpen && selectedMessages.length > 0) {
        setLoading(true);
        try {
          const messagePromises = selectedMessages.map(id => dltApi.getMessage(id));
          const messagesData = await Promise.all(messagePromises);
          setMessages(messagesData);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          setMessages([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMessages();
  }, [replayDialogOpen, selectedMessages, dltApi]);

  const handleReplay = async () => {
    setIsReplaying(true);

    try {
      // Build replay requests with original message data
      const replayRequests: ReplayRequest[] = messages.map(message => ({
        messageId: message.id,
        payload: message.payload, // Original payload as string
        headers: message.headers  // Original headers
      }));

      // Call the API to replay messages
      await dltApi.replayMessages(replayRequests);

      toast({
        title: 'Replay initiated',
        description: `${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''} replayed successfully. History saved by API.`,
        variant: 'default'
      });

      // Trigger message list refresh
      triggerRefresh();

      setReplayDialogOpen(false);
      clearSelection();
    } catch (error) {
      console.error('Failed to replay messages:', error);
      toast({
        title: 'Replay failed',
        description: 'Failed to replay messages. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsReplaying(false);
    }
  };

  const handleClose = () => {
    setReplayDialogOpen(false);
  };

  return (
    <Dialog open={replayDialogOpen} onOpenChange={setReplayDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Replay Messages</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Confirm replay for the selected message{selectedMessages.length > 1 ? 's' : ''}. The API will save the replay history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Selected Messages ({messages.length})</Label>
            {loading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Loading messages...
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-slate-900 dark:text-slate-100 truncate">{message.key}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate">{message.topic}</div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isReplaying}
            className="border-slate-300 dark:border-slate-700"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleReplay}
            disabled={isReplaying}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            {isReplaying ? 'Replaying...' : 'Replay Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
