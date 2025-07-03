package pentacode.backend.code.common.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import pentacode.backend.code.restaurant.dto.MenuDTO;

@Getter
@Setter
@Builder
public class OrderItemDTO {
    private MenuDTO menu;
    private int quantity;
}
