// Mock data for Kafka DLT Replay Dashboard

export const mockServices = [
  { id: 'payment-service', name: 'Payment Service' },
  { id: 'order-service', name: 'Order Service' },
  { id: 'notification-service', name: 'Notification Service' },
  { id: 'inventory-service', name: 'Inventory Service' },
  { id: 'user-service', name: 'User Service' }
];

export const mockTopics = {
  'payment-service': [
    { name: 'payment.created' },
    { name: 'payment.failed' },
    { name: 'payment.refunded' }
  ],
  'order-service': [
    { name: 'order.created' },
    { name: 'order.cancelled' },
    { name: 'order.completed' }
  ],
  'notification-service': [
    { name: 'notification.email.failed' },
    { name: 'notification.sms.failed' }
  ],
  'inventory-service': [
    { name: 'inventory.updated' },
    { name: 'inventory.low-stock' }
  ],
  'user-service': [
    { name: 'user.created' },
    { name: 'user.updated' }
  ]
};

export const errorTypes = [
  'DeserializationException',
  'ValidationException',
  'TimeoutException',
  'ServiceUnavailableException',
  'UnknownException'
];

const generateMessages = () => {
  const messages = [];
  const services = Object.keys(mockTopics);
  
  for (let i = 0; i < 150; i++) {
    const serviceId = services[Math.floor(Math.random() * services.length)];
    const topics = mockTopics[serviceId];
    const topic = topics[Math.floor(Math.random() * topics.length)].name;
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const replayCount = Math.floor(Math.random() * 5);
    const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
    const lastReplayAt = replayCount > 0 ? new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString() : null;
    
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    const userId = `USR-${Math.floor(Math.random() * 1000)}`;
    
    messages.push({
      id: `msg-${i + 1}`,
      key: `${topic.split('.')[0]}-${orderId}`,
      serviceId,
      topic,
      timestamp,
      errorType,
      replayCount,
      lastReplayAt,
      headers: {
        'correlation-id': `corr-${Math.random().toString(36).substr(2, 9)}`,
        'source': serviceId,
        'content-type': 'application/json'
      },
      payload: {
        orderId,
        userId,
        amount: Math.floor(Math.random() * 1000) + 50,
        currency: 'USD',
        status: 'failed'
      },
      stacktrace: `${errorType}: Failed to process message\n  at com.kafka.processor.MessageHandler.handle(MessageHandler.java:${Math.floor(Math.random() * 200) + 50})\n  at com.kafka.consumer.KafkaConsumer.consume(KafkaConsumer.java:${Math.floor(Math.random() * 150) + 30})\n  at com.kafka.listener.MessageListener.onMessage(MessageListener.java:${Math.floor(Math.random() * 100) + 20})`
    });
  }
  
  return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const mockMessages = generateMessages();

export const mockMetricsOverview = {
  totalDltMessages: mockMessages.length,
  dltLast24h: mockMessages.filter(m => 
    new Date(m.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length,
  topServices: mockServices.slice(0, 3).map(s => ({
    serviceName: s.name,
    count: mockMessages.filter(m => m.serviceId === s.id).length
  })),
  dltByTopic: Object.keys(mockTopics).flatMap(serviceId => 
    mockTopics[serviceId].map(t => ({
      topic: t.name,
      count: mockMessages.filter(m => m.topic === t.name).length
    }))
  ).sort((a, b) => b.count - a.count).slice(0, 10),
  dltByErrorType: errorTypes.map(errorType => ({
    errorType,
    count: mockMessages.filter(m => m.errorType === errorType).length
  })).sort((a, b) => b.count - a.count),
  dltByTime: Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: mockMessages.filter(m => m.timestamp.startsWith(dateStr)).length
    };
  })
};

export const mockReplayHistory = (messageId) => {
  const message = mockMessages.find(m => m.id === messageId);
  if (!message || message.replayCount === 0) return [];
  
  return Array.from({ length: message.replayCount }, (_, i) => ({
    id: `replay-${messageId}-${i + 1}`,
    messageId,
    replayedAt: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)).toISOString(),
    status: Math.random() > 0.3 ? 'SUCCESS' : 'FAILED',
    replayedBy: 'system'
  }));
};

export const getFilteredMessages = (filters) => {
  let filtered = [...mockMessages];
  
  if (filters.serviceId) {
    filtered = filtered.filter(m => m.serviceId === filters.serviceId);
  }
  
  if (filters.topic) {
    filtered = filtered.filter(m => m.topic === filters.topic);
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
    filtered = filtered.filter(m => 
      m.key.toLowerCase().includes(keyLower)
    );
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
};
