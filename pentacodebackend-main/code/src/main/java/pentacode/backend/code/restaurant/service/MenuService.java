package pentacode.backend.code.restaurant.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pentacode.backend.code.common.service.base.BaseService;
import pentacode.backend.code.restaurant.dto.MenuDTO;
import pentacode.backend.code.restaurant.entity.Category;
import pentacode.backend.code.restaurant.entity.Menu;
import pentacode.backend.code.restaurant.entity.Restaurant;
import pentacode.backend.code.restaurant.mapper.MenuMapper;
import pentacode.backend.code.restaurant.repository.MenuRepository;
import pentacode.backend.code.restaurant.repository.RestaurantRepository;

@Service
public class MenuService extends BaseService<Menu> {
    private final MenuMapper menuMapper;
    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuService(MenuMapper menuMapper, MenuRepository menuRepository, RestaurantRepository restaurantRepository) {
        super(menuRepository);
        this.menuMapper = menuMapper;
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public MenuDTO getByPk(Long pk) {
        return menuMapper.mapToDTO(super.findByPkOr404(pk));
    }

    public Menu getMenu(Long pk) {
        return menuRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Menu not found"));
    }
    
    public List<MenuDTO> getMenuByRestaurant(Long restaurantPk, String searchQuery, String filterCategory, String filterType, String sortOption) {
        Specification<Menu> spec = Specification.where((root, query, cb) -> 
            cb.equal(root.get("restaurant").get("pk"), restaurantPk));

        // Search by name or description
        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            String searchPattern = "%" + searchQuery.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(cb.lower(root.get("name")), searchPattern),
                    cb.like(cb.lower(root.get("description")), searchPattern)
                ));
        }

        // Filter by category
        if (filterCategory != null && !filterCategory.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(cb.lower(root.get("category")), filterCategory.toLowerCase()));
        }

        // Filter by type (food or drink)
        if (filterType != null && !filterType.trim().isEmpty()) {
            boolean isDrink = filterType.equalsIgnoreCase("drink");
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("isDrink"), isDrink));
        }
        spec = spec.and((root, query, cb) -> 
            cb.equal(root.get("isDeleted"), false));

        List<Menu> menus = menuRepository.findAll(spec);

        // Sort
        menus.sort((a, b) -> {
            if (sortOption == null) return 0;
            switch (sortOption) {
                case "name-asc":
                    return a.getName().compareTo(b.getName());
                case "name-desc":
                    return b.getName().compareTo(a.getName());
                case "price-asc":
                    return Double.compare(a.getPrice(), b.getPrice());
                case "price-desc":
                    return Double.compare(b.getPrice(), a.getPrice());
                default:
                    return 0;
            }
        });

        return menuMapper.mapToListDTO(menus);
    }

    @Transactional
    public MenuDTO createMenu(MenuDTO menuDTO, Long restaurantPk) {
        Restaurant restaurant = restaurantRepository.findById(restaurantPk)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));
        
        Menu menu = menuMapper.mapToEntity(menuDTO);
        menu.setRestaurant(restaurant);
        
        // Handle categories
        if (menuDTO.getCategoryPks() != null && !menuDTO.getCategoryPks().isEmpty()) {
            List<Category> categories = restaurant.getCategories().stream()
                    .filter(c -> menuDTO.getCategoryPks().contains(c.getPk()))
                    .collect(Collectors.toList());
            if (categories.size() != menuDTO.getCategoryPks().size()) {
                throw new IllegalArgumentException("One or more categories not found for this restaurant");
            }
            menu.setCategories(categories);
        } else {
            menu.setCategories(new ArrayList<>());
        }
        
        menu = menuRepository.save(menu);
        return menuMapper.mapToDTO(menu);
    }

    @Transactional
    public MenuDTO updateMenu(Long pk, MenuDTO menuDTO, Long restaurantPk) {
        Menu menu = menuRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Menu not found"));
        if (!menu.getRestaurant().getPk().equals(restaurantPk)) {
            throw new IllegalAccessError("Menu does not belong to this restaurant");
        }
        
        menu.setName(menuDTO.getName());
        menu.setDescription(menuDTO.getDescription());
        menu.setPrice(menuDTO.getPrice());
        menu.setImageUrl(menuDTO.getImageUrl());
        menu.setAvailable(menuDTO.isAvailable());
        menu.setDrink(menuDTO.isDrink());
        menu.setCategory(menuDTO.getCategory());
        
        // Handle categories
        if (menuDTO.getCategoryPks() != null) {
            Restaurant restaurant = menu.getRestaurant();
            List<Category> categories = restaurant.getCategories().stream()
                    .filter(c -> menuDTO.getCategoryPks().contains(c.getPk()))
                    .collect(Collectors.toList());
            if (categories.size() != menuDTO.getCategoryPks().size()) {
                throw new IllegalArgumentException("One or more categories not found for this restaurant");
            }
            menu.setCategories(categories);
        } else {
            menu.setCategories(new ArrayList<>());
        }
        
        menu = menuRepository.save(menu);
        return menuMapper.mapToDTO(menu);
    }

    @Transactional
    public void deleteMenu(Long pk, Long restaurantPk) {
        Menu menu = menuRepository.findById(pk)
                .orElseThrow(() -> new IllegalArgumentException("Menu not found"));
        if (!menu.getRestaurant().getPk().equals(restaurantPk)) {
            throw new IllegalAccessError("Menu does not belong to this restaurant");
        }
        menu.setDeleted(true);
    }
}