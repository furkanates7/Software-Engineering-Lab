package pentacode.backend.code.restaurant.mapper;
import java.util.List;
import org.mapstruct.Mapper;

import pentacode.backend.code.common.mapper.base.BaseMapper;
import pentacode.backend.code.restaurant.dto.FoodDTO;
import pentacode.backend.code.restaurant.entity.Category;

@Mapper(componentModel="spring")
public interface FoodMapper extends BaseMapper<Category, FoodDTO> {
    FoodDTO mapToDTO(Category food);
    Category mapToEntity(FoodDTO foodDTO);
    List<FoodDTO> mapToListDTO(List<Category> foods);
    List<Category> mapToListEntity(List<FoodDTO> foodDTOs);
}                                               