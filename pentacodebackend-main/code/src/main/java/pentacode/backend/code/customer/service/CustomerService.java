package pentacode.backend.code.customer.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.customer.dto.CustomerDTO;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.common.entity.Order;
import pentacode.backend.code.common.entity.OrderItem;
import pentacode.backend.code.common.entity.OrderStatusEnum;
import pentacode.backend.code.common.mapper.OrderMapper;
import pentacode.backend.code.common.repository.OrderItemRepository;
import pentacode.backend.code.common.repository.OrderRepository;
import pentacode.backend.code.common.service.base.BaseService;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.customer.mapper.CustomerMapper;
import pentacode.backend.code.customer.repository.CustomerRepository;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.mapper.RestaurantMapper;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;

@Service
public class CustomerService extends BaseService<Customer>{
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final CustomerMapper customerMapper;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;


    public CustomerService(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            OrderItemRepository orderItemRepository,
                            OrderMapper orderMapper,
                            RestaurantRepository restaurantRepository,
                            CustomerMapper customerMapper,
                            RestaurantMapper restaurantMapper) {
        super(customerRepository);
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderMapper = orderMapper;
        this.restaurantRepository = restaurantRepository;
        this.customerMapper = customerMapper;
        this.restaurantMapper = restaurantMapper;
    }

    public void createOrder(Customer customer) {
        Order order = new Order();
        customer.setOrder(order);
        order.setCustomer(customer);
        orderRepository.save(order);
        customerRepository.save(customer);
    }

    public void assignRestaurantToOrder(Order order, Restaurant restaurant) {
        order.setRestaurant(restaurant);
        orderRepository.save(order);
    }

