package pentacode.backend.code.customer.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.criteria.Order;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.service.OrderService;
import pentacode.backend.code.common.utils.ResponseHandler;
import pentacode.backend.code.customer.dto.CustomerDTO;
import pentacode.backend.code.customer.entity.Customer;
import pentacode.backend.code.customer.service.CustomerService;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.service.MenuService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {
    private final CustomerService customerService;
    private final MenuService menuService;

    private CustomerController(CustomerService customerService, MenuService menuService) {
        this.customerService = customerService;
        this.menuService = menuService;
    }
    

    @PostMapping("/create-order")
    public ResponseEntity<Object> createOrder(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            customerService.createOrder(customer);
            return ResponseHandler.generatePkResponse("Order created successfully", HttpStatus.OK, null);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error creating order", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }
    
    @PostMapping("/update-order/{pk}")
    public ResponseEntity<Object> updateOrder(@AuthenticationPrincipal User user, @PathVariable Long pk, @RequestParam String action) {
        try {
            Menu menu = menuService.getMenu(pk);
            Customer customer = user.getCustomer();
            System.out.println("Customer: " + customer);
            System.out.println("Menu: " + menu);
            if(action.equals("add")) {
                customerService.addMenuToOrder(customer, menu);
            } else if(action.equals("remove")) {
                customerService.removeMenuFromOrder(customer, menu);
            }
            return ResponseHandler.generatePkResponse("Order updated successfully", HttpStatus.OK, "Başarılı");
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }        
    }

    @GetMapping("/get-order")
    public ResponseEntity<Object> getOrder(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            OrderDTO order = customerService.getCurrentOrder(customer);
            System.out.println("Order: " + order);
            System.out.println("Customer: " + customer);
            return ResponseHandler.generatePkResponse("Order retrieved successfully", HttpStatus.OK, order);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving order", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @PostMapping("place-order")
    public ResponseEntity<Object> placeOrder(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            customerService.placeOrder(customer);
            return ResponseHandler.generatePkResponse("Order placed successfully", HttpStatus.OK, null);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/get-active-orders")
    public ResponseEntity<Object> getActiveOrders(@AuthenticationPrincipal User user, @RequestParam(required=false) boolean old, @RequestParam(required = false) boolean failed) {
        try {
            Customer customer = user.getCustomer();
            List<OrderDTO> orders = customerService.getActiveOrders(customer, old, failed);
            return ResponseHandler.generatePkResponse("Active orders retrieved successfully", HttpStatus.OK, orders);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving active orders", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/profile")
    public ResponseEntity<Object> getCustomerProfile(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            if (customer == null) {
                return ResponseHandler.generatePkResponse("Customer not found", HttpStatus.NOT_FOUND, null);
            }
            CustomerDTO customerDTO = customerService.getCustomerProfile(customer);
            return ResponseHandler.generatePkResponse("Success", HttpStatus.OK, customerDTO);
        } catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving customer profile", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<Object> updateCustomerProfile(
            @AuthenticationPrincipal User user,
            @RequestBody CustomerDTO request) {
        try {
            Customer customer = user.getCustomer();
            if (customer == null) {
                return ResponseHandler.generatePkResponse("Customer not found", HttpStatus.NOT_FOUND, null);
            }
            CustomerDTO updated = customerService.updateCustomerProfile(customer, request);
            return ResponseHandler.generatePkResponse("Profile updated successfully", HttpStatus.OK, updated);
        } catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error updating customer profile", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @PostMapping("/add-to-favorite/{pk}")
    public ResponseEntity<Object> addToFavorite(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        try {
            Customer customer = user.getCustomer();
            customerService.addToFavorite(customer, pk);
            return ResponseHandler.generatePkResponse("Restaurant added to favorites successfully", HttpStatus.OK, null);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error adding restaurant to favorites", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }      
    }

    @PostMapping("/remove-from-favorite/{pk}")
    public ResponseEntity<Object> removeFromFavorite(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        try {
            Customer customer = user.getCustomer();
            customerService.removeFromFavorite(customer, pk);
            return ResponseHandler.generatePkResponse("Restaurant removed from favorites successfully", HttpStatus.OK, null);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error removing restaurant from favorites", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/is-favorite/{pk}")
    public ResponseEntity<Object> isFavorite(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        try {
            Customer customer = user.getCustomer();
            boolean isFavorite = customerService.isFavorite(customer, pk);
            return ResponseHandler.generatePkResponse("Restaurant is favorite", HttpStatus.OK, isFavorite);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error checking if restaurant is favorite", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/get-favorite-restaurants")
    public ResponseEntity<Object> getFavoriteRestaurants(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            List<RestaurantDTO> favoriteRestaurants = customerService.getFavoriteRestaurants(customer);
            return ResponseHandler.generatePkResponse("Favorite restaurants retrieved successfully", HttpStatus.OK, favoriteRestaurants);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving favorite restaurants", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @PostMapping("/add-to-favorite-orders/{orderId}")
    public ResponseEntity<Object> addToFavoriteOrders(@AuthenticationPrincipal User user, @PathVariable Long orderId) {
        try {
            Customer customer = user.getCustomer();
            OrderDTO order = customerService.addToFavoriteOrders(customer, orderId);
            return ResponseHandler.generatePkResponse("Order added to favorites successfully", HttpStatus.OK, order);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @PostMapping("/remove-from-favorite-orders/{orderId}")
    public ResponseEntity<Object> removeFromFavoriteOrders(@AuthenticationPrincipal User user, @PathVariable Long orderId) {
        try {
            Customer customer = user.getCustomer();
            OrderDTO order = customerService.removeFromFavoriteOrders(customer, orderId);
            return ResponseHandler.generatePkResponse("Order removed from favorites successfully", HttpStatus.OK, order);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/get-favorite-orders")
    public ResponseEntity<Object> getFavoriteOrders(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            List<OrderDTO> favoriteOrders = customerService.getFavoriteOrders(customer);
            return ResponseHandler.generatePkResponse("Favorite orders retrieved successfully", HttpStatus.OK, favoriteOrders);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving favorite orders", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/is-favorite-order/{orderId}")
    public ResponseEntity<Object> isFavoriteOrder(@AuthenticationPrincipal User user, @PathVariable Long orderId) {
        try {
            Customer customer = user.getCustomer();
            boolean isFavorite = customerService.isFavoriteOrder(customer, orderId);
            return ResponseHandler.generatePkResponse("Order favorite status retrieved", HttpStatus.OK, isFavorite);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }

    @GetMapping("/current-money")
    public ResponseEntity<Object> getCurrentMoney(@AuthenticationPrincipal User user) {
        try {
            Customer customer = user.getCustomer();
            Double currentMoney = customer.getMoney();
            return ResponseHandler.generatePkResponse("Current money retrieved successfully", HttpStatus.OK, currentMoney);
        }   
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error retrieving current money", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }        
    }
}
