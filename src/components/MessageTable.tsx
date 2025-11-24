import React from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import useDltStore from '../store/useDltStore';
import { ChevronLeft, ChevronRight, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getShortErrorName, truncateText } from '../lib/formatters';

const errorTypeColors: Record<string, string> = {
  'NotFoundException': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  'InternalException': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  'ValidationException': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  'TimeoutException': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  'ServiceUnavailableException': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  'UnknownException': 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
  'DeserializationException': 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export function MessageTable({ messages, currentPage, totalPages, onPageChange, totalMessages }) {
  const { selectedMessages, toggleMessageSelection, setSelectedMessage, setDrawerOpen, setReplayDialogOpen, setSelectedMessages } = useDltStore();

  const handleRowClick = (message) => {
    setSelectedMessage(message);
    setDrawerOpen(true);
  };

  const handleReplayClick = (e, messageId) => {
    e.stopPropagation();
    setSelectedMessages([messageId]);
    setReplayDialogOpen(true);
  };

  const isAllSelected = messages.length > 0 && messages.every(m => selectedMessages.includes(m.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentIds = messages.map(m => m.id);
      setSelectedMessages(selectedMessages.filter(id => !currentIds.includes(id)));
    } else {
      const newIds = messages.map(m => m.id).filter(id => !selectedMessages.includes(id));
      setSelectedMessages([...selectedMessages, ...newIds]);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Key</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Topic</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Error Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Error Message</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Error Location</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">Replay Count</TableHead>
                <TableHead className="w-32 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500 dark:text-slate-400">
                    No messages found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message) => {
                  const shortErrorName = getShortErrorName(message.errorType);
                  return (
                    <TableRow
                      key={message.id}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      onClick={() => handleRowClick(message)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMessages.includes(message.id)}
                          onCheckedChange={() => toggleMessageSelection(message.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-900 dark:text-slate-100">
                        {truncateText(message.key, 30)}
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300">{message.topic}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                        {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`cursor-help ${errorTypeColors[shortErrorName] || errorTypeColors.UnknownException}`}>
                                {shortErrorName}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-all">{message.errorType}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{truncateText(message.errorMessage || '-', 50)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md">{message.errorMessage || 'No error message'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">{truncateText(message.errorLocation || '-', 40)}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-md">{message.errorLocation || 'No location info'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${message.replayCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                          {message.replayCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRowClick(message)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleReplayClick(e, message.id)}
                            className="hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalMessages)} of {totalMessages} messages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-slate-300 dark:border-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-slate-300 dark:border-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