    @jakarta.transaction.Transactional
    public void addMenuToOrder(Customer customer, Menu menu) {
        Order order = customer.getOrder();
        List<OrderItem> orderItems = order.getOrderItems();

        if (order.getRestaurant() == null) {
            order.setRestaurant(menu.getRestaurant());
        } else if (!order.getRestaurant().getPk().equals(menu.getRestaurant().getPk())) {
            throw new IllegalArgumentException("Menu does not belong to the restaurant of the current order.");
        }


        boolean menuExists = false;
        for (OrderItem item : orderItems) {
            if (item.getMenu().getPk().equals(menu.getPk())) {
                item.setQuantity(item.getQuantity() + 1);
                menuExists = true;
                break;
            }
        }
        if (!menuExists) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenu(menu);
            orderItem.setQuantity(1);
            orderItemRepository.save(orderItem);
        }
        order.setTotalPrice(order.getTotalPrice() + menu.getPrice());
        orderRepository.save(order);
        customerRepository.save(customer);
    }

    @Transactional
    public void removeMenuFromOrder(Customer customer, Menu menu) {
        Order order = customer.getOrder();
        List<OrderItem> orderItem = order.getOrderItems();

        boolean itemFound = false;
        for (OrderItem item : orderItem) {
            if (item.getMenu().getPk().equals(menu.getPk())) {
                if (item.getQuantity() > 1) {
                    item.setQuantity(item.getQuantity() - 1);
                    order.setTotalPrice(order.getTotalPrice() - menu.getPrice());
                } else {
                    item.setOrder(null);
                    order.setTotalPrice(order.getTotalPrice() - menu.getPrice());
                }
                orderItemRepository.save(item);
                itemFound = true;
            }
        }

        System.out.println("ORDER ITEMSSSSS " + order.getOrderItems().size());

        if (order.getTotalPrice() == 0) {
            order.setRestaurant(null);
            order.setName(null);
        }

        if (!itemFound) {
            throw new IllegalArgumentException("Menu not found in the order.");
        }

        orderRepository.save(order);
        customerRepository.save(customer);
    }

    public OrderDTO getCurrentOrder(Customer customer) {
        System.out.println("Customer order: " + customer.getOrder());
        return orderMapper.mapToDTO(customer.getOrder());
    }

    public void placeOrder(Customer customer) {
        Order order = customer.getOrder();
        if (order.getRestaurant() == null) {
            throw new IllegalArgumentException("Restaurant not assigned to the order.");
        }
        if (customer.getMoney() == null) {
            throw new IllegalArgumentException("Customer has no money.");
        }
        if (customer.getMoney() < order.getTotalPrice() + order.getRestaurant().getDeliveryFee()) {
            throw new IllegalArgumentException("Insufficient funds.");
        }
        if(order.getTotalPrice() + order.getRestaurant().getDeliveryFee() < order.getRestaurant().getMinOrderAmount()) {
            throw new IllegalArgumentException("Minimum order amount not met.");
        }
        if(order.getTotalPrice() + order.getRestaurant().getDeliveryFee() > order.getRestaurant().getMaxOrderAmount()) {
            throw new IllegalArgumentException("Maximum order amount exceeded.");
        }
        if (order.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("Order is empty.");
        }
        order.setStatus(OrderStatusEnum.PLACED);
        order.setTotalPrice(order.getTotalPrice() + order.getRestaurant().getDeliveryFee());
        customer.setMoney(customer.getMoney() - (order.getTotalPrice() + order.getRestaurant().getDeliveryFee()));
        customer.addOrderToHistory(order);
        order.setName("Order for" + order.getRestaurant().getName());
        System.out.println("Order items: " + order.getOrderItems());
        orderRepository.save(order);
        Order order1 = new Order();
        customer.setOrder(order1);
        order1.setCustomer(customer);
        orderRepository.save(order1);
        customerRepository.save(customer);
    }

    public List<OrderDTO> getActiveOrders(Customer customer, boolean old, boolean failed) {
        if(failed){
            List<Order> orders = customer.getOrderHistory().stream()
                    .filter(order -> order.getStatus() == OrderStatusEnum.CANCELLED || order.getStatus() == OrderStatusEnum.REJECTED)
                    .toList();
            return orderMapper.mapToListDTO(orders);
        }
        if (old) {
            List<Order> orders = customer.getOrderHistory().stream()
                    .filter(order -> order.getStatus() == OrderStatusEnum.DELIVERED)
                    .toList();
            return orderMapper.mapToListDTO(orders);
        }
        else{
            List<Order> orders = customer.getOrderHistory().stream()
                    .filter(order -> order.getStatus() != OrderStatusEnum.DELIVERED && order.getStatus() != OrderStatusEnum.CANCELLED && order.getStatus() != OrderStatusEnum.REJECTED && 
                            order.getStatus() != OrderStatusEnum.AT_CART)
                    .toList();
            return orderMapper.mapToListDTO(orders);
        }
    }
    public List<CustomerDTO> listAllCustomers() {
        List<Customer> customers = customerRepository.findAllByDeletedFalse();
        return customerMapper.mapToListDTO(customers);
    }
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerProfile(Customer customer) {
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found");
        }
        // Force initialization of lazy collections within transaction
        if (customer.getOrderHistory() != null) {
            customer.getOrderHistory().size();
        }
        if (customer.getOrder() != null) {
            customer.getOrder().getOrderItems().size();
        }
        return customerMapper.mapToDTO(customer);
    }

    @Transactional
    public CustomerDTO updateCustomerProfile(Customer customer, CustomerDTO dto) {
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found");
        }

        // Update customer fields
        customer.setName(dto.getName());
        customer.setAddress(dto.getAddress());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setEmail(dto.getEmail());
        customer.setLatitude(dto.getLatitude());
        customer.setLongitude(dto.getLongitude());

        // Persist and return DTO
        Customer saved = customerRepository.save(customer);
        return customerMapper.mapToDTO(saved);
    }

    @Transactional
    public RestaurantDTO addToFavorite(Customer customer, Long pk) {
        Restaurant restaurant = restaurantRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        if (customer.getFavoriteRestaurants() == null) {
            customer.setFavoriteRestaurants(new ArrayList<>());
        }
        if (restaurant.getCustomers() == null) {
            restaurant.setCustomers(new ArrayList<>());
        }

        if (!customer.getFavoriteRestaurants().contains(restaurant)) {
            customer.getFavoriteRestaurants().add(restaurant);
        }

        if (!restaurant.getCustomers().contains(customer)) {
            restaurant.getCustomers().add(customer);
        }

        restaurantRepository.save(restaurant);

        return restaurantMapper.mapToDTO(restaurant);
    }

    public List<RestaurantDTO> getFavoriteRestaurants(Customer customer) {
        List<Restaurant> favoriteRestaurants = customer.getFavoriteRestaurants();
        return restaurantMapper.mapToListDTO(favoriteRestaurants);
    }

    public boolean isFavorite(Customer customer, Long pk) {
        Restaurant restaurant = restaurantRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        return customer.getFavoriteRestaurants().contains(restaurant);
    }
    
    @Transactional
    public RestaurantDTO removeFromFavorite(Customer customer, Long pk) {
        Restaurant restaurant = restaurantRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        if (customer.getFavoriteRestaurants() != null) {
            customer.getFavoriteRestaurants().remove(restaurant);
        }
        if (restaurant.getCustomers() != null) {
            restaurant.getCustomers().remove(customer);
        }

        restaurantRepository.save(restaurant);

        return restaurantMapper.mapToDTO(restaurant);
    }
    public CustomerDTO getCustomerById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return customerMapper.mapToDTO(customer);
    }

    @Transactional
    public OrderDTO addToFavoriteOrders(Customer customer, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        if (!order.getCustomer().getPk().equals(customer.getPk())) {
            throw new IllegalArgumentException("Order does not belong to this customer");
        }

        if (customer.getFavoriteOrders() == null) {
            customer.setFavoriteOrders(new ArrayList<>());
        }

        if (!customer.getFavoriteOrders().contains(order)) {
            customer.getFavoriteOrders().add(order);
            customerRepository.save(customer);
        }

        return orderMapper.mapToDTO(order);
    }

    @Transactional
    public OrderDTO removeFromFavoriteOrders(Customer customer, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (customer.getFavoriteOrders() != null) {
            customer.getFavoriteOrders().remove(order);
            customerRepository.save(customer);
        }

        return orderMapper.mapToDTO(order);
    }

    public List<OrderDTO> getFavoriteOrders(Customer customer) {
        if (customer.getFavoriteOrders() == null) {
            return new ArrayList<>();
        }
        return orderMapper.mapToListDTO(customer.getFavoriteOrders());
    }

    public boolean isFavoriteOrder(Customer customer, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return customer.getFavoriteOrders() != null && customer.getFavoriteOrders().contains(order);
    }
    
    @Transactional
    public CustomerDTO updateCustomer(Long userId, CustomerDTO dto) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found for user ID: " + userId));

        // Update fields if provided (partial update)
        if (dto.getName() != null) {
            customer.setName(dto.getName());
        }
        if (dto.getEmail() != null) {
            customer.setEmail(dto.getEmail());
        }
        if (dto.getPhoneNumber() != null) {
            customer.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getAddress() != null) {
            customer.setAddress(dto.getAddress());
        }
        if (dto.getLongitude() != 0.0f) {
            customer.setLongitude(dto.getLongitude());
        }
        if (dto.getLatitude() != 0.0f) {
            customer.setLatitude(dto.getLatitude());
        }

        // Persist and return DTO
        Customer saved = customerRepository.save(customer);
        return customerMapper.mapToDTO(saved);
    }

    /**
     * Returns all orders associated with the customer (order history).
     */
    public List<OrderDTO> getAllOrders(Customer customer) {
        if (customer.getOrderHistory() == null) {
            return new ArrayList<>();
        }
        return orderMapper.mapToListDTO(customer.getOrderHistory());
    }
}
