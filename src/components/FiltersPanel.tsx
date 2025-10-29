import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import useDltStore from '../store/useDltStore';
import { useDltApi } from '../hooks/useDltApi';
import type { Service, Topic } from '@/types';
import { Filter, X } from 'lucide-react';

export function FiltersPanel() {
  const dltApi = useDltApi();
  const {
    selectedService,
    setSelectedService,
    selectedTopic,
    setSelectedTopic,
    filters,
    setFilters,
    resetFilters
  } = useDltStore();

  const [services, setServices] = useState<Service[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [errorTypes, setErrorTypes] = useState<string[]>([]);

  // Local state for advanced filters (not applied until button click)
  const [localSearchByKey, setLocalSearchByKey] = useState('');
  const [localSearchByValue, setLocalSearchByValue] = useState('');
  const [localHeaderKey, setLocalHeaderKey] = useState('');
  const [localHeaderValue, setLocalHeaderValue] = useState('');

  // Fetch services and error types on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, errorTypesData] = await Promise.all([
          dltApi.getServices(),
          dltApi.getErrorTypes()
        ]);
        setServices(servicesData);
        setErrorTypes(errorTypesData);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchData();
  }, [dltApi]);

  // Fetch topics when service changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedService) {
        try {
          const topicsData = await dltApi.getTopics(selectedService);
          setTopics(topicsData);
        } catch (error) {
          console.error('Failed to fetch topics:', error);
          setTopics([]);
        }
      } else {
        setTopics([]);
      }
    };

    fetchTopics();
  }, [selectedService, dltApi]);

  const hasActiveFilters = selectedService || selectedTopic || filters.errorType || filters.search || filters.dateFrom || filters.dateTo || filters.searchByKey || filters.searchByValue || filters.headerKey || filters.headerValue;

  const handleApplyAdvancedFilters = () => {
    setFilters({
      searchByKey: localSearchByKey,
      searchByValue: localSearchByValue,
      headerKey: localHeaderKey,
      headerValue: localHeaderValue
    });
  };

  const handleReset = () => {
    setSelectedService(null);
    setSelectedTopic(null);
    resetFilters();
    // Also reset local advanced filter state
    setLocalSearchByKey('');
    setLocalSearchByValue('');
    setLocalHeaderKey('');
    setLocalHeaderValue('');
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 h-fit sticky top-20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-600 dark:text-slate-400"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Service</Label>
          <Select value={selectedService || 'all'} onValueChange={(value) => setSelectedService(value === 'all' ? null : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Topic</Label>
          <Select 
            value={selectedTopic || 'all'} 
            onValueChange={(value) => setSelectedTopic(value === 'all' ? null : value)}
            disabled={!selectedService}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedService ? 'All topics' : 'Select service first'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.name} value={topic.name}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Error Type</Label>
          <Select value={filters.errorType || 'all'} onValueChange={(value) => setFilters({ errorType: value === 'all' ? '' : value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All error types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All error types</SelectItem>
              {errorTypes.map((errorType) => (
                <SelectItem key={errorType} value={errorType}>
                  {errorType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Search</Label>
          <Input
            placeholder="Search messages..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
          <Label className="text-slate-700 dark:text-slate-300 mb-3 block font-semibold">Advanced Search</Label>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">Search by Key</Label>
              <Input
                placeholder="Search by message key..."
                value={localSearchByKey}
                onChange={(e) => setLocalSearchByKey(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">Search by Value</Label>
              <Input
                placeholder="Search in message content..."
                value={localSearchByValue}
                onChange={(e) => setLocalSearchByValue(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">Header Key</Label>
              <Input
                placeholder="e.g., correlation-id"
                value={localHeaderKey}
                onChange={(e) => setLocalHeaderKey(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300 text-sm">Header Value</Label>
              <Input
                placeholder="Search header value..."
                value={localHeaderValue}
                onChange={(e) => setLocalHeaderValue(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleApplyAdvancedFilters}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Advanced Filters
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
