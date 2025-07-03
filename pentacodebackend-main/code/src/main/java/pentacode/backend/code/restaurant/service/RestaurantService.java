package pentacode.backend.code.restaurant.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import pentacode.backend.code.common.service.base.BaseService;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.restaurant.entity.Category;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.mapper.MenuMapper;
import pentacode.backend.code.restaurant.mapper.RestaurantMapper;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;
import pentacode.backend.code.common.dto.OrderDTO;
import pentacode.backend.code.common.mapper.OrderMapper;
import pentacode.backend.code.common.repository.OrderRepository;
import pentacode.backend.code.restaurant.repository.MenuRepository;
import pentacode.backend.code.restaurant.dto.MenuDTO;

@Service
public class RestaurantService extends BaseService<Restaurant> {
    private final RestaurantMapper restaurantMapper;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final MenuRepository menuRepository;
    private final MenuMapper menuMapper;
    
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    public RestaurantService(
            RestaurantMapper restaurantMapper,
            @Qualifier("restaurantRepository") RestaurantRepository restaurantRepository,
            OrderRepository orderRepository,
            OrderMapper orderMapper,
            MenuRepository menuRepository,
            MenuMapper menuMapper) {
        super(restaurantRepository);
        this.restaurantMapper = restaurantMapper;
        this.restaurantRepository = restaurantRepository;
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.menuRepository = menuRepository;
        this.menuMapper = menuMapper;
    }

    private boolean isRestaurantOpen(Restaurant restaurant) {
        // add log for the restaurant
        // System.out.println("Restaurant: " + restaurant.getName());
        // System.out.println("Opening Hours: " + restaurant.getOpeningHours());
        // System.out.println("Closing Hours: " + restaurant.getClosingHours());
        if (restaurant.getOpeningHours() == null || restaurant.getClosingHours() == null) {
            return false;
        }

        try {
            LocalTime currentTime = LocalTime.now();
            
            // Format single-digit hours to two digits
            String formattedOpeningHours = restaurant.getOpeningHours().replaceAll("^(\\d):", "0$1:");
            String formattedClosingHours = restaurant.getClosingHours().replaceAll("^(\\d):", "0$1:");
            // System.out.println("Formatted Opening Hours: " + formattedOpeningHours);
            // System.out.println("Formatted Closing Hours: " + formattedClosingHours);
            LocalTime openingTime = LocalTime.parse(formattedOpeningHours, TIME_FORMATTER);
            LocalTime closingTime = LocalTime.parse(formattedClosingHours, TIME_FORMATTER);

            // Handle case where restaurant is open past midnight
            if (closingTime.isBefore(openingTime)) {
                // System.out.println("Restaurant is open past midnight");
                return !currentTime.isBefore(openingTime) || !currentTime.isAfter(closingTime);
            }
            // current time
            // System.out.println("Current Time: " + currentTime);
            boolean isOpen = !currentTime.isBefore(openingTime) && !currentTime.isAfter(closingTime);
            // System.out.println("Restaurant is open: " + isOpen);
            return !currentTime.isBefore(openingTime) && !currentTime.isAfter(closingTime);
        } catch (Exception e) {
            // System.out.println("Error parsing time for restaurant: " + restaurant.getName() + 
                            //  " Opening: " + restaurant.getOpeningHours() + 
                            //  " Closing: " + restaurant.getClosingHours());
            return false;
        }
    }

    public RestaurantDTO getByPk(Long pk) {
        return restaurantMapper.mapToDTO(super.findByPkOr404(pk));
    }

    public Restaurant getRestaurantByPk(Long pk) {
        return restaurantRepository.findByPk(pk);
    }

    public RestaurantDTO getRestaurant(Long pk) {
        return restaurantMapper.mapToDTO(restaurantRepository.findByPk(pk));
    }

    public List<RestaurantDTO> getRestaurantByName(String name) {
        return restaurantMapper.mapToListDTO(restaurantRepository.findByName(name));
    }

