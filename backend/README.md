# Kafka DLT Replayer Backend

Spring Boot 3.4.4 backend service for managing and replaying Kafka Dead Letter Topic (DLT) messages.

## Features

- **REST API**: Provides endpoints for the React frontend
- **Kafka Consumer**: Automatically listens to all topics ending with `.dlt`
- **Message Storage**: Saves DLT messages to database for analysis
- **Message Replay**: Replays messages back to original Kafka topics
- **Metrics & Analytics**: Provides dashboard metrics and statistics
- **Replay History**: Tracks all replay attempts with success/failure status

## Tech Stack

- **Java 21**
- **Spring Boot 3.4.4**
- **Spring Data JPA**
- **Spring Kafka**
- **H2 Database** (in-memory for development)
- **PostgreSQL** (recommended for production)
- **Lombok**
- **Maven**

## Prerequisites

- Java 21 or higher
- Maven 3.8+
- Kafka broker running on `localhost:9092`

## Getting Started

### 1. Clone and navigate to backend

```bash
cd backend
```

### 2. Build the project

```bash
mvn clean install
```

### 3. Run the application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## Configuration

### application.yml

Key configuration properties:

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: dlt-replayer-group

  datasource:
    url: jdbc:h2:mem:dlt_replayer

server:
  port: 8080
```

### For Production

Update `application.yml` to use PostgreSQL:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dlt_replayer
    username: your_username
    password: your_password
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

## API Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/topics?serviceId={id}` - Get topics (optionally filtered by service)
- `GET /api/errorTypes` - Get all error types

### Messages
- `GET /api/messages` - Get all DLT messages (with filtering)
  - Query params: `serviceId`, `topic`, `errorType`, `key_like`
- `GET /api/messages/{id}` - Get specific message by ID

### Replay
- `POST /api/replays` - Replay messages
  ```json
  {
    "messageIds": ["msg-123", "msg-456"],
    "headers": {
      "X-Custom-Header": "value"
    }
  }
  ```
- `GET /api/replays?messageId={id}` - Get replay history for a message

### Metrics
- `GET /api/metrics` - Get dashboard metrics overview

## How It Works

### 1. DLT Message Consumption

The application automatically listens to all Kafka topics ending with `.dlt`:

```java
@KafkaListener(topicPattern = ".*\\.dlt", ...)
public void consumeDltMessage(ConsumerRecord<String, String> record) {
    // Saves message to database
}
```

### 2. Message Replay

When replaying messages:
1. Retrieves message from database
2. Publishes to original topic (removes `.dlt` suffix)
3. Adds replay metadata headers
4. Records replay attempt in history
5. Updates message replay count

### 3. Database Schema

- **services**: Service definitions
- **topics**: Topic definitions per service
- **dlt_messages**: Stored DLT messages with JSON payload and headers
- **replay_history**: Audit trail of all replay attempts

## Database Console

H2 console available at: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:dlt_replayer`
- **Username**: `sa`
- **Password**: (empty)

## Development

### Run tests

```bash
mvn test
```

### Build JAR

```bash
mvn package
```

### Run JAR

```bash
java -jar target/replayer-0.0.1-SNAPSHOT.jar
```

## Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:

```bash
docker build -t kafka-dlt-replayer .
docker run -p 8080:8080 kafka-dlt-replayer
```

## Troubleshooting

### Kafka Connection Issues

If you get connection errors:
1. Ensure Kafka is running: `docker ps | grep kafka`
2. Check bootstrap servers in `application.yml`
3. Verify network connectivity

### Database Issues

For H2 console access issues:
- Ensure `spring.h2.console.enabled=true`
- Check correct JDBC URL

## License

MIT
