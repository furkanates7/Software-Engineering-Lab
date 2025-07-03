package pentacode.backend.code.restaurant.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import pentacode.backend.code.auth.entity.User;
import pentacode.backend.code.common.utils.ResponseHandler;
import pentacode.backend.code.restaurant.dto.MenuDTO;
import pentacode.backend.code.restaurant.service.MenuService;

@RestController
@RequestMapping("/api/menu")
@AllArgsConstructor
public class MenuController {
    private final MenuService menuService;

    @GetMapping("{pk}")
    public ResponseEntity<Object> getMenuByPk(@PathVariable Long pk) {
        return ResponseHandler.generatePkResponse("Success", HttpStatus.OK, menuService.getByPk(pk));
    }

    @GetMapping("restaurant")
    public ResponseEntity<Object> getMenuByRestaurant(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "search", required = false) String searchQuery,
            @RequestParam(value = "category", required = false) String filterCategory,
            @RequestParam(value = "type", required = false) String filterType,
            @RequestParam(value = "sort", required = false) String sortOption) {
        Long restaurantPk = user.getRestaurant().getPk();
        List<MenuDTO> menuDTOs = menuService.getMenuByRestaurant(restaurantPk, searchQuery, filterCategory, filterType, sortOption);
        return ResponseHandler.generateListResponse("Success", HttpStatus.OK, menuDTOs, menuDTOs.size());
    }

    @PostMapping
    public ResponseEntity<Object> createMenu(
            @Valid @RequestBody MenuDTO menuDTO,
            @AuthenticationPrincipal User user) {
        MenuDTO createdMenu = menuService.createMenu(menuDTO, user.getRestaurant().getPk());
        return ResponseHandler.generatePkResponse("Menu created successfully", HttpStatus.CREATED, createdMenu);
    }

    @PutMapping("{pk}")
    public ResponseEntity<Object> updateMenu(
            @PathVariable Long pk,
            @Valid @RequestBody MenuDTO menuDTO,
            @AuthenticationPrincipal User user) {
        MenuDTO updatedMenu = menuService.updateMenu(pk, menuDTO, user.getRestaurant().getPk());
        return ResponseHandler.generatePkResponse("Menu updated successfully", HttpStatus.OK, updatedMenu);
    }

    @DeleteMapping("{pk}")
    public ResponseEntity<Object> deleteMenu(
            @PathVariable Long pk,
            @AuthenticationPrincipal User user) {
        menuService.deleteMenu(pk, user.getRestaurant().getPk());
        return ResponseHandler.generatePkResponse("Menu deleted successfully", HttpStatus.OK, null);
    }
}