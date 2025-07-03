package pentacode.backend.code.common.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Null;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.CreateOrderRequestDTO;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.dto.OrderItemRequestDTO;
import pentacode.backend.code.common.dto.ReviewDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.OrderItem;
import pentacode.backend.code.common.entity.OrderStatusEnum;
import pentacode.backend.code.common.entity.Review;
import pentacode.backend.code.common.mapper.OrderMapper;
import pentacode.backend.code.common.mapper.ReviewMapper;
import pentacode.backend.code.common.repository.OrderItemRepository;
import pentacode.backend.code.common.repository.OrderRepository;
import pentacode.backend.code.common.repository.ReviewRepository;
import pentacode.backend.code.common.service.base.BaseService;
import pentacode.backend.code.courier.entity.Courier;
import pentacode.backend.code.courier.repository.CourierRepository;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.repository.MenuRepository;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;

@Service
public class OrderService extends BaseService<Order> {
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final RestaurantRepository restaurantRepository;
    private final MenuRepository menuRepository;
    private final OrderItemRepository orderItemRepository;
    private final CourierRepository courierRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    public OrderService(OrderRepository orderRepository, 
                        OrderMapper orderMapper,
                        RestaurantRepository restaurantRepository, 
                        MenuRepository menuRepository,
                        OrderItemRepository orderItemRepository,
                        CourierRepository courierRepository,
                        ReviewRepository reviewRepository,
                        ReviewMapper reviewMapper) {
        super(orderRepository);
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.restaurantRepository = restaurantRepository;
        this.menuRepository = menuRepository;
        this.orderItemRepository = orderItemRepository;
        this.courierRepository = courierRepository;
        this.reviewRepository = reviewRepository;
        this.reviewMapper = reviewMapper;
    }

    public List<OrderDTO> getOrderByRestaurantPk(Long pk){
        return orderMapper.mapToListDTO(orderRepository.findByRestaurantPk(pk));
    }

    public OrderDTO getByPk(Long pk){
        return orderMapper.mapToDTO(super.findByPkOr404(pk));
    }
    public List<OrderDTO> getAllOrders() {
        return orderMapper.mapToListDTO(orderRepository.findAll());
    }
    @Transactional
    public OrderDTO placeOrder(CreateOrderRequestDTO request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setName("Order for " + restaurant.getName());

        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequestDTO itemRequest : request.getItems()) {
            Menu menu = menuRepository.findById(itemRequest.getMenuId())
                    .orElseThrow(() -> new RuntimeException("Menu not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenu(menu);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setOrder(order);
            orderItemRepository.save(orderItem);
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);

        for(OrderItem orderItem : orderItems) {
            order.setTotalPrice(order.getTotalPrice() + (orderItem.getMenu().getPrice() * orderItem.getQuantity()));
        }
        

        order = orderRepository.save(order);

        return orderMapper.mapToDTO(order);
    }
    public OrderDTO assignCourier(Long orderId, Long courierId) {
        Order order = super.findByPkOr404(orderId);
        Courier courier = courierRepository.findByPk(courierId);
        
        if (order == null || courier == null) {
            return null;
        }
        
        // Check if order status allows reassignment
        if (order.getStatus() == OrderStatusEnum.DELIVERED || 
            order.getStatus() == OrderStatusEnum.CANCELLED || 
            order.getStatus() == OrderStatusEnum.REJECTED) {
            return null;
        }
        
        // Check if courier is available and online
        if (!courier.isAvailable() || !courier.isOnline()) {
            return null;
        }
        
        order.setCourier(courier);
        order.setStatus(OrderStatusEnum.ASSIGNED);
        order.setCourierAssignmentAccepted(false);
        
        // Save the updated order
        Order savedOrder = orderRepository.save(order);
        
        // Here we would normally notify the courier about the new assignment
        // This would be implemented with a messaging system or push notifications
        
        return orderMapper.mapToDTO(savedOrder);
    }
    
    public OrderDTO courierAcceptAssignment(Long orderId, String status) {
        Order order = super.findByPkOr404(orderId);
        
        if (order == null || order.getCourier() == null) {
            return null;
        }
        
        if (status.equals("IN_TRANSIT")) {
            order.setCourierAssignmentAccepted(true);
            order.getCourier().setAvailable(false);
            order.setStatus(OrderStatusEnum.IN_TRANSIT);
        } 
        else if (status.equals("DELIVERED")) {
            order.setStatus(OrderStatusEnum.DELIVERED);
        } 
        else if (status.equals("REJECTED")) {
            order.setStatus(OrderStatusEnum.REJECTED);
            order.setCourier(null);
            order.setCourierAssignmentAccepted(false);
            
        }
        else {
            order.setCourier(null);
            order.setCourierAssignmentAccepted(false);
            order.setStatus(OrderStatusEnum.READY_FOR_PICKUP);
        }
        
        Order savedOrder = orderRepository.save(order);
        return orderMapper.mapToDTO(savedOrder);
    }
    public OrderDTO unassignCourier(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null || order.getCourier() == null) {
            return null;
        }

        order.setCourier(null);
        order.setCourierAssignmentAccepted(false);
        order.setStatus(OrderStatusEnum.READY_FOR_PICKUP);

        Order savedOrder = orderRepository.save(order);
        return orderMapper.mapToDTO(savedOrder);
    }

