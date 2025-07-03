package pentacode.backend.code.restaurant.controller;

import java.util.HashMap;
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
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.service.OrderService;
import pentacode.backend.code.common.utils.ResponseHandler;
import pentacode.backend.code.restaurant.dto.MenuDTO;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.restaurant.mapper.RestaurantMapper;
import pentacode.backend.code.restaurant.service.RestaurantService;
import pentacode.backend.code.common.dto.UpdateOrderStatusRequestDTO;
import pentacode.backend.code.restaurant.entity.Restaurant;

@RestController
@RequestMapping("/api/restaurant")
@AllArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;
    private final OrderService orderService;
    private final RestaurantMapper restaurantMapper;

    @GetMapping("{pk}")
    public ResponseEntity<Object> getRestByPk(@AuthenticationPrincipal User user, @PathVariable Long pk) {
        // Long pk = user.getRestaurant().getPk();
        return ResponseHandler.generatePkResponse("Success", HttpStatus.OK, restaurantService.getByPk(pk));
    }
    @GetMapping("/profile")
    public ResponseEntity<Object> getRestaurantProfile(@AuthenticationPrincipal User user) {
        RestaurantDTO restaurantDTO = restaurantMapper.mapToDTO(user.getRestaurant());
        if (restaurantDTO == null) {
            return ResponseHandler.generatePkResponse("Restaurant not found", HttpStatus.NOT_FOUND, null);
        }
        return ResponseHandler.generatePkResponse("Success", HttpStatus.OK, restaurantDTO);
    }   
    @PostMapping("/profile-picture")
    public ResponseEntity<Object> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        Long restaurantPk = user.getRestaurant().getPk();
        RestaurantDTO updatedRestaurant = restaurantService.updateProfilePicture(restaurantPk, file);
        return ResponseHandler.generatePkResponse("Profile picture updated successfully", HttpStatus.OK, updatedRestaurant);
    }
    public String postMethodName(@RequestBody String entity) {
        //TODO: process POST request
        
        return entity;
    }
    
    @PutMapping("/profile")
    public ResponseEntity<Object> updateRestaurantProfile(
            @AuthenticationPrincipal User user,
            @RequestBody RestaurantDTO request) {

        Long restaurantPk = user.getRestaurant().getPk();          // derive pk from JWT principal
        RestaurantDTO updated =
                restaurantService.updateRestaurant(restaurantPk, request);

        return ResponseHandler.generatePkResponse(
                "Profile updated successfully",
                HttpStatus.OK,
                updated);
    }
    @GetMapping("name/{name}")
    public ResponseEntity<Object> getRestaurantByName(@PathVariable String name) {
        List<RestaurantDTO> restaurantDTOs = restaurantService.getRestaurantByName(name);
        return ResponseHandler.generateListResponse("Success", HttpStatus.OK, restaurantDTOs, restaurantDTOs.size());
    }   

    @GetMapping("/all")
    public ResponseEntity<Object> getAllRestaurants(
            @RequestParam(value = "search", required = false) String searchQuery,
            @RequestParam(value = "sort", required = false) String sortOption) {
        try {
            System.out.println("ASDGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgetAllRestaurants called");
            List<RestaurantDTO> restaurantDTOs = restaurantService.getAllRestaurants(searchQuery, sortOption);
            return ResponseHandler.generateListResponse("Success", HttpStatus.OK, restaurantDTOs, restaurantDTOs.size());
        } catch (Exception e) {
            return ResponseHandler.generatePkResponse(e.getMessage(), HttpStatus.BAD_REQUEST, null);
        }
    }
    
    @PostMapping("/orders/{orderId}/assign-courier/{courierId}")
    public ResponseEntity<Object> assignCourier(
            @AuthenticationPrincipal User user,
            @PathVariable("orderId") Long orderId,
            @PathVariable("courierId") Long courierId) {
        Long restaurantId = user.getRestaurant().getPk();
        OrderDTO orderDTO = orderService.getByPk(orderId);
        if (orderDTO == null || !orderDTO.getRestaurant().getPk().equals(restaurantId)) {
            return ResponseHandler.generatePkResponse("Invalid order or restaurant", 
                                                    HttpStatus.BAD_REQUEST, 
                                                    null);
        }
        
        OrderDTO updatedOrder = orderService.assignCourier(orderId, courierId);
        if (updatedOrder == null) {
            return ResponseHandler.generatePkResponse("Failed to assign courier", 
                                                    HttpStatus.BAD_REQUEST, 
                                                    null);
        }
        
        return ResponseHandler.generatePkResponse("Courier assigned successfully", 
                                                HttpStatus.OK, 
                                                updatedOrder);
    }

    @GetMapping("/get/orders")
    public ResponseEntity<Object> getOrdersByRestaurant(@AuthenticationPrincipal User user) {
        Long restaurantId = user.getRestaurant().getPk();
        List<OrderDTO> orderDTOs = restaurantService.getOrdersByRestaurant(restaurantId);
        return ResponseHandler.generateListResponse("Success", HttpStatus.OK, orderDTOs, orderDTOs.size());
    }

    @PostMapping("/orders/{orderId}/status")
    public ResponseEntity<Object> updateOrderStatus(
            @AuthenticationPrincipal User user,
            @PathVariable("orderId") Long orderId,
            @RequestBody UpdateOrderStatusRequestDTO request) {
        Long restaurantId = user.getRestaurant().getPk();
        OrderDTO orderDTO = orderService.getByPk(orderId);
        if (orderDTO == null || !orderDTO.getRestaurant().getPk().equals(restaurantId)) {
            return ResponseHandler.generatePkResponse(
                "Invalid order or restaurant",
                HttpStatus.BAD_REQUEST,
                null
            );
        }
        
        OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus());
        if (updatedOrder == null) {
            return ResponseHandler.generatePkResponse(
                "Failed to update order status",
                HttpStatus.BAD_REQUEST,
                null
            );
        }
        
        return ResponseHandler.generatePkResponse(
            "Order status updated successfully",
            HttpStatus.OK,
            updatedOrder
        );
    }

    @GetMapping("/menus")
    public ResponseEntity<Object> getMenusByRestaurantAndCategory(
            @RequestParam Long restaurantId,
            @RequestParam String categoryName) {
        List<MenuDTO> menus = restaurantService.getMenusByRestaurantAndCategory(restaurantId, categoryName);
        if (menus == null || menus.isEmpty()) {
            return ResponseHandler.generatePkResponse(
                "Invalid category or restaurant", HttpStatus.BAD_REQUEST, null);
        }
        return ResponseHandler.generateListResponse("Success", HttpStatus.OK, menus, menus.size());
    }

    @GetMapping("/get-review-puan")
    public ResponseEntity<Object> getRestaurantReviewPuan(@AuthenticationPrincipal User user) {
        try
        {
            Restaurant restaurant = user.getRestaurant();
            Double reviewPuan = restaurant.getRating(); // Assuming getRating() returns a Double
            Integer reviewCount = restaurant.getNumberOfRatings(); // Assuming getRatingCount() returns an Integer
            HashMap<String, Object> response = new HashMap<>();
            response.put("rating", reviewPuan);
            response.put("ratingCount", reviewCount);
            
            return ResponseHandler.generatePkResponse("Success", HttpStatus.OK, response);
        }
        catch (Exception e) {
            return ResponseHandler.generatePkResponse("Error", HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}