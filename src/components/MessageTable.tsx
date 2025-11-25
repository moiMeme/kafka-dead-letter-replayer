import React, {useMemo} from 'react';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import useDltStore from '../store/useDltStore';
import { ChevronLeft, ChevronRight, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getShortErrorName } from '../lib/formatters';
import {useTheme} from "@/components/ThemeProvider.tsx";
import { getExceptionColor } from "@/lib/utils.ts";
import {Message} from "@/types";

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

  const { theme } = useTheme();

  const exceptionColors = useMemo(() => {
    if (!messages) return {};

    const map: Record<string, string> = {};

    messages.forEach( (m : Message) => {
      map[m.errorType] = getExceptionColor(
            m.errorType,
            theme === "dark" ? "dark" : "light"
      );
    });

    return map;
  }, [theme]);

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
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-64">Key</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-52">Topic</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-44">Timestamp</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-36">Error Type</TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Error Message</TableHead>
                <TableHead className="w-20 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500 dark:text-slate-400">
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
                      <TableCell className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all">
                        <div className="max-w-xs">
                          {message.key}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 text-sm">{message.topic}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                        {format(new Date(message.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={`${exceptionColors[message.errorType]}`}>
                                {shortErrorName}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-all">{message.errorType}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-300 text-xs">
                        <div className="max-w-xl line-clamp-2 leading-relaxed">
                          {message.errorMessage || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRowClick(message)}
                            className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleReplayClick(e, message.id)}
                            className="h-7 w-7 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400"
                          >
                            <Play className="h-3.5 w-3.5" />
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
