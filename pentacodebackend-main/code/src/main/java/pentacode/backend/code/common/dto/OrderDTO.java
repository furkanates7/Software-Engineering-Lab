package pentacode.backend.code.common.dto;

import java.util.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pentacode.backend.code.common.entity.OrderStatusEnum;
import pentacode.backend.code.courier.dto.CourierDTO;
import pentacode.backend.code.restaurant.dto.MenuDTO;
import pentacode.backend.code.restaurant.dto.RestaurantDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long pk;
    private String name;
    private RestaurantDTO restaurant;
    private List<MenuDTO> menus;
    private CourierDTO courier;
    private OrderStatusEnum status;
    private boolean courierAssignmentAccepted;
    private Integer version;
    private double totalPrice;
    public List<OrderItemDTO> orderItems;
    private boolean isRated;
    private Integer rating;
    private Date createdAt;

}