    public List<RestaurantDTO> getAllRestaurants(String searchQuery, String sortOption) {
        try {
            System.out.println("ASDGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgetAllRestaurants called");
            Specification<Restaurant> spec = Specification.where(null);

            // Search by name or description
            if (searchQuery != null && !searchQuery.trim().isEmpty()) {
                String searchPattern = "%" + searchQuery.toLowerCase() + "%";
                spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), searchPattern),
                    cb.like(cb.lower(root.get("description")), searchPattern)
                ));
            }

            List<Restaurant> restaurants = restaurantRepository.findAll(spec);

            // // Filter open restaurants
            // restaurants = restaurants.stream()
            //     .collect(Collectors.toList());

            // Sort in Java
            restaurants.sort((a, b) -> {
                if (sortOption == null || sortOption.equals("name-asc")) {
                    return a.getName().compareTo(b.getName());
                } else if (sortOption.equals("name-desc")) {
                    return b.getName().compareTo(a.getName());
                }
                return 0;
            });

            return restaurantMapper.mapToListDTO(restaurants);
        } catch (Exception e) {
            // Fallback to @Query method if Specification fails
            List<Restaurant> restaurants = restaurantRepository.findRestaurantsWithFilters(
                searchQuery != null && !searchQuery.trim().isEmpty() ? searchQuery : null,
                sortOption != null ? sortOption : "name-asc"
            );
            
            // Filter open restaurants
            // restaurants = restaurants.stream()
            //     .filter(this::isRestaurantOpen)
            //     .collect(Collectors.toList());
                
            return restaurantMapper.mapToListDTO(restaurants);
        }
    }

    public RestaurantDTO updateProfilePicture(Long pk, MultipartFile file) {
        Restaurant restaurant = findByPkOr404(pk);

        try {
            String filename = pk + "_" + file.getOriginalFilename();
            String uploadDir = new File("src/main/resources/static/images").getAbsolutePath(); // writable dir in project root
            File saveFile = new File(uploadDir, filename);
            file.transferTo(saveFile); // saves the file

            // Expose file via URL
            String profilePictureUrl = "http://localhost:8080/images/" + filename;
            restaurant.setImageUrl(profilePictureUrl);
            restaurantRepository.save(restaurant);
            return restaurantMapper.mapToDTO(restaurant);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    public RestaurantDTO updateRestaurant(Long pk, RestaurantDTO dto) {
        // 1. Fetch the entity or fail with 404 (BaseService already has this helper)
        Restaurant entity = findByPkOr404(pk);

        entity.setName(          dto.getName()          );
        entity.setImageUrl(      dto.getImageUrl()      );
        entity.setAddress(       dto.getAddress()       );
        entity.setPhoneNumber(   dto.getPhoneNumber()   );
        entity.setDescription(   dto.getDescription()   );
        entity.setEmail(         dto.getEmail()         );
        entity.setFoodType(      dto.getFoodType()      );
        entity.setOpeningHours(  dto.getOpeningHours()  );
        entity.setClosingHours(  dto.getClosingHours()  );
        entity.setDeliveryTime(  dto.getDeliveryTime()  );
        entity.setDeliveryFee(   dto.getDeliveryFee()   );
        entity.setMinOrderAmount(dto.getMinOrderAmount());
        entity.setMaxOrderAmount(dto.getMaxOrderAmount());
        entity.setLatitude(      dto.getLatitude()      );
        entity.setLongitude(    dto.getLongitude()      );

        //  Persist and return DTO
        Restaurant saved = restaurantRepository.save(entity);
        return restaurantMapper.mapToDTO(saved);
    }

    public List<OrderDTO> getOrdersByRestaurant(Long restaurantId) {
        return orderMapper.mapToListDTO(orderRepository.findByRestaurantPk(restaurantId));
    }

    public List<MenuDTO> getMenusByRestaurantAndCategory(Long restaurantId, String categoryName) {
        List<Menu> menus = menuRepository.findByRestaurantPkAndCategoryName(restaurantId, categoryName);
        return menuMapper.mapToListDTO(menus);
    }

    public List<RestaurantDTO> listAllRestaurants() {
        List<Restaurant> restaurants = restaurantRepository.findAllByDeletedFalse();
        return restaurantMapper.mapToListDTO(restaurants);
    }
}