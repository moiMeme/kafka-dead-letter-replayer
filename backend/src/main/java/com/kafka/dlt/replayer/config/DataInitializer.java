package com.kafka.dlt.replayer.config;

import com.kafka.dlt.replayer.entity.Service;
import com.kafka.dlt.replayer.entity.Topic;
import com.kafka.dlt.replayer.repository.ServiceRepository;
import com.kafka.dlt.replayer.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ServiceRepository serviceRepository;
    private final TopicRepository topicRepository;

    @Override
    public void run(String... args) {
        if (serviceRepository.count() == 0) {
            log.info("Initializing services and topics...");

            // Create services
            Service paymentService = Service.builder()
                .id("payment-service")
                .name("Payment Service")
                .build();

            Service orderService = Service.builder()
                .id("order-service")
                .name("Order Service")
                .build();

            Service notificationService = Service.builder()
                .id("notification-service")
                .name("Notification Service")
                .build();

            Service inventoryService = Service.builder()
                .id("inventory-service")
                .name("Inventory Service")
                .build();

            Service userService = Service.builder()
                .id("user-service")
                .name("User Service")
                .build();

            serviceRepository.saveAll(Arrays.asList(
                paymentService, orderService, notificationService, inventoryService, userService
            ));

            // Create topics
            List<Topic> topics = Arrays.asList(
                // Payment service topics
                Topic.builder().name("payment.created").service(paymentService).serviceId("payment-service").build(),
                Topic.builder().name("payment.failed").service(paymentService).serviceId("payment-service").build(),
                Topic.builder().name("payment.refunded").service(paymentService).serviceId("payment-service").build(),

                // Order service topics
                Topic.builder().name("order.created").service(orderService).serviceId("order-service").build(),
                Topic.builder().name("order.cancelled").service(orderService).serviceId("order-service").build(),
                Topic.builder().name("order.completed").service(orderService).serviceId("order-service").build(),

                // Notification service topics
                Topic.builder().name("notification.email.failed").service(notificationService).serviceId("notification-service").build(),
                Topic.builder().name("notification.sms.failed").service(notificationService).serviceId("notification-service").build(),

                // Inventory service topics
                Topic.builder().name("inventory.updated").service(inventoryService).serviceId("inventory-service").build(),
                Topic.builder().name("inventory.low-stock").service(inventoryService).serviceId("inventory-service").build(),

                // User service topics
                Topic.builder().name("user.created").service(userService).serviceId("user-service").build(),
                Topic.builder().name("user.updated").service(userService).serviceId("user-service").build()
            );

            topicRepository.saveAll(topics);

            log.info("Services and topics initialized successfully");
        }
    }
}
