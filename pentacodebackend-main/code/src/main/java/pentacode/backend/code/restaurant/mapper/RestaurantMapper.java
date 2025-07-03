package pentacode.backend.code.restaurant.mapper;
import java.util.List;

import org.mapstruct.Mapper;

import pentacode.backend.code.common.mapper.base.BaseMapper;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;
import pentacode.backend.code.restaurant.entity.Restaurant;



@Mapper(componentModel="spring")
public interface RestaurantMapper extends BaseMapper<Restaurant, RestaurantDTO> {
    Restaurant mapToEntity(RestaurantDTO restaurantDTO);
    RestaurantDTO mapToDTO(Restaurant restaurant);   
    List<RestaurantDTO> mapToListDTO(List<Restaurant> restaurants); 
}