    public List<OrderDTO> getOrderByCourierPk(Long courierPk, boolean accept, boolean past) {
        if (past) {
            return orderMapper.mapToListDTO(orderRepository.findByCourierPkAndStatus(courierPk, OrderStatusEnum.DELIVERED));
        }
        if (accept) {
            return orderMapper.mapToListDTO(orderRepository.findByCourierPkAndStatus(courierPk, OrderStatusEnum.IN_TRANSIT));
        }
        else{
            return orderMapper.mapToListDTO(orderRepository.findByCourierPkAndStatus(courierPk, OrderStatusEnum.ASSIGNED));
        }
    }
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = super.findByPkOr404(orderId);
        
        if (order == null) {
            return null;
        }
        
        try {
            OrderStatusEnum newStatus = OrderStatusEnum.valueOf(status);
            order.setStatus(newStatus);
            
            // Additional business logic based on the new status
            switch (newStatus) {
                case CANCELLED:
                case REJECTED:
                    // If order is cancelled or rejected, unassign any courier
                    if (order.getCourier() != null) {
                        order.setCourier(null);
                        order.setCourierAssignmentAccepted(false);
                    }
                    break;
                case READY_FOR_PICKUP:
                    break;
                default:
                    // No additional action for other statuses
                    break;
            }
            
            Order savedOrder = orderRepository.save(order);
            return orderMapper.mapToDTO(savedOrder);
            
        } catch (IllegalArgumentException e) {
            // Invalid status value
            return null;
        }
    }

    public Order createOrder(Customer customer) {
        Order order = new Order();
        customer.setOrder(order);
        return orderRepository.save(order);
    }
    @Transactional
    public OrderDTO rateOrder(Long orderId, Double rating, Customer customer, String reviewText) {
        // get the restaurant from order
        
        Order order = super.findByPkOr404(orderId);
        if (order == null) {
            return null;
        }
        Restaurant restaurant = order.getRestaurant();
        if (restaurant == null) {
            return null;
        }
        // get the rating from restaurant
        Double ratingRestaurant = restaurant.getRating();
        // set the rating of 
        System.out.println("RATING: " + rating);
        System.out.println("RATING RESTAURANT: " + ratingRestaurant);

        restaurant.setNumberOfRatings(restaurant.getNumberOfRatings() + 1);
        restaurant.setRating((ratingRestaurant + rating)/restaurant.getNumberOfRatings());
        order.setRating(rating.intValue());

        Review review = new Review();
        review.setRating(rating.intValue());
        review.setRestaurant(restaurant);
        review.setOrder(order);
        review.setCustomer(customer);
        review.setReviewText(reviewText);
        reviewRepository.save(review);

        if (restaurant.getReviews() == null) {
            restaurant.setReviews(new ArrayList<>());
        }
        if (customer.getReviews() == null) {
            customer.setReviews(new ArrayList<>());
        }

        restaurant.getReviews().add(review);
        order.setReviews(review);
        customer.getReviews().add(review);

        order.setRated(true);        
        

        restaurantRepository.save(restaurant);

        // RETURN THE ORDER
        return orderMapper.mapToDTO(order);
    }

    public OrderDTO reOrder(Order userOrder, Long orderId) {
        Order order = super.findByPkOr404(orderId);
        System.out.println("ANANIN AMI BE KARDEŞİM");
        
        // get the all fields from order including order items etc.
        if (order == null) {
            return null;
        }

        // set the order to userOrder
        userOrder.setRestaurant(order.getRestaurant());
        userOrder.setName("Re-Order for " + order.getRestaurant().getName());
        userOrder.setCourier(null);
        userOrder.setStatus(OrderStatusEnum.AT_CART);
        userOrder.setCourierAssignmentAccepted(false);
        userOrder.setTotalPrice(0.0);

        List<OrderItem> orderItemss = userOrder.getOrderItems();

        for (OrderItem item : orderItemss) {
            item.setOrder(null);
            orderItemRepository.save(item);
        }


        userOrder.setOrderItems(new ArrayList<>());
        

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItem orderItem : order.getOrderItems()) {
            Menu menu = orderItem.getMenu();
            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setMenu(menu);
            newOrderItem.setQuantity(orderItem.getQuantity());
            newOrderItem.setOrder(userOrder);
            orderItemRepository.save(newOrderItem);
            orderItems.add(newOrderItem);
        }
        userOrder.setOrderItems(orderItems);

        for(OrderItem orderItem : orderItems) {
            userOrder.setTotalPrice(userOrder.getTotalPrice() + (orderItem.getMenu().getPrice() * orderItem.getQuantity()));
        }
        // save the order
        userOrder = orderRepository.save(userOrder);

        return orderMapper.mapToDTO(userOrder);
    }

    public OrderDTO deleteReview(Long reviewId, Customer customer) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        Order order = review.getOrder();

        System.out.println("REVIEW ID: " + reviewId);

        Restaurant restaurant = order.getRestaurant();
        restaurant.setNumberOfRatings(restaurant.getNumberOfRatings() - 1);
        if (restaurant.getNumberOfRatings() == 0) {
            restaurant.setRating(0.0);
        } else {
            restaurant.setRating((restaurant.getRating() * restaurant.getNumberOfRatings() - review.getRating()) / restaurant.getNumberOfRatings());
        }
        restaurantRepository.save(restaurant);
        order.setRated(false);
        order.setRating(null);
        order.setReviews(null);
        orderRepository.save(order);
        reviewRepository.delete(review);
        return orderMapper.mapToDTO(order);
    }

    public OrderDTO updateReview(Long orderId, ReviewDTO reviewDTO) {
        Long reviewId = reviewDTO.getPk();
        Review review = reviewRepository.findById(reviewId).orElse(null);

        System.out.println("REVIEW ID: " + reviewId);
        

        if (review == null) {
            return null;
        }
        int oldRating = review.getRating();

        review.setRating(reviewDTO.getRating());
        review.setReviewText(reviewDTO.getReviewText());
        reviewRepository.save(review);

        Order order = review.getOrder();
        order.setRating(reviewDTO.getRating());        

        Restaurant restaurant = order.getRestaurant();

        restaurant.setRating((restaurant.getRating() * restaurant.getNumberOfRatings() - oldRating + reviewDTO.getRating()) / restaurant.getNumberOfRatings());
        
        restaurantRepository.save(restaurant);

        return orderMapper.mapToDTO(order);
    }

    public List<ReviewDTO> getAllReviews(String courier) {
        System.out.println("COURIER: " + courier);
        if(courier.equals("null")) {
            return reviewMapper.mapToListDTO(reviewRepository.findAll());
        }
        if(courier.equals("true")) {
            return reviewMapper.mapToListDTO(reviewRepository.findByCourierIdNotNull());
        }
        else {
            return reviewMapper.mapToListDTO(reviewRepository.findByRestaurantIdNotNull());
        }
    }

    public List<ReviewDTO> getReviews(User user) {
        if (user.getRestaurant() != null) {
            return reviewMapper.mapToListDTO(reviewRepository.findByRestaurantId(user.getRestaurant().getPk()));
        } else if (user.getCourier() != null) {
            return reviewMapper.mapToListDTO(reviewRepository.findByCourierId(user.getCourier().getPk()));
        } else {
            throw new RuntimeException("User is not a restaurant or courier");
        }
    }
}
