package pentacode.backend.code.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTOForCustomer {
    private Long pk;
    private String name;
    private RestaurantDTO restaurant;
    
}
