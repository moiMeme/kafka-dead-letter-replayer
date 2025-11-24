import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useDltApi } from '../hooks/useDltApi';
import type { MetricsOverview } from '@/types';
import { Database, TrendingUp, AlertTriangle, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getShortErrorName } from '../lib/formatters';

const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export default function DashboardPage() {
  const dltApi = useDltApi();
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await dltApi.getMetricsOverview();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dltApi]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">DLT Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitor and analyze Kafka Dead Letter Topic messages</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total DLT Messages
            </CardTitle>
            <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.totalDltMessages}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">All time total</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Last 24 Hours
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.dltLast24h}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Recent failures</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Error Types
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.dltByErrorType.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Unique error types</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Top Service
            </CardTitle>
            <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
              {metrics.topServices && metrics.topServices.length > 0
                ? (metrics.topServices[0].serviceName || 'Unknown Service')
                : 'No data'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              {metrics.topServices && metrics.topServices.length > 0
                ? `${metrics.topServices[0].count || 0} messages`
                : 'No messages recorded'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">DLT Messages by Error Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.dltByErrorType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ errorType, percent }) => `${getShortErrorName(errorType)}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="count"
                >
                  {metrics.dltByErrorType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
                          <p className="font-semibold text-slate-900 dark:text-white mb-1">
                            {getShortErrorName(data.errorType)}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-mono break-all max-w-xs">
                            {data.errorType}
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            Count: <span className="font-semibold">{data.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Top 10 Topics by DLT Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.dltByTopic}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  className="text-xs fill-slate-600 dark:fill-slate-400"
                />
                <YAxis className="fill-slate-600 dark:fill-slate-400" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">DLT Messages Over Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dltByTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
              <XAxis 
                dataKey="date" 
                className="text-sm fill-slate-600 dark:fill-slate-400"
              />
              <YAxis className="fill-slate-600 dark:fill-slate-400" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#14b8a6" 
                strokeWidth={3} 
                dot={{ fill: '#14b8a6', r: 6 }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
