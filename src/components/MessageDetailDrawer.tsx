import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import useDltStore from '../store/useDltStore';
import { mockReplayHistory } from '../data/mock';
import { Play, FileJson, FileText, History as HistoryIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Editor from '@monaco-editor/react';
import { useTheme } from './ThemeProvider';

const errorTypeColors = {
  DeserializationException: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  ValidationException: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  TimeoutException: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  ServiceUnavailableException: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  UnknownException: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
};

export function MessageDetailDrawer() {
  const { theme } = useTheme();
  const { selectedMessage, drawerOpen, setDrawerOpen, setReplayDialogOpen, setSelectedMessages } = useDltStore();
  const [editedPayload, setEditedPayload] = useState('');
  const [editedHeaders, setEditedHeaders] = useState<Record<string, string>>({});
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [replayHistory, setReplayHistory] = useState([]);

  useEffect(() => {
    if (selectedMessage) {
      setEditedPayload(JSON.stringify(selectedMessage.payload, null, 2));
      setEditedHeaders({ ...selectedMessage.headers });
      setReplayHistory(mockReplayHistory(selectedMessage.id));
    }
  }, [selectedMessage]);

  if (!selectedMessage) return null;

  const handleReplay = () => {
    setSelectedMessages([selectedMessage.id]);
    setReplayDialogOpen(true);
  };

  const handleAddHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setEditedHeaders(prev => ({
        ...prev,
        [newHeaderKey.trim()]: newHeaderValue.trim()
      }));
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const handleDeleteHeader = (key: string) => {
    setEditedHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const handleHeaderValueChange = (key: string, value: string) => {
    setEditedHeaders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl text-slate-900 dark:text-white mb-2">Message Details</SheetTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-700 dark:text-slate-300 font-mono">
                  {selectedMessage.key}
                </code>
                <Badge className={errorTypeColors[selectedMessage.errorType]}>
                  {selectedMessage.errorType}
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleReplay}
              className="bg-emerald-600 hover:bg-emerald-700 text-white ml-4"
            >
              <Play className="h-4 w-4 mr-2" />
              Replay
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Key</div>
                  <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{selectedMessage.key}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Topic</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{selectedMessage.topic}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Service ID</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{selectedMessage.serviceId}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Timestamp</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {format(new Date(selectedMessage.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Replay Count</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{selectedMessage.replayCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="payload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payload" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Payload
              </TabsTrigger>
              <TabsTrigger value="headers" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Headers
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payload" className="mt-4">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-white">Message Payload (Editable)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <Editor
                      height="400px"
                      language="json"
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      value={editedPayload}
                      onChange={(value) => setEditedPayload(value || '')}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        tabSize: 2
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    Edit the JSON payload above. Changes will be used when replaying this message.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="headers" className="mt-4">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-white">Message Headers (Editable)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(editedHeaders).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1">Key</Label>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{key}</div>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1">Value</Label>
                            <Input
                              value={value}
                              onChange={(e) => handleHeaderValueChange(key, e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteHeader(key)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Add New Header</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1">Header Key</Label>
                        <Input
                          placeholder="e.g., x-custom-header"
                          value={newHeaderKey}
                          onChange={(e) => setNewHeaderKey(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1">Header Value</Label>
                        <Input
                          placeholder="Header value"
                          value={newHeaderValue}
                          onChange={(e) => setNewHeaderValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddHeader()}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAddHeader}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Header
                    </Button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                    Modified headers will be sent when replaying this message.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 mt-4">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-white">Stack Trace</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {selectedMessage.stacktrace}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-white">Replay History</CardTitle>
                </CardHeader>
                <CardContent>
                  {replayHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      No replay history for this message.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {replayHistory.map((replay) => (
                        <div
                          key={replay.id}
                          className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge
                                className={
                                  replay.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                }
                              >
                                {replay.status}
                              </Badge>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {format(new Date(replay.replayedAt), 'MMM dd, yyyy HH:mm:ss')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              Replayed by {replay.replayedBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
