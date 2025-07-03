package pentacode.backend.code.common.entity;

public enum OrderStatusEnum {
    AT_CART,
    PLACED,           // Order has been placed but not yet processed
    CONFIRMED,        // Order has been confirmed by the restaurant
    PREPARING,        // Restaurant is preparing the order
    READY_FOR_PICKUP, // Order is ready for courier pickup
    ASSIGNED,         // Order has been assigned to a courier
    IN_TRANSIT,       // Courier is delivering the order
    DELIVERED,        // Order has been delivered
    CANCELLED,        // Order has been cancelled
    REJECTED          // Order has been rejected by restaurant or courier
}