package pentacode.backend.code.admin.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.management.relation.Role;

import org.springframework.stereotype.Service;

import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.auth.service.AuthenticationService;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.courier.dto.CourierDTO;
import pentacode.backend.code.customer.dto.CustomerDTO;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.common.service.OrderService;
import pentacode.backend.code.restaurant.service.RestaurantService;
import pentacode.backend.code.courier.service.CourierService;
import pentacode.backend.code.customer.service.CustomerService;
import pentacode.backend.code.auth.repository.UserRepository;
import pentacode.backend.code.customer.repository.CustomerRepository;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;

@Service
public class AdminService {
    private final OrderService orderService;
    private final CourierService courierService;
    private final RestaurantService restaurantService;
    private final CustomerService customerService;
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;

    public AdminService(OrderService orderService,
                        CourierService courierService,
                        RestaurantService restaurantService,
                        CustomerService customerService,
                        AuthenticationService authenticationService,
                        UserRepository userRepository,
                        CustomerRepository customerRepository,
                        RestaurantRepository restaurantRepository) {
        this.customerService = customerService;
        this.orderService = orderService;
        this.courierService = courierService;
        this.restaurantService = restaurantService;
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public OrderDTO assignCourier(Long orderId, Long courierId) {
        return orderService.assignCourier(orderId, courierId);
    }

    public OrderDTO unassignCourier(Long orderId) {
        return orderService.unassignCourier(orderId);
    }

    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    public List<CourierDTO> getAllCouriers() {
        return courierService.getAllCouriers();
    }

    public List<RestaurantDTO> getAllRestaurants() {
        return restaurantService.listAllRestaurants();
    }

    public List<CustomerDTO> getAllCustomers() {
        return customerService.listAllCustomers();
    }
    public void deleteUser(Long id) {
        Optional<User> user = findUserByAnyEntityId(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found for provided entity id: " + id);
        }
        User u = user.get();
        boolean deleted = false;
        if (u.getCustomer() != null) {
            Customer customer = u.getCustomer();
            customer.setDeleted(true);
            customerRepository.save(customer);
            deleted = true;
        }
        if (u.getRestaurant() != null) {
            Restaurant restaurant = u.getRestaurant();
            restaurant.setDeleted(true);
            restaurantRepository.save(restaurant);
            deleted = true;
        }
        if (u.getCourier() != null) {
            var courier = u.getCourier();
            courier.setDeleted(true);
            courierService.updateCourier(courier.getPk(), null); // null DTO, just to trigger save
            deleted = true;
        }
        if (!deleted) {
            throw new IllegalArgumentException("No deletable entity found for user with id: " + id);
        }
    }
    public Optional<User> banUser(Long id) {
        Optional<User> user = findUserByAnyEntityId(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found for provided entity id: " + id);
        }
        return authenticationService.banUser(user.get().getId());
    }
    public Optional<User> unbanUser(Long id) {
        Optional<User> user = findUserByAnyEntityId(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found for provided entity id: " + id);
        }
        return authenticationService.unbanUser(user.get().getId());
    }
    public Boolean getUserBanStatus(Long id) {
        Optional<User> user = findUserByAnyEntityId(id);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found for provided entity id: " + id);
        }
        return authenticationService.getUserBanStatus(user.get().getId());
    }
    private Optional<User> findUserByAnyEntityId(Long id) {
        Optional<User> user = userRepository.findByRestaurant_pk(id);
        if (user.isPresent()) return user;
        user = userRepository.findByCourier_pk(id);
        if (user.isPresent()) return user;
        user = userRepository.findByCustomer_pk(id);
        if (user.isPresent()) return user;
        user = userRepository.findByAdmin_pk(id);
        return user;
    }
    public User getUserById(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return null;
        }
        User user = userOptional.get();
        return user;
    }
    public CustomerDTO updateCustomerProfile(Long pk, CustomerDTO dto) {
        Customer customer = customerRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + pk));
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found for user ID: " + pk);
        }
        return customerService.updateCustomerProfile(customer, dto);
    }
    public RestaurantDTO updateRestaurantProfile(Long pk, RestaurantDTO dto) {
        return restaurantService.updateRestaurant(pk, dto);
    }

    public CourierDTO updateCourierProfile(Long pk, CourierDTO dto) {
        /*if (dto.isAvailable()) {
            courier.setIsAvailable(dto.getIsAvailable());
        }
        if (dto.isOnline()) {
            courier.setIsOnline(dto.getIsOnline());
        }*/
        return courierService.updateCourier(pk, dto);
        
    }
}