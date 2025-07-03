package pentacode.backend.code.common.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CreateOrderRequestDTO {
    private Long restaurantId;
    private List<OrderItemRequestDTO> items;
    private Long budget;
}
