package pentacode.backend.code.restaurant.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import pentacode.backend.code.common.mapper.base.BaseMapper;
import pentacode.backend.code.restaurant.dto.FoodDTO;
import pentacode.backend.code.restaurant.dto.MenuDTO;
import pentacode.backend.code.restaurant.entity.Category;
import pentacode.backend.code.restaurant.entity.Menu;

@Mapper(componentModel = "spring")
public interface MenuMapper extends BaseMapper<Menu, MenuDTO> {
    
    @Mapping(source = "categories", target = "categoryPks", qualifiedByName = "categoriesToPks")
    @Mapping(source = "drink", target = "isDrink")
    @Mapping(source = "available", target = "isAvailable")
    MenuDTO mapToDTO(Menu menu);
    
    @Mapping(source = "categoryPks", target = "categories", ignore = true)
    @Mapping(source = "drink", target = "drink")
    @Mapping(source = "available", target = "available")
    Menu mapToEntity(MenuDTO menuDTO);
    
    List<MenuDTO> mapToListDTO(List<Menu> menus);
    
    List<Menu> mapToListEntity(List<MenuDTO> menuDTOs);
    
    @Named("categoriesToPks")
    default List<Long> categoriesToPks(List<Category> categories) {
        if (categories == null) {
            return null;
        }
        return categories.stream()
                .map(Category::getPk)
                .collect(Collectors.toList());
    }
}